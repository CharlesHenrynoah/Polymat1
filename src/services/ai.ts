import { InferenceClient } from 'huggingface_hub';
import json from 'json';

const repo_id = "bigcode/starcoder2-3b";

const llm_client = new InferenceClient({
  model: repo_id,
  timeout: 120,
  headers: {
    Authorization: `Bearer ${process.env.HF_TOKEN}`,
  },
});

export async function call_llm(prompt: string): Promise<string> {
  const response = await llm_client.post({
    json: {
      inputs: prompt,
      parameters: { max_new_tokens: 200 },
      task: "text-generation",
    },
  });
  return json.loads(response.decode())[0]["generated_text"];
}
