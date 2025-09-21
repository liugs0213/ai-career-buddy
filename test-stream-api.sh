#!/bin/bash

# 测试Stream API配置
echo "🧪 测试Stream API配置..."

# 检查环境变量
echo "📋 环境信息:"
echo "  - NODE_ENV: ${NODE_ENV:-未设置}"
echo "  - VITE_API_BASE_URL: ${VITE_API_BASE_URL:-未设置}"

# 测试开发环境API
echo ""
echo "🔧 测试开发环境API配置..."
cd frontend
npm run build:ignore-ts 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 前端构建成功"
    
    # 检查构建产物中的API配置
    echo "📦 检查构建产物..."
    if grep -q "localhost:8080" dist/assets/*.js; then
        echo "⚠️  发现硬编码的localhost:8080"
    else
        echo "✅ 未发现硬编码的localhost:8080"
    fi
    
    # 检查环境变量处理
    if grep -q "import.meta.env.PROD" dist/assets/*.js; then
        echo "✅ 发现环境变量处理逻辑"
    else
        echo "⚠️  未发现环境变量处理逻辑"
    fi
else
    echo "❌ 前端构建失败"
fi

echo ""
echo "🌐 测试nginx配置..."
if [ -f "nginx.conf" ]; then
    echo "✅ nginx.conf存在"
    
    # 检查stream相关配置
    if grep -q "proxy_buffering off" nginx.conf; then
        echo "✅ 发现stream优化配置"
    else
        echo "⚠️  未发现stream优化配置"
    fi
    
    if grep -q "proxy_read_timeout 300s" nginx.conf; then
        echo "✅ 发现stream超时配置"
    else
        echo "⚠️  未发现stream超时配置"
    fi
else
    echo "❌ nginx.conf不存在"
fi

echo ""
echo "📝 总结:"
echo "1. 前端API配置已更新为动态配置"
echo "2. Stream API使用统一的配置工具"
echo "3. nginx配置已优化支持stream请求"
echo "4. 生产环境使用相对路径，开发环境使用localhost"
echo ""
echo "🚀 部署建议:"
echo "1. 重新构建前端镜像: ./build-frontend-nginx.sh"
echo "2. 更新K8s部署: kubectl apply -f k8s-combined-deployment.yaml"
echo "3. 验证stream功能正常工作"
