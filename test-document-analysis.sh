#!/bin/bash

# 测试文档分析功能
echo "🧪 测试文档分析功能..."

echo "📋 测试步骤:"
echo "1. 上传一个MD文档"
echo "2. 触发自动分析"
echo "3. 检查分析结果"

echo ""
echo "🔍 测试文档上传..."

# 创建一个测试MD文档
cat > /tmp/test-resume.md << 'EOF'
# 张三的简历

## 个人信息
- 姓名：张三
- 邮箱：zhangsan@example.com
- 电话：13800138000
- 地址：北京市朝阳区

## 工作经历
### 软件工程师 - ABC科技有限公司 (2020-2023)
- 负责后端系统开发和维护
- 使用Java、Spring Boot、MySQL等技术栈
- 参与多个重要项目的设计和实现

## 教育背景
### 计算机科学与技术 - 北京理工大学 (2016-2020)
- 学士学位
- GPA: 3.8/4.0

## 技能
- 编程语言：Java, Python, JavaScript
- 框架：Spring Boot, React, Vue.js
- 数据库：MySQL, Redis, MongoDB
EOF

echo "✅ 测试文档已创建"

echo ""
echo "🔍 上传文档..."

# 上传文档
response=$(curl -s -X POST http://localhost:8080/api/users/default-user/documents \
  -F "file=@/tmp/test-resume.md" \
  -F "documentType=resume")

echo "上传响应: $response"

# 提取文档ID
document_id=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$document_id" ]; then
    echo "✅ 文档上传成功，ID: $document_id"
    
    echo ""
    echo "🔍 等待分析完成..."
    sleep 5
    
    echo ""
    echo "🔍 检查分析结果..."
    
    # 检查文档状态
    status_response=$(curl -s http://localhost:8080/api/users/default-user/documents/$document_id)
    echo "文档状态: $status_response"
    
    # 获取提取信息
    extracted_response=$(curl -s http://localhost:8080/api/users/default-user/documents/$document_id/extracted-info)
    echo "提取信息: $extracted_response"
    
else
    echo "❌ 文档上传失败"
fi

# 清理测试文件
rm -f /tmp/test-resume.md

echo ""
echo "🎉 测试完成！"
