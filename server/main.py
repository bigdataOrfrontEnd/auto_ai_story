# main.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from models.project_model import ScriptRequest
from services.script_service import ScriptService

app = FastAPI()
service = ScriptService()

# 允许跨域（前端 Vite 默认 5173 端口）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/script/analyze")
async def analyze_script(request: ScriptRequest):
    return StreamingResponse(
        service.generate_analysis(request.content),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)