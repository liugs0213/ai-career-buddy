-- 修复MySQL字符集兼容性问题
-- 解决问号字符(�)导致的编码错误

-- 1. 设置数据库字符集为utf8mb4
ALTER DATABASE ai_career_buddy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. 修复messages表的字符集
ALTER TABLE messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. 修复content字段的字符集（这是主要问题字段）
ALTER TABLE messages MODIFY COLUMN content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. 修复其他可能包含中文的字段
ALTER TABLE messages MODIFY COLUMN attachments TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. 修复notes表
ALTER TABLE notes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE notes MODIFY COLUMN title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE notes MODIFY COLUMN content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 6. 修复user_profiles表
ALTER TABLE user_profiles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_profiles MODIFY COLUMN nickname VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_profiles MODIFY COLUMN industry VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_profiles MODIFY COLUMN position VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_profiles MODIFY COLUMN company VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_profiles MODIFY COLUMN career_stage VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_profiles MODIFY COLUMN preferences TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 7. 修复career_histories表
ALTER TABLE career_histories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE career_histories MODIFY COLUMN title VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE career_histories MODIFY COLUMN content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE career_histories MODIFY COLUMN ai_response TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE career_histories MODIFY COLUMN tags VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE career_histories MODIFY COLUMN metadata TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 8. 修复user_documents表
ALTER TABLE user_documents CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN file_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN file_content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN extracted_info TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN tags VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_documents MODIFY COLUMN metadata TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 9. 验证字符集设置
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
    AND c.COLUMN_TYPE LIKE '%TEXT%'
ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION;