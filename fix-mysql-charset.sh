#!/bin/bash

# 修复MySQL字符集兼容性问题
# 解决问号字符(�)导致的编码错误

echo "🔧 开始修复MySQL字符集兼容性问题..."

# 检查MySQL是否运行
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ MySQL服务未运行，请先启动MySQL服务"
    echo "💡 可以使用: brew services start mysql 或 sudo systemctl start mysql"
    exit 1
fi

# 执行字符集修复SQL
echo "📝 执行字符集修复SQL..."
mysql -u root < backend/sql/fix_charset.sql

if [ $? -eq 0 ]; then
    echo "✅ 字符集修复完成！"
    echo ""
    echo "🔍 验证修复结果..."
    mysql -u root -e "USE ai_career_buddy; SHOW TABLE STATUS;" | grep -E "(messages|notes|user_profiles)"
    echo ""
    echo "🎉 修复完成！现在可以正常存储中文字符了。"
    echo "💡 如果仍有问题，请重启应用程序。"
else
    echo "❌ 字符集修复失败，请检查MySQL连接和权限"
    exit 1
fi


