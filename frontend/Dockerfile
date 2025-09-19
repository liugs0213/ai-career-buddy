# 多阶段构建：构建阶段
FROM harbor.weizhipin.com/arsenal-ai/node:18-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建时设置环境变量（默认值：本地开发）
ARG VITE_API_BASE_URL="http://10.98.208.222:80"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 打印环境变量用于调试
RUN echo "构建时环境变量 VITE_API_BASE_URL: $VITE_API_BASE_URL"

# 构建应用（忽略TypeScript警告）
RUN npm run build:ignore-ts

# 生产阶段：使用简单的HTTP服务器
FROM harbor.weizhipin.com/arsenal-ai/node:18-alpine AS production

WORKDIR /app

# 安装serve包用于提供静态文件服务
RUN npm install -g serve

# 复制构建产物
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# 使用serve提供静态文件服务
CMD ["serve", "-s", "dist", "-l", "3000"]
