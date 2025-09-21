# MySQL 8.0 连接配置优化

## 问题分析

MySQL 8.0 在字符集处理方面有一些变化，可能导致中文字符乱码问题：

1. **默认字符集变化**：MySQL 8.0 默认使用 `utf8mb4`，但连接时可能没有正确设置
2. **连接参数变化**：需要更明确的字符集参数
3. **SQL模式变化**：MySQL 8.0 的SQL模式更严格

## 解决方案

### 1. 优化 DSN 连接字符串

**当前配置**：
```
root:root_password_here@tcp(10.98.1.99:3306)/ai_career_buddy?charset=utf8mb4&parseTime=True&loc=Local
```

**建议配置**：
```
root:root_password_here@tcp(10.98.1.99:3306)/ai_career_buddy?charset=utf8mb4&parseTime=True&loc=Local&collation=utf8mb4_unicode_ci&timeout=30s&readTimeout=30s&writeTimeout=30s
```

### 2. 环境变量配置

在 `k8s-combined-deployment.yaml` 中更新：

```yaml
- name: MYSQL_DSN
  value: "root:root_password_here@tcp(10.98.1.99:3306)/ai_career_buddy?charset=utf8mb4&parseTime=True&loc=Local&collation=utf8mb4_unicode_ci&timeout=30s&readTimeout=30s&writeTimeout=30s"
```

### 3. 应用代码优化

已经在 `backend/internal/db/db.go` 中添加了针对 MySQL 8.0 的优化：

```go
// 设置MySQL连接字符集，确保中文字符正确存储
// 针对 MySQL 8.0 优化
if err == nil {
    // 设置会话字符集
    Conn.Exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci")
    Conn.Exec("SET CHARACTER SET utf8mb4")
    Conn.Exec("SET character_set_client = utf8mb4")
    Conn.Exec("SET character_set_connection = utf8mb4")
    Conn.Exec("SET character_set_results = utf8mb4")
    Conn.Exec("SET collation_connection = utf8mb4_unicode_ci")
    Conn.Exec("SET collation_server = utf8mb4_unicode_ci")
    
    // 设置SQL模式，兼容MySQL 8.0
    Conn.Exec("SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'")
}
```

## 测试步骤

1. **运行连接测试**：
   ```bash
   ./test-mysql8-connection.sh
   ```

2. **修复字符集**：
   ```bash
   ./fix-mysql8-charset.sh
   ```

3. **重新部署应用**：
   ```bash
   # 更新 k8s 配置
   kubectl apply -f k8s-combined-deployment.yaml
   ```

## MySQL 8.0 特殊注意事项

1. **字符集设置**：确保所有相关设置都使用 `utf8mb4`
2. **连接超时**：MySQL 8.0 可能需要更长的连接超时时间
3. **SQL模式**：MySQL 8.0 的SQL模式更严格，需要适当配置
4. **认证插件**：MySQL 8.0 默认使用 `caching_sha2_password`，可能需要调整

## 验证方法

1. 检查数据库字符集：
   ```sql
   SHOW VARIABLES LIKE 'character%';
   ```

2. 检查表字符集：
   ```sql
   SELECT TABLE_NAME, TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'ai_career_buddy';
   ```

3. 测试中文插入：
   ```sql
   INSERT INTO test_table (name) VALUES ('测试中文');
   SELECT name, HEX(name) FROM test_table;
   ```
