import Together from 'together-ai';
import { getSystemPrompt } from '@/lib/systemPrompt';

// Standard Edge runtime for streaming
export const runtime = 'edge';

// We fall back to a mock key to avoid crashes before they provide it
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY || 'mock_key',
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { prompt, wireframe } = json;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = getSystemPrompt(wireframe);

    const res = await together.chat.completions.create({
      model: 'moonshotai/Kimi-K2.5',
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

    // @ts-ignore - The types from the SDK might not directly map to a stream in edge sometimes, but mostly it does.
    const stream = res.toReadableStream();
    
    return new Response(stream, {
      headers: new Headers({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream'
      }),
    });
  } catch (error: any) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Something went wrong' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
