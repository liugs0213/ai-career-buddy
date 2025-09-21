# 🚀 AI职场管家快速启动指南

## 问题诊断与修复

### 前端无法请求后端的问题已修复

**主要修复内容：**

1. **修复了Vite代理配置**
   - 将代理目标固定为 `http://localhost:8080`
   - 添加了 `/health` 路径的代理配置
   - 确保开发环境使用正确的代理设置

2. **创建了修复版启动脚本**
   - `start-dev-fixed.sh` - 包含完整的错误检查和环境设置
   - 自动创建环境变量文件
   - 提供详细的启动状态反馈

3. **创建了连接测试脚本**
   - `test-connection.sh` - 测试前后端连接状态
   - 验证服务是否正常运行

## 🎯 快速启动步骤

### 方法1：使用修复版启动脚本（推荐）
```bash
# 给脚本执行权限
chmod +x start-dev-fixed.sh

# 启动开发环境
./start-dev-fixed.sh
```

### 方法2：手动启动
```bash
# 1. 启动后端服务
cd backend
go run cmd/api/main.go

# 2. 在新终端启动前端服务
cd frontend
echo "VITE_API_BASE_URL=http://localhost:8080" > .env.local
npm run dev
```

### 方法3：使用原有脚本
```bash
# 使用原有的启动脚本
./start-dev.sh
```

## 🔍 验证连接

启动服务后，运行连接测试：
```bash
chmod +x test-connection.sh
./test-connection.sh
```

## 📡 服务地址

- **后端服务**: http://localhost:8080
- **前端服务**: http://localhost:3000
- **健康检查**: http://localhost:8080/health

## 🛠️ 故障排除

### 如果前端仍然无法连接后端：

1. **检查后端是否启动**
   ```bash
   curl http://localhost:8080/health
   ```

2. **检查端口占用**
   ```bash
   lsof -i :8080
   lsof -i :3000
   ```

3. **检查浏览器控制台**
   - 打开浏览器开发者工具
   - 查看Network标签页的错误信息
   - 查看Console标签页的错误日志

4. **检查CORS设置**
   - 后端已配置CORS中间件
   - 允许所有来源的跨域请求

## 🔧 配置说明

### 前端配置 (`frontend/vite.config.ts`)
- 开发环境使用Vite代理
- 代理目标：`http://localhost:8080`
- 支持 `/api` 和 `/health` 路径

### 后端配置 (`backend/internal/config/config.go`)
- 默认端口：8080
- CORS已启用
- 支持所有HTTP方法

## 📝 注意事项

1. 确保Go和Node.js已正确安装
2. 确保MySQL数据库正在运行
3. 首次启动可能需要等待几秒钟让服务完全启动
4. 如果遇到端口冲突，请检查是否有其他服务占用相同端口

## 🎉 成功标志

当看到以下信息时，说明服务启动成功：
- ✅ 后端服务启动成功
- ✅ 前端服务启动成功
- ✅ 可以访问 http://localhost:3000
- ✅ 浏览器控制台没有网络错误
