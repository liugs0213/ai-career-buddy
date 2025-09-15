import React, { useState, useEffect } from 'react';
import './CompanyMonitorPanel.css';

interface CompanyMonitor {
  id: number;
  userId: string;
  companyName: string;
  companyCode: string;
  industry: string;
  monitorType: 'financial' | 'management' | 'market';
  alertEmail: string;
  alertEnabled: boolean;
  alertRules: string;
  lastAlertAt?: string;
  alertCount: number;
  status: 'active' | 'paused' | 'stopped';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// interface _AlertRule {
//   id: string;
//   name: string;
//   type: 'financial' | 'management' | 'market';
//   condition: string;
//   threshold: string;
//   severity: 'low' | 'medium' | 'high' | 'critical';
//   description: string;
//   enabled: boolean;
// }

interface CompanyMonitorPanelProps {
  userId?: string;
  onMonitorClick?: (monitor: CompanyMonitor) => void;
  onAddMonitor?: () => void;
}

const CompanyMonitorPanel: React.FC<CompanyMonitorPanelProps> = ({ 
  userId = 'default-user',
  onMonitorClick,
  onAddMonitor 
}) => {
  const [monitors, setMonitors] = useState<CompanyMonitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'stopped'>('all');

  useEffect(() => {
    fetchCompanyMonitors();
  }, [userId]);

  const fetchCompanyMonitors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/company-monitors`);
      const data = await response.json();
      setMonitors(data.monitors || []);
    } catch (error) {
      console.error('获取企业监控列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonitorTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return '💰';
      case 'management': return '👥';
      case 'market': return '📈';
      default: return '🏢';
    }
  };

  const getMonitorTypeText = (type: string) => {
    switch (type) {
      case 'financial': return '财务监控';
      case 'management': return '管理层监控';
      case 'market': return '市场监控';
      default: return '综合监控';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#16a34a';
      case 'paused': return '#d97706';
      case 'stopped': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '运行中';
      case 'paused': return '已暂停';
      case 'stopped': return '已停止';
      default: return '未知';
    }
  };

  const filteredMonitors = monitors.filter(monitor => {
    if (filter === 'all') return true;
    return monitor.status === filter;
  });

  const monitorStats = {
    total: monitors.length,
    active: monitors.filter(m => m.status === 'active').length,
    paused: monitors.filter(m => m.status === 'paused').length,
    stopped: monitors.filter(m => m.status === 'stopped').length,
    alerts: monitors.reduce((sum, m) => sum + m.alertCount, 0),
  };

  if (loading) {
    return (
      <div className="company-monitor-panel loading">
        <div className="loading-spinner"></div>
        <p>加载企业监控信息中...</p>
      </div>
    );
  }

  return (
    <div className="company-monitor-panel">
      <div className="panel-header">
        <h3>🏢 企业监控中心</h3>
        <div className="monitor-stats">
          <div className="stat-item">
            <span className="stat-number">{monitorStats.total}</span>
            <span className="stat-label">监控企业</span>
          </div>
          <div className="stat-item active">
            <span className="stat-number">{monitorStats.active}</span>
            <span className="stat-label">运行中</span>
          </div>
          <div className="stat-item alerts">
            <span className="stat-number">{monitorStats.alerts}</span>
            <span className="stat-label">总告警</span>
          </div>
        </div>
      </div>

      <div className="panel-actions">
        <div className="panel-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部 ({monitorStats.total})
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            运行中 ({monitorStats.active})
          </button>
          <button 
            className={`filter-btn ${filter === 'paused' ? 'active' : ''}`}
            onClick={() => setFilter('paused')}
          >
            已暂停 ({monitorStats.paused})
          </button>
          <button 
            className={`filter-btn ${filter === 'stopped' ? 'active' : ''}`}
            onClick={() => setFilter('stopped')}
          >
            已停止 ({monitorStats.stopped})
          </button>
        </div>
        
        <button className="add-monitor-btn" onClick={onAddMonitor}>
          <span className="add-icon">➕</span>
          添加监控
        </button>
      </div>

      <div className="monitors-list">
        {filteredMonitors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <h4>暂无企业监控</h4>
            <p>添加您关注的企业，设置监控规则和告警邮箱</p>
            <button className="add-first-btn" onClick={onAddMonitor}>
              添加第一个监控
            </button>
          </div>
        ) : (
          filteredMonitors.map(monitor => (
            <div 
              key={monitor.id}
              className="monitor-item"
              onClick={() => onMonitorClick?.(monitor)}
            >
              <div className="monitor-header">
                <div className="company-info">
                  <h4 className="company-name">{monitor.companyName}</h4>
                  <div className="company-meta">
                    <span className="company-code">{monitor.companyCode}</span>
                    <span className="industry">{monitor.industry}</span>
                  </div>
                </div>
                
                <div className="monitor-status">
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(monitor.status) }}
                  >
                    {getStatusText(monitor.status)}
                  </div>
                </div>
              </div>

              <div className="monitor-content">
                <div className="monitor-types">
                  {monitor.monitorType.split(',').map(type => (
                    <div key={type} className="monitor-type-tag">
                      <span className="type-icon">{getMonitorTypeIcon(type.trim())}</span>
                      <span className="type-text">{getMonitorTypeText(type.trim())}</span>
                    </div>
                  ))}
                </div>

                <div className="monitor-details">
                  <div className="detail-row">
                    <span className="detail-label">📧 告警邮箱:</span>
                    <span className="detail-value">{monitor.alertEmail}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">🔔 告警状态:</span>
                    <span className={`detail-value ${monitor.alertEnabled ? 'enabled' : 'disabled'}`}>
                      {monitor.alertEnabled ? '已启用' : '已禁用'}
                    </span>
                  </div>
                  
                  {monitor.lastAlertAt && (
                    <div className="detail-row">
                      <span className="detail-label">⚠️ 最后告警:</span>
                      <span className="detail-value">
                        {new Date(monitor.lastAlertAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <span className="detail-label">📊 告警次数:</span>
                    <span className="detail-value">{monitor.alertCount}</span>
                  </div>
                </div>

                {monitor.notes && (
                  <div className="monitor-notes">
                    <span className="notes-label">📝 备注:</span>
                    <p className="notes-text">{monitor.notes}</p>
                  </div>
                )}
              </div>

              <div className="monitor-footer">
                <div className="monitor-actions">
                  <button className="action-btn edit">
                    <span className="action-icon">✏️</span>
                    编辑
                  </button>
                  <button className="action-btn pause">
                    <span className="action-icon">⏸️</span>
                    暂停
                  </button>
                  <button className="action-btn alerts">
                    <span className="action-icon">🔔</span>
                    告警历史
                  </button>
                </div>
                
                <div className="monitor-date">
                  创建于 {new Date(monitor.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="panel-footer">
        <div className="monitor-legend">
          <div className="legend-item">
            <div className="legend-color active"></div>
            <span>运行中</span>
          </div>
          <div className="legend-item">
            <div className="legend-color paused"></div>
            <span>已暂停</span>
          </div>
          <div className="legend-item">
            <div className="legend-color stopped"></div>
            <span>已停止</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyMonitorPanel;
