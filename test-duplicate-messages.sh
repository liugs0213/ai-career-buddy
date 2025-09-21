#!/bin/bash

# 快速测试重复消息修复
echo "🧪 测试重复消息修复..."

API_BASE_URL="http://localhost:8080"
TEST_USER_ID="test-user-$(date +%s)"
TEST_THREAD_ID="contract-$(date +%s)"

echo "📋 测试参数: $TEST_USER_ID, $TEST_THREAD_ID"

# 测试普通消息API
echo "🔍 测试普通消息API..."
RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/messages" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$TEST_USER_ID\",\"threadId\":\"$TEST_THREAD_ID\",\"content\":\"测试消息\",\"modelId\":\"bailian/qwen-flash\"}")

MESSAGE_COUNT=$(echo "$RESPONSE" | jq '. | length' 2>/dev/null || echo "解析失败")
echo "消息数量: $MESSAGE_COUNT"

if [ "$MESSAGE_COUNT" = "2" ]; then
    echo "✅ 普通API正常 (2条消息)"
else
    echo "❌ 普通API异常: $MESSAGE_COUNT 条消息"
fi

echo "🎉 测试完成"