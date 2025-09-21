# 部署问题修复说明

## 问题描述

前端访问本地后端的问题：即使后端已经部署到K8s，前端仍然访问`localhost:8080`，导致无法正常使用。

## 问题原因

1. **前端API配置硬编码**：`frontend/src/api/index.ts`中硬编码了`http://localhost:8080`
2. **缺少API代理**：前端容器没有配置nginx代理来转发API请求到后端
3. **容器间通信问题**：前端和后端在同一个Pod中，但前端无法正确访问后端服务

## 解决方案

### 1. 修复前端API配置

**文件**: `frontend/src/api/index.ts`

```typescript
// 根据环境动态设置API基础URL
const getBaseURL = () => {
  // 生产环境：使用相对路径，通过nginx代理
  if (import.meta.env.PROD) {
    return '/api';
  }
  // 开发环境：使用localhost
  return 'http://localhost:8080';
};

const baseURL = getBaseURL();
```

### 2. 添加nginx代理配置

**文件**: `frontend/nginx.conf`

```nginx
# API代理到后端服务
location /api/ {
    proxy_pass http://localhost:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 30s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
}
```

### 3. 创建nginx版本的Dockerfile

**文件**: `frontend/Dockerfile.nginx`

```dockerfile
# 多阶段构建：构建阶段
FROM harbor.weizhipin.com/arsenal-ai/node:18-alpine AS builder
# ... 构建步骤 ...

# 生产阶段：使用nginx
FROM harbor.weizhipin.com/arsenal-ai/nginx:alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 4. 更新K8s部署配置

**文件**: `k8s-combined-deployment.yaml`

```yaml
# 前端容器
- name: frontend
  image: harbor.weizhipin.com/arsenal-ai/ai-career-buddy-frontend:latest
  ports:
  - containerPort: 80  # 改为80端口
    protocol: TCP
  livenessProbe:
    httpGet:
      path: /
      port: 80  # 改为80端口
  readinessProbe:
    httpGet:
      path: /
      port: 80  # 改为80端口
```

## 部署步骤

### 1. 构建前端nginx镜像

```bash
# 使用新的构建脚本
./build-frontend-nginx.sh
```

### 2. 更新K8s部署

```bash
# 应用更新的部署配置
kubectl apply -f k8s-combined-deployment.yaml
```

### 3. 验证部署

```bash
# 检查Pod状态
kubectl get pods -n kf-partition-gray

# 检查服务状态
kubectl get svc -n kf-partition-gray

# 查看Pod日志
kubectl logs -f deployment/ai-career-buddy-combined -n kf-partition-gray -c frontend
kubectl logs -f deployment/ai-career-buddy-combined -n kf-partition-gray -c backend
```

## 架构说明

### 修复前的问题架构
```
前端容器 (serve:3000) ──直接访问──> localhost:8080 ❌
                                    ↑
                               (无法访问，因为不在同一网络)
```

### 修复后的正确架构
```
前端容器 (nginx:80) ──代理──> localhost:8080 ✅
                              ↑
                         (同一Pod内通信)
```

## 工作原理

1. **前端请求**: 用户访问前端页面
2. **API请求**: 前端发送API请求到`/api/*`
3. **nginx代理**: nginx将`/api/*`请求代理到`http://localhost:8080/api/*`
4. **后端处理**: 后端容器处理请求并返回响应
5. **响应返回**: 响应通过nginx返回给前端

## 环境变量说明

- **开发环境**: `import.meta.env.DEV = true` → 使用`http://localhost:8080`
- **生产环境**: `import.meta.env.PROD = true` → 使用`/api`（相对路径）

## 故障排除

### 1. 检查nginx配置
```bash
# 进入前端容器
kubectl exec -it deployment/ai-career-buddy-combined -n kf-partition-gray -c frontend -- sh

# 查看nginx配置
cat /etc/nginx/conf.d/default.conf

# 测试nginx配置
nginx -t
```

### 2. 检查API代理
```bash
# 在容器内测试API代理
curl http://localhost/api/health
```

### 3. 检查网络连接
```bash
# 检查后端服务是否可达
curl http://localhost:8080/health
```

## 注意事项

1. **端口变更**: 前端从3000端口改为80端口
2. **镜像更新**: 需要重新构建前端镜像
3. **配置同步**: 确保nginx配置正确复制到容器中
4. **服务发现**: 在Pod内部，服务通过localhost通信

## 验证清单

- [ ] 前端API配置已更新为动态配置
- [ ] nginx代理配置已添加
- [ ] Dockerfile.nginx已创建
- [ ] K8s部署配置已更新
- [ ] 前端镜像已重新构建
- [ ] 部署已更新
- [ ] API请求正常工作
- [ ] 前端页面正常显示
