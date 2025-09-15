import React, { useState, useEffect } from 'react';
import './CareerPlanningPanel.css';

interface CareerPlanningPanelProps {
  userInput?: string;
  aiResponse?: string;
  className?: string;
}

interface CareerStage {
  id: string;
  name: string;
  ageRange: string;
  description: string;
  keyTasks: string[];
  skills: string[];
  challenges: string[];
}

interface IndustryTrend {
  id: string;
  industry: string;
  growth: number;
  demand: string;
  avgSalary: number;
  keySkills: string[];
  outlook: string;
}

const CareerPlanningPanel: React.FC<CareerPlanningPanelProps> = ({
  userInput = '',
  aiResponse = '',
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [currentStage, setCurrentStage] = useState('growth'); // 默认成长阶段

  // 职业阶段数据
  const careerStages: CareerStage[] = [
    {
      id: 'entry',
      name: '入门阶段',
      ageRange: '22-25岁',
      description: '刚毕业或初入职场，需要建立基础技能和职业认知',
      keyTasks: ['学习基础技能', '建立职业网络', '寻找导师', '确定职业方向'],
      skills: ['基础专业技能', '学习能力', '沟通能力', '团队协作'],
      challenges: ['缺乏经验', '薪资较低', '工作压力大', '职业方向不明确']
    },
    {
      id: 'growth',
      name: '成长阶段',
      ageRange: '26-30岁',
      description: '技能快速提升，开始承担更多责任，寻找专业发展方向',
      keyTasks: ['深化专业技能', '承担项目责任', '建立个人品牌', '考虑专业认证'],
      skills: ['专业技能', '项目管理', '问题解决', '领导力基础'],
      challenges: ['工作生活平衡', '技能更新压力', '竞争激烈', '职业瓶颈']
    },
    {
      id: 'establishment',
      name: '建立阶段',
      ageRange: '31-40岁',
      description: '成为行业专家，开始领导团队，建立个人影响力',
      keyTasks: ['成为领域专家', '领导团队', '建立行业声誉', '考虑创业'],
      skills: ['专业深度', '团队管理', '战略思维', '商业洞察'],
      challenges: ['管理压力', '技术更新', '家庭责任', '职业转型']
    },
    {
      id: 'mastery',
      name: '精通阶段',
      ageRange: '41-50岁',
      description: '行业资深专家，可能转向管理或咨询，影响行业发展',
      keyTasks: ['行业影响力', '培养下一代', '战略决策', '知识传承'],
      skills: ['行业洞察', '战略规划', '人才培养', '商业判断'],
      challenges: ['技术老化', '管理复杂', '创新压力', '职业倦怠']
    }
  ];

  // 行业趋势数据
  const industryTrends: IndustryTrend[] = [
    {
      id: 'tech',
      industry: '互联网科技',
      growth: 15,
      demand: '高',
      avgSalary: 25000,
      keySkills: ['编程', '数据分析', '产品设计', '人工智能'],
      outlook: '持续增长，AI、大数据、云计算等新兴技术驱动'
    },
    {
      id: 'finance',
      industry: '金融科技',
      growth: 12,
      demand: '高',
      avgSalary: 22000,
      keySkills: ['金融知识', '数据分析', '风险管理', '区块链'],
      outlook: '数字化转型加速，金融科技人才需求旺盛'
    },
    {
      id: 'healthcare',
      industry: '医疗健康',
      growth: 18,
      demand: '很高',
      avgSalary: 20000,
      keySkills: ['医疗知识', '数据分析', '人工智能', '生物技术'],
      outlook: '人口老龄化推动，医疗科技快速发展'
    },
    {
      id: 'education',
      industry: '在线教育',
      growth: 20,
      demand: '很高',
      avgSalary: 18000,
      keySkills: ['教育理论', '产品设计', '数据分析', '用户体验'],
      outlook: '疫情推动在线教育普及，未来发展潜力巨大'
    },
    {
      id: 'automotive',
      industry: '新能源汽车',
      growth: 25,
      demand: '很高',
      avgSalary: 23000,
      keySkills: ['汽车工程', '电池技术', '自动驾驶', '软件工程'],
      outlook: '政策支持，技术突破，市场快速增长'
    }
  ];

  const getFilteredStages = () => {
    if (selectedStage === 'all') return careerStages;
    return careerStages.filter(stage => stage.id === selectedStage);
  };

  const getFilteredIndustries = () => {
    if (selectedIndustry === 'all') return industryTrends;
    return industryTrends.filter(industry => industry.id === selectedIndustry);
  };

  const getGrowthLevel = (growth: number) => {
    if (growth >= 20) return 'very-high';
    if (growth >= 15) return 'high';
    if (growth >= 10) return 'medium';
    return 'low';
  };

  const getDemandLevel = (demand: string) => {
    switch (demand) {
      case '很高': return 'very-high';
      case '高': return 'high';
      case '中': return 'medium';
      default: return 'low';
    }
  };

  return (
    <div className={`career-planning-panel ${isExpanded ? 'expanded' : ''} ${className}`}>
      <div className="panel-header">
        <div className="header-left">
          <span className="panel-icon">🎯</span>
          <h3 className="panel-title">职业规划指导</h3>
        </div>
        <div className="header-actions">
        </div>
      </div>
      
      <div className="panel-content">
        {/* 当前阶段 */}
        <div className="current-stage-section">
          <h4>我的当前阶段</h4>
          <div className="current-stage-card">
            <div className="stage-selector">
              <label>选择当前职业阶段：</label>
              <select 
                value={currentStage} 
                onChange={(e) => setCurrentStage(e.target.value)}
                className="stage-select"
              >
                {careerStages.map(stage => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name} ({stage.ageRange})
                  </option>
                ))}
              </select>
            </div>
            
            {careerStages.find(stage => stage.id === currentStage) && (
              <div className="current-stage-info">
                <div className="stage-header">
                  <h5>{careerStages.find(stage => stage.id === currentStage)!.name}</h5>
                  <span className="stage-age">{careerStages.find(stage => stage.id === currentStage)!.ageRange}</span>
                </div>
                
                <div className="stage-description">
                  <p>{careerStages.find(stage => stage.id === currentStage)!.description}</p>
                </div>
                
                <div className="stage-focus">
                  <div className="focus-item">
                    <h6>🎯 当前重点任务</h6>
                    <ul>
                      {careerStages.find(stage => stage.id === currentStage)!.keyTasks.map((task, index) => (
                        <li key={index}>{task}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="focus-item">
                    <h6>💪 需要提升的技能</h6>
                    <div className="skills-tags">
                      {careerStages.find(stage => stage.id === currentStage)!.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="focus-item">
                    <h6>⚠️ 需要注意的挑战</h6>
                    <ul>
                      {careerStages.find(stage => stage.id === currentStage)!.challenges.map((challenge, index) => (
                        <li key={index}>{challenge}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 职业阶段指导 */}
        <div className="career-stages-section">
          <div className="section-header">
            <h4>职业发展阶段</h4>
            <div className="stage-filters">
              <button 
                className={`filter-btn ${selectedStage === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedStage('all')}
              >
                全部阶段
              </button>
              {careerStages.map(stage => (
                <button 
                  key={stage.id}
                  className={`filter-btn ${selectedStage === stage.id ? 'active' : ''}`}
                  onClick={() => setSelectedStage(stage.id)}
                >
                  {stage.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="stages-grid">
            {getFilteredStages().map(stage => (
              <div key={stage.id} className="stage-card">
                <div className="stage-header">
                  <h5 className="stage-name">{stage.name}</h5>
                  <span className="stage-age">{stage.ageRange}</span>
                </div>
                
                <div className="stage-description">
                  <p>{stage.description}</p>
                </div>
                
                <div className="stage-details">
                  <div className="detail-section">
                    <h6>关键任务</h6>
                    <ul>
                      {stage.keyTasks.map((task, index) => (
                        <li key={index}>{task}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="detail-section">
                    <h6>核心技能</h6>
                    <div className="skills-tags">
                      {stage.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h6>主要挑战</h6>
                    <ul>
                      {stage.challenges.map((challenge, index) => (
                        <li key={index}>{challenge}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 行业趋势分析 */}
        <div className="industry-trends-section">
          <div className="section-header">
            <h4>行业趋势分析</h4>
            <div className="industry-filters">
              <button 
                className={`filter-btn ${selectedIndustry === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedIndustry('all')}
              >
                全部行业
              </button>
              {industryTrends.map(industry => (
                <button 
                  key={industry.id}
                  className={`filter-btn ${selectedIndustry === industry.id ? 'active' : ''}`}
                  onClick={() => setSelectedIndustry(industry.id)}
                >
                  {industry.industry}
                </button>
              ))}
            </div>
          </div>
          
          <div className="industries-grid">
            {getFilteredIndustries().map(industry => (
              <div key={industry.id} className="industry-card">
                <div className="industry-header">
                  <h5 className="industry-name">{industry.industry}</h5>
                  <div className="industry-stats">
                    <span className={`growth-badge ${getGrowthLevel(industry.growth)}`}>
                      +{industry.growth}%
                    </span>
                    <span className={`demand-badge ${getDemandLevel(industry.demand)}`}>
                      {industry.demand}
                    </span>
                  </div>
                </div>
                
                <div className="industry-details">
                  <div className="detail-row">
                    <span className="detail-label">平均薪资:</span>
                    <span className="detail-value">{(industry.avgSalary / 1000).toFixed(0)}K</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">关键技能:</span>
                    <div className="skills-tags">
                      {industry.keySkills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="outlook-section">
                    <h6>发展前景</h6>
                    <p>{industry.outlook}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 职业规划建议 */}
        <div className="planning-advice-section">
          <h4>职业规划建议</h4>
          <div className="advice-grid">
            <div className="advice-card">
              <div className="advice-icon">🎯</div>
              <h5>目标设定</h5>
              <ul>
                <li>设定短期（1-2年）和长期（5-10年）职业目标</li>
                <li>目标要具体、可衡量、可实现</li>
                <li>定期回顾和调整目标</li>
                <li>平衡职业发展和个人生活</li>
              </ul>
            </div>
            
            <div className="advice-card">
              <div className="advice-icon">📚</div>
              <h5>技能提升</h5>
              <ul>
                <li>持续学习新技术和行业知识</li>
                <li>参加专业培训和认证</li>
                <li>通过项目实践提升技能</li>
                <li>关注行业发展趋势</li>
              </ul>
            </div>
            
            <div className="advice-card">
              <div className="advice-icon">🤝</div>
              <h5>人脉建设</h5>
              <ul>
                <li>积极参加行业活动和会议</li>
                <li>建立和维护专业关系</li>
                <li>寻找导师和mentor</li>
                <li>参与在线专业社区</li>
              </ul>
            </div>
            
            <div className="advice-card">
              <div className="advice-icon">💼</div>
              <h5>职业发展</h5>
              <ul>
                <li>主动承担更多责任</li>
                <li>寻求内部晋升机会</li>
                <li>考虑横向发展</li>
                <li>评估外部机会</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerPlanningPanel;
