# AI职场管家 - 用户历史记录与个性化功能指南

## 🎯 功能概述

AI职场管家现在支持完整的用户历史记录和个性化功能，让您的职场咨询更加智能和个性化。

## 📊 核心功能

### 1. **职业规划阶段可视化** 🎯

#### 功能特点：
- **阶段展示**: 5个职业发展阶段，从职场新人到高级管理
- **进度跟踪**: 可视化显示当前阶段和完成进度
- **技能指导**: 每个阶段的核心技能和目标
- **时间规划**: 预计完成时间和学习路径

#### 职业阶段：
1. **职场新人** (1-2年) - 学习基础技能，适应工作环境
2. **技能提升** (2-3年) - 专业技能快速提升期
3. **专业专家** (3-5年) - 在专业领域有一定影响力
4. **管理转型** (5-8年) - 从专业向管理转型
5. **高级管理** (8年以上) - 高级管理层

#### 使用方法：
```tsx
import CareerStageChart from './components/CareerStageChart';

<CareerStageChart 
  currentStage="技能提升"
  onStageClick={(stage) => console.log('点击阶段:', stage)}
/>
```

### 2. **劳动合同风险点监控** 📋

#### 功能特点：
- **风险识别**: 自动识别合同中的风险点
- **风险分级**: 低、中、高、严重四个风险等级
- **建议措施**: 针对每个风险点的具体建议
- **状态跟踪**: 风险点的解决状态和进度

#### 风险类型：
- **薪资相关**: 薪资结构、发放时间、调整机制
- **工作时间**: 加班费、年假、病假政策
- **试用期**: 试用期长度、薪资标准、转正条件
- **竞业限制**: 限制范围、时间、补偿标准
- **保密协议**: 保密范围、期限、违约责任
- **违约金**: 违约金设置、计算标准
- **福利待遇**: 五险一金、补充保险、其他福利
- **解除合同**: 解除条件、通知期、经济补偿

#### 使用方法：
```tsx
import ContractRiskPanel from './components/ContractRiskPanel';

<ContractRiskPanel 
  userId="user123"
  companyName="示例公司"
  onRiskClick={(risk) => console.log('风险详情:', risk)}
/>
```

### 3. **企业监控告警系统** 🏢

#### 功能特点：
- **多维度监控**: 财务、管理层、市场三个维度
- **告警设置**: 自定义告警规则和邮箱通知
- **状态管理**: 运行中、已暂停、已停止状态
- **历史记录**: 告警历史和统计信息

#### 监控类型：
- **财务监控**: 营收、利润、现金流、负债率
- **管理层监控**: 人事变动、战略调整、组织架构
- **市场监控**: 市场份额、竞争对手、行业趋势

#### 告警规则示例：
```json
{
  "id": "financial-1",
  "name": "营收下降告警",
  "type": "financial",
  "condition": "revenue_decline",
  "threshold": "10%",
  "severity": "high",
  "description": "营收同比下降超过10%时触发告警",
  "enabled": true
}
```

#### 使用方法：
```tsx
import CompanyMonitorPanel from './components/CompanyMonitorPanel';

<CompanyMonitorPanel 
  userId="user123"
  onMonitorClick={(monitor) => console.log('监控详情:', monitor)}
  onAddMonitor={() => console.log('添加监控')}
/>
```

### 4. **个性化指标系统** 📊

#### 功能特点：
- **能力评估**: 7个维度的个人能力评分
- **可视化展示**: 雷达图和进度条展示
- **动态更新**: 支持实时编辑和保存
- **智能分析**: 优势领域和改进建议

#### 评估维度：
1. **职业发展评分** (0-100) - 综合评估职业发展状况
2. **技能水平** (0-100) - 当前专业技能和软技能水平
3. **市场价值** (0-100) - 在就业市场中的竞争力
4. **风险承受能力** (0-100) - 对职业变化和风险的承受度
5. **学习能力** (0-100) - 快速学习和适应新技能的能力
6. **人脉网络** (0-100) - 专业人脉网络的广度和深度
7. **工作生活平衡** (0-100) - 工作与个人生活的平衡程度

#### 评分标准：
- **80-100分**: 优秀 🟢
- **60-79分**: 良好 🟡
- **40-59分**: 一般 🟠
- **0-39分**: 需改进 🔴

#### 使用方法：
```tsx
import PersonalMetricsPanel from './components/PersonalMetricsPanel';

<PersonalMetricsPanel 
  userId="user123"
  onMetricsUpdate={(metrics) => console.log('指标更新:', metrics)}
/>
```

## 🔧 后端API接口

### 用户档案管理
```bash
# 获取用户档案
GET /api/users/{userId}/profile

# 更新用户档案
PUT /api/users/{userId}/profile
```

### 职业历史记录
```bash
# 获取职业历史记录
GET /api/users/{userId}/career-history?category=career&limit=20&offset=0

# 保存职业历史记录
POST /api/users/{userId}/career-history
```

### 合同风险点
```bash
# 获取合同风险点
GET /api/users/{userId}/contract-risks?companyName=示例公司&resolved=false

# 保存合同风险点
POST /api/users/{userId}/contract-risks

# 更新合同风险点
PUT /api/users/{userId}/contract-risks/{riskId}
```

### 企业监控
```bash
# 获取企业监控列表
GET /api/users/{userId}/company-monitors?status=active

# 保存企业监控
POST /api/users/{userId}/company-monitors

# 更新企业监控
PUT /api/users/{userId}/company-monitors/{monitorId}
```

### 个性化指标
```bash
# 获取个性化指标
GET /api/users/{userId}/personal-metrics

# 更新个性化指标
PUT /api/users/{userId}/personal-metrics
```

