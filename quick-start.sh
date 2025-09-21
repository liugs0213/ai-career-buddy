#!/bin/bash

echo "🚀 快速启动AI职场管家..."

# 启动后端
echo "启动后端服务..."
cd backend
go run cmd/api/main.go &
BACKEND_PID=$!

# 等待后端启动
sleep 2

# 启动前端
echo "启动前端服务..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ 服务启动完成!"
echo "📡 后端: http://localhost:8080"
echo "🎨 前端: http://localhost:3000"

# 保持运行
wait

