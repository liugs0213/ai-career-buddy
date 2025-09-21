#!/bin/bash

# 修复 MySQL 客户端中文输入问题
echo "🔧 修复 MySQL 客户端中文输入问题..."

# 数据库连接信息
DB_HOST="10.98.1.99"
DB_USER="root"
DB_PASS="root_password_here"
DB_NAME="ai_career_buddy"

echo "📋 数据库信息:"
echo "  - 主机: $DB_HOST"
echo "  - 数据库: $DB_NAME"
echo "  - 用户: $DB_USER"

# 1. 检查当前环境变量
echo ""
echo "🔍 1. 检查当前环境变量..."
echo "LANG: $LANG"
echo "LC_ALL: $LC_ALL"
echo "LC_CTYPE: $LC_CTYPE"

# 2. 设置正确的环境变量
echo ""
echo "🔧 2. 设置正确的环境变量..."
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8
export LC_CTYPE=zh_CN.UTF-8

echo "设置后的环境变量:"
echo "LANG: $LANG"
echo "LC_ALL: $LC_ALL"
echo "LC_CTYPE: $LC_CTYPE"

# 3. 测试 MySQL 客户端连接
echo ""
echo "🧪 3. 测试 MySQL 客户端连接..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
SELECT '测试中文输入' as test_chinese;
"

# 4. 创建 MySQL 客户端配置文件
echo ""
echo "🔧 4. 创建 MySQL 客户端配置文件..."
cat > ~/.my.cnf << 'EOF'
[client]
default-character-set=utf8mb4
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

[mysql]
default-character-set=utf8mb4

[mysqldump]
default-character-set=utf8mb4
EOF

echo "✅ MySQL 客户端配置文件已创建: ~/.my.cnf"

# 5. 测试中文输入
echo ""
echo "🧪 5. 测试中文输入..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
-- 创建测试表
CREATE TEMPORARY TABLE test_chinese_input (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    content TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 插入中文数据
INSERT INTO test_chinese_input (name, content) VALUES 
('测试文档', '这是测试内容'),
('劳动合同', '包含中文的文档'),
('Offer示例', '字节跳动Offer分析');

-- 查询中文数据
SELECT * FROM test_chinese_input;
"

# 6. 提供正确的连接命令
echo ""
echo "📝 6. 正确的 MySQL 连接命令:"
echo "mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4"

# 7. 创建便捷连接脚本
echo ""
echo "🔧 7. 创建便捷连接脚本..."
cat > connect-mysql.sh << EOF
#!/bin/bash
# 设置环境变量
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8
export LC_CTYPE=zh_CN.UTF-8

# 连接 MySQL
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4
EOF

chmod +x connect-mysql.sh
echo "✅ 便捷连接脚本已创建: ./connect-mysql.sh"

echo ""
echo "🎉 MySQL 客户端中文输入修复完成！"
echo ""
echo "📝 使用方法:"
echo "1. 使用便捷脚本: ./connect-mysql.sh"
echo "2. 或者使用完整命令:"
echo "   mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4"
echo ""
echo "📝 注意事项:"
echo "1. 确保终端支持 UTF-8 编码"
echo "2. 确保输入法设置正确"
echo "3. 如果仍有问题，可能需要重启终端"
