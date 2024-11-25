import { HfInference } from '@huggingface/inference';

const HUGGING_FACE_TOKEN = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const inference = new HfInference(HUGGING_FACE_TOKEN);

interface QueryParams {
  inputs: string;
}

export async function query(params: QueryParams): Promise<string> {
  try {
    const response = await inference.textGeneration({
      model: "bigcode/starcoder2-3b",
      inputs: params.inputs,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.7
      }
    });
    return response.generated_text;
  } catch (error) {
    throw new Error(`AI Service Error: ${error}`);
  }
}

export async function getChatResponse(prompt: string): Promise<string> {
  return query({ inputs: prompt });
}