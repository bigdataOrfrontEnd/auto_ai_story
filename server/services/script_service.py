# services/script_service.py
import os
import json
import asyncio
from openai import OpenAI
import os
from jinja2 import Template
class ScriptService:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("DASHSCOPE_API_KEY"),
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
        )
        self.template_path = os.path.join(
            os.path.dirname(__file__), "..", "templates"
        )

    def sse(self, event: str, data):
        return f"data: {json.dumps({'event': event, 'data': data}, ensure_ascii=False)}\n\n"

    def _get_template(self, name: str, content: str) -> str:
        path = os.path.join(self.template_path, f"{name}.txt")
        with open(path, "r", encoding="utf-8") as f:
            return Template(f.read()).render(content=content)

    async def generate_analysis(self, story: str, project_id: str | None):
        length = len(story)

        # 1️⃣ 基础日志
        yield self.sse("log", f"输入长度: {length}")

        # 2️⃣ 决策模式
        if length < 100:
            mode = "creative_expansion"
            template = "expansion"
        elif length > 2000:
            mode = "segmentation"
            template = "segmentation"
        else:
            mode = "direct_analysis"
            template = "extraction"

        yield self.sse("stage", mode)

        prompt = self._get_template(template, story)

        # 3️⃣ LLM 流式输出
        try:
            response = self.client.chat.completions.create(
                model="qwen-plus",
                messages=[{"role": "user", "content": prompt}],
                stream=True
            )

            full_text = ""

            for chunk in response:
                delta = chunk.choices[0].delta
                if delta and delta.content:
                    full_text += delta.content
                    yield self.sse("token", delta.content)
                    await asyncio.sleep(0.003)

            # 4️⃣ 最终结果（占位）
            yield self.sse("result", {
                "projectId": project_id,
                "rawText": full_text,
                "characters": [],
                "scenes": [],
                "shots": []
            })

        except Exception as e:
            yield self.sse("error", str(e))
