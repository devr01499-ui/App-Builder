import OpenAI from 'openai';
import { getSystemPrompt } from '@/lib/systemPrompt';

// Standard Edge runtime for streaming
export const runtime = 'edge';

// Initialize OpenAI client pointed to OpenRouter 
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || 'mock_key',
});

// Primary and Fallback model slugs
const PRIMARY_MODEL = 'google/gemma-2-9b-it:free';
const FALLBACK_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

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

    let stream;
    try {
      console.log(`Attempting generation with ${PRIMARY_MODEL}...`);
      stream = await client.chat.completions.create({
        model: PRIMARY_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        stream: true,
        // Recommended headers for OpenRouter
        extraHeaders: {
          'HTTP-Referer': 'https://claritiy.ai',
          'X-Title': 'CLARITIY App Builder',
        }
      });
    } catch (primaryError) {
      console.error(`Primary model (${PRIMARY_MODEL}) failed. Falling back to ${FALLBACK_MODEL}...`, primaryError);
      stream = await client.chat.completions.create({
        model: FALLBACK_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        stream: true,
        extraHeaders: {
          'HTTP-Referer': 'https://claritiy.ai',
          'X-Title': 'CLARITIY App Builder',
        }
      });
    }

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = `data: ${JSON.stringify(chunk)}\n\n`;
            controller.enqueue(encoder.encode(text));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });
    
    return new Response(readableStream, {
      headers: new Headers({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
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
