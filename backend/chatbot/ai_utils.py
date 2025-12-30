from django.conf import settings
from groq import Groq
import json

_client = None  # lazy singleton


def get_groq_client():
    """
    Lazily create Groq client only when needed.
    Safe for CI, migrations, and production.
    """
    global _client

    if _client is None:
        if not settings.GROQ_API_KEY:
            raise RuntimeError(
                "GROQ_API_KEY is not set. "
                "AI features are disabled."
            )
        _client = Groq(api_key=settings.GROQ_API_KEY)

    return _client


def send_to_ai(message):
    """
    Send user message to Groq LLM.
    """
    client = get_groq_client()

    prompt = f"""
You are an AI shopping assistant for a fashion e-commerce app.

IMPORTANT RULES:
- The platform has ONLY ONE BRAND: Fluxo
- NEVER ask about brand
- NEVER include brand in output
- If the user mentions ONLY price → intent MUST be "search"

ALLOWED CATEGORIES:
- men
- ladies

ALLOWED SUBCATEGORIES:
- t-shirt
- shirt
- trousers
- jackets
- coats
- tops
- leggings
- blouses

You MUST return JSON ONLY in this format:

{{
  "intent": "search" | "recommend" | "smalltalk",
  "payload": {{
    "category": "men | ladies | null",
    "subcategory": "one of the allowed subcategories or null",
    "max_price": number | null,
    "query": "string | null"
  }},
  "reply": "Natural language reply"
}}

User message: "{message}"
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )

    text = response.choices[0].message.content.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "intent": "smalltalk",
            "payload": {},
            "reply": "Can you please rephrase that?"
        }
