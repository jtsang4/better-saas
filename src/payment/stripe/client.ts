import Stripe from 'stripe';
import { paymentConfig } from '../../config/payment.config';

// Stripe configuration
export const stripeConfig = {
  secretKey: paymentConfig.stripe.secretKey,
  webhookSecret: paymentConfig.stripe.webhookSecret,
  apiVersion: paymentConfig.stripe.apiVersion,
};

// Server-side Stripe instance
export const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: stripeConfig.apiVersion as Stripe.LatestApiVersion,
  typescript: true,
});
