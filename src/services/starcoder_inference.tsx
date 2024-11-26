import { HfInference } from '@huggingface/inference';

const REPO_ID = 'Qwen/Qwen2.5-Coder-32B-Instruct';
const HF_TOKEN = "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";

interface PromptConfig {
  task: string;
  language?: string; // Made optional
  style?: 'concise' | 'detailed';
  context?: string;
}

export class StarCoderService {
  private client: HfInference;
  
  constructor() {
    this.client = new HfInference(HF_TOKEN);
  }

  async generateCode(config: PromptConfig): Promise<string> {
    try {
      const prompt = `Generate code in any programming language for: ${config.task}${
        config.language ? ` using ${config.language}` : ''
      }. Code only, no explanations.`;

      const response = await this.client.textGeneration({
        model: REPO_ID,
        inputs: prompt,
        parameters: {
          max_new_tokens: 32000,
          temperature: 0.3,
          top_p: 0.95,
          top_k: 50,
          repetition_penalty: 1.2,
          stop: ["###", "Notes:", "Example:", "Output:"] 
        }
      });

      if (!response?.generated_text) {
        throw new Error('No code generated');
      }

      return this.extractCodeOnly(response.generated_text);
    } catch (error) {
      console.error('Generation error:', error);
      throw error;
    }
  }

  private extractCodeOnly(text: string): string {
    if (!text) return '';

    // Try to find code between code blocks with any language identifier
    const codeBlockMatch = text.match(/```[\w]*\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // Clean and extract code without language assumptions
    const cleanText = text
      .replace(/^(?:Here's|Here is|This is|The|Solution:|Code:|Implementation:).*/i, '')
      .replace(/\b(?:First|Step|Next|Finally|Then)\b.*?:\s*/g, '')
      .replace(/\[[^\]]+\]/g, '')
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const lines = cleanText.split('\n');
    const codeLines = lines.filter(line => 
      !line.toLowerCase().includes('explanation') &&
      !line.toLowerCase().includes('step') &&
      !line.toLowerCase().includes('note') &&
      line.trim().length > 0
    );

    return codeLines.join('\n');
  }
}

export async function call_llm(prompt: string, language?: string): Promise<string> {
  const service = new StarCoderService();
  return service.generateCode({
    task: prompt,
    language,
    style: 'detailed'
  });
}

export default StarCoderService;