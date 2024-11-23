const HF_API_URL = "https://api-inference.huggingface.co/models/bigcode/starcoder";

export async function getChatResponse(message: string): Promise<string> {
  const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key is not configured');
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: message }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (response.status === 400) {
        throw new Error(
          errorData?.error || 'Invalid request format or content'
        );
      }
      if (response.status === 401) {
        throw new Error('Invalid API token. Please check your token and try again.');
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    // The Starcoder model returns a different response format
    if (data && data.generated_text) {
      return data.generated_text;
    }

    throw new Error("Unexpected response format from AI service");
  } catch (error) {
    console.error('Error communicating with Hugging Face:', error);
    throw new Error('Unable to communicate with AI at the moment.');
  }
}

export async function query(data: any): Promise<any> {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/bigcode/starcoder",
    {
      headers: {
        Authorization: "Bearer hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  const result = await response.json();
  return result;
}
