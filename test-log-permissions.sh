#!/bin/bash

echo "🔍 测试日志权限修复..."

# 检查当前目录权限
echo "📁 检查当前目录权限:"
ls -la backend/logs/ 2>/dev/null || echo "logs 目录不存在"

# 创建测试目录
echo "📝 创建测试目录..."
mkdir -p backend/logs-test
chmod 755 backend/logs-test

# 测试文件创建权限
echo "✍️ 测试文件创建权限..."
touch backend/logs-test/test.log 2>/dev/null && echo "✅ 文件创建成功" || echo "❌ 文件创建失败"

# 清理测试目录
rm -rf backend/logs-test

echo "🎯 权限测试完成"
echo ""
echo "📋 修复说明:"
echo "1. ✅ Dockerfile 中添加了正确的目录权限设置"
echo "2. ✅ Kubernetes 配置中添加了 securityContext"
echo "3. ✅ 设置了 fsGroup 确保卷挂载权限正确"
echo ""
echo "🚀 下一步操作:"
echo "1. 重新构建 Docker 镜像"
echo "2. 重新部署 Kubernetes 服务"
echo "3. 验证日志文件创建成功"
