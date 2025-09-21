#!/bin/bash

# 修复 MySQL 8.0 字符集问题
echo "🔧 修复 MySQL 8.0 字符集问题..."

# 数据库连接信息
DB_HOST="10.98.1.99"
DB_USER="root"
DB_PASS="root_password_here"
DB_NAME="ai_career_buddy"

echo "📋 数据库信息:"
echo "  - 主机: $DB_HOST"
echo "  - 数据库: $DB_NAME"
echo "  - 用户: $DB_USER"

# 1. 检查 MySQL 版本
echo ""
echo "🔍 1. 检查 MySQL 版本..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "SELECT VERSION();"

# 2. 检查当前字符集设置
echo ""
echo "📊 2. 检查当前字符集设置..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "
SHOW VARIABLES LIKE 'character%';
SHOW VARIABLES LIKE 'collation%';
"

# 3. 检查数据库字符集
echo ""
echo "📋 3. 检查数据库字符集..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "
SELECT 
    SCHEMA_NAME,
    DEFAULT_CHARACTER_SET_NAME,
    DEFAULT_COLLATION_NAME
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = '$DB_NAME';
"

# 4. 修复服务器字符集设置（如果可能）
echo ""
echo "🔧 4. 尝试修复服务器字符集设置..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "
SET GLOBAL character_set_server = 'utf8mb4';
SET GLOBAL collation_server = 'utf8mb4_unicode_ci';
SET GLOBAL character_set_database = 'utf8mb4';
SET GLOBAL collation_database = 'utf8mb4_unicode_ci';
"

# 5. 修复数据库字符集
echo ""
echo "🔧 5. 修复数据库字符集..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "
ALTER DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"

# 6. 修复表字符集
echo ""
echo "🔧 6. 修复表字符集..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
-- 修复 user_documents 表
ALTER TABLE user_documents CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复其他表
ALTER TABLE messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE notes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_profiles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE career_histories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"

# 7. 修复字段字符集
echo ""
echo "🔧 7. 修复字段字符集..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
-- 修复 user_documents 表字段
ALTER TABLE user_documents MODIFY COLUMN file_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN file_content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN extracted_info TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN processing_error TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN tags VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN metadata TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复 messages 表字段
ALTER TABLE messages MODIFY COLUMN content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE messages MODIFY COLUMN attachments TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复 notes 表字段
ALTER TABLE notes MODIFY COLUMN title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE notes MODIFY COLUMN content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"

# 8. 验证修复结果
echo ""
echo "✅ 8. 验证修复结果..."
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

# 9. 测试中文插入
echo ""
echo "🧪 9. 测试中文插入..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
-- 创建测试表
CREATE TEMPORARY TABLE test_charset_mysql8 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_name VARCHAR(255),
    test_content TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 插入测试数据
INSERT INTO test_charset_mysql8 (test_name, test_content) VALUES 
('测试文件名.md', '这是测试内容，包含中文'),
('劳动合同示例.md', '包含各种中文字符的文档内容');

-- 查询测试数据
SELECT 
    id,
    test_name,
    HEX(test_name) as name_hex,
    test_content,
    HEX(LEFT(test_content, 20)) as content_hex
FROM test_charset_mysql8;
"

# 10. 检查现有数据
echo ""
echo "📄 10. 检查现有数据..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    id,
    file_name,
    HEX(file_name) as name_hex,
    LENGTH(file_name) as name_length,
    CHAR_LENGTH(file_name) as char_length
FROM user_documents 
WHERE id IN (1, 2, 3, 4)
LIMIT 2;
"

echo ""
echo "🎉 MySQL 8.0 字符集修复完成！"
echo ""
echo "📝 后续操作建议:"
echo "1. 重新上传有问题的文档"
echo "2. 或者调用重新处理API"
echo "3. 检查应用连接字符串是否包含正确的字符集参数"
echo ""
echo "📝 MySQL 8.0 特殊注意事项:"
echo "1. 确保连接字符串包含 charset=utf8mb4"
echo "2. 确保客户端连接时设置正确的字符集"
echo "3. 如果问题仍然存在，可能需要重启 MySQL 服务"
