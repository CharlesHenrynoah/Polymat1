import { HfInference } from '@huggingface/inference';

const REPO_ID = 'bigcode/starcoder2-3b';
const HF_TOKEN = "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";

class StarCoderService {
  private client: HfInference;

  constructor() {
    this.client = new HfInference(HF_TOKEN);
  }

  async generateCode(prompt: string): Promise<string> {
    try {
      const response = await this.client.textGeneration({
        model: REPO_ID,
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          return_full_text: false,
          temperature: 0.7
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

// Add the call_llm function that's being imported
export const call_llm = async (prompt: string): Promise<string> => {
  return starCoderService.generateCode(prompt);
};

export default starCoderService;
