#!/bin/bash

# 使用正确的API地址构建前端镜像

echo "🔧 修复前端构建配置..."

# 设置正确的参数
API_BASE_URL="http://10.98.208.222:80"
IMAGE_NAME="harbor.weizhipin.com/arsenal-oceanus/ai-career-buddy-frontend"
TAG="latest"

echo "📡 API基础URL: $API_BASE_URL"
echo "📦 镜像名称: $IMAGE_NAME:$TAG"

# 进入前端目录
cd frontend

# 构建Docker镜像，使用构建时环境变量
echo "🐳 开始构建Docker镜像..."
docker build \
  --build-arg VITE_API_BASE_URL="$API_BASE_URL" \
  -t "$IMAGE_NAME:$TAG" \
  .

if [ $? -eq 0 ]; then
  echo "✅ 镜像构建成功!"
  
  # 推送到仓库
  echo "📤 推送镜像到Harbor..."
  docker push "$IMAGE_NAME:$TAG"
  
  if [ $? -eq 0 ]; then
    echo "✅ 镜像推送成功!"
    echo ""
    echo "🚀 现在可以部署到K8s:"
    echo "kubectl apply -f k8s-frontend-fixed.yaml"
  else
    echo "❌ 镜像推送失败!"
  fi
else
  echo "❌ 镜像构建失败!"
fi
