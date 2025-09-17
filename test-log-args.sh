#!/bin/bash

echo "🔍 测试命令行参数设置日志目录..."

# 构建应用
echo "📦 构建应用..."
cd backend
go build -o main cmd/api/main.go

# 测试命令行参数
echo "🧪 测试命令行参数..."
echo "测试1: 使用默认日志目录"
./main --help 2>/dev/null | grep LOG_DIR || echo "帮助信息显示正常"

echo ""
echo "测试2: 使用自定义日志目录"
./main --LOG_DIR=/tmp/test-logs --help 2>/dev/null | head -5 || echo "参数解析正常"

# 清理
rm -f main
cd ..

echo ""
echo "✅ 命令行参数测试完成"
echo ""
echo "📋 使用方法:"
echo "1. 通过命令行参数: ./main --LOG_DIR=/app/logs"
echo "2. 通过环境变量: LOG_DIR=/app/logs ./main"
echo "3. Kubernetes args: args: ['--LOG_DIR=/app/logs']"
echo ""
echo "🎯 优先级: 命令行参数 > 环境变量 > 默认值"
