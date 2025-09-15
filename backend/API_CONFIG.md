# API配置说明

## 百炼API集成

### 环境变量配置

在启动后端服务前，请设置以下环境变量：

```bash
# 百炼API配置
export BAILIAN_API_URL="http://higress-pirate-prod-gao.weizhipin.com/v1/chat/completions"
export BAILIAN_API_KEY="sk-84229c5e-18ea-4b6a-a04a-2183688f9373"
```

### API接口说明

#### 1. 普通消息接口
- **URL**: `POST /api/messages`
- **功能**: 发送消息并获取完整回复
- **支持**: 百炼模型和其他模型

#### 2. 流式消息接口
- **URL**: `POST /api/messages/stream`
- **功能**: 流式返回AI回复
- **支持**: 百炼模型（真实流式）+ 其他模型（模拟流式）

### 支持的模型

#### 百炼模型（调用真实API）
- `bailian/deepseek-v3`
- `bailian/deepseek-r1`
- `bailian/deepseek-v3.1`
- `bailian/qwen-flash`
- `bailian/qwen-plus`
- `bailian/qwen-vl-max`
- `bailian/qwen-vl-plus`

#### 其他模型（模拟回复）
- Arsenal私有部署模型
- 微软Azure模型

### 使用方式

1. 在前端选择百炼模型
2. 发送消息时会自动调用百炼API
3. 支持图片和PDF附件
4. 自动添加系统提示词

### 测试命令

```bash
# 测试百炼API
curl -X POST http://localhost:8080/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "test123",
    "content": "你好，请介绍一下自己",
    "modelId": "bailian/qwen-plus"
  }'

# 测试流式API
curl -X POST http://localhost:8080/api/messages/stream \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "test123",
    "content": "请写一首关于春天的诗",
    "modelId": "bailian/qwen-plus"
  }'
```