### 职业阶段
```bash
# 获取职业阶段定义
GET /api/career-stages
```

## 📱 前端组件使用

### 1. 职业阶段图表
```tsx
// 基本使用
<CareerStageChart currentStage="技能提升" />

// 带回调函数
<CareerStageChart 
  currentStage="专业专家"
  onStageClick={(stage) => {
    console.log('当前阶段:', stage.stage);
    console.log('阶段描述:', stage.description);
    console.log('所需技能:', stage.skills);
  }}
/>
```

### 2. 合同风险面板
```tsx
// 基本使用
<ContractRiskPanel userId="user123" />

// 按公司筛选
<ContractRiskPanel 
  userId="user123"
  companyName="示例公司"
  onRiskClick={(risk) => {
    console.log('风险等级:', risk.riskLevel);
    console.log('风险详情:', risk.riskDetail);
    console.log('建议措施:', risk.suggestions);
  }}
/>
```

### 3. 企业监控面板
```tsx
// 基本使用
<CompanyMonitorPanel userId="user123" />

// 带回调函数
<CompanyMonitorPanel 
  userId="user123"
  onMonitorClick={(monitor) => {
    console.log('公司名称:', monitor.companyName);
    console.log('监控类型:', monitor.monitorType);
    console.log('告警状态:', monitor.alertEnabled);
  }}
  onAddMonitor={() => {
    // 打开添加监控的弹窗
    setShowAddMonitorModal(true);
  }}
/>
```

### 4. 个性化指标面板
```tsx
// 基本使用
<PersonalMetricsPanel userId="user123" />

// 带更新回调
<PersonalMetricsPanel 
  userId="user123"
  onMetricsUpdate={(metrics) => {
    console.log('职业发展评分:', metrics.careerScore);
    console.log('技能水平:', metrics.skillLevel);
    console.log('市场价值:', metrics.marketValue);
  }}
/>
```

## 🎨 样式定制

### CSS变量
```css
:root {
  --primary-color: #3b82f6;
  --success-color: #16a34a;
  --warning-color: #d97706;
  --danger-color: #dc2626;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --border-color: #e2e8f0;
}
```

### 主题定制
```css
/* 深色主题 */
.dark-theme {
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --bg-primary: #1e293b;
  --bg-secondary: #334155;
  --border-color: #475569;
}
```

## 📊 数据模型

### 用户档案 (UserProfile)
```typescript
interface UserProfile {
  id: number;
  userId: string;
  nickname: string;
  email: string;
  phone: string;
  industry: string;
  position: string;
  experience: number;
  company: string;
  careerStage: string;
  preferences: string; // JSON
  createdAt: string;
  updatedAt: string;
}
```

### 职业历史记录 (CareerHistory)
```typescript
interface CareerHistory {
  id: number;
  userId: string;
  threadId: string;
  category: 'career' | 'offer' | 'contract' | 'monitor';
  title: string;
  content: string;
  aiResponse: string;
  modelId: string;
  tags: string; // JSON数组
  rating: number; // 1-5
  isBookmarked: boolean;
  metadata: string; // JSON
  createdAt: string;
  updatedAt: string;
}
```

### 合同风险点 (ContractRisk)
```typescript
interface ContractRisk {
  id: number;
  userId: string;
  threadId: string;
  companyName: string;
  riskType: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskPoint: string;
  riskDetail: string;
  suggestions: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolveNote?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 企业监控 (CompanyMonitor)
```typescript
interface CompanyMonitor {
  id: number;
  userId: string;
  companyName: string;
  companyCode: string;
  industry: string;
  monitorType: 'financial' | 'management' | 'market';
  alertEmail: string;
  alertEnabled: boolean;
  alertRules: string; // JSON
  lastAlertAt?: string;
  alertCount: number;
  status: 'active' | 'paused' | 'stopped';
  notes: string;
  createdAt: string;
  updatedAt: string;
}
```

### 个性化指标 (PersonalMetrics)
```typescript
interface PersonalMetrics {
  id: number;
  userId: string;
  careerScore: number; // 0-100
  skillLevel: number; // 0-100
  marketValue: number; // 0-100
  riskTolerance: number; // 0-100
  learningAbility: number; // 0-100
  networkStrength: number; // 0-100
  workLifeBalance: number; // 0-100
  careerGoals: string; // JSON
  skillGaps: string; // JSON
  improvementPlan: string; // JSON
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🚀 部署说明

### 数据库迁移
```bash
# 后端会自动创建新的数据表
# 包括: user_profiles, career_histories, contract_risks, 
#       company_monitors, personal_metrics
```

### 环境变量
```bash
# 数据库配置
MYSQL_DSN=root:@tcp(127.0.0.1:3306)/ai_career_buddy?charset=utf8mb4&parseTime=True&loc=Local

# 日志配置
LOG_DIR=./logs
```

## 📈 未来扩展

### 计划功能：
1. **智能推荐**: 基于历史记录推荐相关问题和资源
2. **数据分析**: 更深入的职业发展数据分析
3. **社交功能**: 用户之间的经验分享和交流
4. **移动端**: 开发移动端应用
5. **AI助手**: 更智能的个性化建议和提醒

### 技术优化：
1. **缓存机制**: Redis缓存提升性能
2. **搜索引擎**: Elasticsearch支持全文搜索
3. **实时通知**: WebSocket实现实时告警
4. **数据分析**: 集成数据分析工具
5. **机器学习**: 基于用户行为的智能推荐

---

通过这套完整的用户历史记录和个性化功能，AI职场管家将为您提供更加智能、个性化的职场咨询服务！🎉
