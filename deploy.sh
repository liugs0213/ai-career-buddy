#!/bin/bash

# AI Career Buddy 部署脚本

set -e

# 配置变量
IMAGE_NAME="ai-career-buddy"
IMAGE_TAG="latest"
REGISTRY=""  # 请设置您的镜像仓库地址，如: registry.example.com/

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 开始部署 AI Career Buddy...${NC}"

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker未运行，请先启动Docker${NC}"
    exit 1
fi

# 检查kubectl是否可用
if ! kubectl version --client > /dev/null 2>&1; then
    echo -e "${RED}❌ kubectl未安装或不可用${NC}"
    exit 1
fi

# 构建Docker镜像
echo -e "${YELLOW}📦 构建Docker镜像...${NC}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

# 如果设置了镜像仓库，则推送镜像
if [ ! -z "$REGISTRY" ]; then
    echo -e "${YELLOW}📤 推送镜像到仓库...${NC}"
    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}${IMAGE_NAME}:${IMAGE_TAG}
    docker push ${REGISTRY}${IMAGE_NAME}:${IMAGE_TAG}
    
    # 更新部署文件中的镜像地址
    sed -i.bak "s|image: ai-career-buddy:latest|image: ${REGISTRY}${IMAGE_NAME}:${IMAGE_TAG}|g" k8s-deployment.yaml
fi

# 部署到Kubernetes
echo -e "${YELLOW}🚀 部署到Kubernetes...${NC}"
kubectl apply -f k8s-deployment.yaml

# 等待部署完成
echo -e "${YELLOW}⏳ 等待部署完成...${NC}"
kubectl rollout status deployment/ai-career-buddy

# 显示服务信息
echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}📋 服务信息:${NC}"
kubectl get services ai-career-buddy-service
kubectl get ingress ai-career-buddy-ingress

# 显示Pod状态
echo -e "${GREEN}📊 Pod状态:${NC}"
kubectl get pods -l app=ai-career-buddy

echo -e "${GREEN}🎉 部署成功！访问地址: http://ai-career-buddy.local${NC}"
echo -e "${YELLOW}💡 提示: 请确保您的域名解析正确，或修改hosts文件${NC}"
