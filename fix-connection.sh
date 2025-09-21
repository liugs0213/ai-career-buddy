#!/bin/bash

# 修复数据库连接和字符集问题
echo "🔧 修复数据库连接和字符集问题..."

# 数据库连接信息
DB_HOST="10.98.1.99"
DB_USER="root"
DB_PASS="root_password_here"
DB_NAME="ai_career_buddy"

echo "📋 数据库信息:"
echo "  - 主机: $DB_HOST"
echo "  - 数据库: $DB_NAME"
echo "  - 用户: $DB_USER"

# 1. 测试连接
echo ""
echo "🔍 1. 测试数据库连接..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "SELECT 1;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 数据库连接成功"
else
    echo "❌ 数据库连接失败，请检查:"
    echo "   - 数据库服务是否运行"
    echo "   - 网络连接是否正常"
    echo "   - 用户名密码是否正确"
    exit 1
fi

# 2. 修复数据库字符集
echo ""
echo "🔧 2. 修复数据库字符集..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "
ALTER DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"

# 3. 修复表字符集
echo ""
echo "🔧 3. 修复表字符集..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
ALTER TABLE user_documents CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN file_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN file_content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN extracted_info TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN processing_error TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN tags VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN metadata TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"

# 4. 验证修复结果
echo ""
echo "✅ 4. 验证修复结果..."
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
    AND t.TABLE_NAME = 'user_documents'
    AND c.COLUMN_NAME IN ('file_name', 'file_content', 'extracted_info')
ORDER BY c.ORDINAL_POSITION;
"

# 5. 测试中文插入
echo ""
echo "🧪 5. 测试中文插入..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
INSERT INTO user_documents (
    user_id, document_type, file_name, file_size, file_type, 
    file_path, file_content, upload_source, is_processed, processing_status
) VALUES (
    'test-user', 'test', '测试文档.md', 100, 'md',
    '/test/path', '这是测试内容', 'manual', 0, 'pending'
);

SELECT 
    id,
    file_name,
    HEX(file_name) as name_hex,
    file_content,
    HEX(LEFT(file_content, 10)) as content_hex
FROM user_documents 
WHERE user_id = 'test-user' 
ORDER BY id DESC 
LIMIT 1;

DELETE FROM user_documents WHERE user_id = 'test-user';
"

echo ""
echo "🎉 修复完成！"
echo ""
echo "📝 后续操作建议:"
echo "1. 重新上传有问题的文档"
echo "2. 或者调用重新处理API"
echo "3. 检查应用连接配置"
