#!/bin/bash

# MVP前端构建脚本
# 支持本地开发和生产环境

set -e

# 默认配置
IMAGE_NAME="harbor.weizhipin.com/arsenal-ai/ai-career-buddy-frontend"
TAG="latest"
API_BASE_URL="http://10.98.208.222:80"

# 解析命令行参数
while [[ $# -gt 0 ]]; do
  case $1 in
    --api-url)
      API_BASE_URL="$2"
      shift 2
      ;;
    --tag)
      TAG="$2"
      shift 2
      ;;
    --help)
      echo "用法: $0 [选项]"
      echo "选项:"
      echo "  --api-url URL    设置API基础URL (默认: http://localhost:8080)"
      echo "  --tag TAG        设置镜像标签 (默认: latest)"
      echo "  --help           显示此帮助信息"
      exit 0
      ;;
    *)
      echo "未知参数: $1"
      echo "使用 --help 查看帮助信息"
      exit 1
      ;;
  esac
done

echo "🚀 开始构建前端镜像..."
echo "📡 API基础URL: $API_BASE_URL"
echo "🏷️  镜像标签: $TAG"

# 进入前端目录
cd frontend

# 测试环境变量传递
echo "🔍 测试环境变量传递..."
echo "VITE_API_BASE_URL=$API_BASE_URL" > .env.local
echo "创建的环境文件内容:"
cat .env.local

# 构建Docker镜像
echo "🐳 开始Docker构建..."
podman build \
  --build-arg VITE_API_BASE_URL="$API_BASE_URL" \
  -t "$IMAGE_NAME:$TAG" \
  .

echo "✅ 前端镜像构建完成!"
echo "📦 镜像: $IMAGE_NAME:$TAG"

# 询问是否推送到仓库
read -p "是否推送到Harbor仓库? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "📤 推送镜像到Harbor..."
  podman push "$IMAGE_NAME:$TAG"
  echo "✅ 镜像推送完成!"
fi

echo "🎉 构建完成!"
echo ""
echo "📋 使用说明:"
echo "1. 本地开发: npm run dev (使用Vite代理)"
echo "2. 生产部署: kubectl apply -f k8s-frontend-mvp.yaml"
echo "3. 自定义API地址: ./build-frontend.sh --api-url http://your-api-server:port"
