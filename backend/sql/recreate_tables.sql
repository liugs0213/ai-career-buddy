-- AI职场管家MySQL数据库重建脚本
-- 删除现有表并重新创建，确保字符集正确

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS career_histories;
DROP TABLE IF EXISTS contract_risks;
DROP TABLE IF EXISTS company_monitors;
DROP TABLE IF EXISTS personal_metrics;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS user_documents;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS sessions;

-- 重新创建数据库（如果需要）
CREATE DATABASE IF NOT EXISTS ai_career_buddy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_career_buddy;

-- 消息表 - 存储聊天消息
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    role VARCHAR(16) NOT NULL COMMENT '角色：user, assistant',
    content TEXT NOT NULL COMMENT '消息内容',
    thread_id VARCHAR(64) COMMENT '会话ID，用于分组消息',
    attachments TEXT COMMENT '附件信息(JSON格式)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天消息表';

-- 为消息表创建索引
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- 为笔记表创建索引
CREATE INDEX idx_notes_user_id ON notes(user_id);

-- 笔记表 - 存储个人笔记
CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    title VARCHAR(255) NOT NULL COMMENT '笔记标题',
    content TEXT NOT NULL COMMENT '笔记内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='个人笔记表';

-- 用户档案表
CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE COMMENT '用户ID',
    nickname VARCHAR(100) COMMENT '昵称',
    email VARCHAR(255) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    industry VARCHAR(100) COMMENT '行业',
    position VARCHAR(100) COMMENT '职位',
    experience INT COMMENT '工作年限',
    company VARCHAR(200) COMMENT '当前公司',
    career_stage VARCHAR(50) COMMENT '职业阶段',
    default_model VARCHAR(100) DEFAULT 'bailian/qwen-flash' COMMENT '默认选择的模型',
    preferences TEXT COMMENT '偏好设置(JSON)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户档案表';

-- 为用户档案表创建索引
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- 用户文档表 - 存储用户上传的简历、合同、offer等文档
CREATE TABLE user_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    document_type VARCHAR(50) NOT NULL COMMENT '文档类型：resume, contract, offer, employment, other',
    file_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_size BIGINT NOT NULL COMMENT '文件大小(字节)',
    file_type VARCHAR(50) NOT NULL COMMENT '文件类型：pdf, doc, docx, txt',
    file_path VARCHAR(500) COMMENT '文件存储路径',
    file_content TEXT COMMENT '文件内容(提取的文本)',
    extracted_info TEXT COMMENT 'AI提取的结构化信息(JSON)',
    upload_source VARCHAR(50) DEFAULT 'manual' COMMENT '上传来源：manual, api, import',
    is_processed BOOLEAN DEFAULT FALSE COMMENT '是否已处理',
    processing_status VARCHAR(20) DEFAULT 'pending' COMMENT '处理状态：pending, processing, completed, failed',
    processing_error TEXT COMMENT '处理错误信息',
    tags VARCHAR(500) COMMENT '标签(JSON数组)',
    metadata TEXT COMMENT '额外元数据(JSON)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户文档表';

-- 为用户文档表创建索引
CREATE INDEX idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX idx_user_documents_document_type ON user_documents(document_type);
CREATE INDEX idx_user_documents_processing_status ON user_documents(processing_status);
CREATE INDEX idx_user_documents_created_at ON user_documents(created_at);

-- 职业规划历史记录表
CREATE TABLE career_histories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    thread_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    category VARCHAR(50) NOT NULL COMMENT '分类：career, offer, contract, monitor',
    title VARCHAR(200) NOT NULL COMMENT '问题标题',
    content TEXT NOT NULL COMMENT '问题内容',
    ai_response TEXT NOT NULL COMMENT 'AI回复',
    model_id VARCHAR(100) COMMENT '使用的模型',
    tags VARCHAR(500) COMMENT '标签(JSON数组)',
    rating INT DEFAULT 0 COMMENT '用户评分 1-5',
    is_bookmarked BOOLEAN DEFAULT FALSE COMMENT '是否收藏',
    metadata TEXT COMMENT '额外元数据(JSON)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='职业规划历史记录表';

-- 为职业历史表创建索引
CREATE INDEX idx_career_histories_user_id ON career_histories(user_id);
CREATE INDEX idx_career_histories_thread_id ON career_histories(thread_id);
CREATE INDEX idx_career_histories_category ON career_histories(category);
CREATE INDEX idx_career_histories_created_at ON career_histories(created_at);

-- 劳动合同风险点表
CREATE TABLE contract_risks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    thread_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    company_name VARCHAR(200) COMMENT '公司名称',
    risk_type VARCHAR(50) COMMENT '风险类型',
    risk_level VARCHAR(20) COMMENT '风险等级: low, medium, high, critical',
    risk_point VARCHAR(200) COMMENT '风险点描述',
    risk_detail TEXT COMMENT '风险详情',
    suggestions TEXT COMMENT '建议措施',
    is_resolved BOOLEAN DEFAULT FALSE COMMENT '是否已解决',
    resolved_at TIMESTAMP NULL COMMENT '解决时间',
    resolve_note TEXT COMMENT '解决备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='劳动合同风险点表';

