#!/bin/bash

# 给脚本执行权限: chmod +x run_project.sh

echo "[1/2] 启动后端服务器 (端口 8000)..."
cd server
source venv/bin/activate
pip install -r requirements.txt
python main.py &
BACKEND_PID=$!

echo "[2/2] 启动前端 Vite..."
cd ..
npm install
npm run dev &
FRONTEND_PID=$!

echo "项目已在后台运行。"
echo "按 Ctrl+C 停止所有服务。"

# 捕获退出信号，同时关闭前后端
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait