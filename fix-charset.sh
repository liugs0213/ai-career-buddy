#!/bin/bash

# 修复数据库字符集问题
echo "🔧 修复数据库字符集问题..."

# 数据库连接信息
DB_HOST="10.98.1.99"
DB_USER="root"
DB_PASS="root_password_here"
DB_NAME="ai_career_buddy"

echo "📋 数据库信息:"
echo "  - 主机: $DB_HOST"
echo "  - 数据库: $DB_NAME"
echo "  - 用户: $DB_USER"

# 检查数据库连接
echo ""
echo "🔍 检查数据库连接..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "SELECT 1;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 数据库连接成功"
else
    echo "❌ 数据库连接失败"
    exit 1
fi

# 检查当前字符集
echo ""
echo "📊 检查当前字符集设置..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    TABLE_NAME,
    TABLE_COLLATION,
    COLUMN_NAME,
    CHARACTER_SET_NAME,
    COLLATION_NAME
FROM 
    information_schema.TABLES t
    JOIN information_schema.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
WHERE 
    t.TABLE_SCHEMA = '$DB_NAME'
    AND c.TABLE_SCHEMA = '$DB_NAME'
    AND c.COLUMN_TYPE LIKE '%TEXT%'
ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION;
"

# 执行字符集修复
echo ""
echo "🔧 执行字符集修复..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME < backend/sql/fix_charset.sql

if [ $? -eq 0 ]; then
    echo "✅ 字符集修复完成"
else
    echo "❌ 字符集修复失败"
    exit 1
fi

# 验证修复结果
echo ""
echo "✅ 验证修复结果..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    TABLE_NAME,
    TABLE_COLLATION,
    COLUMN_NAME,
    CHARACTER_SET_NAME,
    COLLATION_NAME
FROM 
    information_schema.TABLES t
    JOIN information_schema.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
WHERE 
    t.TABLE_SCHEMA = '$DB_NAME'
    AND c.TABLE_SCHEMA = '$DB_NAME'
    AND c.COLUMN_TYPE LIKE '%TEXT%'
ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION;
"

# 检查问题文档
echo ""
echo "🔍 检查问题文档..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    id, 
    file_name, 
    file_type, 
    document_type, 
    is_processed, 
    processing_status,
    processing_error
FROM user_documents 
WHERE id = 2;
"

echo ""
echo "🎉 字符集修复完成！"
echo ""
echo "📝 后续操作建议:"
echo "1. 重新上传有问题的文档"
echo "2. 或者调用重新处理API: POST /api/users/default-user/documents/2/retry"
echo "3. 检查文档处理状态"
