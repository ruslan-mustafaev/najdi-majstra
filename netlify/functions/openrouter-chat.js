const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const API_KEY = process.env.OPENROUTER_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'OPENROUTER_API_KEY is not configured' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { messages, model = 'google/gemini-2.5-flash' } = body;

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid request: messages array required' }),
      };
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://najdimajstra.sk',
        'X-Title': 'najdiMajstra.sk'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
        headers: corsHeaders,
        body: JSON.stringify({
          error: `OpenRouter API error: ${response.status}`,
          details: errorData
        }),
      };
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No response from OpenRouter API' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: data.choices[0].message.content,
        usage: data.usage
      }),
    };

  } catch (error) {
    console.error('OpenRouter API call failed:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message || 'Unknown error'
      }),
    };
  }
};
