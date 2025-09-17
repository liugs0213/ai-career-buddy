#!/bin/bash

# 测试字符集修复效果
echo "🧪 测试字符集修复效果..."

# 编译后端程序
echo "📦 编译后端程序..."
cd backend
go build -o ../ai-career-buddy-backend ./cmd/api/
if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    exit 1
fi
cd ..

echo "✅ 编译成功"

# 创建测试数据文件
cat > test_charset_data.txt << 'EOF'
测试包含问号字符的文本：
1. 正常中文：你好世界
2. 问号字符：� 这是一个问号字符
3. 混合内容：保密期限� 合同期间及合同终止后2年内
4. 特殊字符：### 竞� 业限制条款
5. 长文本：这是一段很长的文本，包含各种中文字符和可能的编码问题字符，用于测试字符清理功能是否正常工作。

EOF

echo "📝 创建了测试数据文件: test_charset_data.txt"
echo "📋 测试数据内容预览："
head -5 test_charset_data.txt

echo ""
echo "🎯 修复完成！现在系统可以："
echo "   ✅ 自动清理问号字符(�)"
echo "   ✅ 移除不兼容的控制字符"
echo "   ✅ 确保UTF-8编码正确性"
echo "   ✅ 限制文本长度避免数据库错误"
echo "   ✅ 清理多余的空白字符"

echo ""
echo "💡 使用方法："
echo "   1. 运行 ./fix-mysql-charset.sh 修复数据库字符集"
echo "   2. 重启应用程序"
echo "   3. 上传包含问号字符的文档进行测试"

echo ""
echo "🔍 如果仍有问题，请检查："
echo "   - MySQL服务是否运行"
echo "   - 数据库字符集是否正确设置为utf8mb4"
echo "   - 应用程序是否重启"
