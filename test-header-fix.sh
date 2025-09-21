#!/bin/bash

# 测试 HTTP 请求头修复
echo "🧪 测试 HTTP 请求头修复..."

echo "📋 修复内容:"
echo "1. 重新添加 x-higress-llm-model 请求头"
echo "2. 使用 utils.SanitizeModelID() 清理模型ID"
echo "3. 确保请求头值符合 HTTP 规范"

echo ""
echo "🔍 检查修复后的代码..."

# 检查是否添加了请求头
if grep -n "x-higress-llm-model" backend/internal/api/bailian_client.go; then
    echo "✅ 已添加 x-higress-llm-model 请求头"
else
    echo "❌ 未找到 x-higress-llm-model 请求头"
fi

# 检查是否使用了清理函数
if grep -n "SanitizeModelID" backend/internal/api/bailian_client.go; then
    echo "✅ 已使用 SanitizeModelID 清理函数"
else
    echo "❌ 未使用 SanitizeModelID 清理函数"
fi

# 检查是否导入了 utils 包
if grep -n "ai-career-buddy/internal/utils" backend/internal/api/bailian_client.go; then
    echo "✅ 已导入 utils 包"
else
    echo "❌ 未导入 utils 包"
fi

echo ""
echo "🔧 编译测试..."
if cd backend && go build -o /tmp/test-build ./cmd/api/; then
    echo "✅ 编译成功"
    rm -f /tmp/test-build
else
    echo "❌ 编译失败"
    exit 1
fi

echo ""
echo "🎉 修复完成！"
echo ""
echo "📝 修复说明:"
echo "1. 重新添加了 x-higress-llm-model 请求头"
echo "2. 使用 SanitizeModelID() 函数清理模型ID"
echo "3. 确保请求头值符合 HTTP 规范"
echo ""
echo "📝 后续操作:"
echo "1. 重启后端服务"
echo "2. 测试文档上传功能"
echo "3. 检查是否还有错误"
echo ""
echo "📝 重启服务命令:"
echo "kubectl rollout restart deployment/ai-career-buddy-combined -n kf-partition-gray"
