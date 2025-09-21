#!/bin/bash

# 应用 MySQL 8.0 字符集修复
echo "🔧 应用 MySQL 8.0 字符集修复..."

# 检查 kubectl 是否可用
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl 命令不可用，请确保已安装 kubectl"
    exit 1
fi

# 检查当前命名空间
NAMESPACE="kf-partition-gray"
echo "📋 目标命名空间: $NAMESPACE"

# 1. 检查当前 MySQL 部署
echo ""
echo "🔍 1. 检查当前 MySQL 部署..."
kubectl get deployments -n $NAMESPACE | grep mysql || echo "未找到 MySQL 部署"

# 2. 检查当前 MySQL Pod
echo ""
echo "🔍 2. 检查当前 MySQL Pod..."
kubectl get pods -n $NAMESPACE | grep mysql || echo "未找到 MySQL Pod"

# 3. 备份当前配置
echo ""
echo "💾 3. 备份当前配置..."
kubectl get deployment mysql-deployment -n $NAMESPACE -o yaml > mysql-backup-$(date +%Y%m%d-%H%M%S).yaml 2>/dev/null || echo "无法备份当前配置"

# 4. 应用修复后的配置
echo ""
echo "🔧 4. 应用修复后的配置..."
kubectl apply -f mysql-k8s-fixed.yaml

if [ $? -eq 0 ]; then
    echo "✅ 配置应用成功"
else
    echo "❌ 配置应用失败"
    exit 1
fi

# 5. 等待部署完成
echo ""
echo "⏳ 5. 等待部署完成..."
kubectl rollout status deployment/mysql-deployment -n $NAMESPACE --timeout=300s

# 6. 检查部署状态
echo ""
echo "✅ 6. 检查部署状态..."
kubectl get pods -n $NAMESPACE | grep mysql

# 7. 检查服务状态
echo ""
echo "🔍 7. 检查服务状态..."
kubectl get services -n $NAMESPACE | grep mysql

# 8. 测试连接
echo ""
echo "🧪 8. 测试连接..."
kubectl exec -n $NAMESPACE deployment/mysql-deployment -- mysql -u root -p$MYSQL_ROOT_PASSWORD -e "SELECT '中文测试成功' as test_result;" 2>/dev/null || echo "连接测试失败"

echo ""
echo "🎉 MySQL 8.0 字符集修复完成！"
echo ""
echo "📝 后续操作:"
echo "1. 检查应用连接是否正常"
echo "2. 重新上传有问题的文档"
echo "3. 验证中文输入是否正常"
echo ""
echo "📝 如果问题仍然存在，请检查:"
echo "1. Secret 配置是否正确"
echo "2. 存储是否可用"
echo "3. 网络连接是否正常"
