interface QueryParams {
  inputs: string;
}

async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://api-inference.huggingface.co/validate-token', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

export async function query(params: QueryParams): Promise<string> {
  const token = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  if (!token) {
    throw new Error('API key is not configured');
  }

  const isValidToken = await validateToken(token);
  if (!isValidToken) {
    throw new Error('Invalid or expired API token');
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/bigcode/starcoder2-3b', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: params.inputs,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI Service Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.generated_text;
  } catch (error) {
    throw new Error(`AI Service Error: ${error}`);
  }
}

export async function getChatResponse(prompt: string): Promise<string> {
  return query({ inputs: prompt });
}
