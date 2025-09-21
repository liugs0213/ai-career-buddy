#!/bin/bash

# 检查文档数据（解决乱码和格式问题）
echo "🔍 检查文档数据..."

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

# 1. 检查字符集设置
echo ""
echo "📊 1. 检查数据库字符集设置..."
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

# 2. 检查文档基本信息（避免长文本显示问题）
echo ""
echo "📋 2. 检查文档基本信息..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    id,
    user_id,
    document_type,
    file_name,
    file_size,
    file_type,
    upload_source,
    is_processed,
    processing_status,
    LEFT(processing_error, 100) as error_preview,
    created_at
FROM user_documents 
ORDER BY id;
"

# 3. 检查特定文档的文件名（测试中文显示）
echo ""
echo "🔤 3. 检查文档文件名（测试中文显示）..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    id,
    file_name,
    HEX(file_name) as file_name_hex,
    LENGTH(file_name) as name_length,
    CHAR_LENGTH(file_name) as char_length
FROM user_documents 
WHERE id IN (1, 2, 3, 4);
"

# 4. 检查文档内容长度和编码
echo ""
echo "📄 4. 检查文档内容编码..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    id,
    file_type,
    LENGTH(file_content) as content_length,
    CHAR_LENGTH(file_content) as char_length,
    LEFT(file_content, 50) as content_preview,
    HEX(LEFT(file_content, 20)) as content_hex
FROM user_documents 
WHERE file_content IS NOT NULL AND file_content != '';
"

# 5. 检查是否有乱码字符
echo ""
echo "🔍 5. 检查乱码字符..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
SELECT 
    id,
    file_name,
    CASE 
        WHEN file_name LIKE '%?%' THEN 'CONTAINS_QUESTION_MARKS'
        ELSE 'OK'
    END as name_status,
    CASE 
        WHEN file_content LIKE '%?%' THEN 'CONTAINS_QUESTION_MARKS'
        ELSE 'OK'
    END as content_status
FROM user_documents;
"

echo ""
echo "🎉 检查完成！"
echo ""
echo "📝 如果发现乱码问题，请运行:"
echo "   ./fix-charset.sh"
echo ""
echo "📝 如果需要重新处理文档，请运行:"
echo "   ./test-document-fix.sh"
