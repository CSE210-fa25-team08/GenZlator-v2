import json
import os
from typing import Dict, List, Any, Optional


class PromptManager:
    def __init__(self, prompts_file: str = "./prompts/prompts.json"):
        self.prompts_file = prompts_file
        self.prompts = self._load_prompts()

    def _load_prompts(self) -> Dict[str, Any]:
        """load prompts from JSON file"""
        try:
            with open(self.prompts_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"Prompts file not found: {self.prompts_file}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in prompts file: {e}")

    def get_system_prompt(self, prompt_type: str, **kwargs) -> str:
        """get system prompt"""
        prompt_config = self.prompts["prompts"]["system_prompts"].get(prompt_type)
        if not prompt_config:
            raise ValueError(f"System prompt type '{prompt_type}' not found")

        return prompt_config["content"].format(**kwargs)

    def get_user_prompt(self, prompt_type: str, **kwargs) -> str:
        """get user prompt"""
        prompt_config = self.prompts["prompts"]["user_prompts"].get(prompt_type)
        if not prompt_config:
            raise ValueError(f"User prompt type '{prompt_type}' not found")

        return prompt_config["content"].format(**kwargs)

    def format_chat_history(self, chat_history: List[str]) -> str:
        """format chat history"""
        if not chat_history:
            return self.prompts["prompts"]["formatting"]["chat_history_empty"]

        format_template = self.prompts["prompts"]["formatting"]["chat_history_format"]
        return "\n".join(
            format_template.format(message=msg) for msg in chat_history[-2:]
        )

    def format_similar_examples(self, examples: List[Dict[str, Any]]) -> str:
        """format similar examples"""
        if not examples:
            return "No similar examples found."

        format_template = self.prompts["prompts"]["formatting"][
            "similar_example_format"
        ]
        formatted_examples = []

        for example in examples:
            formatted = format_template.format(
                original=example.get("originalInput", ""),
                correction=example.get("correctionText", ""),
                similarity=example.get("similarity", 0.0),
            )
            formatted_examples.append(formatted)

        return "\n\n".join(formatted_examples)