-- 为企业风险表创建索引
CREATE INDEX idx_contract_risks_user_id ON contract_risks(user_id);
CREATE INDEX idx_contract_risks_thread_id ON contract_risks(thread_id);
CREATE INDEX idx_contract_risks_risk_level ON contract_risks(risk_level);

-- 企业监控表
CREATE TABLE company_monitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    company_name VARCHAR(200) NOT NULL COMMENT '公司名称',
    company_code VARCHAR(50) COMMENT '公司代码/股票代码',
    industry VARCHAR(100) COMMENT '行业',
    monitor_type VARCHAR(50) COMMENT '监控类型: financial, management, market',
    alert_email VARCHAR(255) COMMENT '告警邮箱',
    alert_enabled BOOLEAN DEFAULT FALSE COMMENT '是否启用告警',
    alert_rules TEXT COMMENT '告警规则(JSON)',
    last_alert_at TIMESTAMP NULL COMMENT '最后告警时间',
    alert_count INT DEFAULT 0 COMMENT '告警次数',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active, paused, stopped',
    notes TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业监控表';

-- 为企业监控表创建索引
CREATE INDEX idx_company_monitors_user_id ON company_monitors(user_id);
CREATE INDEX idx_company_monitors_company_name ON company_monitors(company_name);
CREATE INDEX idx_company_monitors_status ON company_monitors(status);

-- 个性化指标表
CREATE TABLE personal_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE COMMENT '用户ID',
    career_score INT DEFAULT 0 COMMENT '职业发展评分 0-100',
    skill_level INT DEFAULT 0 COMMENT '技能水平评分 0-100',
    market_value INT DEFAULT 0 COMMENT '市场价值评分 0-100',
    risk_tolerance INT DEFAULT 0 COMMENT '风险承受能力 0-100',
    learning_ability INT DEFAULT 0 COMMENT '学习能力评分 0-100',
    network_strength INT DEFAULT 0 COMMENT '人脉网络强度 0-100',
    work_life_balance INT DEFAULT 0 COMMENT '工作生活平衡 0-100',
    career_goals TEXT COMMENT '职业目标(JSON)',
    skill_gaps TEXT COMMENT '技能缺口(JSON)',
    improvement_plan TEXT COMMENT '改进计划(JSON)',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='个性化指标表';

-- 为个性化指标表创建索引
CREATE INDEX idx_personal_metrics_user_id ON personal_metrics(user_id);

-- 会话表 - 存储聊天会话信息（可选）
CREATE TABLE sessions (
    id VARCHAR(64) PRIMARY KEY COMMENT '会话ID',
    title VARCHAR(255) NOT NULL COMMENT '会话标题',
    tab_type VARCHAR(32) NOT NULL COMMENT '标签类型：career, offer, contract, monitor',
    user_id VARCHAR(64) COMMENT '用户ID（预留）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后消息时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天会话表';

-- 为会话表创建索引
CREATE INDEX idx_sessions_tab_type ON sessions(tab_type);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_last_message_at ON sessions(last_message_at);

-- 插入默认用户档案
INSERT INTO user_profiles (user_id, nickname, email, phone, industry, position, experience, company, career_stage, default_model, created_at, updated_at) VALUES 
('default-user', '默认用户', 'default@example.com', '13800138000', '互联网', '软件工程师', 3, '示例公司', '技能提升', 'bailian/qwen-flash', NOW(), NOW());

-- 为默认用户插入一些示例个性化指标
INSERT INTO personal_metrics (user_id, career_score, skill_level, market_value, risk_tolerance, learning_ability, network_strength, work_life_balance, created_at, last_updated) VALUES 
('default-user', 75, 80, 70, 60, 85, 65, 70, NOW(), NOW());

-- 插入一些示例数据
INSERT INTO messages (role, content, thread_id) VALUES 
('assistant', '您好！我是您的职业规划专家。我可以帮您制定清晰的职业发展路径，分析行业趋势，制定技能提升计划。请告诉我您目前的职业状况和未来目标，我会为您提供专业的规划建议！', 'career-demo'),
('assistant', '您好！我是您的Offer分析专家。我可以帮您分析薪资水平、评估福利待遇、对比不同Offer的优劣，并为您提供专业的谈判建议。请分享您收到的Offer详情，我会为您进行深度分析！', 'offer-demo'),
('assistant', '您好！我是您的劳动合同检查专家。我可以帮您详细解读合同条款，识别潜在风险点，确保您的合法权益得到保护。请上传或描述您的劳动合同内容，我会为您进行专业审查！', 'contract-demo'),
('assistant', '您好！我是您的企业监控专家。我可以帮您实时监控所在企业的发展动态，包括财务状况、行业地位、管理层变动等关键信息，为您提供及时的风险预警和发展建议！', 'monitor-demo');

-- 显示所有表
SHOW TABLES;

-- 显示表结构
DESCRIBE messages;
DESCRIBE career_histories;
DESCRIBE user_profiles;
