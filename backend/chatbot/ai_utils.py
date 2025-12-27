from groq import Groq
from django.conf import settings

import os
client = os.getenv("GROQ_API_KEY")


def send_to_ai(message):
    prompt = f"""
    You are an AI shopping assistant.

    You MUST return JSON only in this format:

    {{
        "intent": "search" or "recommend" or "smalltalk",
        "payload": {{
            "category": "...",
            "subcategory": "...",
            "max_price": number,
            "query": "..."
        }},
        "reply": "Natural language reply"
    }}

    Extract:
    - category (men/ladies/kids)
    - subcategory (t-shirt, jeans, shirt, etc.)
    - max_price if user mentions price
    - general search query

    User message: "{message}"
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )

    import json
    text = response.choices[0].message.content
    return json.loads(text)
