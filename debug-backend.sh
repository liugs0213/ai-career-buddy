#!/bin/bash

echo "🔍 调试后端服务..."

# 检查Pod状态
echo "=== Pod状态 ==="
kubectl get pods -n kf-partition-gray | grep ai-career-buddy

echo ""
echo "=== 后端Pod日志 ==="
BACKEND_POD=$(kubectl get pods -n kf-partition-gray | grep ai-career-buddy-backend | head -1 | awk '{print $1}')
if [ ! -z "$BACKEND_POD" ]; then
  echo "后端Pod: $BACKEND_POD"
  kubectl logs $BACKEND_POD -n kf-partition-gray --tail=50
else
  echo "未找到后端Pod"
fi

echo ""
echo "=== 环境变量检查 ==="
if [ ! -z "$BACKEND_POD" ]; then
  kubectl exec $BACKEND_POD -n kf-partition-gray -- env | grep -E "(APP_|DB_|LOG_|BAILIAN_)" | sort
fi

echo ""
echo "=== 健康检查 ==="
if [ ! -z "$BACKEND_POD" ]; then
  kubectl exec $BACKEND_POD -n kf-partition-gray -- wget -qO- http://localhost:8080/health || echo "健康检查失败"
fi

echo ""
echo "=== 文件系统检查 ==="
if [ ! -z "$BACKEND_POD" ]; then
  echo "日志目录:"
  kubectl exec $BACKEND_POD -n kf-partition-gray -- ls -la /app/logs/ 2>/dev/null || echo "日志目录不存在"
  echo "上传目录:"
  kubectl exec $BACKEND_POD -n kf-partition-gray -- ls -la /app/uploads/ 2>/dev/null || echo "上传目录不存在"
fi
