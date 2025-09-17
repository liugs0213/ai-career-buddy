#!/bin/bash

echo "🔧 构建后端镜像..."

# 设置参数
IMAGE_NAME="harbor.weizhipin.com/arsenal-oceanus/ai-career-buddy"
TAG="latest"

echo "📦 镜像: $IMAGE_NAME:$TAG"

# 进入后端目录
cd backend

# 构建镜像
echo "🐳 开始构建..."
docker build -t "$IMAGE_NAME:$TAG" .

if [ $? -eq 0 ]; then
  echo "✅ 构建成功!"
  
  # 推送镜像
  echo "📤 推送镜像..."
  docker push "$IMAGE_NAME:$TAG"
  
  if [ $? -eq 0 ]; then
    echo "✅ 推送成功!"
    echo ""
    echo "🚀 现在可以部署到K8s:"
    echo "kubectl apply -f k8s-backend-fixed.yaml"
  else
    echo "❌ 推送失败!"
  fi
else
  echo "❌ 构建失败!"
fi
