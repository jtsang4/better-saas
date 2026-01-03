import { generateText } from 'ai';
import { openai } from '@/lib/ai/clients';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return Response.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: 'OpenAI is not configured.' }, { status: 500 });
    }

    const { text } = await generateText({
      model: openai('gpt-4-turbo'),
      prompt,
    });

    return Response.json({ text });
  } catch (_error) {
    return Response.json({ error: 'Failed to generate text.' }, { status: 500 });
  }
}
