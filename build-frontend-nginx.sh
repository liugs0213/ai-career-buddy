#!/bin/bash

# 构建使用nginx的前端镜像
echo "🚀 构建前端nginx镜像..."

# 设置镜像标签
IMAGE_TAG="harbor.weizhipin.com/arsenal-ai/ai-career-buddy-frontend:latest"

# 进入前端目录
cd frontend

# 构建镜像
echo "📦 使用nginx Dockerfile构建镜像..."
podman build -f Dockerfile.nginx -t $IMAGE_TAG .

if [ $? -eq 0 ]; then
    echo "✅ 前端nginx镜像构建成功: $IMAGE_TAG"
    
    # 推送镜像到仓库
    echo "📤 推送镜像到仓库..."
    docker push $IMAGE_TAG
    
    if [ $? -eq 0 ]; then
        echo "✅ 镜像推送成功"
        echo "🎉 前端nginx镜像构建和推送完成！"
        echo "📋 镜像信息:"
        echo "   - 镜像名: $IMAGE_TAG"
        echo "   - 端口: 80 (nginx)"
        echo "   - 特性: nginx代理API请求到后端"
    else
        echo "❌ 镜像推送失败"
        exit 1
    fi
else
    echo "❌ 前端nginx镜像构建失败"
    exit 1
fi
