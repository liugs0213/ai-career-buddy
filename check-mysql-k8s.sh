#!/bin/bash

# 检查 MySQL Kubernetes 部署状态
echo "🔍 检查 MySQL Kubernetes 部署状态..."

NAMESPACE="kf-partition-gray"

# 1. 检查部署状态
echo ""
echo "📋 1. 检查部署状态..."
kubectl get deployments -n $NAMESPACE | grep mysql

# 2. 检查 Pod 状态
echo ""
echo "📋 2. 检查 Pod 状态..."
kubectl get pods -n $NAMESPACE | grep mysql

# 3. 检查服务状态
echo ""
echo "📋 3. 检查服务状态..."
kubectl get services -n $NAMESPACE | grep mysql

# 4. 检查配置映射
echo ""
echo "📋 4. 检查配置映射..."
kubectl get configmaps -n $NAMESPACE | grep mysql

# 5. 检查持久化存储
echo ""
echo "📋 5. 检查持久化存储..."
kubectl get pvc -n $NAMESPACE | grep mysql

# 6. 检查 Secret
echo ""
echo "📋 6. 检查 Secret..."
kubectl get secrets -n $NAMESPACE | grep mysql

# 7. 检查 MySQL 字符集设置
echo ""
echo "🔤 7. 检查 MySQL 字符集设置..."
kubectl exec -n $NAMESPACE deployment/mysql-deployment -- mysql -u root -p$MYSQL_ROOT_PASSWORD -e "
SHOW VARIABLES LIKE 'character%';
SHOW VARIABLES LIKE 'collation%';
" 2>/dev/null || echo "无法连接到 MySQL"

# 8. 测试中文输入
echo ""
echo "🧪 8. 测试中文输入..."
kubectl exec -n $NAMESPACE deployment/mysql-deployment -- mysql -u root -p$MYSQL_ROOT_PASSWORD -e "
CREATE TEMPORARY TABLE test_chinese (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO test_chinese (name) VALUES ('测试中文');
SELECT name, HEX(name) FROM test_chinese;
" 2>/dev/null || echo "中文测试失败"

echo ""
echo "🎉 检查完成！"
echo ""
echo "📝 如果发现问题，请检查:"
echo "1. 部署是否成功"
echo "2. Pod 是否正常运行"
echo "3. 服务是否可用"
echo "4. 配置是否正确"
