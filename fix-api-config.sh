#!/bin/bash

# 修复API配置问题
echo "🔧 修复前端API配置..."

# 重新构建前端镜像（使用正确的API地址）
echo "📦 重新构建前端镜像..."
cd frontend
podman build -t harbor.weizhipin.com/arsenal-ai/ai-career-buddy-frontend:latest .

# 推送更新后的镜像
echo "🚀 推送更新后的前端镜像..."
podman push harbor.weizhipin.com/arsenal-ai/ai-career-buddy-frontend:latest

echo "✅ 修复完成！"
echo ""
echo "📋 修复内容："
echo "- 前端API地址从 http://10.98.208.222:80 改为 http://localhost:8080"
echo "- 这样前端可以通过Pod内部网络访问后端服务"
echo ""
echo "🔄 下一步："
echo "1. 重新部署应用：kubectl apply -f k8s-combined-deployment.yaml"
echo "2. 或者使用：./deploy-to-k8s.sh"
