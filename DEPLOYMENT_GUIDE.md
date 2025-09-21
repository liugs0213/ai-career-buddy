# AI Career Buddy 部署指南

## 概述
本项目包含前端和后端的组合部署，使用Kubernetes进行容器编排。

## 镜像信息
- **后端镜像**: `harbor.weizhipin.com/arsenal-ai/ai-career-buddy-backend:latest`
- **前端镜像**: `harbor.weizhipin.com/arsenal-ai/ai-career-buddy-frontend:latest`

## 快速部署

### 1. 构建镜像（已完成）
```bash
# 后端镜像
cd backend
podman build -t harbor.weizhipin.com/arsenal-ai/ai-career-buddy-backend:latest .

# 前端镜像  
cd frontend
podman build -t harbor.weizhipin.com/arsenal-ai/ai-career-buddy-frontend:latest .
```

### 2. 部署到Kubernetes
```bash
# 使用自动化部署脚本
./deploy-to-k8s.sh

# 或手动部署
kubectl apply -f k8s-combined-deployment.yaml
```

## 部署配置说明

### Pod配置
- **命名空间**: `kf-partition-gray`
- **副本数**: 1
- **容器**:
  - `backend`: 后端服务，端口8080
  - `frontend`: 前端服务，端口3000

### 服务配置
- **服务名**: `ai-career-buddy-combined-service`
- **端口映射**:
  - 前端: 80 → 3000
  - 后端: 8080 → 8080

### 环境变量
后端容器包含以下环境变量：
- `APP_PORT`: 8080
- `APP_ENV`: production
- `DB_HOST`: mysql-service
- `DB_PORT`: 3306
- `DB_NAME`: ai_career_buddy
- `MYSQL_DSN`: 数据库连接字符串
- `LOG_LEVEL`: info
- `UPLOAD_DIR`: /app/uploads
- `MAX_FILE_SIZE`: 10485760 (10MB)

## 健康检查
- **后端**: `/health` 端点
- **前端**: `/` 根路径

## 资源限制
- **后端**: 256Mi-512Mi内存，100m-500m CPU
- **前端**: 64Mi-128Mi内存，50m-100m CPU

## 访问方式
部署完成后，可以通过以下方式访问：
- **前端**: `http://<集群IP>:80`
- **后端API**: `http://<集群IP>:8080`

## 故障排查
```bash
# 查看Pod状态
kubectl get pods -n kf-partition-gray -l app=ai-career-buddy-combined

# 查看服务状态
kubectl get svc -n kf-partition-gray -l app=ai-career-buddy-combined

# 查看后端日志
kubectl logs -n kf-partition-gray -l app=ai-career-buddy-combined -c backend

# 查看前端日志
kubectl logs -n kf-partition-gray -l app=ai-career-buddy-combined -c frontend

# 进入Pod调试
kubectl exec -it -n kf-partition-gray <pod-name> -c backend -- /bin/sh
```

## 注意事项
1. 确保Kubernetes集群中有足够的资源
2. 确保数据库服务 `mysql-service` 可用
3. 如需修改配置，请更新 `k8s-combined-deployment.yaml` 后重新部署
4. 镜像使用 `imagePullPolicy: Always`，确保使用最新镜像
