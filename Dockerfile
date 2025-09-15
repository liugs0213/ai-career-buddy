# 多阶段构建 - 前端构建阶段
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# 复制前端依赖文件
COPY frontend/package*.json ./

# 安装前端依赖（包括开发依赖，因为需要TypeScript编译器）
RUN npm ci

# 复制前端源代码
COPY frontend/ ./

# 构建前端应用
RUN npm run build

# 多阶段构建 - 后端构建阶段
FROM golang:1.24-alpine AS backend-builder

WORKDIR /app/backend

# 安装必要的工具
RUN apk add --no-cache git

# 复制Go模块文件
COPY backend/go.mod backend/go.sum ./

# 下载Go依赖
RUN go mod download

# 复制后端源代码
COPY backend/ ./

# 构建后端应用
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/api

# 生产阶段 - 最终镜像
FROM alpine:latest

# 安装必要的运行时依赖
RUN apk --no-cache add ca-certificates tzdata wget

WORKDIR /app

# 从构建阶段复制文件
COPY --from=backend-builder /app/backend/main .
COPY --from=backend-builder /app/backend/sql ./sql
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# 创建必要的目录
RUN mkdir -p logs uploads

# 设置时区
ENV TZ=Asia/Shanghai

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# 启动命令
CMD ["./main"]
