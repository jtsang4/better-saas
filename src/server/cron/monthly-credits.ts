import { and, eq, inArray, isNull, not, or, sql } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { paymentConfig } from '@/config/payment.config';
import db from '@/server/db';
import { creditTransactions, payment, user, userCredits, userQuotaUsage } from '@/server/db/schema';

/**
 * Grant monthly free credits to users without active subscriptions
 * and update quota usage records for all users
 * This should be run on the 1st of each month
 */
export async function grantMonthlyFreeCredits() {
  console.log('🎁 Starting monthly free credits distribution and quota update...');

  try {
    const now = new Date();
    const currentPeriod = now.toISOString().slice(0, 7);
    const referenceId = `free_${currentPeriod}`;

    // Get all users who don't have active subscriptions (free users)
    const freeUsers = await db
      .select({
        userId: user.id,
      })
      .from(user)
      .leftJoin(payment, eq(payment.userId, user.id))
      .where(or(isNull(payment.status), not(inArray(payment.status, ['active', 'trialing']))));

    console.log(`Found ${freeUsers.length} free users`);

    const freePlan = paymentConfig.plans.find((p) => p.id === 'free');
    const freeCredits = freePlan?.credits?.monthly || 100;

    if (!freeCredits || freeCredits <= 0) {
      console.log('❌ No monthly credits configured for free plan');
      return { success: false, message: 'No monthly credits configured' };
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ userId: string; error: string }> = [];

    const freeUserIds = freeUsers.map((freeUser) => freeUser.userId);
    const creditedUserIds = new Set<string>();

    if (freeUserIds.length > 0) {
      const creditedUsers = await db
        .select({ userId: creditTransactions.userId })
        .from(creditTransactions)
        .where(
          and(
            eq(creditTransactions.referenceId, referenceId),
            inArray(creditTransactions.userId, freeUserIds)
          )
        );

      for (const creditedUser of creditedUsers) {
        creditedUserIds.add(creditedUser.userId);
      }
    }

    const eligibleUserIds = freeUserIds.filter((userId) => !creditedUserIds.has(userId));
    const chunkSize = 500;

    for (let index = 0; index < eligibleUserIds.length; index += chunkSize) {
      const batch = eligibleUserIds.slice(index, index + chunkSize);

      try {
        await db
          .insert(userCredits)
          .values(
            batch.map((userId) => ({
              id: crypto.randomUUID(),
              userId,
              balance: 0,
              totalEarned: 0,
              totalSpent: 0,
              frozenBalance: 0,
              createdAt: now,
              updatedAt: now,
            }))
          )
          .onConflictDoNothing({ target: userCredits.userId });

        const updatedAccounts = await db
          .update(userCredits)
          .set({
            balance: sql`${userCredits.balance} + ${freeCredits}`,
            totalEarned: sql`${userCredits.totalEarned} + ${freeCredits}`,
            updatedAt: now,
          })
          .where(inArray(userCredits.userId, batch))
          .returning({
            userId: userCredits.userId,
            balance: userCredits.balance,
          });

        if (updatedAccounts.length === 0) {
          continue;
        }

        const transactionRows = updatedAccounts.map((account) => ({
          id: crypto.randomUUID(),
          userId: account.userId,
          type: 'earn' as const,
          amount: freeCredits,
          balanceAfter: account.balance,
          source: 'subscription' as const,
          description: 'Monthly free credits',
          referenceId,
          metadata: JSON.stringify({
            type: 'monthly_free_credits',
            planId: 'free',
            month: currentPeriod,
          }),
        }));

        const insertedTransactions = await db
          .insert(creditTransactions)
          .values(transactionRows)
          .onConflictDoNothing({
            target: [creditTransactions.userId, creditTransactions.referenceId],
          })
          .returning({ userId: creditTransactions.userId });

        successCount += insertedTransactions.length;
      } catch (error) {
        errorCount += batch.length;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ userId: `batch_${index}`, error: errorMessage });
        console.error(`❌ Failed to grant credits for batch ${index}:`, errorMessage);
      }
    }

    console.log('🎯 Monthly free credits distribution completed:');
    console.log(`   ✅ Success: ${successCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    console.log(`   💰 Total credits distributed: ${successCount * freeCredits}`);

    // Update quota usage records for all users (reset monthly usage)
    console.log('📊 Updating quota usage records for all users...');
    let quotaUpdateSuccessCount = 0;
    let quotaUpdateErrorCount = 0;
    const quotaErrors: Array<{ userId: string; error: string }> = [];

    const allUsers = await db.select({ id: user.id }).from(user);
    console.log(`Found ${allUsers.length} users for quota update`);

    const services = ['api_call', 'storage'] as const;
    const quotaChunkSize = 500;

    for (let index = 0; index < allUsers.length; index += quotaChunkSize) {
      const batch = allUsers.slice(index, index + quotaChunkSize);
      const quotaRecords = batch.flatMap((userData) =>
        services.map((service) => ({
          id: uuidv7(),
          userId: userData.id,
          service,
          period: currentPeriod,
          usedAmount: 0,
          createdAt: now,
          updatedAt: now,
        }))
      );

      try {
        const inserted = await db
          .insert(userQuotaUsage)
          .values(quotaRecords)
          .onConflictDoNothing({
            target: [userQuotaUsage.userId, userQuotaUsage.service, userQuotaUsage.period],
          })
          .returning({ id: userQuotaUsage.id });

        quotaUpdateSuccessCount += inserted.length;
      } catch (error) {
        quotaUpdateErrorCount += batch.length;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        quotaErrors.push({ userId: `batch_${index}`, error: errorMessage });
        console.error(`❌ Failed to update quota for batch ${index}:`, errorMessage);
      }
    }

    console.log('📊 Quota update completed:');
    console.log(`   ✅ Success: ${quotaUpdateSuccessCount} records`);
    console.log(`   ❌ Errors: ${quotaUpdateErrorCount} users`);

    return {
      success: true,
      totalUsers: freeUsers.length,
      successCount,
      errorCount,
      creditsPerUser: freeCredits,
      totalCreditsDistributed: successCount * freeCredits,
      quotaUpdateSuccessCount,
      quotaUpdateErrorCount,
      errors: errors.length > 0 ? errors : undefined,
      quotaErrors: quotaErrors.length > 0 ? quotaErrors : undefined,
    };
  } catch (error) {
    console.error('💥 Fatal error in monthly credits distribution:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Manually trigger monthly credits distribution (for testing or manual runs)
 */
export async function triggerMonthlyCredits() {
  console.log('🔧 Manually triggering monthly credits distribution...');
  return await grantMonthlyFreeCredits();
}
