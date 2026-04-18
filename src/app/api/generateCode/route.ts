import OpenAI from 'openai';
import { getSystemPrompt } from '@/lib/systemPrompt';

// Standard Edge runtime for streaming
export const runtime = 'edge';

// Initialize OpenAI client pointed to OpenRouter 
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || 'mock_key',
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { prompt, wireframe, designConcept } = json;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = getSystemPrompt(wireframe, designConcept);

    const res = await client.chat.completions.create({
      model: 'google/gemma-4-26b-a4b-it:free',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
    });

    const stream = res.toReadableStream();
    
    return new Response(stream, {
      headers: new Headers({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream'
      }),
    });
  } catch (error: unknown) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Something went wrong' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
