#!/bin/bash

# 深度诊断 HTTP 请求头字段值错误
echo "🔍 深度诊断 HTTP 请求头字段值错误..."

echo "📋 错误信息:"
echo "API请求失败 (状态码: 503): invalid header value for: x-higress-llm-model"

echo ""
echo "🔍 1. 检查当前运行的代码..."

# 检查是否有未保存的更改
if [ -f "backend/internal/api/bailian_client.go" ]; then
    echo "检查 bailian_client.go 文件..."
    if grep -n "x-higress-llm-model" backend/internal/api/bailian_client.go; then
        echo "❌ 文件中仍然存在 x-higress-llm-model"
    else
        echo "✅ 文件中已移除 x-higress-llm-model"
    fi
fi

echo ""
echo "🔍 2. 检查所有 Go 文件..."
if find backend/ -name "*.go" -exec grep -l "x-higress-llm-model" {} \; 2>/dev/null; then
    echo "❌ 发现包含 x-higress-llm-model 的 Go 文件"
else
    echo "✅ 所有 Go 文件中都没有 x-higress-llm-model"
fi

echo ""
echo "🔍 3. 检查是否有其他变体..."
if find backend/ -name "*.go" -exec grep -l "higress.*model\|model.*higress" {} \; 2>/dev/null; then
    echo "❌ 发现相关变体"
else
    echo "✅ 没有发现相关变体"
fi

echo ""
echo "🔍 4. 检查配置文件..."
if find . -name "*.yaml" -o -name "*.yml" -o -name "*.json" | xargs grep -l "x-higress-llm-model" 2>/dev/null; then
    echo "❌ 配置文件中发现相关设置"
else
    echo "✅ 配置文件中没有相关设置"
fi

echo ""
echo "🔍 5. 检查环境变量..."
if env | grep -i "higress\|model"; then
    echo "❌ 环境变量中发现相关设置"
else
    echo "✅ 环境变量中没有相关设置"
fi

echo ""
echo "🔍 6. 检查 Kubernetes 配置..."
if command -v kubectl &> /dev/null; then
    echo "检查 Kubernetes 配置..."
    if kubectl get configmaps -n kf-partition-gray | grep -i "higress\|model"; then
        echo "❌ Kubernetes 配置中发现相关设置"
    else
        echo "✅ Kubernetes 配置中没有相关设置"
    fi
else
    echo "❌ kubectl 不可用，无法检查 Kubernetes 配置"
fi

echo ""
echo "🔍 7. 检查服务状态..."
if command -v kubectl &> /dev/null; then
    echo "检查服务状态..."
    kubectl get pods -n kf-partition-gray | grep ai-career-buddy
    echo ""
    echo "检查服务日志..."
    kubectl logs --tail=20 deployment/ai-career-buddy-combined -n kf-partition-gray 2>/dev/null | grep -i "higress\|model\|header" || echo "日志中没有相关信息"
else
    echo "❌ kubectl 不可用，无法检查服务状态"
fi

echo ""
echo "🎯 可能的原因分析:"
echo "1. 服务端要求: 百炼 API 可能要求 x-higress-llm-model 请求头"
echo "2. 网络代理: 可能有中间件或代理添加了这个请求头"
echo "3. 缓存问题: 旧的代码可能还在运行"
echo "4. 配置问题: 可能有其他配置导致这个问题"

echo ""
echo "🔧 建议的解决方案:"
echo "1. 重新添加 x-higress-llm-model 请求头，但使用清理后的值"
echo "2. 检查百炼 API 文档，确认是否需要这个请求头"
echo "3. 重启所有相关服务"
echo "4. 检查网络代理配置"

echo ""
echo "📝 立即操作建议:"
echo "1. 重新添加请求头: 在 bailian_client.go 中添加清理后的请求头"
echo "2. 重启服务: kubectl rollout restart deployment/ai-career-buddy-combined -n kf-partition-gray"
echo "3. 检查 API 文档: 确认百炼 API 的要求"
