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
        # 获取模板文件夹的绝对路径
        self.template_path = os.path.join(os.path.dirname(__file__), "..", "templates")

    def _get_template(self, template_name: str, content: str) -> str:
        """
        使用 Jinja2 渲染模板
        :param template_name: 模板文件名 (不带后缀)
        :param content: 用户输入的原文
        """
        file_path = os.path.join(self.template_path, f"{template_name}.txt")
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                template_str = f.read()
            
            # 使用 Jinja2 渲染
            template = Template(template_str)
            return template.render(content=content)
            
        except FileNotFoundError:
            return f"Error: Template {template_name} not found."

    async def generate_analysis(self, content: str):
        text_len = len(content)
        
        # 1. 发送初步诊断
        yield f"data: {json.dumps({'status': 'processing', 'text': f'> 输入长度: {text_len} 字\n'})}\n\n"
        
        # 2. 决策分支并加载模板
        if text_len < 100:
            yield f"data: {json.dumps({'status': 'processing', 'text': '> 模式：创意扩写\n'})}\n\n"
            prompt = self._get_template("expansion", content)
        elif text_len > 2000:
            yield f"data: {json.dumps({'status': 'processing', 'text': '> 模式：章节拆分\n'})}\n\n"
            prompt = self._get_template("segmentation", content)
        else:
            yield f"data: {json.dumps({'status': 'processing', 'text': '> 模式：直接解析\n'})}\n\n"
            prompt = self._get_template("extraction", content)

        # 3. 调用真正的 LLM 流式接口
        # 注意：这里演示如何将 AI 的实时回复“流”给前端
        try:
            response = self.client.chat.completions.create(
                model="qwen-plus", # 或你使用的模型
                messages=[{"role": "user", "content": prompt}],
                stream=True
            )

            full_reply = ""
            for chunk in response:
                if chunk.choices[0].delta.content:
                    char = chunk.choices[0].delta.content
                    full_reply += char
                    yield f"data: {json.dumps({'status': 'streaming', 'text': char})}\n\n"
                    # 适当的小延迟，让打字机效果更丝滑
                    await asyncio.sleep(0.01)

            # 4. 任务完成：模拟/获取结构化数据
            # 实际项目中，你可以再让 LLM 做一次结构化转换，或者从上面的回复中正则提取
            final_data = {
                "status": "completed",
                "characters": [{"name": "待处理角色", "visualPrompt": "cinematic lighting"}],
                "shots": [{"action": "根据 AI 解析结果生成的动作"}]
            }
            yield f"data: {json.dumps(final_data)}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'status': 'error', 'text': f'AI 调用失败: {str(e)}'})}\n\n"