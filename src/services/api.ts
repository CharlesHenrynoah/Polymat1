const API_URL = 'https://api-inference.huggingface.co/models/bigcode/starcoder';

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

export const chatWithBot = async (message: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key is not configured');
  }

  const isValidToken = await validateToken(apiKey);
  if (!isValidToken) {
    throw new Error('Invalid or expired API token');
  }

  // Input validation
  if (!message || message.length > 2048) {
    throw new Error('Message must be between 1 and 2048 characters');
  }

  try {
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('Sending request to Hugging Face:', { message });
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        inputs: message,
        parameters: {
          max_length: 2048,
          temperature: 0.7,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (response.status === 400) {
        throw new Error(
          errorData?.error || 'Invalid request format or content'
        );
      }
      if (response.status === 401) {
        throw new Error('Invalid API token. Please check your token and try again.');
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    // The Starcoder model returns a different response format
    if (data && data.generated_text) {
      return data.generated_text;
    }

    throw new Error('Invalid response format from AI service');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI Service Error: ${error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
};
