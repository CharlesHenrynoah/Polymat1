import { Model } from './Model';

export class TextToCodeModel extends Model {
  private modelName: string;
  private apiConfig: any;

  constructor(apiUrl: string, apiKey: string, modelName: string, apiConfig: any) {
    super(apiUrl, apiKey);
    this.modelName = modelName;
    this.apiConfig = apiConfig;
  }

  async processTextToCode(text: string): Promise<string> {
    const data = {
      modelName: this.modelName,
      text,
      config: this.apiConfig,
    };

    try {
      const response = await this.connectToApi('text-to-code', data);
      return response.code;
    } catch (error) {
      console.error('Error processing text to code:', error);
      throw error;
    }
  }
}
