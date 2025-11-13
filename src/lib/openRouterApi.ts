const NETLIFY_FUNCTION_URL = '/.netlify/functions/openrouter-chat';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callOpenRouter(
  messages: OpenRouterMessage[],
  model: string = 'google/gemini-2.5-flash'
): Promise<string> {
  try {
    const response = await fetch(NETLIFY_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.content) {
      throw new Error('No response from OpenRouter API');
    }

    return data.content;
  } catch (error) {
    console.error('OpenRouter API call failed:', error);
    throw error;
  }
}
