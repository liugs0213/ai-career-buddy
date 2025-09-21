#!/bin/bash

# 诊断数据库连接问题
echo "🔍 诊断数据库连接问题..."

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

# 2. 检查数据库字符集
echo ""
echo "📊 2. 检查数据库字符集..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "
SELECT 
    DEFAULT_CHARACTER_SET_NAME,
    DEFAULT_COLLATION_NAME
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = '$DB_NAME';
"

# 3. 检查表字符集
echo ""
echo "📋 3. 检查表字符集..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    TABLE_NAME,
    TABLE_COLLATION
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = '$DB_NAME' 
AND TABLE_NAME = 'user_documents';
"

# 4. 检查字段字符集
echo ""
echo "🔤 4. 检查字段字符集..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    COLUMN_NAME,
    CHARACTER_SET_NAME,
    COLLATION_NAME,
    COLUMN_TYPE
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = '$DB_NAME' 
AND TABLE_NAME = 'user_documents'
AND COLUMN_NAME IN ('file_name', 'file_content', 'extracted_info');
"

# 5. 测试中文插入
echo ""
echo "🧪 5. 测试中文插入..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
CREATE TEMPORARY TABLE test_charset (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_name VARCHAR(255),
    test_content TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO test_charset (test_name, test_content) VALUES ('测试文件名', '这是测试内容');

SELECT 
    test_name,
    HEX(test_name) as name_hex,
    test_content,
    HEX(LEFT(test_content, 10)) as content_hex
FROM test_charset;
"

# 6. 检查连接参数
echo ""
echo "🔗 6. 检查连接参数..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';
"

# 7. 检查现有数据
echo ""
echo "📄 7. 检查现有数据编码..."
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
echo "🎉 诊断完成！"
echo ""
echo "📝 如果发现字符集问题，请运行:"
echo "   ./fix-charset.sh"
echo ""
echo "📝 如果连接有问题，请检查:"
echo "   1. 数据库服务是否正常运行"
echo "   2. 网络连接是否正常"
echo "   3. 用户名密码是否正确"
echo "   4. 数据库是否存在"
