# server/core/structured_extraction.py
import json
import re
import sys
from typing import Any, Coroutine
from openai import OpenAI
from jinja2 import Template
try:
    from json_repair import repair_json
except ImportError:
    repair_json = None

# Note: This is a standalone function, not part of a class.
async def extract_structure(
    client: OpenAI, 
    get_template_func,
    text: str, 
    template_name: str
) -> Coroutine[Any, Any, list]:
    """
    Extracts a list of structured data (JSON) from text using a specified template and an AI model.

    Args:
        client: The OpenAI client instance.
        get_template_func: A function that takes a template name and content and returns a rendered prompt.
        text: The input text to analyze.
        template_name: The name of the template to use for extraction.

    Returns:
        The extracted data as a list, or an empty list if parsing fails.
    """
    prompt = get_template_func(template_name, text)

    response = client.chat.completions.create(
        model="qwen-plus",
        messages=[{"role": "user", "content": prompt}],
        stream=False,
    )

    raw = response.choices[0].message.content.strip()

    # Attempt to parse the JSON response with fallbacks
    data = None
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        # Fallback 1: Use json_repair
        if repair_json:
            try:
                fixed = repair_json(raw)
                data = json.loads(fixed)
            except (json.JSONDecodeError, ValueError):
                pass
        
        # Fallback 2: Extract the first JSON-like block
        if data is None:
            match = re.search(r'[\{\[](.|\n)*?[\}\]]', raw)
            if match:
                try:
                    data = json.loads(match.group(0))
                except (json.JSONDecodeError, ValueError):
                    pass

    if data is None:
        print(f"Failed to extract valid JSON for '{template_name}'. Raw output: {raw}", file=sys.stderr)
        return []

    return data if isinstance(data, list) else []
