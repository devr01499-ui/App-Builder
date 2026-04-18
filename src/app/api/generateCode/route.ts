import { getSystemPrompt } from '@/lib/systemPrompt';

// Standard Edge runtime for streaming
export const runtime = 'edge';

// Primary model is the 120B model requested by user
const PRIMARY_MODEL = 'openai/gpt-oss-120b:free';

// Fallback chain for maximum reliability
const FALLBACK_MODELS = [
  'meta-llama/llama-3.1-8b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
];

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

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
      console.log(`OpenRouter: Attempting generation with ${model}`);
      return fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://claritiy.pro',
          'X-Title': 'CLARITIY Builder',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          stream: true,
          reasoning: { enabled: true }
        }),
      });
    };

    let response = await openRouterRequest(PRIMARY_MODEL);

    // Iterative fallback if the primary model fails
    if (!response.ok) {
      for (const model of FALLBACK_MODELS) {
        console.warn(`${model} fallback attempt due to error ${response.status}`);
        response = await openRouterRequest(model);
        if (response.ok) break;
      }
    }

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        errorMessage = await response.text() || errorMessage;
      }

      return new Response(JSON.stringify({ 
        error: `All models failed. Last Error (${response.status}): ${errorMessage}` 
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
    return new Response(JSON.stringify({ error: (error as Error).message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
