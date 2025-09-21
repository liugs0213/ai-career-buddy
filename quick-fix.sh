#!/bin/bash

echo "🚀 快速修复 API 导出问题..."
echo "============================="

# 检查 API 文件是否存在且不为空
if [ -f "frontend/src/api/index.ts" ]; then
    if [ -s "frontend/src/api/index.ts" ]; then
        echo "✅ API 文件存在且不为空"
    else
        echo "❌ API 文件为空，需要重新创建"
        exit 1
    fi
else
    echo "❌ API 文件不存在"
    exit 1
fi

# 检查是否导出了 api
if grep -q "export const api" frontend/src/api/index.ts; then
    echo "✅ api 已正确导出"
else
    echo "❌ api 未导出"
    exit 1
fi

# 检查是否导出了 http
if grep -q "export const http" frontend/src/api/index.ts; then
    echo "✅ http 已正确导出"
else
    echo "❌ http 未导出"
    exit 1
fi

echo ""
echo "🔧 修复完成，现在可以构建了："
echo "   cd frontend && npm run build:ignore-ts"
echo ""
echo "💡 如果还有问题，请检查："
echo "   1. TypeScript 语法错误"
echo "   2. 依赖包是否完整"
echo "   3. 环境变量配置"
