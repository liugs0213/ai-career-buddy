# AI职场管家 - 日志系统使用指南

## 📋 概述

AI职场管家后端已集成完整的日志系统，支持多级别日志记录、文件输出、性能监控等功能。

## 🚀 功能特性

### 1. **多级别日志**
- `DEBUG`: 调试信息，详细的程序执行信息
- `INFO`: 一般信息，重要的业务流程记录
- `WARN`: 警告信息，潜在问题提醒
- `ERROR`: 错误信息，需要关注的错误
- `FATAL`: 致命错误，程序无法继续执行

### 2. **双重输出**
- **控制台输出**: 实时查看日志信息
- **文件输出**: 持久化存储，按日期分割

### 3. **智能记录**
- HTTP请求自动记录
- API调用性能监控
- 数据库操作跟踪
- 业务逻辑记录

## 📁 日志文件结构

```
logs/
├── app-2024-01-15.log    # 按日期分割的日志文件
├── app-2024-01-16.log
└── ...
```

## 🔧 配置说明

### 环境变量
```bash
# 日志目录配置
LOG_DIR=./logs

# 其他配置
APP_PORT=8080
APP_ENV=dev
MYSQL_DSN=root:@tcp(127.0.0.1:3306)/ai_career_buddy?charset=utf8mb4&parseTime=True&loc=Local
BAILIAN_API_URL=http://higress-pirate-prod-gao.weizhipin.com/v1/chat/completions
BAILIAN_API_KEY=sk-84229c5e-18ea-4b6a-a04a-2183688f9373
```

## 📝 日志记录内容

### 1. **系统启动日志**
```
[INFO] 日志系统初始化成功，日志目录: ./logs
[INFO] 数据库连接成功: 类型=MySQL
[INFO] 数据库表迁移完成
[INFO] AI职场管家服务启动，监听端口: 8080
```

### 2. **HTTP请求日志**
```
[INFO] HTTP请求: POST /api/messages | IP: 127.0.0.1 | 状态: 200 | 耗时: 1.234s
[INFO] HTTP请求: GET /health | IP: 127.0.0.1 | 状态: 200 | 耗时: 2ms
```

### 3. **消息处理日志**
```
[INFO] 收到消息请求: ThreadID=career-123, ModelID=nbg-v3-33b, Content长度=45, 附件数量=0
[INFO] 开始生成AI回复: ModelID=nbg-v3-33b, DeepThinking=false, NetworkSearch=false
[DEBUG] AI回复生成完成，内容长度: 256
[INFO] 消息处理完成: ThreadID=career-123, 总耗时=1.234s
```

### 4. **API调用日志**
```
[INFO] 开始调用百炼API: ModelID=nbg-v3-33b, Input长度=45
[INFO] 百炼API调用成功: ModelID=nbg-v3-33b, 耗时=800ms, 回复长度=256
[ERROR] 百炼API调用失败: ModelID=nbg-v3-33b, 耗时=5s, 错误=timeout
```

### 5. **流式消息日志**
```
[INFO] 收到流式消息请求: ThreadID=career-123, ModelID=nbg-v3-33b, Content长度=45
[INFO] 使用百炼流式API: ModelID=nbg-v3-33b
[INFO] 百炼流式API调用成功
[INFO] 流式消息处理完成: ThreadID=career-123, 总耗时=2.5s
```

### 6. **数据库操作日志**
```
[INFO] 开始连接数据库: DSN=root:@tcp(127.0.0.1:3306)/ai_career_buddy?charset=utf8mb4&parseTime=True&loc=Local
[INFO] 数据库连接成功: 类型=MySQL
[DEBUG] 用户消息保存成功: ID=123
[DEBUG] AI回复保存成功: ID=124
```

## 🛠️ 使用方法

### 1. **在代码中使用日志**

```go
import "ai-career-buddy/internal/logger"

// 记录不同级别的日志
logger.Debug("调试信息: 变量值=%v", value)
logger.Info("业务操作: 用户=%s, 操作=%s", user, action)
logger.Warn("警告信息: 潜在问题=%s", issue)
logger.Error("错误信息: 操作失败=%v", err)
logger.Fatal("致命错误: 系统无法启动=%v", err) // 会退出程序
```

### 2. **专用日志函数**

```go
// HTTP请求日志
logger.LogRequest("POST", "/api/messages", "127.0.0.1", 200, time.Second)

// API调用日志
logger.LogAPI("百炼API", "nbg-v3-33b", true, time.Second, nil)

// 数据库操作日志
logger.LogDatabase("INSERT", "messages", true, time.Millisecond*100, nil)

// 业务操作日志
logger.LogBusiness("消息处理", "发送消息", map[string]interface{}{
    "threadID": "career-123",
    "modelID": "nbg-v3-33b",
})
```

## 📊 日志分析

### 1. **性能监控**
通过日志可以分析：
- API响应时间
- 数据库操作耗时
- 整体请求处理时间

### 2. **错误追踪**
- 错误发生频率
- 错误类型分布
- 错误发生时间模式

### 3. **业务分析**
- 用户活跃度
- 功能使用频率
- 模型使用分布

## 🔍 日志查看命令

### 1. **实时查看日志**
```bash
# 查看最新日志
tail -f logs/app-$(date +%Y-%m-%d).log

# 查看错误日志
grep "ERROR" logs/app-*.log

# 查看API调用日志
grep "API调用" logs/app-*.log
```

### 2. **日志分析**
```bash
# 统计错误数量
grep -c "ERROR" logs/app-*.log

# 查看最慢的请求
grep "HTTP请求" logs/app-*.log | sort -k8 -nr

# 查看API调用统计
grep "百炼API调用" logs/app-*.log | awk '{print $NF}' | sort | uniq -c
```

## ⚠️ 注意事项

1. **日志文件大小**: 建议定期清理旧日志文件
2. **敏感信息**: 避免在日志中记录密码、API密钥等敏感信息
3. **性能影响**: 大量日志可能影响性能，生产环境可考虑异步日志
4. **存储空间**: 确保日志目录有足够的存储空间

## 🚀 扩展功能

### 1. **日志轮转**
可以集成 `logrotate` 或类似工具实现日志轮转：

```bash
# /etc/logrotate.d/ai-career-buddy
/path/to/logs/app-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 root root
}
```

### 2. **日志聚合**
可以集成 ELK Stack (Elasticsearch, Logstash, Kibana) 进行日志聚合和分析。

### 3. **监控告警**
可以基于日志内容设置监控告警，及时发现系统问题。

---

通过这套完整的日志系统，您可以更好地监控和调试AI职场管家服务的运行状态！
