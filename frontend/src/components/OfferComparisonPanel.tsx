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
}

const OfferComparisonPanel: React.FC<OfferComparisonPanelProps> = ({
  userInput = '',
  aiResponse = '',
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [offerData, setOfferData] = useState<OfferData[]>([]);

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
        timestamp: '2024-01-15'
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
        timestamp: '2024-01-10'
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
        timestamp: '2024-01-08'
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
        timestamp: '2024-01-05'
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
        timestamp: '2024-01-03'
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
        timestamp: '2024-01-01'
      }
    ];
    setOfferData(mockData);
  }, []);

  const getFilteredOffers = () => {
    if (selectedCategory === 'all') return offerData;
    return offerData.filter(offer => offer.industry === selectedCategory);
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

  return (
    <div className={`offer-comparison-panel ${isExpanded ? 'expanded' : ''} ${className}`}>
      <div className="panel-header">
        <div className="header-left">
          <span className="panel-icon">📊</span>
          <h3 className="panel-title">Offer对比分析</h3>
        </div>
        <div className="header-actions">
        </div>
      </div>
      
      <div className="panel-content">
        {/* 统计概览 */}
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

        {/* 筛选器 */}
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

        {/* Offer列表 */}
        <div className="offers-list">
          <div className="list-header">
            <h4>最新Offer数据</h4>
            <span className="update-time">更新时间: {new Date().toLocaleString()}</span>
          </div>
          
          <div className="offers-grid">
            {getFilteredOffers().map(offer => (
              <div key={offer.id} className="offer-card">
                <div className="offer-header">
                  <div className="company-info">
                    <h5 className="company-name">{offer.company}</h5>
                    <span className="position">{offer.position}</span>
                  </div>
                  <div className={`salary-badge ${getSalaryLevel(offer.baseSalary)}`}>
                    {formatSalary(offer.baseSalary)}
                  </div>
                </div>
                
                <div className="offer-details">
                  <div className="detail-row">
                    <span className="detail-label">奖金:</span>
                    <span className="detail-value">{offer.bonus}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">股权:</span>
                    <span className="detail-value">{offer.equity}</span>
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
            ))}
          </div>
        </div>

        {/* 热门公司排行 */}
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

        {/* 薪资分析 */}
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
  );
};

export default OfferComparisonPanel;
