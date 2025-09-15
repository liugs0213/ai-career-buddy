# 深度思考功能说明

## 🧠 功能概述

深度思考功能为AI职场管家提供了更深入、更全面的分析能力，通过多维度思考框架为用户提供更专业的职场建议。

## ✨ 功能特点

### 1. **深度思考模式**
- 🎯 **多维度分析**：从个人、市场、时间等多个维度分析问题
- 🔍 **详细推理过程**：提供完整的逻辑链条和思考过程
- ⚠️ **风险评估**：识别潜在风险和机会
- 📋 **具体行动建议**：提供可执行的步骤和方案
- 💡 **案例分享**：结合相关经验和最佳实践

### 2. **网络搜索模式**
- 📊 **最新信息**：结合最新的行业动态和趋势
- 📈 **权威数据**：引用权威报告和市场数据
- 🏢 **市场分析**：分析当前市场状况和竞争态势
- ⏰ **时效性建议**：提供具有时效性的专业建议

## 🔧 技术实现

### **后端架构**：

#### 1. **请求结构扩展**
```go
type SendMessageRequest struct {
    ThreadID       string   `json:"threadId"`
    Content        string   `json:"content" binding:"required"`
    Attachments    []string `json:"attachments,omitempty"`
    ModelID        string   `json:"modelId,omitempty"`
    DeepThinking   bool     `json:"deepThinking,omitempty"`    // 新增
    NetworkSearch  bool     `json:"networkSearch,omitempty"`  // 新增
}
```

#### 2. **智能提示词系统**
```go
func buildSystemPrompt(modelID string, deepThinking, networkSearch bool) string {
    basePrompt := "你是AI职场管家，专业的职场顾问助手。"
    
    if deepThinking {
        basePrompt += "\n\n【深度思考模式】请进行深度分析：\n" +
            "1. 多角度分析问题，考虑不同维度和可能性\n" +
            "2. 提供详细的推理过程和逻辑链条\n" +
            "3. 分析潜在风险和机会\n" +
            "4. 给出具体的行动建议和步骤\n" +
            "5. 提供相关的案例或经验分享"
    }
    
    if networkSearch {
        basePrompt += "\n\n【网络搜索模式】请结合最新信息：\n" +
            "1. 提供最新的行业动态和趋势\n" +
            "2. 引用权威数据和报告\n" +
            "3. 分析当前市场状况\n" +
            "4. 给出时效性强的建议"
    }
    
    return basePrompt
}
```

#### 3. **百炼API集成**
- ✅ 深度思考模式自动优化系统提示词
- ✅ 网络搜索模式增强信息时效性
- ✅ 支持流式响应和普通响应
- ✅ 错误处理和重试机制

### **前端集成**：

#### 1. **API调用扩展**
```typescript
export const api = {
  sendMessage: (p: { 
    threadId?: string; 
    content: string; 
    attachments?: string[]; 
    modelId?: string; 
    deepThinking?: boolean;    // 新增
    networkSearch?: boolean    // 新增
  }) => http.post('/api/messages', p).then(r => r.data),
}
```

#### 2. **状态管理**
```typescript
const [deepThinkingActive, setDeepThinkingActive] = useState(false);
const [networkSearchActive, setNetworkSearchActive] = useState(false);
```

## 📋 使用场景

### **职业规划场景**
- **普通模式**：基础职业建议和路径规划
- **深度思考模式**：多维度SWOT分析、风险评估、具体行动计划
- **网络搜索模式**：最新行业趋势、薪资数据、就业市场分析

### **Offer分析场景**
- **普通模式**：基本薪资和福利评估
- **深度思考模式**：财务维度分析、职业发展评估、风险收益分析、谈判策略
- **网络搜索模式**：市场薪资对比、公司评价、行业报告

### **合同审查场景**
- **普通模式**：关键条款检查和建议
- **深度思考模式**：法律风险分析、权益保护策略、修改建议
- **网络搜索模式**：最新法律法规、行业标准、案例参考

## 🎯 功能优势

### 1. **智能化程度提升**
- 从简单回复升级为深度分析
- 提供多维度思考框架
- 结合最新市场信息

### 2. **专业性增强**
- 详细的推理过程
- 风险评估和机会识别
- 具体的行动建议

### 3. **用户体验优化**
- 一键开启深度思考
- 实时网络搜索
- 流式响应支持

## 🚀 测试方法

### **API测试**
```bash
# 测试深度思考模式
curl -X POST http://localhost:8080/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "test123",
    "content": "我想转行做产品经理，请给我建议",
    "modelId": "bailian/qwen-plus",
    "deepThinking": true,
    "networkSearch": true
  }'

# 测试流式深度思考
curl -X POST http://localhost:8080/api/messages/stream \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "test123",
    "content": "如何评估一个Offer的好坏？",
    "modelId": "bailian/qwen-plus",
    "deepThinking": true
  }'
```

### **前端测试**
1. 打开AI职场管家页面
2. 点击"深度思考"按钮（🧠图标）
3. 选择百炼模型
4. 发送问题，观察回复质量
5. 对比开启/关闭深度思考的差异

## 📊 效果对比

| 模式 | 回复长度 | 分析深度 | 实用性 | 时效性 |
|------|----------|----------|--------|--------|
| 普通模式 | 短 | 浅 | 一般 | 一般 |
| 深度思考 | 长 | 深 | 高 | 一般 |
| 网络搜索 | 中 | 中 | 高 | 高 |
| 深度+网络 | 长 | 深 | 很高 | 高 |

## 🔮 未来扩展

1. **个性化深度思考**：根据用户历史对话调整分析角度
2. **行业专业模式**：针对不同行业提供专业分析框架
3. **实时数据集成**：接入更多实时数据源
4. **可视化分析**：将分析结果以图表形式展示
5. **协作功能**：支持多人讨论和意见收集

深度思考功能让AI职场管家从简单的问答工具升级为专业的职场顾问，为用户提供更深入、更实用的职业发展建议！🎉
