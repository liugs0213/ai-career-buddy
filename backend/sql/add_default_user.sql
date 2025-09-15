-- 添加默认用户脚本
-- 如果用户已存在则忽略，如果不存在则创建

-- 插入默认用户档案（如果不存在）
INSERT IGNORE INTO user_profiles (
    user_id, 
    nickname, 
    email, 
    phone, 
    industry, 
    position, 
    experience, 
    company, 
    career_stage, 
    default_model, 
    created_at, 
    updated_at
) VALUES (
    'default-user', 
    '默认用户', 
    'default@example.com', 
    '13800138000', 
    '互联网', 
    '软件工程师', 
    3, 
    '示例公司', 
    '技能提升', 
    'bailian/qwen-flash', 
    NOW(), 
    NOW()
);

-- 为默认用户插入个性化指标（如果不存在）
INSERT IGNORE INTO personal_metrics (
    user_id, 
    career_score, 
    skill_level, 
    market_value, 
    risk_tolerance, 
    learning_ability, 
    network_strength, 
    work_life_balance, 
    created_at, 
    last_updated
) VALUES (
    'default-user', 
    75, 
    80, 
    70, 
    60, 
    85, 
    65, 
    70, 
    NOW(), 
    NOW()
);

-- 为默认用户插入一些示例职业历史记录
INSERT IGNORE INTO career_histories (
    user_id,
    thread_id,
    category,
    title,
    content,
    ai_response,
    model_id,
    created_at,
    updated_at
) VALUES 
('default-user', 'career-demo-1', 'career', '职业规划咨询', '我想了解如何制定职业发展计划', '根据您的背景，我建议您从以下几个方面制定职业发展计划...', 'bailian/qwen-flash', NOW(), NOW()),
('default-user', 'offer-demo-1', 'offer', 'Offer分析', '我收到了两个Offer，不知道如何选择', '让我帮您分析这两个Offer的优劣，从薪资、发展前景、工作环境等方面进行对比...', 'bailian/qwen-flash', NOW(), NOW()),
('default-user', 'contract-demo-1', 'contract', '合同审查', '请帮我审查这份劳动合同', '我已经仔细审查了您的劳动合同，发现以下几个需要注意的风险点...', 'bailian/qwen-flash', NOW(), NOW()),
('default-user', 'monitor-demo-1', 'monitor', '企业监控', '我想监控我所在公司的发展动态', '我为您设置了企业监控，将定期跟踪公司的财务状况、管理层变动等信息...', 'bailian/qwen-flash', NOW(), NOW());

-- 显示创建结果
SELECT '默认用户创建完成' as message;
SELECT * FROM user_profiles WHERE user_id = 'default-user';
SELECT * FROM personal_metrics WHERE user_id = 'default-user';
SELECT COUNT(*) as career_history_count FROM career_histories WHERE user_id = 'default-user';
