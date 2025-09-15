import React, { useState, useEffect } from 'react';
import './CareerStageChart.css';

interface CareerStage {
  stage: string;
  description: string;
  skills: string;
  goals: string;
  duration: string;
  progress: number;
}

interface CareerStageChartProps {
  currentStage?: string;
  onStageClick?: (stage: CareerStage) => void;
}

const CareerStageChart: React.FC<CareerStageChartProps> = ({ 
  currentStage = "职场新人", 
  onStageClick 
}) => {
  const [stages, setStages] = useState<CareerStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCareerStages();
  }, []);

  const fetchCareerStages = async () => {
    try {
      const response = await fetch('/api/career-stages');
      const data = await response.json();
      setStages(data.stages);
    } catch (error) {
      console.error('获取职业阶段失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageIndex = (stageName: string) => {
    return stages.findIndex(stage => stage.stage === stageName);
  };

  const getStageColor = (index: number, currentIndex: number) => {
    if (index < currentIndex) return '#10b981'; // 已完成 - 绿色
    if (index === currentIndex) return '#3b82f6'; // 当前阶段 - 蓝色
    return '#e5e7eb'; // 未开始 - 灰色
  };

  const getProgressWidth = (index: number, currentIndex: number) => {
    if (index < currentIndex) return '100%';
    if (index === currentIndex) return '60%'; // 假设当前阶段完成60%
    return '0%';
  };

  if (loading) {
    return (
      <div className="career-stage-chart loading">
        <div className="loading-spinner"></div>
        <p>加载职业阶段信息中...</p>
      </div>
    );
  }

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="career-stage-chart">
      <div className="chart-header">
        <h3>🎯 职业发展路径</h3>
        <p>您当前处于: <span className="current-stage">{currentStage}</span></p>
      </div>

      <div className="stages-container">
        {stages.map((stage, index) => (
          <div 
            key={stage.stage}
            className={`stage-item ${index === currentIndex ? 'current' : ''} ${index < currentIndex ? 'completed' : ''}`}
            onClick={() => onStageClick?.(stage)}
          >
            <div className="stage-icon">
              <div 
                className="stage-circle"
                style={{ 
                  backgroundColor: getStageColor(index, currentIndex),
                  borderColor: getStageColor(index, currentIndex)
                }}
              >
                {index < currentIndex ? '✓' : index + 1}
              </div>
              {index < stages.length - 1 && (
                <div 
                  className="stage-connector"
                  style={{ 
                    backgroundColor: index < currentIndex ? '#10b981' : '#e5e7eb'
                  }}
                />
              )}
            </div>

            <div className="stage-content">
              <h4 className="stage-title">{stage.stage}</h4>
              <p className="stage-description">{stage.description}</p>
              
              <div className="stage-details">
                <div className="detail-item">
                  <span className="detail-label">⏱️ 预计时长:</span>
                  <span className="detail-value">{stage.duration}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">🎯 主要目标:</span>
                  <span className="detail-value">{stage.goals}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">💡 核心技能:</span>
                  <span className="detail-value">{stage.skills}</span>
                </div>
              </div>

              <div className="stage-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: getProgressWidth(index, currentIndex),
                      backgroundColor: getStageColor(index, currentIndex)
                    }}
                  />
                </div>
                <span className="progress-text">
                  {index < currentIndex ? '已完成' : 
                   index === currentIndex ? '进行中' : '未开始'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-footer">
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color completed"></div>
            <span>已完成阶段</span>
          </div>
          <div className="legend-item">
            <div className="legend-color current"></div>
            <span>当前阶段</span>
          </div>
          <div className="legend-item">
            <div className="legend-color future"></div>
            <span>未来阶段</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerStageChart;
