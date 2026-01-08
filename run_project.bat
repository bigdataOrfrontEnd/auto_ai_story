@echo off
echo [1/2] 正在启动后端服务器...
@REM start cmd /k "cd server && venv\Scripts\activate && pip install -r requirements.txt && python main.py"

start cmd /k ".venv\Scripts\activate && python ./server/main.py"
echo [2/2] 正在启动前端 Vite...
start cmd /k "npm install && npm run dev"

echo 项目启动中，请检查新打开的窗口状态。
pause