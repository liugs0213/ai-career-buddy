#!/bin/bash

# 诊断 HTTP 请求头字段值错误
echo "🔍 诊断 HTTP 请求头字段值错误..."

echo "📋 错误信息:"
echo "Post \"http://higress-pirate-prod-gao.weizhipin.com/v1/chat/completions\": net/http: invalid header field value for \"X-Higress-Llm-Model\""

echo ""
echo "🔍 检查当前代码状态..."

# 1. 检查 bailian_client.go 中是否还有 x-higress-llm-model
echo ""
echo "1. 检查 bailian_client.go 中的请求头设置..."
if grep -n "x-higress-llm-model" backend/internal/api/bailian_client.go; then
    echo "❌ 仍然存在 x-higress-llm-model 请求头"
else
    echo "✅ bailian_client.go 中已移除 x-higress-llm-model 请求头"
fi

# 2. 检查整个后端代码中是否还有相关请求头
echo ""
echo "2. 检查整个后端代码..."
if grep -r "x-higress-llm-model" backend/; then
    echo "❌ 后端代码中仍然存在相关请求头"
else
    echo "✅ 后端代码中已移除相关请求头"
fi

# 3. 检查前端代码
echo ""
echo "3. 检查前端代码..."
if grep -r "x-higress-llm-model" frontend/; then
    echo "❌ 前端代码中存在相关请求头"
else
    echo "✅ 前端代码中无相关请求头"
fi

# 4. 检查配置文件
echo ""
echo "4. 检查配置文件..."
if grep -r "x-higress-llm-model" . --include="*.yaml" --include="*.yml" --include="*.json"; then
    echo "❌ 配置文件中存在相关请求头"
else
    echo "✅ 配置文件中无相关请求头"
fi

echo ""
echo "🔍 可能的原因分析:"
echo "1. 代码中已移除请求头，但错误仍然出现"
echo "2. 可能是缓存的问题"
echo "3. 可能是其他服务或中间件设置了这个请求头"
echo "4. 可能是网络代理或网关添加了这个请求头"

echo ""
echo "🔧 建议的解决方案:"
echo "1. 重启后端服务"
echo "2. 清除浏览器缓存"
echo "3. 检查网络代理配置"
echo "4. 检查 Kubernetes 服务配置"
echo "5. 检查是否有其他中间件添加了这个请求头"

echo ""
echo "📝 立即操作建议:"
echo "1. 重启后端服务: kubectl restart deployment ai-career-buddy-combined -n kf-partition-gray"
echo "2. 检查服务日志: kubectl logs -f deployment/ai-career-buddy-combined -n kf-partition-gray"
echo "3. 清除浏览器缓存并重新测试"
