#!/bin/bash

# 强制更新部署脚本
echo "🔄 强制更新AI Career Buddy部署..."

# 推送最新镜像
echo "📦 推送最新镜像..."
podman push harbor.weizhipin.com/arsenal-ai/ai-career-buddy-frontend:latest
podman push harbor.weizhipin.com/arsenal-ai/ai-career-buddy-backend:latest

# 删除现有部署
echo "🗑️ 删除现有部署..."
kubectl delete deployment ai-career-buddy-combined -n kf-partition-gray --ignore-not-found=true

# 等待Pod完全删除
echo "⏳ 等待Pod删除..."
kubectl wait --for=delete pod -l app=ai-career-buddy-combined -n kf-partition-gray --timeout=60s

# 重新部署
echo "🚀 重新部署..."
kubectl apply -f k8s-combined-deployment.yaml

# 等待部署完成
echo "⏳ 等待部署完成..."
kubectl rollout status deployment/ai-career-buddy-combined -n kf-partition-gray --timeout=300s

# 显示部署状态
echo "📊 部署状态:"
kubectl get pods -n kf-partition-gray -l app=ai-career-buddy-combined

echo "✅ 部署更新完成！"
echo ""
echo "📝 重要提示："
echo "1. 清除浏览器缓存 (Ctrl+Shift+R 或 Cmd+Shift+R)"
echo "2. 检查前端是否使用 localhost:8080 访问后端"
echo "3. 如果仍有问题，请检查Pod日志："
echo "   kubectl logs -n kf-partition-gray -l app=ai-career-buddy-combined -c frontend"
echo "   kubectl logs -n kf-partition-gray -l app=ai-career-buddy-combined -c backend"
