#!/bin/bash

# 测试当前镜像的环境变量

echo "🧪 测试当前镜像的环境变量..."

# 运行当前镜像
echo "🐳 运行当前镜像..."
docker run -d --name test-frontend \
  -p 3001:3000 \
  harbor.weizhipin.com/arsenal-oceanus/ai-career-buddy-fronted:latest

# 等待容器启动
sleep 5

# 检查容器日志
echo "📋 容器日志:"
docker logs test-frontend

# 检查环境变量
echo ""
echo "🔍 容器环境变量:"
docker exec test-frontend env | grep -E "(VITE_|NODE_|PORT)"

# 访问页面并检查
echo ""
echo "🌐 访问测试页面..."
curl -s http://localhost:3001 | grep -o "API Base URL: [^<]*" || echo "未找到API Base URL信息"

# 清理
echo ""
echo "🧹 清理测试容器..."
docker stop test-frontend
docker rm test-frontend

echo "✅ 测试完成!"
