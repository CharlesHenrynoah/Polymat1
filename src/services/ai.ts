import { InferenceClient } from '@huggingface/inference';

interface QueryParams {
  inputs: string;
}

const client = new InferenceClient({
  model: 'bigcode/starcoder2-3b',
  token: import.meta.env.VITE_HUGGINGFACE_API_KEY,
});

export async function query(params: QueryParams): Promise<string> {
  try {
    const response = await client.textGeneration({
      inputs: params.inputs,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.7,
      },
    });

    return response.generated_text;
  } catch (error) {
    throw new Error(`AI Service Error: ${error}`);
  }
}

export async function getChatResponse(prompt: string): Promise<string> {
  return query({ inputs: prompt });
}
