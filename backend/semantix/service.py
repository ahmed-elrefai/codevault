import os
import json
from groq import Groq
from backend import settings
from fastapi import HTTPException, status

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """
You are an expert code documentor and analyzer. Your task is to analyze the provided code snippet and return a structured JSON response.
The JSON must contain the following keys:
- "description": A concise summary of what the code does (max 2 sentences).
- "tags": A list of relevant technical tags (e.g., ["python", "auth", "jwt"]).
- "language": The programming language of the snippet.
- "time_complexity": The time complexity (Big O notation, e.g., "O(n)").
- "space_complexity": The space complexity (Big O notation, e.g., "O(1)").

Do not include any markdown formatting or explanations outside the JSON. Return ONLY the raw JSON string.
"""

def analyze_code_with_llm(code: str) -> dict:
    if not settings.GROQ_API_KEY:
         raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="AI Service not configured (Missing API Key)")

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": f"Analyze this code:\n\n{code}",
                }
            ],
            model=settings.AI_MODEL,
            temperature=0.1, # Low temperature for consistent, structured output
            response_format={"type": "json_object"} # Force JSON mode if supported by model, otherwise prompt relies on it
        )
        
        content = chat_completion.choices[0].message.content
        if not content:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Received empty response from AI")

        return json.loads(content)

    except json.JSONDecodeError:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to parse AI response")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"AI Service Error: {str(e)}")
