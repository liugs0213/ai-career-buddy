import React, { useState, useEffect } from 'react';
import './ContractRiskPanel.css';

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

interface ContractRiskPanelProps {
  userId?: string;
  companyName?: string;
  onRiskClick?: (risk: ContractRisk) => void;
}

const ContractRiskPanel: React.FC<ContractRiskPanelProps> = ({ 
  userId = 'default-user',
  companyName,
  onRiskClick 
}) => {
  const [risks, setRisks] = useState<ContractRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');

  useEffect(() => {
    fetchContractRisks();
  }, [userId, companyName]);

  const fetchContractRisks = async () => {
    try {
      setLoading(true);
      let url = `/api/users/${userId}/contract-risks`;
      if (companyName) {
        url += `?companyName=${encodeURIComponent(companyName)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setRisks(data.risks || []);
    } catch (error) {
      console.error('获取合同风险点失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'critical': return '严重';
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '未知';
    }
  };

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case '薪资': return '💰';
      case '工作时间': return '⏰';
      case '试用期': return '📅';
      case '竞业限制': return '🚫';
      case '保密协议': return '🔒';
      case '违约金': return '⚖️';
      case '福利待遇': return '🎁';
      case '解除合同': return '📋';
      default: return '⚠️';
    }
  };

  const filteredRisks = risks.filter(risk => {
    if (filter === 'unresolved') return !risk.isResolved;
    if (filter === 'resolved') return risk.isResolved;
    return true;
  });

  const riskStats = {
    total: risks.length,
    unresolved: risks.filter(r => !r.isResolved).length,
    resolved: risks.filter(r => r.isResolved).length,
    critical: risks.filter(r => r.riskLevel === 'critical').length,
    high: risks.filter(r => r.riskLevel === 'high').length,
  };

  if (loading) {
    return (
      <div className="contract-risk-panel loading">
        <div className="loading-spinner"></div>
        <p>加载合同风险点中...</p>
      </div>
    );
  }

  return (
    <div className="contract-risk-panel">
      <div className="panel-header">
        <h3>📋 合同风险监控</h3>
        <div className="risk-stats">
          <div className="stat-item">
            <span className="stat-number">{riskStats.total}</span>
            <span className="stat-label">总风险</span>
          </div>
          <div className="stat-item critical">
            <span className="stat-number">{riskStats.critical}</span>
            <span className="stat-label">严重</span>
          </div>
          <div className="stat-item high">
            <span className="stat-number">{riskStats.high}</span>
            <span className="stat-label">高风险</span>
          </div>
          <div className="stat-item resolved">
            <span className="stat-number">{riskStats.resolved}</span>
            <span className="stat-label">已解决</span>
          </div>
        </div>
      </div>

      <div className="panel-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部 ({riskStats.total})
        </button>
        <button 
          className={`filter-btn ${filter === 'unresolved' ? 'active' : ''}`}
          onClick={() => setFilter('unresolved')}
        >
          未解决 ({riskStats.unresolved})
        </button>
        <button 
          className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          已解决 ({riskStats.resolved})
        </button>
      </div>

      <div className="risks-list">
        {filteredRisks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h4>暂无合同风险点</h4>
            <p>开始咨询合同问题，系统将自动识别并记录风险点</p>
          </div>
        ) : (
          filteredRisks.map(risk => (
            <div 
              key={risk.id}
              className={`risk-item ${risk.isResolved ? 'resolved' : ''}`}
              onClick={() => onRiskClick?.(risk)}
            >
              <div className="risk-header">
                <div className="risk-type">
                  <span className="risk-icon">{getRiskTypeIcon(risk.riskType)}</span>
                  <span className="risk-type-text">{risk.riskType}</span>
                </div>
                <div 
                  className="risk-level"
                  style={{ backgroundColor: getRiskLevelColor(risk.riskLevel) }}
                >
                  {getRiskLevelText(risk.riskLevel)}
                </div>
              </div>

              <div className="risk-content">
                <h4 className="risk-point">{risk.riskPoint}</h4>
                <p className="risk-detail">{risk.riskDetail}</p>
                
                {risk.suggestions && (
                  <div className="risk-suggestions">
                    <span className="suggestions-label">💡 建议措施:</span>
                    <p className="suggestions-text">{risk.suggestions}</p>
                  </div>
                )}
              </div>

              <div className="risk-footer">
                <div className="risk-meta">
                  <span className="company-name">🏢 {risk.companyName}</span>
                  <span className="risk-date">
                    {new Date(risk.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {risk.isResolved ? (
                  <div className="resolved-badge">
                    <span className="resolved-icon">✅</span>
                    <span>已解决</span>
                  </div>
                ) : (
                  <div className="unresolved-badge">
                    <span className="unresolved-icon">⚠️</span>
                    <span>待处理</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="panel-footer">
        <div className="risk-legend">
          <div className="legend-item">
            <div className="legend-color critical"></div>
            <span>严重风险</span>
          </div>
          <div className="legend-item">
            <div className="legend-color high"></div>
            <span>高风险</span>
          </div>
          <div className="legend-item">
            <div className="legend-color medium"></div>
            <span>中风险</span>
          </div>
          <div className="legend-item">
            <div className="legend-color low"></div>
            <span>低风险</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractRiskPanel;
