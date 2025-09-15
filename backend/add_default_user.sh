#!/bin/bash

# 添加默认用户脚本
echo "正在添加默认用户..."

# 检查MySQL是否运行
if ! pgrep -x "mysqld" > /dev/null; then
    echo "MySQL服务未运行，请先启动MySQL服务"
    exit 1
fi

# 执行SQL脚本
mysql -u root -p < sql/add_default_user.sql

echo "默认用户添加完成！"
echo "用户ID: default-user"
echo "昵称: 默认用户"
echo "默认模型: bailian/qwen-flash"
