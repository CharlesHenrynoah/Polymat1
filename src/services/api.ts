const API_URL = 'https://api-inference.huggingface.co/models/bigcode/starcoder';

export const chatWithBot = async (message: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key is not configured');
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
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.generated_text) {
      throw new Error('Invalid response format from AI service');
    }

    return data.generated_text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI Service Error: ${error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
};
