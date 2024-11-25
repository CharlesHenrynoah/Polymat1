import { HfInference } from '@huggingface/inference';

const REPO_ID = 'bigcode/starcoder2-3b';
const TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;

class StarCoderService {
  private client: HfInference;

  constructor() {
    this.client = new HfInference(TOKEN);
  }

  async generateCode(prompt: string): Promise<string> {
    try {
      const response = await this.client.textGeneration({
        model: REPO_ID,
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          return_full_text: false,
        }
      });
      
      return response.generated_text;
    } catch (error) {
      console.error('StarCoder inference error:', error);
      throw error;
    }
  }
}

export const starCoderService = new StarCoderService();

export const call_llm = async (prompt: string): Promise<string> => {
  return await starCoderService.generateCode(prompt);
};

export default starCoderService;