import React, { useState, useEffect } from 'react';
import './CompanyExperiencePanel.css';

interface CurrentCompany {
  id: string;
  companyName: string;
  position: string;
  industry: string;
  companySize: string;
  workLocation: string;
  joinDate: string;
  currentSalary: string;
  workEnvironment: string;
  teamSize: string;
}

interface CompanyRisk {
  id: string;
  riskType: 'financial' | 'management' | 'market' | 'operational' | 'legal' | 'career';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  probability: number;
  mitigation: string;
  lastUpdated: string;
}

interface CompanyScore {
  overallScore: number;
  happinessIndex: number;
  careerDevelopment: number;
  workLifeBalance: number;
  salarySatisfaction: number;
  teamCulture: number;
  managementQuality: number;
  companyStability: number;
  growthPotential: number;
}

interface CompanyMetrics {
  riskCount: number;
  highRiskCount: number;
  lastRiskUpdate: string;
  scoreTrend: 'up' | 'down' | 'stable';
  recommendation: string;
}

interface CompanyExperiencePanelProps {
  userInput?: string;
  aiResponse?: string;
  className?: string;
}

const CompanyExperiencePanel: React.FC<CompanyExperiencePanelProps> = ({
  userInput = '',
  aiResponse = '',
  className = ''
}) => {
  const [currentCompany, setCurrentCompany] = useState<CurrentCompany | null>(null);
  const [risks, setRisks] = useState<CompanyRisk[]>([]);
  const [scores, setScores] = useState<CompanyScore | null>(null);
  const [metrics, setMetrics] = useState<CompanyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'risks' | 'scores'>('overview');
  const [riskNotificationEnabled, setRiskNotificationEnabled] = useState(false);

  useEffect(() => {
    // 模拟数据加载
    loadCompanyData();
  }, [userInput, aiResponse]);

  const loadCompanyData = async () => {
    setLoading(true);
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟当前企业数据
    const mockCurrentCompany: CurrentCompany = {
      id: '1',
      companyName: '字节跳动',
      position: '高级软件工程师',
      industry: '互联网',
      companySize: '10000+',
      workLocation: '北京',
      joinDate: '2024-03-01',
      currentSalary: '35K',
      workEnvironment: '开放创新',
      teamSize: '15人'
    };

    const mockRisks: CompanyRisk[] = [
      {
        id: '1',
        riskType: 'financial',
        severity: 'medium',
        title: '现金流压力',
        description: '公司近期现金流出现紧张，可能影响员工薪资发放',
        impact: '可能导致薪资延迟发放，影响员工士气',
        probability: 60,
        mitigation: '建议关注公司财报，准备应急资金',
        lastUpdated: '2024-09-13'
      },
      {
        id: '2',
        riskType: 'management',
        severity: 'high',
        title: '高管频繁变动',
        description: '公司近期多名高管离职，管理层稳定性存疑',
        impact: '可能影响公司战略执行和业务发展',
        probability: 70,
        mitigation: '密切关注公司动态，评估个人发展机会',
        lastUpdated: '2024-09-10'
      },
      {
        id: '3',
        riskType: 'market',
        severity: 'medium',
        title: '行业竞争加剧',
        description: '竞争对手推出新产品，市场份额面临挑战',
        impact: '可能影响公司业绩和员工发展空间',
        probability: 50,
        mitigation: '提升个人技能，增强市场竞争力',
        lastUpdated: '2024-09-08'
      },
      {
        id: '4',
        riskType: 'operational',
        severity: 'low',
        title: '技术债务积累',
        description: '系统技术债务较多，可能影响开发效率',
        impact: '可能影响项目进度和代码质量',
        probability: 40,
        mitigation: '参与技术重构，提升代码质量',
        lastUpdated: '2024-09-05'
      },
      {
        id: '5',
        riskType: 'career',
        severity: 'medium',
        title: '晋升通道受限',
        description: '公司组织结构调整，晋升机会减少',
        impact: '可能影响个人职业发展速度',
        probability: 45,
        mitigation: '主动承担更多责任，提升个人价值',
        lastUpdated: '2024-09-12'
      }
    ];

    const mockScores: CompanyScore = {
      overallScore: 78,
      happinessIndex: 82,
      careerDevelopment: 75,
      workLifeBalance: 68,
      salarySatisfaction: 85,
      teamCulture: 88,
      managementQuality: 72,
      companyStability: 80,
      growthPotential: 76
    };

    const mockMetrics: CompanyMetrics = {
      riskCount: 5,
      highRiskCount: 1,
      lastRiskUpdate: '2024-09-13',
      scoreTrend: 'stable',
      recommendation: '当前企业整体表现良好，建议继续关注风险变化，积极提升个人技能'
    };

    setCurrentCompany(mockCurrentCompany);
    setRisks(mockRisks);
    setScores(mockScores);
    setMetrics(mockMetrics);
    setLoading(false);
  };

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return '💰';
      case 'management': return '👥';
      case 'market': return '📈';
      case 'operational': return '⚙️';
      case 'legal': return '⚖️';
      case 'career': return '🎯';
      default: return '⚠️';
    }
  };

  const getRiskTypeText = (type: string) => {
    switch (type) {
      case 'financial': return '财务风险';
      case 'management': return '管理风险';
      case 'market': return '市场风险';
      case 'operational': return '运营风险';
      case 'legal': return '法律风险';
      case 'career': return '职业风险';
      default: return '其他风险';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#16a34a';
      case 'medium': return '#d97706';
      case 'high': return '#dc2626';
      case 'critical': return '#7c2d12';
      default: return '#6b7280';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'low': return '低风险';
      case 'medium': return '中风险';
      case 'high': return '高风险';
      case 'critical': return '严重风险';
      default: return '未知';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '一般';
    if (score >= 60) return '较差';
    return '很差';
  };


  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'up': return '上升';
      case 'down': return '下降';
      case 'stable': return '稳定';
      default: return '稳定';
    }
  };

  if (loading) {
    return (
      <div className={`company-experience-panel loading ${className}`}>
        <div className="loading-spinner"></div>
        <p>加载企业经历信息中...</p>
      </div>
    );
  }

  return (
    <div className={`company-experience-panel ${className}`}>
      <div className="panel-header">
        <div className="header-left">
          <span className="panel-icon">🏢</span>
          <h3 className="panel-title">当前企业监控分析</h3>
        </div>
        <div className="header-actions">
          <button 
            className={`action-btn notification-btn ${riskNotificationEnabled ? 'enabled' : 'disabled'}`}
            onClick={() => setRiskNotificationEnabled(!riskNotificationEnabled)}
            title={riskNotificationEnabled ? '关闭风险通知' : '开启风险通知'}
          >
            <span className="notification-icon">🔔</span>
            <span>{riskNotificationEnabled ? '风险通知开启' : '风险通知关闭'}</span>
          </button>
        </div>
      </div>

      <div className="panel-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          <span>企业概览</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'risks' ? 'active' : ''}`}
          onClick={() => setActiveTab('risks')}
        >
          <span className="tab-icon">⚠️</span>
          <span>风险分析</span>
          <span className="tab-count">{risks.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'scores' ? 'active' : ''}`}
          onClick={() => setActiveTab('scores')}
        >
          <span className="tab-icon">⭐</span>
          <span>评分分析</span>
        </button>
      </div>

      <div className="panel-content">
        {activeTab === 'overview' ? (
          <div className="overview-section">
            <div className="section-header">
              <h4>🏢 当前企业概览</h4>
              <p className="section-desc">您当前所在企业的基本信息和综合评估</p>
            </div>
            
            {currentCompany && (
              <div className="company-overview-card">
                <div className="company-header">
                  <div className="company-basic">
                    <h5 className="company-name">{currentCompany.companyName}</h5>
                    <div className="company-meta">
                      <span className="position">{currentCompany.position}</span>
                      <span className="industry">{currentCompany.industry}</span>
                    </div>
                  </div>
                  {scores && (
                    <div className="overall-score">
                      <div className="score-circle">
                        <span className="score-number">{scores.overallScore}</span>
                        <span className="score-label">综合评分</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="company-details">
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">工作地点:</span>
                      <span className="detail-value">{currentCompany.workLocation}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">入职时间:</span>
                      <span className="detail-value">{currentCompany.joinDate}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">当前薪资:</span>
                      <span className="detail-value salary">{currentCompany.currentSalary}/月</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">工作环境:</span>
                      <span className="detail-value">{currentCompany.workEnvironment}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">团队规模:</span>
                      <span className="detail-value">{currentCompany.teamSize}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">企业规模:</span>
                      <span className="detail-value">{currentCompany.companySize}</span>
                    </div>
                  </div>
                </div>

                {metrics && (
                  <div className="metrics-summary">
                    <div className="metrics-grid">
                      <div className="metric-item">
                        <span className="metric-icon">⚠️</span>
                        <span className="metric-label">风险总数</span>
                        <span className="metric-value">{metrics.riskCount}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-icon">🚨</span>
                        <span className="metric-label">高风险</span>
                        <span className="metric-value">{metrics.highRiskCount}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-icon">{getTrendIcon(metrics.scoreTrend)}</span>
                        <span className="metric-label">评分趋势</span>
                        <span className="metric-value">{getTrendText(metrics.scoreTrend)}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-icon">📅</span>
                        <span className="metric-label">工作天数</span>
                        <span className="metric-value">{Math.floor((Date.now() - new Date(currentCompany.joinDate).getTime()) / (1000 * 60 * 60 * 24))}天</span>
                      </div>
                    </div>
                    
                    <div className="recommendation">
                      <h6>💡 建议</h6>
                      <p>{metrics.recommendation}</p>
                    </div>
                  </div>
                )}

                {/* 添加更多企业信息 */}
                <div className="additional-info">
                  <div className="info-section">
                    <h6>🏢 企业优势</h6>
                    <div className="advantage-tags">
                      <span className="advantage-tag">技术领先</span>
                      <span className="advantage-tag">成长空间大</span>
                      <span className="advantage-tag">团队优秀</span>
                      <span className="advantage-tag">福利完善</span>
                    </div>
                  </div>
                  
                  <div className="info-section">
                    <h6>📈 近期动态</h6>
                    <div className="recent-activities">
                      <div className="activity-item">
                        <span className="activity-date">2024-09-10</span>
                        <span className="activity-text">公司完成新一轮融资</span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-date">2024-09-05</span>
                        <span className="activity-text">发布新产品功能</span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-date">2024-08-28</span>
                        <span className="activity-text">团队规模扩大</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'risks' ? (
          <div className="risks-section">
            <div className="section-header">
              <h4>⚠️ 公司风险分析</h4>
              <p className="section-desc">基于最新信息分析的公司潜在风险</p>
            </div>
            
            <div className="risks-list">
              {risks.map(risk => (
                <div key={risk.id} className="risk-card">
                  <div className="risk-header">
                    <div className="risk-type">
                      <span className="type-icon">{getRiskTypeIcon(risk.riskType)}</span>
                      <span className="type-text">{getRiskTypeText(risk.riskType)}</span>
                    </div>
                    <div 
                      className="severity-badge"
                      style={{ backgroundColor: getSeverityColor(risk.severity) }}
                    >
                      {getSeverityText(risk.severity)}
                    </div>
                  </div>

                  <div className="risk-content">
                    <h5 className="risk-title">{risk.title}</h5>
                    <p className="risk-description">{risk.description}</p>
                    
                    <div className="risk-details">
                      <div className="detail-item">
                        <span className="detail-label">影响:</span>
                        <span className="detail-value">{risk.impact}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">发生概率:</span>
                        <span className="detail-value">{risk.probability}%</span>
                      </div>
                    </div>

                    <div className="risk-mitigation">
                      <h6>应对建议:</h6>
                      <p>{risk.mitigation}</p>
                    </div>

                    <div className="risk-footer">
                      <span className="last-updated">更新于: {risk.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="scores-section">
            <div className="section-header">
              <h4>⭐ 企业评分分析</h4>
              <p className="section-desc">从多个维度评估当前企业的综合表现</p>
            </div>
            
            {scores && (
              <div className="scores-content">
                <div className="happiness-index">
                  <div className="happiness-header">
                    <h5>😊 幸福指数</h5>
                    <div className="happiness-score">
                      <span className="score-number">{scores.happinessIndex}</span>
                      <span className="score-text">{getScoreText(scores.happinessIndex)}</span>
                    </div>
                  </div>
                  <div className="happiness-bar">
                    <div 
                      className="happiness-fill"
                      style={{ 
                        width: `${scores.happinessIndex}%`,
                        backgroundColor: getScoreColor(scores.happinessIndex)
                      }}
                    ></div>
                  </div>
                </div>

                <div className="score-breakdown">
                  <h6>📊 详细评分</h6>
                  <div className="score-items">
                    <div className="score-item">
                      <span className="score-label">职业发展</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill"
                          style={{ 
                            width: `${scores.careerDevelopment}%`,
                            backgroundColor: getScoreColor(scores.careerDevelopment)
                          }}
                        ></div>
                      </div>
                      <span className="score-value">{scores.careerDevelopment}</span>
                    </div>
                    
                    <div className="score-item">
                      <span className="score-label">工作生活平衡</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill"
                          style={{ 
                            width: `${scores.workLifeBalance}%`,
                            backgroundColor: getScoreColor(scores.workLifeBalance)
                          }}
                        ></div>
                      </div>
                      <span className="score-value">{scores.workLifeBalance}</span>
                    </div>
                    
                    <div className="score-item">
                      <span className="score-label">薪资满意度</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill"
                          style={{ 
                            width: `${scores.salarySatisfaction}%`,
                            backgroundColor: getScoreColor(scores.salarySatisfaction)
                          }}
                        ></div>
                      </div>
                      <span className="score-value">{scores.salarySatisfaction}</span>
                    </div>
                    
                    <div className="score-item">
                      <span className="score-label">团队文化</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill"
                          style={{ 
                            width: `${scores.teamCulture}%`,
                            backgroundColor: getScoreColor(scores.teamCulture)
                          }}
                        ></div>
                      </div>
                      <span className="score-value">{scores.teamCulture}</span>
                    </div>
                    
                    <div className="score-item">
                      <span className="score-label">管理质量</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill"
                          style={{ 
                            width: `${scores.managementQuality}%`,
                            backgroundColor: getScoreColor(scores.managementQuality)
                          }}
                        ></div>
                      </div>
                      <span className="score-value">{scores.managementQuality}</span>
                    </div>
                    
                    <div className="score-item">
                      <span className="score-label">公司稳定性</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill"
                          style={{ 
                            width: `${scores.companyStability}%`,
                            backgroundColor: getScoreColor(scores.companyStability)
                          }}
                        ></div>
                      </div>
                      <span className="score-value">{scores.companyStability}</span>
                    </div>
                    
                    <div className="score-item">
                      <span className="score-label">成长潜力</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill"
                          style={{ 
                            width: `${scores.growthPotential}%`,
                            backgroundColor: getScoreColor(scores.growthPotential)
                          }}
                        ></div>
                      </div>
                      <span className="score-value">{scores.growthPotential}</span>
                    </div>
                  </div>
                </div>

                {/* 添加评分趋势和对比分析 */}
                <div className="score-analysis">
                  <div className="analysis-section">
                    <h6>📈 评分趋势分析</h6>
                    <div className="trend-chart">
                      <div className="trend-item">
                        <span className="trend-label">本月评分</span>
                        <div className="trend-bar">
                          <div className="trend-fill" style={{ width: '78%', backgroundColor: '#3b82f6' }}></div>
                        </div>
                        <span className="trend-value">78</span>
                      </div>
                      <div className="trend-item">
                        <span className="trend-label">上月评分</span>
                        <div className="trend-bar">
                          <div className="trend-fill" style={{ width: '75%', backgroundColor: '#10b981' }}></div>
                        </div>
                        <span className="trend-value">75</span>
                      </div>
                      <div className="trend-item">
                        <span className="trend-label">三个月前</span>
                        <div className="trend-bar">
                          <div className="trend-fill" style={{ width: '72%', backgroundColor: '#f59e0b' }}></div>
                        </div>
                        <span className="trend-value">72</span>
                      </div>
                    </div>
                  </div>

                  <div className="analysis-section">
                    <h6>🎯 改进建议</h6>
                    <div className="improvement-suggestions">
                      <div className="suggestion-item">
                        <span className="suggestion-icon">💡</span>
                        <div className="suggestion-content">
                          <span className="suggestion-title">工作生活平衡</span>
                          <span className="suggestion-desc">建议合理安排工作时间，提高效率</span>
                        </div>
                      </div>
                      <div className="suggestion-item">
                        <span className="suggestion-icon">📚</span>
                        <div className="suggestion-content">
                          <span className="suggestion-title">职业发展</span>
                          <span className="suggestion-desc">可以主动承担更多挑战性项目</span>
                        </div>
                      </div>
                      <div className="suggestion-item">
                        <span className="suggestion-icon">🤝</span>
                        <div className="suggestion-content">
                          <span className="suggestion-title">管理质量</span>
                          <span className="suggestion-desc">建议加强与上级的沟通交流</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="analysis-section">
                    <h6>📊 行业对比</h6>
                    <div className="industry-comparison">
                      <div className="comparison-item">
                        <span className="comparison-label">您的评分</span>
                        <span className="comparison-value">78</span>
                      </div>
                      <div className="comparison-item">
                        <span className="comparison-label">行业平均</span>
                        <span className="comparison-value">72</span>
                      </div>
                      <div className="comparison-item">
                        <span className="comparison-label">同级别平均</span>
                        <span className="comparison-value">75</span>
                      </div>
                      <div className="comparison-item">
                        <span className="comparison-label">排名</span>
                        <span className="comparison-value">前25%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="panel-footer">
        <div className="footer-info">
          <span className="info-text">
            {activeTab === 'overview' 
              ? `企业概览 - 最后更新: ${metrics?.lastRiskUpdate || '未知'}`
              : activeTab === 'risks' 
              ? `发现 ${risks.length} 个潜在风险，其中 ${metrics?.highRiskCount || 0} 个高风险`
              : `综合评分: ${scores?.overallScore || 0}分 - 幸福指数: ${scores?.happinessIndex || 0}`
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompanyExperiencePanel;
