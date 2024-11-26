import { HfInference } from '@huggingface/inference';

const REPO_ID = 'bigcode/starcoder2-3b';
const HF_TOKEN = "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";

interface PromptConfig {
  language: string;
  task: string;
}

class StarCoderService {
  private client: HfInference;
  private readonly defaultPromptTemplate = `You are an expert software engineer tasked with writing high-quality, production-grade code.
Focus on writing clear, efficient, and well-documented solutions.

TASK DESCRIPTION:
{task}

PROGRAMMING LANGUAGE:
{language}

SPECIFIC REQUIREMENTS:
{requirements}

CODE STRUCTURE REQUIREMENTS:
1. Start with function/class documentation
2. Include input validation
3. Implement proper error handling
4. Add type hints where applicable
5. Include example usage in comments

QUALITY STANDARDS:
- Code must be efficient and optimized
- Variable names must be descriptive
- Follow language-specific best practices
- Include error handling for edge cases
- Write clean, maintainable code

CODE SOLUTION:`;

  constructor() {
    this.client = new HfInference(HF_TOKEN);
  }

  private getSpecificRequirements(task: string): string {
    if (!task || typeof task !== 'string') {
      return 'Write basic, functional code with proper error handling';
    }

    const taskLower = task.toLowerCase();
    
    if (taskLower.includes('function')) {
      return `- Write a single-purpose, pure function
- Implement comprehensive input validation
- Handle all edge cases
- Return consistent types
- Add clear documentation`;
    }

    if (taskLower.includes('algorithm')) {
      return `- Optimize for time complexity
- Consider space complexity
- Handle edge cases efficiently
- Implement error checking
- Document complexity analysis`;
    }

    if (taskLower.includes('class')) {
      return `- Follow OOP principles
- Implement proper encapsulation
- Add comprehensive error handling
- Include method documentation
- Consider thread safety`;
    }

    return `- Write clear, efficient code
- Implement error handling
- Add proper documentation
- Consider edge cases`;
  }

  private getGenerationParameters(task: string) {
    // Paramètres ajustés pour une meilleure qualité de code
    return {
      max_new_tokens: 1000,
      return_full_text: false,
      temperature: 0.2,    // Réduit pour plus de cohérence
      top_p: 0.90,
      top_k: 40,
      repetition_penalty: 1.3,
      stop: ["```", "'''", '"""']
    };
  }

  async generateCode(promptConfig: PromptConfig): Promise<string> {
    try {
      const task = String(promptConfig?.task || '').trim();
      const language = String(promptConfig?.language || 'python').trim();
      const requirements = this.getSpecificRequirements(task);

      const prompt = this.defaultPromptTemplate
        .replace('{task}', task)
        .replace('{language}', language)
        .replace('{requirements}', requirements);

      const response = await this.client.textGeneration({
        model: REPO_ID,
        inputs: prompt,
        parameters: this.getGenerationParameters(task)
      });

      if (!response?.generated_text) {
        throw new Error('No code generated');
      }

      return this.cleanOutput(response.generated_text);
    } catch (error) {
      console.error('Generation error:', error);
      throw error;
    }
  }

  private cleanOutput(text: string): string {
    if (!text || typeof text !== 'string') return '';

    return text
      .replace(/^```[\w]*\n?/, '')
      .replace(/```$/, '')
      .replace(/^\s*#.*$/gm, '')  // Supprime les commentaires inutiles
      .replace(/\n{3,}/g, '\n\n') // Normalise l'espacement
      .trim();
  }
}

export const starCoderService = new StarCoderService();

export const call_llm = async (task: string, language: string = 'python'): Promise<string> => {
  if (!task || typeof task !== 'string') {
    throw new Error('Valid task string is required');
  }

  try {
    return await starCoderService.generateCode({
      language: language || 'python',
      task
    });
  } catch (error) {
    console.error('LLM call error:', error);
    throw error;
  }
};

export default starCoderService;