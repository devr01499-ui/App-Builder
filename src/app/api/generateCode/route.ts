import { getSystemPrompt } from '@/lib/systemPrompt';

// Standard Edge runtime for streaming
export const runtime = 'edge';

const PRIMARY_MODEL = 'google/gemma-2-9b-it:free';
const FALLBACK_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'mock_key' || apiKey === '<OPENROUTER_API_KEY>') {
    return new Response(JSON.stringify({ 
      error: 'API Key not configured. Please add your OpenRouter API Key to Vercel Environment Variables as OPENROUTER_API_KEY.' 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt, wireframe, designConcept } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = getSystemPrompt(wireframe, designConcept);

    const openRouterRequest = async (model: string) => {
      console.log(`OpenRouter: Sending request for ${model}`);
      return fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://claritiy.pro',
          'X-Title': 'CLARITIY',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          stream: true,
        }),
      });
    };

    let response = await openRouterRequest(PRIMARY_MODEL);

    if (!response.ok) {
      console.warn(`Primary model ${PRIMARY_MODEL} failed (Status: ${response.status}), trying fallback...`);
      response = await openRouterRequest(FALLBACK_MODEL);
    }

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // Fallback if not JSON
        errorMessage = await response.text() || errorMessage;
      }

      return new Response(JSON.stringify({ 
        error: `OpenRouter Error (${response.status}): ${errorMessage}` 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Proxy the stream
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: unknown) {
    console.error("API critical error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Something went wrong' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
