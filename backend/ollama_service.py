import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"

def extract_data(text: str, source_type: str = "mpesa", custom_instruction: str = None, model: str = "llama2"):
    
    # Base instruction is now generic but strict about JSON
    base_instruction = "Extract relevant data from the text."

    # Append custom instruction if provided, with high priority
    additional_instruction = ""
    if custom_instruction:
        additional_instruction = f"""
        CRITICAL USER INSTRUCTION: {custom_instruction}
        You MUST extract EXACTLY the fields requested in the instruction above.
        Do not rename fields. Do not add fields not requested.
        If a requested field is not found, return null for that field.
        """
    else:
        # Default fallback if no instruction is given
        additional_instruction = "Extract the following fields: transaction_code, amount, sender_name, receiver_name, date, time."

    prompt = f"""
    You are a strict data extraction engine.
    Task: {base_instruction}
    {additional_instruction}
    
    Return ONLY valid JSON. Do not include any explanation or markdown formatting.
    
    Text to process:
    {text}
    """
    
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }
    
    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        result = response.json()
        return json.loads(result['response'])
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        # Return a partial object or error indicator instead of None if possible, 
        # but None is handled by the caller.
        return {"error": str(e), "raw_text": text}
