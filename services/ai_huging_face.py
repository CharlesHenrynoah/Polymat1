import os
from huggingface_hub import HfInference
import json

# Configuration
repo_id = "bigcode/starcoder2-3b"
hf_token = os.getenv("HF_TOKEN")

# Initialisation du client
llm_client = HfInference(api_token=hf_token)

def call_llm(inference_client: HfInference, prompt: str):
    """
    Appelle le modèle de langage avec un prompt donné
    
    Args:
        inference_client: Client Hugging Face initialisé
        prompt: Texte du prompt à envoyer au modèle
    
    Returns:
        str: Texte généré par le modèle
    """
    response = inference_client.text_generation(
        model=repo_id,
        inputs=prompt,
        parameters={"max_new_tokens": 200}
    )
    return response["generated_text"]

# Exemple d'utilisation
if __name__ == "__main__":
    # Exemple de prompt
    response = call_llm(llm_client, "Donne moi un code en python pour scrapper des données")
    print(response)
