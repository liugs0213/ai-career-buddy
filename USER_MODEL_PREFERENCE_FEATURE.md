# 用户默认模型选择功能

## 功能概述

现在系统支持记录和保存用户选择的默认模型，用户每次切换模型时，系统会自动保存这个选择，下次登录时会自动加载用户之前选择的模型。

## 实现的功能

### 1. 数据库层面
- ✅ 在 `user_profiles` 表中添加了 `default_model` 字段
- ✅ 默认值为 `'bailian/qwen-flash'`（通义千问 Flash）
- ✅ 字段长度为 100 字符，支持所有模型ID

### 2. 后端API层面
- ✅ 更新了 `UserProfile` 结构体，添加 `DefaultModel` 字段
- ✅ 新增 `UpdateUserDefaultModel` API：`PUT /api/users/:userId/default-model`
- ✅ 新增 `GetUserDefaultModel` API：`GET /api/users/:userId/default-model`
- ✅ 支持自动创建用户档案（如果不存在）
- ✅ 完整的错误处理和日志记录

### 3. 前端界面层面
- ✅ 在 `api/index.ts` 中添加了模型偏好相关的API调用函数
- ✅ 在 `Home.tsx` 中添加了加载用户默认模型的逻辑
- ✅ 在用户选择模型时自动保存到后端
- ✅ 用户切换时自动加载对应的默认模型

## API接口详情

### 更新用户默认模型
```http
PUT /api/users/{userId}/default-model
Content-Type: application/json

{
  "defaultModel": "deepseek-v3-0324"
}
```

**响应：**
```json
{
  "message": "默认模型更新成功",
  "defaultModel": "deepseek-v3-0324"
}
```

### 获取用户默认模型
```http
GET /api/users/{userId}/default-model
```

**响应：**
```json
{
  "defaultModel": "deepseek-v3-0324",
  "isDefault": false
}
```

## 使用流程

1. **首次使用**：用户选择模型后，系统自动保存到数据库
2. **再次登录**：系统自动加载用户之前选择的模型
3. **切换用户**：每个用户都有独立的模型偏好设置
4. **模型切换**：每次切换模型都会自动保存新的选择

## 数据库变更

需要在现有数据库上执行以下SQL来添加新字段：

```sql
ALTER TABLE user_profiles 
ADD COLUMN default_model VARCHAR(100) DEFAULT 'bailian/qwen-flash' 
COMMENT '默认选择的模型';
```

或者重新运行 `sql/recreate_tables.sql` 脚本来重建数据库。

## 技术特点

- 🔒 **数据安全**：用户模型选择完全私有化存储
- ⚡ **实时保存**：用户选择模型时立即保存，无需额外操作
- 🔄 **自动加载**：用户登录时自动恢复之前的模型选择
- 👥 **多用户支持**：每个用户都有独立的模型偏好
- 🛡️ **错误处理**：完整的错误处理和日志记录
- 📱 **用户友好**：无需用户手动保存，完全自动化

## 支持的模型

系统支持所有已配置的模型：
- Arsenal 私有部署模型（推荐）
- 百炼外部供应商模型
- 微软Azure模型

用户可以根据自己的需求选择最适合的模型，系统会记住这个选择。
