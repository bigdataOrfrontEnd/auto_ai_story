import json
import asyncio
from openai import OpenAI

class ScriptService:
    def __init__(self):
        self.client = OpenAI(
            api_key="你的API_KEY",
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
        )

    async def generate_analysis(self, content: str):
        text_len = len(content)
        # 1. 发送初步诊断信息
        yield f"data: {json.dumps({'status': 'processing', 'text': f'> 检测到文本长度: {text_len} 字\n'})}\n\n"
        await asyncio.sleep(0.3)

        # 2. 根据长度决策逻辑分支
        if text_len < 100:
            yield f"data: {json.dumps({'status': 'processing', 'text': '> 模式：创意扩写模式 (Creative Expansion)\n'})}\n\n"
            # 逻辑：调用一个扩写 Prompt
            prompt = f"你是一个天才编剧。请将以下一句话大纲扩写成具有电影感的故事细节：{content}"
        elif text_len > 2000:
            yield f"data: {json.dumps({'status': 'processing', 'text': '> 模式：章节拆分模式 (Chapter Segmentation)\n'})}\n\n"
            # 逻辑：调用一个摘要并切分章节的 Prompt
            prompt = f"你是一个资深导演。请将以下长文本拆分为逻辑连贯的电影场景，并保留核心视觉特征：{content}"
        else:
            yield f"data: {json.dumps({'status': 'processing', 'text': '> 模式：直接解析模式 (Direct Extraction)\n'})}\n\n"
            prompt = f"请解析以下剧本并提取角色和分镜：{content}"

        # 3. 模拟 AI 思考输出 (打字机效果)
        # 实际开发中，这里直接 return self.client.chat.completions.create(stream=True) 并循环 yield
        response_text = "AI 正在生成深度分析报告...\n-------------------\n"
        for char in response_text:
            yield f"data: {json.dumps({'status': 'streaming', 'text': char})}\n\n"
            await asyncio.sleep(0.01)

        # 4. 模拟最终沉淀的结构化 JSON 数据
        # 这里数据应该根据 prompt 的不同结果而变化
        final_data = {
            "status": "completed",
            "characters": [{"name": "马克", "visualPrompt": "astronaut"}],
            "shots": [{"action": "在火星行走"}]
        }
        yield f"data: {json.dumps(final_data)}\n\n"