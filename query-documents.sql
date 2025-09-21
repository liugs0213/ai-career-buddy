-- 查询文档数据（避免格式问题）
-- 使用这个SQL文件来避免MySQL命令行显示长文本时的格式混乱

-- 1. 检查文档基本信息
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

-- 2. 检查文件名编码
SELECT 
    id,
    file_name,
    HEX(file_name) as file_name_hex,
    LENGTH(file_name) as name_length,
    CHAR_LENGTH(file_name) as char_length
FROM user_documents 
WHERE id IN (1, 2, 3, 4);

-- 3. 检查文档内容编码
SELECT 
    id,
    file_type,
    LENGTH(file_content) as content_length,
    CHAR_LENGTH(file_content) as char_length,
    LEFT(file_content, 50) as content_preview,
    HEX(LEFT(file_content, 20)) as content_hex
FROM user_documents 
WHERE file_content IS NOT NULL AND file_content != '';

-- 4. 检查乱码字符
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

-- 5. 检查字符集设置
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
    t.TABLE_SCHEMA = 'ai_career_buddy'
    AND c.TABLE_SCHEMA = 'ai_career_buddy'
    AND t.TABLE_NAME = 'user_documents'
    AND c.COLUMN_NAME IN ('file_name', 'file_content', 'extracted_info')
ORDER BY c.ORDINAL_POSITION;
