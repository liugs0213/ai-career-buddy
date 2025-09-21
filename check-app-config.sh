#!/bin/bash

# 检查应用连接配置
echo "🔍 检查应用连接配置..."

# 检查环境变量
echo "📋 1. 检查环境变量..."
echo "MYSQL_DSN: $MYSQL_DSN"
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "DB_NAME: $DB_NAME"
echo "DB_USERNAME: $DB_USERNAME"
echo "DB_PASSWORD: $DB_PASSWORD"

# 检查应用是否运行
echo ""
echo "🔍 2. 检查应用状态..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ 应用运行正常"
    
    # 测试API
    echo ""
    echo "🧪 3. 测试API..."
    curl -s -X GET "http://localhost:8080/api/users/default-user/documents" | jq '.documents | length' 2>/dev/null || echo "API测试失败"
    
else
    echo "❌ 应用未运行或无法访问"
fi

# 检查Docker容器
echo ""
echo "🐳 4. 检查Docker容器..."
docker ps | grep ai-career-buddy || echo "未找到相关容器"

# 检查Kubernetes部署
echo ""
echo "☸️ 5. 检查Kubernetes部署..."
kubectl get pods -n kf-partition-gray | grep ai-career-buddy || echo "未找到相关Pod"

echo ""
echo "📝 如果发现问题，请检查:"
echo "1. 应用是否正确启动"
echo "2. 环境变量是否正确设置"
echo "3. 数据库连接是否正常"
echo "4. 网络连接是否正常"
