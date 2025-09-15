-- AI职场管家MySQL数据库设置脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS ai_career_buddy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_career_buddy;

-- 消息表 - 存储聊天消息
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(16) NOT NULL COMMENT '角色：user, assistant',
    content TEXT NOT NULL COMMENT '消息内容',
    thread_id VARCHAR(64) COMMENT '会话ID，用于分组消息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天消息表';

-- 为消息表创建索引
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- 笔记表 - 存储个人笔记
CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '笔记标题',
    content TEXT NOT NULL COMMENT '笔记内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='个人笔记表';

-- 会话表 - 存储聊天会话信息（可选）
CREATE TABLE IF NOT EXISTS sessions (
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

-- 插入一些示例数据（可选）
INSERT IGNORE INTO messages (role, content, thread_id) VALUES 
('assistant', '您好！我是您的职业规划专家。我可以帮您制定清晰的职业发展路径，分析行业趋势，制定技能提升计划。请告诉我您目前的职业状况和未来目标，我会为您提供专业的规划建议！', 'career-demo'),
('assistant', '您好！我是您的Offer分析专家。我可以帮您分析薪资水平、评估福利待遇、对比不同Offer的优劣，并为您提供专业的谈判建议。请分享您收到的Offer详情，我会为您进行深度分析！', 'offer-demo'),
('assistant', '您好！我是您的劳动合同检查专家。我可以帮您详细解读合同条款，识别潜在风险点，确保您的合法权益得到保护。请上传或描述您的劳动合同内容，我会为您进行专业审查！', 'contract-demo'),
('assistant', '您好！我是您的企业监控专家。我可以帮您实时监控所在企业的发展动态，包括财务状况、行业地位、管理层变动等关键信息，为您提供及时的风险预警和发展建议！', 'monitor-demo');

-- 显示表结构
SHOW TABLES;
DESCRIBE messages;
DESCRIBE notes;
DESCRIBE sessions;
