#!/bin/bash

# 测试百炼API配置
echo "🧪 测试百炼API配置..."

# 设置API配置
API_URL="http://higress-pirate-prod-gao.weizhipin.com/v1/chat/completions"
API_KEY="sk-84229c5e-18ea-4b6a-a04a-2183688f9373"

echo "📋 API配置:"
echo "URL: $API_URL"
echo "Key: ${API_KEY:0:10}..."

echo ""
echo "🔍 测试API连接..."

# 测试API连接
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -H "x-higress-llm-model: qwen-flash" \
  -d '{
    "model": "qwen-flash",
    "stream": false,
    "messages": [
      {
        "role": "user",
        "content": "你好，请简单回复"
      }
    ]
  }')

# 分离响应体和状态码
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

echo "HTTP状态码: $http_code"
echo "响应内容: $response_body"

if [ "$http_code" = "200" ]; then
    if [ "$response_body" = "success" ] || [ "$response_body" = "ok" ]; then
        echo "❌ API返回简单成功消息，可能是API Key无效"
    elif echo "$response_body" | grep -q "error\|Error\|ERROR"; then
        echo "❌ API返回错误信息"
    else
        echo "✅ API响应正常"
    fi
else
    echo "❌ HTTP请求失败，状态码: $http_code"
fi

echo ""
echo "🔧 建议的解决方案:"
echo "1. 检查API Key是否有效"
echo "2. 检查API URL是否正确"
echo "3. 检查网络连接"
echo "4. 联系API提供方确认配置"
