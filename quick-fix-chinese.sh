#!/bin/bash

# 快速修复 MySQL 中文输入问题
echo "🔧 快速修复 MySQL 中文输入问题..."

# 数据库连接信息
DB_HOST="10.98.1.99"
DB_USER="root"
DB_PASS="root_password_here"
DB_NAME="ai_career_buddy"

# 设置环境变量
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8
export LC_CTYPE=zh_CN.UTF-8

echo "✅ 环境变量已设置"

# 测试连接
echo "🔍 测试连接..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "SELECT '中文测试成功' as result;"

if [ $? -eq 0 ]; then
    echo "✅ 连接成功，中文输入已修复"
    echo ""
    echo "📝 现在可以使用以下命令连接 MySQL:"
    echo "mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4"
    echo ""
    echo "📝 或者运行:"
    echo "./connect-mysql.sh"
else
    echo "❌ 连接失败，请检查数据库配置"
fi
