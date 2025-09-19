#!/bin/bash

echo "🧪 测试前端构建过程..."

# 测试1: 使用默认值构建
echo "=== 测试1: 默认值构建 ==="
cd frontend
podman build -t test-frontend-default . 2>&1 | grep -E "(构建时环境变量|VITE_API_BASE_URL)"

# 测试2: 使用自定义值构建
echo ""
echo "=== 测试2: 自定义值构建 ==="
podman build \
  --build-arg VITE_API_BASE_URL="http://10.98.208.222:80" \
  -t test-frontend-custom . 2>&1 | grep -E "(构建时环境变量|VITE_API_BASE_URL)"

# 测试3: 运行容器检查环境变量
echo ""
echo "=== 测试3: 检查构建结果 ==="
echo "运行默认构建的容器..."
podman run -d --name test-default -p 3001:3000 test-frontend-default
sleep 3
echo "默认构建的环境变量:"
podman exec test-default env | grep VITE_API_BASE_URL || echo "未找到VITE_API_BASE_URL"

echo ""
echo "运行自定义构建的容器..."
podman run -d --name test-custom -p 3002:3000 test-frontend-custom
sleep 3
echo "自定义构建的环境变量:"
podman exec test-custom env | grep VITE_API_BASE_URL || echo "未找到VITE_API_BASE_URL"

# 清理
echo ""
echo "🧹 清理测试容器..."
podman stop test-default test-custom
podman rm test-default test-custom
podman rmi test-frontend-default test-frontend-custom

echo "✅ 测试完成!"
