#!/bin/bash

# 测试文档处理修复
echo "🧪 测试文档处理修复..."

# API基础URL
API_BASE="http://localhost:8080/api"

echo "📋 测试步骤:"
echo "1. 检查文档状态"
echo "2. 重新处理文档"
echo "3. 验证处理结果"

# 1. 检查文档状态
echo ""
echo "🔍 1. 检查文档ID=2的状态..."
curl -s -X GET "$API_BASE/users/default-user/documents/2" | jq '.'

# 2. 重新处理文档
echo ""
echo "🔧 2. 重新处理文档ID=2..."
curl -s -X POST "$API_BASE/users/default-user/documents/2/retry" | jq '.'

# 等待处理完成
echo ""
echo "⏳ 等待处理完成..."
sleep 3

# 3. 检查处理结果
echo ""
echo "✅ 3. 检查处理结果..."
curl -s -X GET "$API_BASE/users/default-user/documents/2" | jq '.'

# 4. 尝试获取提取信息
echo ""
echo "📊 4. 尝试获取提取信息..."
curl -s -X GET "$API_BASE/users/default-user/documents/2/extracted-info" | jq '.'

echo ""
echo "🎉 测试完成！"
echo ""
echo "📝 如果仍有问题，请检查:"
echo "1. 后端服务是否正常运行"
echo "2. 数据库字符集是否正确"
echo "3. 文档内容是否有效"
