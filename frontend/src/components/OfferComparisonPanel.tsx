import React, { useState, useEffect } from 'react';
import './OfferComparisonPanel.css';

interface OfferComparisonPanelProps {
  userInput?: string;
  aiResponse?: string;
  className?: string;
}

interface OfferData {
  id: string;
  company: string;
  position: string;
  baseSalary: number;
  bonus: string;
  equity: string;
  benefits: string[];
  location: string;
  experience: string;
  industry: string;
  timestamp: string;
  riskLevel?: 'low' | 'medium' | 'high';
  growthPotential?: 'high' | 'medium' | 'low';
  companySize?: 'startup' | 'medium' | 'large';
}

interface RiskAnalysis {
  industry: string;
  riskLevel: 'low' | 'medium' | 'high';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface Recommendation {
  offerId: string;
  score: number;
  reasons: string[];
  category: 'best_overall' | 'highest_salary' | 'best_growth' | 'most_stable';
}

const OfferComparisonPanel: React.FC<OfferComparisonPanelProps> = ({
  userInput = '',
  aiResponse = '',
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [offerData, setOfferData] = useState<OfferData[]>([]);
  const [sortBy, setSortBy] = useState<'salary' | 'company' | 'position' | 'date'>('salary');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 模拟数据 - 实际应用中可以从API获取
  useEffect(() => {
    const mockData: OfferData[] = [
      {
        id: '1',
        company: '字节跳动',
        position: '算法工程师',
        baseSalary: 35000,
        bonus: '3-6个月',
        equity: '20万RSU',
        benefits: ['免费三餐', '健身房', '商业保险', '年假15天'],
        location: '北京',
        experience: '3-5年',
        industry: '互联网',
        timestamp: '2024-01-15',
        riskLevel: 'medium',
        growthPotential: 'high',
        companySize: 'large'
      },
      {
        id: '2',
        company: '腾讯',
        position: '后端开发',
        baseSalary: 32000,
        bonus: '2-4个月',
        equity: '15万股票',
        benefits: ['免费班车', '体检', '培训基金', '年假12天'],
        location: '深圳',
        experience: '3-5年',
        industry: '互联网',
        timestamp: '2024-01-10',
        riskLevel: 'low',
        growthPotential: 'medium',
        companySize: 'large'
      },
      {
        id: '3',
        company: '阿里巴巴',
        position: '前端开发',
        baseSalary: 30000,
        bonus: '2-5个月',
        equity: '12万期权',
        benefits: ['免费咖啡', '团建', '学习津贴', '年假10天'],
        location: '杭州',
        experience: '2-4年',
        industry: '互联网',
        timestamp: '2024-01-08',
        riskLevel: 'medium',
        growthPotential: 'medium',
        companySize: 'large'
      },
      {
        id: '4',
        company: '美团',
        position: '产品经理',
        baseSalary: 28000,
        bonus: '2-3个月',
        equity: '10万RSU',
        benefits: ['免费午餐', '健身房', '商业保险', '年假12天'],
        location: '北京',
        experience: '3-5年',
        industry: '互联网',
        timestamp: '2024-01-05',
        riskLevel: 'medium',
        growthPotential: 'medium',
        companySize: 'large'
      },
      {
        id: '5',
        company: '滴滴',
        position: '数据科学家',
        baseSalary: 33000,
        bonus: '3-5个月',
        equity: '18万股票',
        benefits: ['免费晚餐', '按摩', '培训', '年假15天'],
        location: '北京',
        experience: '4-6年',
        industry: '互联网',
        timestamp: '2024-01-03',
        riskLevel: 'high',
        growthPotential: 'high',
        companySize: 'large'
      },
      {
        id: '6',
        company: '华为',
        position: '软件工程师',
        baseSalary: 25000,
        bonus: '1-3个月',
        equity: '8万TUP',
        benefits: ['免费班车', '体检', '培训', '年假10天'],
        location: '深圳',
        experience: '2-4年',
        industry: '通信',
        timestamp: '2024-01-01',
        riskLevel: 'low',
        growthPotential: 'low',
        companySize: 'large'
      }
    ];
    setOfferData(mockData);
  }, []);

  const getFilteredOffers = () => {
    let filtered = selectedCategory === 'all' ? offerData : offerData.filter(offer => offer.industry === selectedCategory);
    
    // 排序逻辑
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'salary':
          comparison = a.baseSalary - b.baseSalary;
          break;
        case 'company':
          comparison = a.company.localeCompare(b.company);
          break;
        case 'position':
          comparison = a.position.localeCompare(b.position);
          break;
        case 'date':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  const getAverageSalary = () => {
    const filtered = getFilteredOffers();
    if (filtered.length === 0) return 0;
    return Math.round(filtered.reduce((sum, offer) => sum + offer.baseSalary, 0) / filtered.length);
  };

  const getSalaryRange = () => {
    const filtered = getFilteredOffers();
    if (filtered.length === 0) return { min: 0, max: 0 };
    const salaries = filtered.map(offer => offer.baseSalary);
    return {
      min: Math.min(...salaries),
      max: Math.max(...salaries)
    };
  };

  const getTopCompanies = () => {
    if (offerData.length === 0) return [];
    
    const companyCounts = offerData.reduce((acc, offer) => {
      acc[offer.company] = (acc[offer.company] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(companyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));
  };

  const getIndustryStats = () => {
    if (offerData.length === 0) return [];
    
    const industryCounts = offerData.reduce((acc, offer) => {
      acc[offer.industry] = (acc[offer.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(industryCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([industry, count]) => ({ industry, count }));
  };

  const formatSalary = (salary: number) => {
    return `${(salary / 1000).toFixed(0)}K`;
  };

  const getSalaryLevel = (salary: number) => {
    if (salary >= 30000) return 'high';
    if (salary >= 20000) return 'medium';
    return 'low';
  };

  // 风险分析数据
  const getRiskAnalysis = (): RiskAnalysis[] => {
    return [
      {
        industry: '互联网',
        riskLevel: 'medium',
        trend: 'stable',
        description: '互联网行业竞争激烈，但仍有增长空间'
      },
      {
        industry: '通信',
        riskLevel: 'low',
        trend: 'stable',
        description: '通信行业相对稳定，技术更新较慢'
      }
    ];
  };

  // 智能推荐算法
  const getRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    // 如果没有Offer数据，返回空数组
    if (offerData.length === 0) {
      return recommendations;
    }
    
    // 最高薪资推荐
    const highestSalaryOffer = offerData.reduce((max, offer) => 
      offer.baseSalary > max.baseSalary ? offer : max
    );
    recommendations.push({
      offerId: highestSalaryOffer.id,
      score: 95,
      reasons: ['薪资最高', '福利待遇优厚', '公司知名度高'],
      category: 'highest_salary'
    });

    // 最佳综合推荐
    const bestOverallOffer = offerData.find(offer => 
      offer.baseSalary >= 30000 && offer.riskLevel === 'low' && offer.growthPotential === 'high'
    ) || offerData[0];
    recommendations.push({
      offerId: bestOverallOffer.id,
      score: 88,
      reasons: ['薪资竞争力强', '风险较低', '成长潜力大'],
      category: 'best_overall'
    });

    // 最佳成长推荐
    const bestGrowthOffer = offerData.find(offer => 
      offer.growthPotential === 'high' && offer.baseSalary >= 30000
    ) || offerData[0];
    recommendations.push({
      offerId: bestGrowthOffer.id,
      score: 85,
      reasons: ['成长潜力最大', '技术前沿', '学习机会多'],
      category: 'best_growth'
    });

    // 最稳定推荐
    const mostStableOffer = offerData.find(offer => 
      offer.riskLevel === 'low' && offer.companySize === 'large'
    ) || offerData[1];
    recommendations.push({
      offerId: mostStableOffer.id,
      score: 82,
      reasons: ['风险最低', '公司稳定', '福利完善'],
      category: 'most_stable'
    });

    return recommendations;
  };

  // 获取风险等级样式
  const getRiskLevelStyle = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'risk-low';
      case 'medium': return 'risk-medium';
      case 'high': return 'risk-high';
      default: return 'risk-medium';
    }
  };

  // 获取成长潜力样式
  const getGrowthPotentialStyle = (growthPotential: string) => {
    switch (growthPotential) {
      case 'high': return 'growth-high';
      case 'medium': return 'growth-medium';
      case 'low': return 'growth-low';
      default: return 'growth-medium';
    }
  };

  // 获取推荐类型标签
  const getRecommendationLabel = (category: string) => {
    switch (category) {
      case 'best_overall': return '最佳综合';
      case 'highest_salary': return '最高薪资';
      case 'best_growth': return '最佳成长';
      case 'most_stable': return '最稳定';
      default: return '推荐';
    }
  };

  return (
    <div className={`offer-comparison-panel ${isExpanded ? 'expanded' : ''} ${className}`}>
      <div className="panel-header">
        <div className="header-left">
          <span className="panel-icon">📊</span>
          <h3 className="panel-title">Offer对比分析</h3>
        </div>
        <div className="header-actions">
          <button 
            className="action-btn fullscreen-btn"
            onClick={() => setIsFullscreen(true)}
            title="放大到全屏"
          >
            🔍 放大
          </button>
        </div>
      </div>
      
      <div className="panel-content">
        {/* 统计概览和筛选器合并 */}
        <div className="stats-filter-section">
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-value">{offerData.length}</div>
              <div className="stat-label">总Offer数</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatSalary(getAverageSalary())}</div>
              <div className="stat-label">平均薪资</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatSalary(getSalaryRange().min)}-{formatSalary(getSalaryRange().max)}</div>
              <div className="stat-label">薪资范围</div>
            </div>
          </div>
          
          <div className="filter-section">
            <div className="filter-label">行业筛选：</div>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                全部
              </button>
              {getIndustryStats().map(stat => (
                <button 
                  key={stat.industry}
                  className={`filter-btn ${selectedCategory === stat.industry ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(stat.industry)}
                >
                  {stat.industry} ({stat.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Offer列表 */}
        <div className="offers-list">
          <div className="list-header">
            <h4>最新Offer数据</h4>
            <div className="header-right">
              <div className="sort-controls">
                <span className="sort-label">排序:</span>
                <select 
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'salary' | 'company' | 'position' | 'date')}
                >
                  <option value="salary">薪资</option>
                  <option value="company">公司</option>
                  <option value="position">职位</option>
                  <option value="date">日期</option>
                </select>
                <button 
                  className={`sort-order-btn ${sortOrder}`}
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={sortOrder === 'desc' ? '降序' : '升序'}
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>
              <span className="update-time">更新时间: {new Date().toLocaleString()}</span>
            </div>
          </div>
          
          <div className="offers-grid">
            {getFilteredOffers().length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h4>暂无Offer数据</h4>
                <p>请先上传或输入Offer信息进行分析</p>
              </div>
            ) : (
              getFilteredOffers().map(offer => (
              <div key={offer.id} className="offer-card">
                <div className="offer-header">
                  <div className="company-info">
                    <h5 className="company-name">{offer.company}</h5>
                    <span className="position">{offer.position}</span>
                    <div className="offer-tags">
                      {offer.riskLevel && (
                        <span className={`risk-tag ${getRiskLevelStyle(offer.riskLevel)}`}>
                          {offer.riskLevel === 'low' ? '低风险' : offer.riskLevel === 'medium' ? '中风险' : '高风险'}
                        </span>
                      )}
                      {offer.growthPotential && (
                        <span className={`growth-tag ${getGrowthPotentialStyle(offer.growthPotential)}`}>
                          {offer.growthPotential === 'high' ? '高成长' : offer.growthPotential === 'medium' ? '中成长' : '低成长'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`salary-badge ${getSalaryLevel(offer.baseSalary)}`}>
                    <strong>{formatSalary(offer.baseSalary)}</strong>
                  </div>
                </div>
                
                <div className="offer-details">
                  <div className="detail-row">
                    <span className="detail-label">奖金:</span>
                    <span className="detail-value"><strong>{offer.bonus}</strong></span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">股权:</span>
                    <span className="detail-value"><strong>{offer.equity}</strong></span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">地点:</span>
                    <span className="detail-value">{offer.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">经验:</span>
                    <span className="detail-value">{offer.experience}</span>
                  </div>
                </div>
                
                <div className="benefits-section">
                  <div className="benefits-label">福利待遇:</div>
                  <div className="benefits-list">
                    {offer.benefits.map((benefit, index) => (
                      <span key={index} className="benefit-tag">{benefit}</span>
                    ))}
                  </div>
                </div>
                
                <div className="offer-footer">
                  <span className="timestamp">{offer.timestamp}</span>
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* 风险分析区域 */}
        <div className="risk-analysis-section">
          <h4>行业风险分析</h4>
          <div className="risk-cards">
            {getRiskAnalysis().map((risk, index) => (
              <div key={index} className={`risk-card ${getRiskLevelStyle(risk.riskLevel)}`}>
                <div className="risk-header">
                  <span className="risk-industry">{risk.industry}</span>
                  <span className={`risk-level ${getRiskLevelStyle(risk.riskLevel)}`}>
                    {risk.riskLevel === 'low' ? '低风险' : risk.riskLevel === 'medium' ? '中风险' : '高风险'}
                  </span>
                </div>
                <div className="risk-trend">
                  <span className={`trend-icon ${risk.trend}`}>
                    {risk.trend === 'up' ? '📈' : risk.trend === 'down' ? '📉' : '📊'}
                  </span>
                  <span className="trend-text">
                    {risk.trend === 'up' ? '上升趋势' : risk.trend === 'down' ? '下降趋势' : '稳定趋势'}
                  </span>
                </div>
                <div className="risk-description">{risk.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 智能推荐区域 */}
        <div className="recommendations-section">
          <h4>智能推荐</h4>
          <div className="recommendations-grid">
            {getRecommendations().map((rec, index) => {
              const offer = offerData.find(o => o.id === rec.offerId);
              if (!offer) return null;
              
              return (
                <div key={index} className="recommendation-card">
                  <div className="rec-header">
                    <span className="rec-type">{getRecommendationLabel(rec.category)}</span>
                    <span className="rec-score">{rec.score}分</span>
                  </div>
                  <div className="rec-company">
                    <strong>{offer.company}</strong> - {offer.position}
                  </div>
                  <div className="rec-salary">
                    <span className="rec-salary-value">{formatSalary(offer.baseSalary)}</span>
                    <span className="rec-salary-label">月薪</span>
                  </div>
                  <div className="rec-reasons">
                    {rec.reasons.map((reason, idx) => (
                      <span key={idx} className="reason-tag">{reason}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 合并的分析区域 */}
        <div className="analysis-section">
          <div className="ranking-section">
            <h4>热门公司排行</h4>
            <div className="ranking-list">
              {getTopCompanies().map((item, index) => (
                <div key={item.company} className="ranking-item">
                  <span className="rank-number">{index + 1}</span>
                  <span className="company-name">{item.company}</span>
                  <span className="offer-count">{item.count}个Offer</span>
                </div>
              ))}
            </div>
          </div>

          <div className="salary-analysis">
            <h4>薪资分析</h4>
            <div className="analysis-content">
              <div className="analysis-item">
                <span className="analysis-label">高薪岗位:</span>
                <span className="analysis-value">
                  {offerData.filter(offer => offer.baseSalary >= 30000).length}个
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">中等薪资:</span>
                <span className="analysis-value">
                  {offerData.filter(offer => offer.baseSalary >= 20000 && offer.baseSalary < 30000).length}个
                </span>
              </div>
              <div className="analysis-item">
                <span className="analysis-label">入门薪资:</span>
                <span className="analysis-value">
                  {offerData.filter(offer => offer.baseSalary < 20000).length}个
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 全屏模态框 */}
      {isFullscreen && (
        <div className="visualization-fullscreen-modal" onClick={() => setIsFullscreen(false)}>
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <div className="fullscreen-header">
              <div className="header-left">
                <span className="panel-icon">📊</span>
                <h2 className="panel-title">Offer对比分析</h2>
              </div>
              <div className="header-actions">
                <button 
                  className="action-btn close-btn"
                  onClick={() => setIsFullscreen(false)}
                  title="关闭全屏"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="fullscreen-body">
              {/* 统计概览和筛选器合并 */}
              <div className="stats-filter-section">
                <div className="stats-overview">
                  <div className="stat-card">
                    <div className="stat-value">{offerData.length}</div>
                    <div className="stat-label">总Offer数</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{formatSalary(getAverageSalary())}</div>
                    <div className="stat-label">平均薪资</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{formatSalary(getSalaryRange().min)}-{formatSalary(getSalaryRange().max)}</div>
                    <div className="stat-label">薪资范围</div>
                  </div>
                </div>
                
                <div className="filter-section">
                  <div className="filter-label">行业筛选：</div>
                  <div className="filter-buttons">
                    <button 
                      className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('all')}
                    >
                      全部
                    </button>
                    {getIndustryStats().map(stat => (
                      <button 
                        key={stat.industry}
                        className={`filter-btn ${selectedCategory === stat.industry ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(stat.industry)}
                      >
                        {stat.industry} ({stat.count})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Offer列表 */}
              <div className="offers-list">
                <div className="list-header">
                  <h4>最新Offer数据</h4>
                  <div className="header-right">
                    <div className="sort-controls">
                      <span className="sort-label">排序:</span>
                      <select 
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'salary' | 'company' | 'position' | 'date')}
                      >
                        <option value="salary">薪资</option>
                        <option value="company">公司</option>
                        <option value="position">职位</option>
                        <option value="date">日期</option>
                      </select>
                      <button 
                        className={`sort-order-btn ${sortOrder}`}
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        title={sortOrder === 'desc' ? '降序' : '升序'}
                      >
                        {sortOrder === 'desc' ? '↓' : '↑'}
                      </button>
                    </div>
                    <span className="update-time">更新时间: {new Date().toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="offers-grid">
                  {getFilteredOffers().length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      <h4>暂无Offer数据</h4>
                      <p>请先上传或输入Offer信息进行分析</p>
                    </div>
                  ) : (
                    getFilteredOffers().map(offer => (
                    <div key={offer.id} className="offer-card">
                      <div className="offer-header">
                        <div className="company-info">
                          <h5 className="company-name">{offer.company}</h5>
                          <span className="position">{offer.position}</span>
                          <div className="offer-tags">
                            {offer.riskLevel && (
                              <span className={`risk-tag ${getRiskLevelStyle(offer.riskLevel)}`}>
                                {offer.riskLevel === 'low' ? '低风险' : offer.riskLevel === 'medium' ? '中风险' : '高风险'}
                              </span>
                            )}
                            {offer.growthPotential && (
                              <span className={`growth-tag ${getGrowthPotentialStyle(offer.growthPotential)}`}>
                                {offer.growthPotential === 'high' ? '高成长' : offer.growthPotential === 'medium' ? '中成长' : '低成长'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`salary-badge ${getSalaryLevel(offer.baseSalary)}`}>
                          <strong>{formatSalary(offer.baseSalary)}</strong>
                        </div>
                      </div>
                      
                      <div className="offer-details">
                        <div className="detail-row">
                          <span className="detail-label">奖金:</span>
                          <span className="detail-value"><strong>{offer.bonus}</strong></span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">股权:</span>
                          <span className="detail-value"><strong>{offer.equity}</strong></span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">地点:</span>
                          <span className="detail-value">{offer.location}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">经验:</span>
                          <span className="detail-value">{offer.experience}</span>
                        </div>
                      </div>
                      
                      <div className="benefits-section">
                        <div className="benefits-label">福利待遇:</div>
                        <div className="benefits-list">
                          {offer.benefits.map((benefit, index) => (
                            <span key={index} className="benefit-tag">{benefit}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="offer-footer">
                        <span className="timestamp">{offer.timestamp}</span>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </div>

              {/* 风险分析区域 */}
              <div className="risk-analysis-section">
                <h4>行业风险分析</h4>
                <div className="risk-cards">
                  {getRiskAnalysis().map((risk, index) => (
                    <div key={index} className={`risk-card ${getRiskLevelStyle(risk.riskLevel)}`}>
                      <div className="risk-header">
                        <span className="risk-industry">{risk.industry}</span>
                        <span className={`risk-level ${getRiskLevelStyle(risk.riskLevel)}`}>
                          {risk.riskLevel === 'low' ? '低风险' : risk.riskLevel === 'medium' ? '中风险' : '高风险'}
                        </span>
                      </div>
                      <div className="risk-trend">
                        <span className={`trend-icon ${risk.trend}`}>
                          {risk.trend === 'up' ? '📈' : risk.trend === 'down' ? '📉' : '📊'}
                        </span>
                        <span className="trend-text">
                          {risk.trend === 'up' ? '上升趋势' : risk.trend === 'down' ? '下降趋势' : '稳定趋势'}
                        </span>
                      </div>
                      <div className="risk-description">{risk.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 智能推荐区域 */}
              <div className="recommendations-section">
                <h4>智能推荐</h4>
                <div className="recommendations-grid">
                  {getRecommendations().map((rec, index) => {
                    const offer = offerData.find(o => o.id === rec.offerId);
                    if (!offer) return null;
                    
                    return (
                      <div key={index} className="recommendation-card">
                        <div className="rec-header">
                          <span className="rec-type">{getRecommendationLabel(rec.category)}</span>
                          <span className="rec-score">{rec.score}分</span>
                        </div>
                        <div className="rec-company">
                          <strong>{offer.company}</strong> - {offer.position}
                        </div>
                        <div className="rec-salary">
                          <span className="rec-salary-value">{formatSalary(offer.baseSalary)}</span>
                          <span className="rec-salary-label">月薪</span>
                        </div>
                        <div className="rec-reasons">
                          {rec.reasons.map((reason, idx) => (
                            <span key={idx} className="reason-tag">{reason}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 合并的分析区域 */}
              <div className="analysis-section">
                <div className="ranking-section">
                  <h4>热门公司排行</h4>
                  <div className="ranking-list">
                    {getTopCompanies().map((item, index) => (
                      <div key={item.company} className="ranking-item">
                        <span className="rank-number">{index + 1}</span>
                        <span className="company-name">{item.company}</span>
                        <span className="offer-count">{item.count}个Offer</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="salary-analysis">
                  <h4>薪资分析</h4>
                  <div className="analysis-content">
                    <div className="analysis-item">
                      <span className="analysis-label">高薪岗位:</span>
                      <span className="analysis-value">
                        {offerData.filter(offer => offer.baseSalary >= 30000).length}个
                      </span>
                    </div>
                    <div className="analysis-item">
                      <span className="analysis-label">中等薪资:</span>
                      <span className="analysis-value">
                        {offerData.filter(offer => offer.baseSalary >= 20000 && offer.baseSalary < 30000).length}个
                      </span>
                    </div>
                    <div className="analysis-item">
                      <span className="analysis-label">入门薪资:</span>
                      <span className="analysis-value">
                        {offerData.filter(offer => offer.baseSalary < 20000).length}个
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferComparisonPanel;
