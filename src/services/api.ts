import { InferenceClient } from '@huggingface/inference';

const client = new InferenceClient({
  model: 'bigcode/starcoder2-3b',
  token: import.meta.env.VITE_HUGGINGFACE_API_KEY,
});

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

    const response = await client.textGeneration({
      inputs: message,
      parameters: {
        max_length: 2048,
        temperature: 0.7,
        return_full_text: false
      }
    });

    if (!response.generated_text) {
      throw new Error('Invalid response format from AI service');
    }

    return response.generated_text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI Service Error: ${error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
};
