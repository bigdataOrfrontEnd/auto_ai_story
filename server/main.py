import os
import json
from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
# from core.comfy_client import ComfyUIClient # 导入你之前的类

app = FastAPI()

# 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. 初始化 Qwen 客户端
llm_client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 2. 初始化 ComfyUI 客户端
# comfy_client = ComfyUIClient(
#     api_url="http://127.0.0.1:8188", 
#     model_name="v1-5-pruned-emaonly.safetensors"
# )

# --- 接口 A: 剧本解析流 (Qwen) ---
@app.post("/api/script/analyze")
async def analyze_script(request: Request):
    data = await request.json()
    story = data.get("story")

    def generate():
        # 这里你可以预设 Prompt，要求 Qwen 返回特定格式的 JSON
        completion = llm_client.chat.completions.create(
            model="qwen-max",
            messages=[
                {"role": "system", "content": "你是一个电影分镜专家，请将剧本解析为角色列表和分镜 JSON。"},
                {"role": "user", "content": story}
            ],
            stream=True
        )
        for chunk in completion:
            content = chunk.choices[0].delta.content
            if content:
                yield f"data: {json.dumps({'content': content})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

# --- 接口 B: 资产/视频渲染 (ComfyUI) ---
@app.post("/api/render/image")
async def render_image(request: Request):
    data = await request.json()
    # 这里的 prompt 应该是前端根据阶段一结果生成的 ComfyUI API JSON
    comfy_prompt = data.get("prompt") 
    
    # 调用你之前的 generate_image 逻辑
    result = comfy_client._generate_image(prompt=comfy_prompt)
    return result

# --- 接口 C: 静态资源访问 ---
# 为了让前端能看到 storage 里的图，需要挂载静态目录
from fastapi.staticfiles import StaticFiles
if not os.path.exists("storage"): os.makedirs("storage")
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)