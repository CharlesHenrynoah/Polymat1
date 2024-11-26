import { HfInference } from '@huggingface/inference';

const REPO_ID = 'bigcode/starcoder2-3b';
const HF_TOKEN = "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";

interface PromptConfig {
  language: string;
  task: string;
}

class StarCoderService {
  private client: HfInference;
  private readonly defaultPromptTemplate = `You are a senior software engineer writing professional grade code.
Your task is to write clear, optimized, and production-ready code.

TASK: {task}
LANGUAGE: {language}

REQUIREMENTS:
{requirements}

EXPECTED QUALITY STANDARDS:
- Code must be clean, efficient, and well-structured
- All inputs must be properly validated
- Edge cases must be handled
- Error handling must be comprehensive
- Variable names must be clear and descriptive
- Code should follow best practices and patterns

CODE SOLUTION:`;

  constructor() {
    this.client = new HfInference(HF_TOKEN);
  }

  private getTaskType(task: string): 'basic' | 'algorithm' | 'datastructure' | 'system' {
    if (!task || typeof task !== 'string') return 'basic';

    const taskLower = task.toLowerCase();
    if (taskLower.includes('algorithm') || taskLower.includes('sort') || taskLower.includes('search')) {
      return 'algorithm';
    }
    if (taskLower.includes('class') || taskLower.includes('stack') || taskLower.includes('queue')) {
      return 'datastructure';
    }
    if (taskLower.includes('system') || taskLower.includes('framework')) {
      return 'system';
    }
    return 'basic';
  }

  private getRequirements(task: string): string {
    const taskType = this.getTaskType(task);
    
    const commonRequirements = `- Input validation is mandatory
- Error cases must be handled gracefully
- Code must be optimized for performance
- Documentation is required for complex logic`;

    const specificRequirements = {
      basic: `- Function must be pure and focused
- Return types must be consistent
- Edge cases must be considered`,

      algorithm: `- Time complexity must be optimal
- Space complexity must be considered
- Algorithm must be stable
- Edge cases must be handled efficiently`,

      datastructure: `- Data structure must be properly encapsulated
- Operations must have optimal complexity
- Memory management must be efficient
- Thread safety should be considered`,

      system: `- System must be scalable
- Error handling must be comprehensive
- Logging should be implemented
- Performance must be optimized`
    };

    return `${commonRequirements}\n${specificRequirements[taskType]}`;
  }

  private getGenerationParameters(task: string) {
    const taskType = this.getTaskType(task);
    
    const baseParams = {
      max_new_tokens: 800,
      return_full_text: false,
      repetition_penalty: 1.2,
      stop: ["```", "'''", '"""']
    };

    // Ajuster les paramètres selon le type de tâche
    const typeParams = {
      basic: {
        temperature: 0.1,
        top_p: 0.85,
        top_k: 30
      },
      algorithm: {
        temperature: 0.2,
        top_p: 0.90,
        top_k: 40
      },
      datastructure: {
        temperature: 0.3,
        top_p: 0.92,
        top_k: 45
      },
      system: {
        temperature: 0.4,
        top_p: 0.95,
        top_k: 50
      }
    };

    return { ...baseParams, ...typeParams[taskType] };
  }

  private buildPrompt(config: PromptConfig): string {
    try {
      const task = String(config?.task || '').trim();
      const language = String(config?.language || 'python').trim();
      const requirements = this.getRequirements(task);

      return this.defaultPromptTemplate
        .replace('{task}', task)
        .replace('{language}', language)
        .replace('{requirements}', requirements);
    } catch (error) {
      console.error('Prompt building error:', error);
      throw new Error('Failed to build prompt');
    }
  }

  async generateCode(promptConfig: PromptConfig): Promise<string> {
    try {
      const prompt = this.buildPrompt(promptConfig);
      const parameters = this.getGenerationParameters(promptConfig.task);
      
      const response = await this.client.textGeneration({
        model: REPO_ID,
        inputs: prompt,
        parameters
      });
      
      if (!response?.generated_text) {
        throw new Error('No code generated');
      }

      return this.postProcessCode(response.generated_text);
    } catch (error) {
      console.error('Generation error:', error);
      throw error;
    }
  }

  private postProcessCode(code: string): string {
    if (!code || typeof code !== 'string') return '';

    return code
      .replace(/^```[\w]*\n?/, '')
      .replace(/```$/, '')
      .replace(/^\s*#.*$/gm, '')  // Enlever les commentaires inutiles
      .replace(/\n{3,}/g, '\n\n') // Normaliser l'espacement
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