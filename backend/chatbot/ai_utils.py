from groq import Groq
from django.conf import settings
import json

client = Groq(api_key=settings.GROQ_API_KEY)

def send_to_ai(message):
    prompt = f"""
You are an AI shopping assistant for a fashion e-commerce app.

IMPORTANT RULES:
- The platform has ONLY ONE BRAND: Fluxo
- NEVER ask about brand
- NEVER include brand in output
- Extract ONLY from allowed categories and subcategories
- If the user mentions ONLY price → intent is STILL "search"

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
  "reply": "Natural language reply for user"
}}

Extraction rules:
- Use ONLY the allowed subcategories list
- If no valid subcategory is mentioned → set subcategory to null
- Do NOT invent new values
- Missing fields must be null
- Casual messages → intent = smalltalk

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
