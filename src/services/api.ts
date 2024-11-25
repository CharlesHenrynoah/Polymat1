import { HfInference } from '@huggingface/inference';
import { refreshToken } from '../config/configdb';

const client = new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY);

export const chatWithBot = async (message: string): Promise<string> => {
  try {
    await refreshToken();
    const response = await client.textGeneration({
      model: 'bigcode/starcoder2-3b',
      inputs: message,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.7,
      }
    });

    return response.generated_text;
  } catch (error) {
    throw new Error(`AI Service Error: ${error}`);
  }
};
