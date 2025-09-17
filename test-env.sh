#!/bin/bash

# 测试环境变量传递脚本

echo "🧪 测试环境变量传递..."

# 测试1: 本地构建测试
echo "=== 测试1: 本地构建测试 ==="
cd frontend

# 设置环境变量
export VITE_API_BASE_URL="http://test-api:8080"

echo "设置的环境变量: VITE_API_BASE_URL=$VITE_API_BASE_URL"

# 运行构建命令查看输出
echo "运行构建命令..."
npm run build:ignore-ts 2>&1 | grep -E "(Vite构建模式|环境变量VITE_API_BASE_URL|API Base URL|最终使用的API Base URL)"

echo ""

# 测试2: Docker构建测试
echo "=== 测试2: Docker构建测试 ==="
cd ..

echo "构建测试镜像..."
docker build \
  --build-arg VITE_API_BASE_URL="http://docker-test:8080" \
  -t test-frontend:env-test \
  frontend/ 2>&1 | grep -E "(构建时环境变量|Vite构建模式|环境变量VITE_API_BASE_URL)"

echo ""
echo "✅ 环境变量测试完成!"
echo ""
echo "📋 检查方法:"
echo "1. 查看构建日志中的环境变量输出"
echo "2. 运行容器后查看浏览器控制台日志"
echo "3. 检查网络请求的URL是否正确"
