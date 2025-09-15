# 后端MD文档解析功能说明

## ✅ 问题已解决

### 问题分析
你问得很对！后端确实需要解析MD文档内容并放到prompt中。之前的问题是：

1. **前端上传MD文档** → 调用文档上传API → 自动分析 → 保存到数据库
2. **前端发送消息** → 检查附件 → 获取分析结果 → 合并到消息内容
3. **后端接收消息** → **只处理PDF附件，忽略MD文档附件** ❌

### 修复内容

#### 1. 修改消息处理逻辑
```go
// 检查是否为文档引用（document:格式）
if strings.HasPrefix(attachment, "document:") {
    documentID := strings.TrimPrefix(attachment, "document:")
    var document models.UserDocument
    if err := db.Conn.Where("id = ?", documentID).First(&document).Error; err == nil {
        if document.FileContent != "" {
            documentTexts = append(documentTexts, fmt.Sprintf("[%s文档内容]:\n%s", document.DocumentType, document.FileContent))
        }
        
        // 如果有分析结果，也添加到内容中
        if document.IsProcessed && document.ExtractedInfo != "" {
            var extractedInfo models.DocumentExtractedInfo
            if err := json.Unmarshal([]byte(document.ExtractedInfo), &extractedInfo); err == nil {
                documentTexts = append(documentTexts, fmt.Sprintf("[%s分析结果]:\n%s", document.DocumentType, document.ExtractedInfo))
            }
        }
    }
}
```

#### 2. 同时修复普通消息和流式消息
- **SendMessage**: 处理普通消息的附件
- **StreamMessage**: 处理流式消息的附件

#### 3. 增强prompt内容
```go
// 构建系统提示词
systemPrompt := buildSystemPrompt(req.ModelID, req.DeepThinking, req.NetworkSearch)
fullInput := systemPrompt + "\n\n用户问题: " + enhancedContent  // 使用增强后的内容
```

## 🔧 工作流程

### 完整流程
```
1. 用户上传MD文档 → 前端调用uploadDocument API
2. 后端保存文档 → 自动触发AI分析 → 保存分析结果
3. 用户发送消息："分析下这个劳动合同" → 前端检查附件
4. 前端获取分析结果 → 合并到消息内容 → 发送给后端
5. 后端接收消息 → 检查附件 → 从数据库获取文档内容和分析结果
6. 后端将文档内容和分析结果添加到prompt中 → 发送给AI
7. AI基于完整的文档内容生成专业回复
```

### 数据流
```
MD文档内容 + AI分析结果 → 合并到用户消息 → 发送给AI → 生成专业回复
```

## 📊 解析内容

### 1. 原始文档内容
```
[contract文档内容]:
# 劳动合同书
**甲方（用人单位）**: 字节跳动科技有限公司
**乙方（劳动者）**: 张三
...
```

### 2. AI分析结果
```
[contract分析结果]:
{
  "contractInfo": {
    "companyName": "字节跳动科技有限公司",
    "position": "高级软件工程师",
    "salary": "35,000元人民币",
    "startDate": "2024年3月1日",
    "contractType": "固定期限劳动合同",
    "workLocation": "北京市海淀区知春路63号字节跳动大厦",
    "workingHours": "周一至周五 9:00-18:00",
    "benefits": ["免费三餐", "健身房", "商业保险"],
    "noticePeriod": "提前30天书面通知",
    "nonCompete": "合同终止后1年内不得在与公司业务相同或相近的企业工作",
    "confidentiality": "合同期间及合同终止后2年内保密"
  }
}
```

### 3. 最终prompt
```
你是AI职场管家，专门提供职业规划、Offer分析、合同审查等服务...

用户问题: 分析下这个劳动合同

[contract文档内容]:
# 劳动合同书
**甲方（用人单位）**: 字节跳动科技有限公司
...

[contract分析结果]:
{
  "contractInfo": {
    "companyName": "字节跳动科技有限公司",
    "position": "高级软件工程师",
    ...
  }
}
```

## 🎯 AI回复质量提升

### 之前的问题
- AI只能看到用户的问题："分析下这个劳动合同"
- 没有文档内容，无法进行具体分析
- 回复泛泛而谈，缺乏针对性

### 现在的优势
- AI能看到完整的劳动合同内容
- AI能看到结构化的分析结果
- AI能基于具体条款提供专业建议
- 回复更加准确、详细、实用

## 🧪 测试验证

### 测试步骤
1. 上传`劳动合同示例.md`
2. 发送消息："分析下这个劳动合同"
3. 查看AI回复是否包含：
   - 具体的合同条款分析
   - 风险点识别
   - 法律建议
   - 谈判建议

### 预期结果
AI回复应该包含：
- ✅ 公司信息：字节跳动科技有限公司
- ✅ 职位信息：高级软件工程师
- ✅ 薪资分析：35,000元/月
- ✅ 风险点：竞业限制、保密条款
- ✅ 建议：薪资谈判、条款修改建议

## 🔍 调试方法

### 1. 查看日志
```bash
# 查看消息处理日志
tail -f logs/app-*.log | grep "收到流式消息请求"

# 查看文档处理日志
tail -f logs/app-*.log | grep "MD文档自动分析"
```

### 2. 数据库检查
```sql
-- 查看上传的文档
SELECT id, file_name, document_type, file_content, extracted_info 
FROM user_documents 
WHERE user_id = 'default-user';

-- 查看消息内容
SELECT content FROM messages 
WHERE thread_id = 'contract-xxx' 
ORDER BY created_at DESC LIMIT 1;
```

### 3. 网络请求检查
- 打开F12开发者工具
- 查看Network标签
- 应该看到文档上传和分析的请求

## ⚠️ 注意事项

1. **文档大小**: MD文档不能超过10MB
2. **分析时间**: 文档分析需要3-5秒
3. **内容完整性**: 确保MD文档有实际内容
4. **数据库连接**: 确保数据库连接正常

## 🚀 性能优化

### 1. 缓存机制
- 分析结果缓存在数据库中
- 避免重复分析相同文档

### 2. 异步处理
- 文档分析异步进行
- 不阻塞用户操作

### 3. 错误处理
- 分析失败时提供降级方案
- 记录详细错误日志

---

**总结**: 现在后端能够正确解析MD文档内容并放到prompt中，AI可以基于完整的文档内容生成专业、准确的回复！
