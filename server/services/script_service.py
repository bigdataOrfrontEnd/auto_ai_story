# services/script_service.py
import os
import json
import asyncio
from openai import OpenAI
from jinja2 import Template

from core.structured_extraction import extract_structure


class ScriptService:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("DASHSCOPE_API_KEY"),
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
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
        yield self.sse("log", f"输入长度: {length}")

        # ① 决策模式
        if length < 100:
            mode, template = "creative_expansion", "expansion"
        elif length > 2000:
            mode, template = "simplification", "simplification"
        else:
            mode, template = "direct_analysis", "basic"

        yield self.sse("stage", mode)

        prompt = self._get_template(template, story)

        # ② 第一阶段：原始分析（流式）
        full_text = ""
        try:
            response = self.client.chat.completions.create(
                model="qwen-plus",
                messages=[{"role": "user", "content": prompt}],
                stream=True,
            )

            for chunk in response:
                delta = chunk.choices[0].delta
                if delta and delta.content:
                    full_text += delta.content
                    yield self.sse("token", delta.content)
                    await asyncio.sleep(0.003)

            # ③ 第二阶段：结构化抽取
            yield self.sse("stage", "structure_extraction")

            # 并行执行所有提取任务
            results = await asyncio.gather(
                extract_structure(self.client, self._get_template, full_text, "character_extraction"),
                extract_structure(self.client, self._get_template, full_text, "scene_extraction"),
                extract_structure(self.client, self._get_template, full_text, "shot_extraction"),
            )
            characters, scenes, shots = results

            # ④ 数据后处理和ID填充
            for i, c in enumerate(characters):
                c.setdefault("id", f"char_{i+1}")
                c.setdefault("name", "")
                c.setdefault("aliases", "")
                c.setdefault("description", "")

            for i, s in enumerate(scenes):
                s.setdefault("id", f"scene_{i+1}")
                s.setdefault("location", "")
                s.setdefault("time", "")
                s.setdefault("description", "")
            
            default_scene_id = scenes[0]["id"] if scenes else "scene_1"
            
            for i, sh in enumerate(shots):
                sh.setdefault("id", f"shot_{i+1}")
                sh.setdefault("sceneId", default_scene_id)
                sh.setdefault("shotType", "unknown")
                sh.setdefault("description", "")

            # ⑤ 最终结果
            yield self.sse(
                "result",
                {
                    "projectId": project_id,
                    "rawText": full_text,
                    "characters": characters,
                    "scenes": scenes,
                    "shots": shots,
                },
            )

        except Exception as e:
            yield self.sse("error", str(e))