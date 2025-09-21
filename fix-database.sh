#!/bin/bash

# 修复数据库问题脚本
echo "🔧 修复数据库表问题..."

# 检查MySQL连接
echo "📡 检查MySQL连接..."
mysql -h 10.98.1.99 -P 3306 -u root -proot_password_here -e "SELECT 1;" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ 无法连接到MySQL数据库"
    echo "请检查数据库连接信息："
    echo "- 主机: 10.98.1.99"
    echo "- 端口: 3306"
    echo "- 用户名: root"
    echo "- 密码: root_password_here"
    exit 1
fi

echo "✅ MySQL连接正常"

# 执行数据库重建脚本
echo "📊 执行数据库重建..."
mysql -h 10.98.1.99 -P 3306 -u root -proot_password_here < backend/sql/recreate_tables.sql

if [ $? -eq 0 ]; then
    echo "✅ 数据库表重建成功"
else
    echo "❌ 数据库表重建失败"
    exit 1
fi

# 验证表是否创建成功
echo "🔍 验证表创建..."
mysql -h 10.98.1.99 -P 3306 -u root -proot_password_here ai_career_buddy -e "SHOW TABLES;" | grep -E "(user_documents|user_profiles|messages|notes)"

echo "✅ 数据库修复完成！"
echo ""
echo "📋 修复内容："
echo "- 重新创建了所有数据库表"
echo "- 确保字符集为utf8mb4"
echo "- 插入了默认用户数据"
echo ""
echo "🔄 下一步："
echo "1. 重新部署应用：kubectl apply -f k8s-combined-deployment.yaml"
echo "2. 或者使用：./deploy-to-k8s.sh"
