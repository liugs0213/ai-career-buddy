import React, { useState, useEffect } from 'react';
import './PersonalMetricsPanel.css';

interface PersonalMetrics {
  id: number;
  userId: string;
  careerScore: number;
  skillLevel: number;
  marketValue: number;
  riskTolerance: number;
  learningAbility: number;
  networkStrength: number;
  workLifeBalance: number;
  careerGoals: string;
  skillGaps: string;
  improvementPlan: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

interface PersonalMetricsPanelProps {
  userId?: string;
  onMetricsUpdate?: (metrics: PersonalMetrics) => void;
}

const PersonalMetricsPanel: React.FC<PersonalMetricsPanelProps> = ({ 
  userId = 'default-user',
  onMetricsUpdate 
}) => {
  const [metrics, setMetrics] = useState<PersonalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PersonalMetrics>>({});

  useEffect(() => {
    fetchPersonalMetrics();
  }, [userId]);

  const fetchPersonalMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/personal-metrics`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setFormData(data);
      } else {
        // 如果没有数据，创建默认值
        const defaultMetrics: PersonalMetrics = {
          id: 0,
          userId,
          careerScore: 60,
          skillLevel: 65,
          marketValue: 70,
          riskTolerance: 50,
          learningAbility: 75,
          networkStrength: 55,
          workLifeBalance: 60,
          careerGoals: '[]',
          skillGaps: '[]',
          improvementPlan: '[]',
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setMetrics(defaultMetrics);
        setFormData(defaultMetrics);
      }
    } catch (error) {
      console.error('获取个性化指标失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/personal-metrics`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId,
          lastUpdated: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const updatedMetrics = await response.json();
        setMetrics(updatedMetrics);
        setEditing(false);
        onMetricsUpdate?.(updatedMetrics);
      }
    } catch (error) {
      console.error('更新个性化指标失败:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#d97706';
    if (score >= 40) return '#ea580c';
    return '#dc2626';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '一般';
    return '需改进';
  };

  const metricsConfig = [
    {
      key: 'careerScore',
      label: '职业发展评分',
      icon: '🎯',
      description: '综合评估您的职业发展状况',
    },
    {
      key: 'skillLevel',
      label: '技能水平',
      icon: '💡',
      description: '当前专业技能和软技能水平',
    },
    {
      key: 'marketValue',
      label: '市场价值',
      icon: '💰',
      description: '在就业市场中的竞争力',
    },
    {
      key: 'riskTolerance',
      label: '风险承受能力',
      icon: '⚖️',
      description: '对职业变化和风险的承受度',
    },
    {
      key: 'learningAbility',
      label: '学习能力',
      icon: '📚',
      description: '快速学习和适应新技能的能力',
    },
    {
      key: 'networkStrength',
      label: '人脉网络',
      icon: '🤝',
      description: '专业人脉网络的广度和深度',
    },
    {
      key: 'workLifeBalance',
      label: '工作生活平衡',
      icon: '⚖️',
      description: '工作与个人生活的平衡程度',
    },
  ];

  if (loading) {
    return (
      <div className="personal-metrics-panel loading">
        <div className="loading-spinner"></div>
        <p>加载个性化指标中...</p>
      </div>
    );
  }

  return (
    <div className="personal-metrics-panel">
      <div className="panel-header">
        <h3>📊 个人能力雷达图</h3>
        <div className="header-actions">
          <button 
            className={`action-btn ${editing ? 'cancel' : 'edit'}`}
            onClick={() => editing ? setEditing(false) : setEditing(true)}
          >
            {editing ? '取消' : '编辑'}
          </button>
          {editing && (
            <button className="action-btn save" onClick={handleSave}>
              保存
            </button>
          )}
        </div>
      </div>

      <div className="metrics-overview">
        <div className="overall-score">
          <div className="score-circle">
            <div 
              className="score-fill"
              style={{ 
                background: `conic-gradient(${getScoreColor(metrics?.careerScore || 0)} 0deg ${(metrics?.careerScore || 0) * 3.6}deg, #e2e8f0 0deg)`
              }}
            >
              <div className="score-inner">
                <span className="score-number">{metrics?.careerScore || 0}</span>
                <span className="score-label">综合评分</span>
              </div>
            </div>
          </div>
          <div className="score-info">
            <h4>整体评估</h4>
            <p className={`score-text ${getScoreText(metrics?.careerScore || 0).toLowerCase()}`}>
              {getScoreText(metrics?.careerScore || 0)}
            </p>
            <p className="score-description">
              基于您的各项能力指标综合评估
            </p>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        {metricsConfig.map(config => {
          const value = editing ? formData[config.key as keyof PersonalMetrics] : metrics?.[config.key as keyof PersonalMetrics];
          const score = typeof value === 'number' ? value : 0;
          
          return (
            <div key={config.key} className="metric-item">
              <div className="metric-header">
                <span className="metric-icon">{config.icon}</span>
                <h4 className="metric-label">{config.label}</h4>
              </div>
              
              <div className="metric-content">
                <p className="metric-description">{config.description}</p>
                
                {editing ? (
                  <div className="metric-input">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) => setFormData({
                        ...formData,
                        [config.key]: parseInt(e.target.value)
                      })}
                      className="score-slider"
                    />
                    <div className="score-display">
                      <span className="score-value">{score}</span>
                      <span className="score-unit">分</span>
                    </div>
                  </div>
                ) : (
                  <div className="metric-score">
                    <div className="score-bar">
                      <div 
                        className="score-fill-bar"
                        style={{ 
                          width: `${score}%`,
                          backgroundColor: getScoreColor(score)
                        }}
                      />
                    </div>
                    <div className="score-text">
                      <span className="score-number">{score}</span>
                      <span className="score-unit">分</span>
                      <span className={`score-level ${getScoreText(score).toLowerCase()}`}>
                        {getScoreText(score)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="metrics-summary">
        <div className="summary-item">
          <span className="summary-label">📈 优势领域:</span>
          <span className="summary-value">
            {metricsConfig
              .filter(config => {
                const value = metrics?.[config.key as keyof PersonalMetrics];
                return typeof value === 'number' && value >= 70;
              })
              .map(config => config.label)
              .join('、') || '暂无'}
          </span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">📉 改进领域:</span>
          <span className="summary-value">
            {metricsConfig
              .filter(config => {
                const value = metrics?.[config.key as keyof PersonalMetrics];
                return typeof value === 'number' && value < 60;
              })
              .map(config => config.label)
              .join('、') || '暂无'}
          </span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">🔄 最后更新:</span>
          <span className="summary-value">
            {metrics?.lastUpdated ? new Date(metrics.lastUpdated).toLocaleDateString() : '从未更新'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PersonalMetricsPanel;
