# MD文档自动分析功能测试

## ✅ 问题已修复

### 问题原因
前端只是将MD文件作为附件发送给消息API，但没有调用专门的文档上传和分析API，导致MD文档无法自动解析和保存关键信息。

### 修复内容

#### 1. 添加文档管理API
```typescript
// 新增API接口
uploadDocument: (userId: string, file: File, documentType: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  return http.post(`/api/users/${userId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
},
getDocumentExtractedInfo: (userId: string, documentId: string) => 
  http.get(`/api/users/${userId}/documents/${documentId}/extracted-info`).then(r => r.data),
```

#### 2. 修改文件上传逻辑
- 检测文档类型（MD、TXT、PDF）
- 自动识别文档类型（简历、合同、Offer等）
- 调用文档上传API
- 触发自动分析

#### 3. 增强消息发送逻辑
- 检查附件中是否有文档
- 获取文档分析结果
- 将分析结果添加到消息内容中

## 🔧 工作流程

### 1. 文档上传流程
```
用户选择MD文件 → 前端检测文件类型 → 调用uploadDocument API → 后端保存文件 → 自动触发AI分析 → 返回分析结果
```

### 2. 消息发送流程
```
用户发送消息 → 检查附件 → 获取文档分析结果 → 合并到消息内容 → 发送给AI → 返回增强回复
```

## 🧪 测试步骤

### 1. 上传MD文档
1. 点击上传按钮（📎）
2. 选择MD文件（如`劳动合同示例.md`）
3. 查看控制台日志：
   ```
   上传文档到后端: {fileName: "劳动合同示例.md", documentType: "contract"}
   文档上传结果: {message: "文档上传成功", document: {...}, autoAnalyze: true}
   MD文档自动分析已触发
   ```

### 2. 发送分析请求
1. 输入消息："分析下这个劳动合同"
2. 点击发送
3. 查看控制台日志：
   ```
   获取文档分析结果: {document: {...}, extractedInfo: {...}, visualizationData: {...}}
   ```

### 3. 验证分析结果
1. AI回复应该包含文档分析结果
2. 结构化信息应该被正确提取
3. 可视化数据应该被生成

## 📊 分析能力

### 合同分析
- 提取公司名称、职位、薪资
- 识别风险点（竞业限制、保密条款）
- 生成合同流程图
- 提供法律建议

### 简历分析
- 提取个人信息、工作经历
- 分析技能树
- 生成职业发展时间线
- 创建思维导图

### Offer分析
- 分析薪资结构和福利
- 对比市场水平
- 生成决策流程图
- 提供谈判建议

## 🔍 调试方法

### 1. 浏览器控制台
```javascript
// 查看上传的文件
console.log('上传的文件:', uploadedFiles);

// 查看文档分析结果
console.log('文档分析结果:', analysisResult);
```

### 2. 网络请求
- 打开F12开发者工具
- 查看Network标签
- 应该看到以下请求：
  - `POST /api/users/{userId}/documents` - 文档上传
  - `GET /api/users/{userId}/documents/{documentId}/extracted-info` - 获取分析结果

### 3. 数据库检查
```sql
-- 查看上传的文档
SELECT * FROM user_documents WHERE user_id = 'default-user';

-- 查看分析结果
SELECT id, file_name, extracted_info, processing_status FROM user_documents;
```

## ⚠️ 注意事项

1. **文件大小**: MD文件不能超过10MB
2. **分析时间**: MD文档分析需要3-5秒
3. **网络连接**: 需要稳定的网络进行AI分析
4. **文档内容**: MD文件需要有实际内容，不能为空

## 🚀 预期结果

上传MD文档并发送分析请求后：

1. ✅ 文档被成功上传到后端
2. ✅ 自动触发AI分析
3. ✅ 生成结构化信息
4. ✅ 创建可视化数据
5. ✅ AI回复包含分析结果
6. ✅ 关键信息被异步保存到数据库

## 📝 测试用例

### 测试用例1：劳动合同分析
- **文件**: `劳动合同示例.md`
- **消息**: "分析下这个劳动合同"
- **预期**: AI回复包含合同条款分析、风险点识别、法律建议

### 测试用例2：简历分析
- **文件**: `简历示例.md`
- **消息**: "帮我分析这份简历"
- **预期**: AI回复包含技能分析、职业发展建议、技能树生成

### 测试用例3：Offer分析
- **文件**: `字节跳动Offer分析报告.md`
- **消息**: "这个Offer怎么样？"
- **预期**: AI回复包含薪资分析、市场对比、谈判建议

---

**测试状态**: ✅ 已修复，MD文档现在可以自动解析并保存关键信息
