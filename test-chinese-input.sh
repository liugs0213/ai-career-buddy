#!/bin/bash

# 测试 MySQL 中文输入
echo "🧪 测试 MySQL 中文输入..."

# 数据库连接信息
DB_HOST="10.98.1.99"
DB_USER="root"
DB_PASS="root_password_here"
DB_NAME="ai_career_buddy"

# 设置环境变量
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8
export LC_CTYPE=zh_CN.UTF-8

echo "📋 环境变量设置:"
echo "LANG: $LANG"
echo "LC_ALL: $LC_ALL"
echo "LC_CTYPE: $LC_CTYPE"

echo ""
echo "🔍 测试中文输入..."

# 创建测试表并插入中文数据
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 << 'EOF'
-- 创建测试表
CREATE TEMPORARY TABLE test_chinese (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    content TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 插入中文数据
INSERT INTO test_chinese (name, content) VALUES 
('测试文档', '这是测试内容'),
('劳动合同', '包含中文的文档'),
('Offer示例', '字节跳动Offer分析'),
('简历示例', '个人简历文档'),
('在职证明', '工作证明文件');

-- 查询中文数据
SELECT 
    id,
    name,
    content,
    HEX(name) as name_hex,
    HEX(LEFT(content, 10)) as content_hex
FROM test_chinese;

-- 测试中文查询
SELECT * FROM test_chinese WHERE name LIKE '%测试%';
SELECT * FROM test_chinese WHERE content LIKE '%中文%';
EOF

echo ""
echo "✅ 中文输入测试完成！"
echo ""
echo "📝 如果测试成功，说明中文输入已修复"
echo "📝 如果仍有问题，请检查:"
echo "1. 终端是否支持 UTF-8"
echo "2. 输入法是否正确设置"
echo "3. MySQL 客户端版本是否支持 utf8mb4"
