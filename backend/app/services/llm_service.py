import ollama


def generate_response(user_message: str):

    response = ollama.chat(
        model="qwen2.5:0.5b",

        messages=[

            {
                "role": "system",
                "content": """
You are a voice assistant.

STRICT RULES:
- Reply ONLY in English.
- Accept ONLY English input.
- If the user speaks any other language, reply:
  'Sorry, only English language is supported.'
- Reply like a real assistant.
- Keep responses short.
- Maximum 2 sentences.
- Speak naturally.
- Do not give long explanations.
- Sound conversational and intelligent.
- Avoid bullet points.
- Avoid paragraphs.
- Keep answers short and conversational.
- Do not use emojis.
- Do not use markdown.
- Do not explain too much.
- For coding questions, give short clean code only.
"""
            },

            {
                "role": "user",
                "content": user_message
            }
        ]
    )

    return response["message"]["content"]