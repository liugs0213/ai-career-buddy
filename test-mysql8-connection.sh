#!/bin/bash

# 测试 MySQL 8.0 连接和字符集
echo "🧪 测试 MySQL 8.0 连接和字符集..."

# 数据库连接信息
DB_HOST="10.98.1.99"
DB_USER="root"
DB_PASS="root_password_here"
DB_NAME="ai_career_buddy"

echo "📋 数据库信息:"
echo "  - 主机: $DB_HOST"
echo "  - 数据库: $DB_NAME"
echo "  - 用户: $DB_USER"

# 1. 测试基本连接
echo ""
echo "🔍 1. 测试基本连接..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "SELECT 1 as connection_test;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 基本连接成功"
else
    echo "❌ 基本连接失败"
    exit 1
fi

# 2. 检查 MySQL 版本
echo ""
echo "📊 2. 检查 MySQL 版本..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "SELECT VERSION();"

# 3. 检查字符集设置
echo ""
echo "🔤 3. 检查字符集设置..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "
SHOW VARIABLES LIKE 'character%';
SHOW VARIABLES LIKE 'collation%';
"

# 4. 测试中文插入和查询
echo ""
echo "🧪 4. 测试中文插入和查询..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
-- 创建测试表
DROP TABLE IF EXISTS test_mysql8_charset;
CREATE TABLE test_mysql8_charset (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_name VARCHAR(255),
    test_content TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 插入测试数据
INSERT INTO test_mysql8_charset (test_name, test_content) VALUES 
('测试文件名.md', '这是测试内容，包含中文'),
('劳动合同示例.md', '包含各种中文字符的文档内容'),
('Offer示例.md', '字节跳动Offer分析报告');

-- 查询测试数据
SELECT 
    id,
    test_name,
    HEX(test_name) as name_hex,
    test_content,
    HEX(LEFT(test_content, 20)) as content_hex
FROM test_mysql8_charset;

-- 清理测试表
DROP TABLE test_mysql8_charset;
"

# 5. 检查现有数据
echo ""
echo "📄 5. 检查现有数据..."
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

# 6. 测试连接字符串
echo ""
echo "🔗 6. 测试连接字符串..."
echo "建议的连接字符串:"
echo "root:root_password_here@tcp(10.98.1.99:3306)/ai_career_buddy?charset=utf8mb4&parseTime=True&loc=Local&collation=utf8mb4_unicode_ci"

# 7. 检查表字符集
echo ""
echo "📋 7. 检查表字符集..."
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

echo ""
echo "🎉 MySQL 8.0 连接测试完成！"
echo ""
echo "📝 如果发现字符集问题，请运行:"
echo "   ./fix-mysql8-charset.sh"
echo ""
echo "📝 MySQL 8.0 特殊注意事项:"
echo "1. 确保连接字符串包含 charset=utf8mb4"
echo "2. 确保连接字符串包含 collation=utf8mb4_unicode_ci"
echo "3. 确保客户端连接时设置正确的字符集"
echo "4. 如果问题仍然存在，可能需要重启 MySQL 服务"
