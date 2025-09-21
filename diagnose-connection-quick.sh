#!/bin/bash

echo "🔍 快速诊断前后端连接问题..."

# 检查后端服务
echo "1. 检查后端服务状态..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ 后端服务运行正常 (localhost:8080)"
    curl -s http://localhost:8080/health | jq . 2>/dev/null || echo "后端响应但JSON解析失败"
else
    echo "❌ 后端服务未运行或无法访问 (localhost:8080)"
    echo "请检查:"
    echo "  - 后端服务是否启动"
    echo "  - 端口8080是否被占用"
    echo "  - 防火墙设置"
fi

echo ""

# 检查前端代理配置
echo "2. 检查前端代理配置..."
if [ -f "frontend/vite.config.ts" ]; then
    echo "✅ Vite配置文件存在"
    echo "代理配置:"
    grep -A 10 "proxy" frontend/vite.config.ts
else
    echo "❌ Vite配置文件不存在"
fi

echo ""

# 检查环境变量
echo "3. 检查环境变量..."
echo "VITE_API_BASE_URL: ${VITE_API_BASE_URL:-'未设置'}"

echo ""

# 测试API连接
echo "4. 测试API连接..."
echo "测试直连后端:"
curl -s -w "状态码: %{http_code}, 耗时: %{time_total}s\n" http://localhost:8080/api/health -o /dev/null

echo ""
echo "测试通过前端代理 (如果前端服务运行):"
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ 前端代理工作正常"
    curl -s http://localhost:3000/api/health | jq . 2>/dev/null || echo "代理响应但JSON解析失败"
else
    echo "❌ 前端代理不可访问"
    echo "请检查前端开发服务器是否运行在 localhost:3000"
fi

echo ""
echo "🔧 建议修复步骤:"
echo "1. 启动后端: cd backend && go run cmd/api/main.go"
echo "2. 启动前端: cd frontend && npm run dev"
echo "3. 检查浏览器网络面板的请求详情"

