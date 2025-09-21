#!/bin/bash

# 快速检查文档数据
echo "🔍 快速检查文档数据..."

# 数据库连接信息
DB_HOST="10.98.1.99"
DB_USER="root"
DB_PASS="root_password_here"
DB_NAME="ai_career_buddy"

# 使用SQL文件查询，避免格式问题
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME < query-documents.sql

echo ""
echo "📝 如果发现乱码问题，请运行:"
echo "   ./fix-charset.sh"
echo ""
echo "📝 如果需要重新处理文档，请运行:"
echo "   ./test-document-fix.sh"
