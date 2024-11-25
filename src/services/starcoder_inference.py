# Installer les dépendances
#pip install huggingface_hub

from huggingface_hub import InferenceClient
import json

# Configuration
repo_id = "bigcode/starcoder2-3b"

# Initialisation du client
llm_client = InferenceClient(
    model=repo_id,
    timeout=120,
)

def call_llm(inference_client: InferenceClient, prompt: str):
    """
    Appelle le modèle de langage avec un prompt donné
    
    Args:
        inference_client: Client Hugging Face initialisé
        prompt: Texte du prompt à envoyer au modèle
    
    Returns:
        str: Texte généré par le modèle
    """
    response = inference_client.post(
        json={
            "inputs": prompt,
            "parameters": {"max_new_tokens": 200},
            "task": "text-generation",
        }
    )
    return json.loads(response.decode())[0]["generated_text"]

# Exemple d'utilisation
if __name__ == "__main__":
    # Exemple de prompt
    response = call_llm(llm_client, "Donne moi un code en python pour scrapper des données")
    print(response)