#!/bin/bash

# AI Career Buddy 部署脚本
# 此脚本将部署包含前端和后端的组合应用

set -e

echo "🚀 开始部署 AI Career Buddy 到 Kubernetes..."

# 检查kubectl是否可用
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl 未安装或不在PATH中"
    echo "请先安装kubectl并配置Kubernetes集群连接"
    exit 1
fi

# 检查集群连接
echo "📡 检查Kubernetes集群连接..."
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ 无法连接到Kubernetes集群"
    echo "请检查kubeconfig配置"
    exit 1
fi

echo "✅ 集群连接正常"

# 检查命名空间是否存在
NAMESPACE="kf-partition-gray"
echo "📦 检查命名空间: $NAMESPACE"
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo "创建命名空间: $NAMESPACE"
    kubectl create namespace $NAMESPACE
else
    echo "✅ 命名空间 $NAMESPACE 已存在"
fi

# 部署应用
echo "🚀 部署应用..."
kubectl apply -f k8s-combined-deployment.yaml

# 等待部署完成
echo "⏳ 等待部署完成..."
kubectl rollout status deployment/ai-career-buddy-combined -n $NAMESPACE --timeout=300s

# 显示部署状态
echo "📊 部署状态:"
kubectl get pods -n $NAMESPACE -l app=ai-career-buddy-combined

echo "🌐 服务状态:"
kubectl get svc -n $NAMESPACE -l app=ai-career-buddy-combined

echo "✅ 部署完成！"
echo ""
echo "📝 访问信息:"
echo "前端服务: http://<集群IP>:80"
echo "后端API: http://<集群IP>:8080"
echo ""
echo "🔍 查看日志:"
echo "kubectl logs -n $NAMESPACE -l app=ai-career-buddy-combined -c backend"
echo "kubectl logs -n $NAMESPACE -l app=ai-career-buddy-combined -c frontend"
