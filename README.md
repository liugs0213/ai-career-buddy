## AI Career Buddy（AI 职场管家）

最小可用 MVP：前端 React + Vite + TypeScript + Ant Design；后端 Go + Gin + Gorm + MySQL。前端内置 MSW 模拟 API，可在无后端环境时直接体验。

### 目录结构
```
ai-career-buddy/
  backend/            # Go 后端（可选）
  frontend/           # Vite + React 前端
```

### 快速开始（推荐：仅前端 + 模拟 API）
1) 启动前端开发服务器（已内置 MSW mock）
```
cd frontend
npm install
npm run dev
```
2) 打开浏览器访问：`http://localhost:5173/`

说明：开发模式下会自动注册 `MSW`，并提供以下模拟接口：
- `GET /health`
- `GET /api/notes`、`POST /api/notes`、`PUT /api/notes/:id`、`DELETE /api/notes/:id`
- `GET /api/messages?threadId=default`、`POST /api/messages`

如需关闭 mock 并接通真实后端：在 `frontend/src/main.tsx` 注释掉包含 `mocks/browser` 的 DEV 逻辑，或按需加环境变量开关（可提 Issue）。

### 可选：启动后端与数据库
1) 准备 MySQL（本地）
```
CREATE DATABASE ai_career_buddy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
2) 配置后端环境变量
```
cd backend
cp .env.example .env
# 按需修改 .env 中 MYSQL_DSN，如：
# MYSQL_DSN=root:password@tcp(127.0.0.1:3306)/ai_career_buddy?charset=utf8mb4&parseTime=True&loc=Local
```
3) 启动后端（需要本机 Go 工具链正常）
```
make run
# 或
go run ./cmd/api
```
启动后默认端口 `:8080`。首次运行会自动迁移表 `messages`、`notes`。

前端代理已在 `frontend/vite.config.ts` 中配置：`/api` 与 `/health` 会转发至 `http://localhost:8080`。

### API 概览（MVP）
- `GET /health` → `{ status: "ok" }`
- `GET /api/messages?threadId=...` → `Message[]`
- `POST /api/messages` → `{ messages: [Message, Message] }`（MVP 为简单回声回复）
- `GET /api/notes` → `Note[]`
- `POST /api/notes` → `Note`
- `PUT /api/notes/:id` → `Note`
- `DELETE /api/notes/:id` → `{ deleted: id }`

数据结构（简化）：
```
Message { id, role: 'user'|'assistant', content, threadId, createdAt }
Note    { id, title, content, updatedAt }
```

### 常见问题（FAQ）
- 前端控制台报 404？若未启动后端，请确保 MSW mock 已启用（开发模式默认启用）。
- 如何切换到真实 LLM？当前 `POST /api/messages` 为回声占位。可在后端添加对接（如 OpenAI 兼容 API）；前端无需变更。
- Go 构建报工具链不匹配？将 `GOTOOLCHAIN` 与 `GOROOT` 对齐到同版本（例如 1.24.4），清理缓存后重试：
```
go env -w GOTOOLCHAIN=go1.24.4
go clean -cache -testcache -modcache
```

### 开发脚本
前端：
```
cd frontend
npm run dev     # 开发
npm run build   # 生产构建
```
后端：
```
cd backend
make run        # 启动
make build      # 构建二进制
```

### 下一步计划（建议）
- 多会话支持、会话归档与检索
- 接入真实 LLM（可配置 Key、模型、代理）
- 简历解析与职位 JD 分析的专用工具链
- 用户会话持久化与鉴权（MVP 可使用匿名/本地存储）


