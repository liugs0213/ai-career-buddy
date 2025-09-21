# 🎨 前端镜像构建命令

## 快速构建命令

### 1. 使用构建脚本（推荐）
```bash
# 给脚本执行权限
chmod +x build-frontend-only.sh

# 运行构建脚本
./build-frontend-only.sh
```

### 2. 使用完整构建脚本
```bash
# 只构建前端
./build-all.sh --frontend-only

# 构建前端并推送
./build-all.sh --frontend-only --push
```

### 3. 手动构建命令
```bash
# 进入前端目录
cd frontend

# 创建环境配置文件
echo "VITE_API_BASE_URL=http://10.98.208.222:80" > .env.production

# 构建镜像
podman build \
  --build-arg VITE_API_BASE_URL="http://10.98.208.222:80" \
  -t harbor.weizhipin.com/arsenal-ai/ai-career-buddy-frontend:latest \
  .
```

## 构建参数说明

- **镜像名称**: `harbor.weizhipin.com/arsenal-ai/ai-career-buddy-frontend`
- **标签**: `latest`
- **API地址**: `http://10.98.208.222:80`
- **构建工具**: Podman

## 推送命令

```bash
# 推送镜像到Harbor
podman push harbor.weizhipin.com/arsenal-ai/ai-career-buddy-frontend:latest
```

## 部署命令

```bash
# 更新K8s部署
kubectl set image deployment/ai-career-buddy-frontend frontend=harbor.weizhipin.com/arsenal-ai/ai-career-buddy-frontend:latest

# 或者使用配置文件
kubectl apply -f k8s-frontend-fixed.yaml
```

## 验证构建

```bash
# 查看本地镜像
podman images | grep ai-career-buddy-frontend

# 测试镜像运行
podman run -p 3000:3000 harbor.weizhipin.com/arsenal-ai/ai-career-buddy-frontend:latest
```

## 故障排除

### 问题1：构建失败
```bash
# 检查Dockerfile
cat frontend/Dockerfile

# 检查环境变量
cat frontend/.env.production

# 清理构建缓存
podman system prune -f
```

### 问题2：推送失败
```bash
# 检查Harbor登录
podman login harbor.weizhipin.com

# 检查镜像标签
podman images | grep ai-career-buddy-frontend
```

### 问题3：环境变量不生效
```bash
# 检查构建参数
podman build --build-arg VITE_API_BASE_URL="http://10.98.208.222:80" -t test-image .

# 检查环境文件
cat frontend/.env.production
```

## 构建流程

1. ✅ 检查Podman环境
2. ✅ 创建环境配置文件
3. ✅ 构建前端镜像
4. ✅ 推送镜像（可选）
5. ✅ 部署到K8s（可选）

## 注意事项

- 确保Podman已安装并可用
- 确保网络可以访问Harbor仓库
- 构建前检查前端代码是否有语法错误
- 推送前确保已登录Harbor

现在您可以使用上述命令构建前端镜像了！
