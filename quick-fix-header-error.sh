#!/bin/bash

# 快速修复 HTTP 请求头字段值错误
echo "🔧 快速修复 HTTP 请求头字段值错误..."

echo "📋 问题: net/http: invalid header field value for \"X-Higress-Llm-Model\""

echo ""
echo "🔍 检查当前状态..."

# 检查代码中是否还有相关请求头
if grep -r "x-higress-llm-model" backend/; then
    echo "❌ 代码中仍然存在相关请求头，需要修复"
    exit 1
else
    echo "✅ 代码中已移除相关请求头"
fi

echo ""
echo "🔧 执行修复步骤..."

# 1. 重启后端服务
echo ""
echo "1. 重启后端服务..."
if command -v kubectl &> /dev/null; then
    echo "使用 kubectl 重启服务..."
    kubectl rollout restart deployment/ai-career-buddy-combined -n kf-partition-gray
    echo "✅ 服务重启命令已执行"
    
    # 等待服务重启
    echo "⏳ 等待服务重启完成..."
    kubectl rollout status deployment/ai-career-buddy-combined -n kf-partition-gray --timeout=300s
else
    echo "❌ kubectl 不可用，请手动重启服务"
fi

# 2. 检查服务状态
echo ""
echo "2. 检查服务状态..."
if command -v kubectl &> /dev/null; then
    kubectl get pods -n kf-partition-gray | grep ai-career-buddy
    echo "✅ 服务状态检查完成"
else
    echo "❌ 无法检查服务状态"
fi

# 3. 测试 API 连接
echo ""
echo "3. 测试 API 连接..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ API 连接正常"
else
    echo "❌ API 连接失败，请检查服务状态"
fi

echo ""
echo "🎉 修复完成！"
echo ""
echo "📝 后续操作建议:"
echo "1. 清除浏览器缓存"
echo "2. 重新测试文档上传功能"
echo "3. 如果问题仍然存在，请检查网络代理配置"
echo ""
echo "📝 如果问题仍然存在，请运行:"
echo "./diagnose-header-error.sh"
