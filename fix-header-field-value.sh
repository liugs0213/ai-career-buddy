#!/bin/bash

# 修复 HTTP 请求头字段值问题
echo "🔧 修复 HTTP 请求头字段值问题..."

echo "📋 问题分析:"
echo "错误: net/http: invalid header field value for \"X-Higress-Llm-Model\""
echo "原因: modelID 包含无效字符，导致 HTTP 请求头设置失败"

echo ""
echo "🔍 检查当前代码..."

# 检查 bailian_client.go 中的问题
if grep -n "x-higress-llm-model" backend/internal/api/bailian_client.go; then
    echo "✅ 找到问题代码位置"
else
    echo "❌ 未找到问题代码"
fi

echo ""
echo "🔧 修复方案:"
echo "1. 对 modelID 进行清理和验证"
echo "2. 移除或替换无效字符"
echo "3. 确保 HTTP 请求头值符合规范"

echo ""
echo "📝 HTTP 请求头字段值规范:"
echo "- 不能包含控制字符 (ASCII 0-31)"
echo "- 不能包含换行符 (\\n) 或回车符 (\\r)"
echo "- 不能包含非 ASCII 字符"
echo "- 不能包含特殊字符如 : 等"

echo ""
echo "🎯 建议的修复步骤:"
echo "1. 在设置请求头之前清理 modelID"
echo "2. 移除或替换无效字符"
echo "3. 添加验证逻辑"
echo "4. 记录清理后的值用于调试"

echo ""
echo "📝 修复代码示例:"
echo "// 清理 modelID 中的无效字符"
echo "cleanModelID := strings.ReplaceAll(modelID, \"\\n\", \"\")"
echo "cleanModelID = strings.ReplaceAll(cleanModelID, \"\\r\", \"\")"
echo "cleanModelID = strings.ReplaceAll(cleanModelID, \":\", \"-\")"
echo "cleanModelID = strings.TrimSpace(cleanModelID)"
echo ""
echo "// 设置请求头"
echo "req.Header.Set(\"x-higress-llm-model\", cleanModelID)"
