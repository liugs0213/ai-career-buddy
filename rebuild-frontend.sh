#!/bin/bash

echo "🔧 重新构建前端镜像，使用正确的API地址..."

# 设置参数
API_URL="http://10.98.208.222:80"
IMAGE_NAME="harbor.weizhipin.com/arsenal-oceanus/ai-career-buddy-frontend"
TAG="v0.0.2"

echo "📡 API地址: $API_URL"
echo "📦 镜像: $IMAGE_NAME:$TAG"

# 进入前端目录
cd frontend

# 构建镜像
echo "🐳 开始构建..."
podman build \
  --build-arg VITE_API_BASE_URL="$API_URL" \
  -t "$IMAGE_NAME:$TAG" \
  .

if [ $? -eq 0 ]; then
  echo "✅ 构建成功!"
  
  # 推送镜像
  echo "📤 推送镜像..."
  podman push "$IMAGE_NAME:$TAG"
  
  if [ $? -eq 0 ]; then
    echo "✅ 推送成功!"
    echo ""
    echo "🚀 现在更新K8s部署:"
    echo "kubectl set image deployment/ai-career-buddy-frontend frontend=$IMAGE_NAME:$TAG -n kf-partition-gray"
  else
    echo "❌ 推送失败!"
  fi
else
  echo "❌ 构建失败!"
fi
