#!/bin/bash

echo "🔍 测试后端日志问题..."

# 获取后端Pod
BACKEND_POD=$(kubectl get pods -n kf-partition-gray | grep ai-career-buddy-backend | head -1 | awk '{print $1}')

if [ -z "$BACKEND_POD" ]; then
  echo "❌ 未找到后端Pod"
  exit 1
fi

echo "📦 后端Pod: $BACKEND_POD"

echo ""
echo "=== 1. 检查环境变量 ==="
kubectl exec $BACKEND_POD -n kf-partition-gray -- env | grep -E "(LOG_|APP_)" | sort

echo ""
echo "=== 2. 检查日志目录 ==="
kubectl exec $BACKEND_POD -n kf-partition-gray -- ls -la /app/logs/ 2>/dev/null || echo "❌ 日志目录不存在或无权限"

echo ""
echo "=== 3. 检查应用进程 ==="
kubectl exec $BACKEND_POD -n kf-partition-gray -- ps aux | grep main

echo ""
echo "=== 4. 检查端口监听 ==="
kubectl exec $BACKEND_POD -n kf-partition-gray -- netstat -tlnp | grep 8080

echo ""
echo "=== 5. 检查最近的日志 ==="
kubectl logs $BACKEND_POD -n kf-partition-gray --tail=20

echo ""
echo "=== 6. 测试健康检查 ==="
kubectl exec $BACKEND_POD -n kf-partition-gray -- wget -qO- http://localhost:8080/health 2>/dev/null || echo "❌ 健康检查失败"

echo ""
echo "=== 7. 检查应用启动日志 ==="
kubectl logs $BACKEND_POD -n kf-partition-gray | grep -E "(🚀|📋|✅|❌|启动|初始化)" | tail -10
