import React, { useState, useEffect, useRef } from 'react';
import { CareerDevelopmentTimeline, SkillDevelopmentTimeline } from './Timeline';
import { TechnicalSkillTree, ManagementSkillTree } from './SkillTree';
import ContractSummaryPanel from './ContractSummaryPanel';
import CompanyExperiencePanel from './CompanyExperiencePanel';
import OfferComparisonPanel from './OfferComparisonPanel';
import CareerPlanningPanel from './CareerPlanningPanel';
import './VisualizationPanel.css';

interface VisualizationPanelProps {
  activeTab: string;
  userInput?: string;
  aiResponse?: string;
  className?: string;
}

type VisualizationType = 'timeline' | 'skilltree' | 'comparison' | 'planning' | 'none';

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  activeTab,
  userInput = '',
  aiResponse = '',
  className = ''
}) => {
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('none');
  const [isExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPanelVisible] = useState(true);
  const isUserSelectedRef = useRef(false);

  // 当activeTab变化时，重置用户选择状态并强制设置默认面板
  useEffect(() => {
    console.log('activeTab变化，重置用户选择状态，当前activeTab:', activeTab);
    isUserSelectedRef.current = false;
    
    // 强制设置默认面板
    if (activeTab === 'career') {
      console.log('强制设置career标签页为planning');
      setVisualizationType('planning');
    } else if (activeTab === 'offer') {
      console.log('强制设置offer标签页为comparison');
      setVisualizationType('comparison');
    }
  }, [activeTab]);

  // 根据用户输入和AI回复智能选择可视化类型
  useEffect(() => {
    console.log('VisualizationPanel useEffect triggered:', { activeTab, userInput, aiResponse: aiResponse.substring(0, 50), isUserSelected: isUserSelectedRef.current });
    
    // 强制检查：如果是career标签页，必须显示planning
    if (activeTab === 'career') {
      console.log('强制检查：career标签页必须显示planning');
      setVisualizationType('planning');
      return;
    }
    
    // 强制检查：如果是offer标签页，必须显示comparison
    if (activeTab === 'offer') {
      console.log('强制检查：offer标签页必须显示comparison');
      setVisualizationType('comparison');
      return;
    }
    
    // 如果用户已经手动选择了可视化类型，不要自动覆盖
    if (isUserSelectedRef.current) {
      console.log('用户已手动选择，跳过自动检测');
      return;
    }
    
    // 如果是劳动合同检查模式，直接返回none，使用ContractSummaryPanel
    if (activeTab === 'contract') {
      console.log('劳动合同检查模式，使用ContractSummaryPanel');
      setVisualizationType('none');
      return;
    }
    
    // 如果是在职企业监控模式，直接返回none，使用CompanyExperiencePanel
    if (activeTab === 'monitor') {
      console.log('在职企业监控模式，使用CompanyExperiencePanel');
      setVisualizationType('none');
      return;
    }
    
    // 如果没有用户输入和AI回复，根据activeTab显示默认面板
    if (!userInput.trim() && !aiResponse.trim()) {
      console.log('没有对话内容，根据activeTab显示默认面板，activeTab:', activeTab);
      if (activeTab === 'career') {
        console.log('设置职业指导默认面板: planning');
        setVisualizationType('planning');
        return;
      } else if (activeTab === 'offer') {
        console.log('设置Offer分析默认面板: comparison');
        setVisualizationType('comparison');
        return;
      }
    }
    
    const detectVisualizationType = () => {
      const text = (userInput + ' ' + aiResponse).toLowerCase();
      console.log('检测文本:', text.substring(0, 100));
      console.log('当前activeTab:', activeTab);
      
      // 如果当前在career标签页，优先返回planning
      if (activeTab === 'career') {
        console.log('当前在career标签页，检测职业规划相关内容');
        // 检测offer分析相关关键词，只有明确的offer关键词才返回comparison
        if (text.includes('offer') || text.includes('薪资') || text.includes('谈判') || 
            text.includes('15k') || text.includes('18k') || text.includes('期望') ||
            text.includes('福利') || text.includes('待遇')) {
          console.log('检测到明确的offer分析关键词');
          return 'comparison'; // offer分析使用对比分析
        }
        // 其他情况都返回planning
        console.log('career标签页默认返回planning');
        return 'planning';
      }
      
      // 如果当前在offer标签页，优先返回comparison
      if (activeTab === 'offer') {
        console.log('当前在offer标签页，默认返回comparison');
        return 'comparison';
      }
      
      // 其他标签页的检测逻辑
      // 检测offer分析相关关键词
      if (text.includes('offer') || text.includes('薪资') || text.includes('谈判') || 
          text.includes('15k') || text.includes('18k') || text.includes('期望') ||
          text.includes('福利') || text.includes('待遇') || text.includes('对比')) {
        console.log('检测到offer分析关键词');
        return 'comparison'; // offer分析使用对比分析
      }
      
      // 检测职业规划关键词（包含原流程图关键词）
      if (text.includes('分析') || text.includes('规划') || text.includes('框架') || 
          text.includes('结构') || text.includes('分类') || text.includes('体系') ||
          text.includes('评估') || text.includes('价值') || text.includes('决策') ||
          text.includes('流程') || text.includes('步骤') || text.includes('过程') ||
          text.includes('转型') || text.includes('转换') || text.includes('路径')) {
        console.log('检测到职业规划关键词');
        return 'planning';
      }
      
      // 检测时间轴关键词
      if (text.includes('时间') || text.includes('计划') || text.includes('阶段') || 
          text.includes('进度') || text.includes('里程碑') || text.includes('发展')) {
        console.log('检测到时间轴关键词');
        return 'timeline';
      }
      
      // 检测技能树关键词
      if (text.includes('技能') || text.includes('能力') || text.includes('学习') || 
          text.includes('提升') || text.includes('掌握') || text.includes('精通')) {
        console.log('检测到技能树关键词');
        return 'skilltree';
      }
      
      console.log('未检测到关键词，根据activeTab返回默认类型');
      // 如果没有检测到关键词，根据activeTab返回默认类型
      if (activeTab === 'career') {
        return 'planning';
      } else if (activeTab === 'offer') {
        return 'comparison';
      }
      return 'planning'; // 默认返回职业规划指导
    };

    const detectedType = detectVisualizationType();
    console.log('最终检测到的可视化类型:', detectedType);
    setVisualizationType(detectedType);
  }, [userInput, aiResponse, activeTab]);

  const getVisualizationComponent = () => {
    switch (visualizationType) {
      case 'timeline':
        if (activeTab === 'career') {
          return <CareerDevelopmentTimeline />;
        } else if (activeTab === 'offer') {
          return <SkillDevelopmentTimeline />;
        }
        return <CareerDevelopmentTimeline />;
        
      case 'skilltree':
        if (activeTab === 'career') {
          return <TechnicalSkillTree />;
        } else if (activeTab === 'offer') {
          return <ManagementSkillTree />;
        }
        return <TechnicalSkillTree />;
        
      case 'comparison':
        return <OfferComparisonPanel userInput={userInput} aiResponse={aiResponse} />;
        
      case 'planning':
        console.log('渲染职业指导面板');
        return <CareerPlanningPanel userInput={userInput} aiResponse={aiResponse} />;
        
      default:
        return null;
    }
  };

  const getVisualizationTitle = () => {
    console.log('getVisualizationTitle 被调用，visualizationType:', visualizationType, 'activeTab:', activeTab);
    switch (visualizationType) {
      case 'timeline':
        return activeTab === 'career' ? '职业发展时间轴' : '技能提升时间轴';
      case 'skilltree':
        return activeTab === 'career' ? '技术技能树' : '管理技能树';
      case 'comparison':
        return 'Offer对比分析';
      case 'planning':
        console.log('返回职业指导标题');
        return '职业指导';
      default:
        return '职业指导'; // 默认返回职业指导
    }
  };

  const getVisualizationIcon = () => {
    switch (visualizationType) {
      case 'timeline': return '⏰';
      case 'skilltree': return '🌳';
      case 'comparison': return '📊';
      case 'planning': return '🎯';
      default: return '🎯'; // 默认返回职业规划图标
    }
  };

  // 如果是劳动合同检查模式，直接显示ContractSummaryPanel
  if (activeTab === 'contract') {
    return <ContractSummaryPanel userInput={userInput} aiResponse={aiResponse} className={className} />;
  }

  // 如果是在职企业监控模式，直接显示CompanyExperiencePanel
  if (activeTab === 'monitor') {
    return <CompanyExperiencePanel userInput={userInput} aiResponse={aiResponse} className={className} />;
  }

  // 如果没有检测到具体类型，根据当前Tab显示默认可视化
  if (visualizationType === 'none') {
    console.log('显示默认可视化，activeTab:', activeTab);
    
    // 如果面板被关闭，不显示任何内容
    if (!isPanelVisible) {
      return null;
    }
    
    const getDefaultVisualization = () => {
      switch (activeTab) {
        case 'career':
          return { type: 'planning', title: '职业指导', icon: '🎯' };
        case 'offer':
          return { type: 'comparison', title: 'Offer对比分析', icon: '📊' };
        default:
          return { type: 'planning', title: '职业指导', icon: '🎯' };
      }
    };

    const defaultViz = getDefaultVisualization();
    console.log('默认可视化配置:', defaultViz);
    console.log('准备渲染组件，type:', defaultViz.type);
    
    return (
      <>
        <div className={`visualization-panel ${isExpanded ? 'expanded' : ''} ${className}`}>
          <div className="panel-header">
            <div className="header-left">
              <span className="panel-icon">{defaultViz.icon}</span>
              <h3 className="panel-title">{defaultViz.title}</h3>
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
            {defaultViz.type === 'planning' && (
              <>
                {console.log('渲染职业规划面板')}
                <CareerPlanningPanel userInput={userInput} aiResponse={aiResponse} />
              </>
            )}
            {defaultViz.type === 'comparison' && (
              <>
                {console.log('渲染Offer对比面板')}
                <OfferComparisonPanel userInput={userInput} aiResponse={aiResponse} />
              </>
            )}
          </div>
          
          <div className="panel-footer">
            <div className="visualization-controls">
              <span className="control-label">切换视图:</span>
              <div className="control-buttons">
                <button 
                  className={`control-btn ${defaultViz.type === 'planning' ? 'active' : ''}`}
                  onClick={() => setVisualizationType('planning')}
                >
                  🎯 规划指导
                </button>
                <button 
                  className={`control-btn ${defaultViz.type === 'comparison' ? 'active' : ''}`}
                  onClick={() => setVisualizationType('comparison')}
                >
                  📊 Offer对比分析
                </button>
                <button 
                  className={`control-btn ${defaultViz.type === 'timeline' ? 'active' : ''}`}
                  onClick={() => setVisualizationType('timeline')}
                >
                  ⏰ 时间轴
                </button>
                <button 
                  className={`control-btn ${defaultViz.type === 'skilltree' ? 'active' : ''}`}
                  onClick={() => setVisualizationType('skilltree')}
                >
                  🌳 技能树
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 全屏模态框 - 默认视图 */}
        {isFullscreen && (
          <div className="visualization-fullscreen-modal" onClick={() => setIsFullscreen(false)}>
            <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
              <div className="fullscreen-header">
                <div className="header-left">
                  <span className="panel-icon">{defaultViz.icon}</span>
                  <h2 className="panel-title">{defaultViz.title}</h2>
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
                {defaultViz.type === 'planning' && (
                  <CareerPlanningPanel userInput={userInput} aiResponse={aiResponse} />
                )}
                {defaultViz.type === 'comparison' && (
                  <OfferComparisonPanel userInput={userInput} aiResponse={aiResponse} />
                )}
              </div>
              
              <div className="fullscreen-footer">
                <div className="visualization-controls">
                  <span className="control-label">切换视图:</span>
                  <div className="control-buttons">
                    <button 
                      className={`control-btn ${defaultViz.type === 'planning' ? 'active' : ''}`}
                      onClick={() => setVisualizationType('planning')}
                    >
                      🎯 规划指导
                    </button>
                    <button 
                      className={`control-btn ${defaultViz.type === 'comparison' ? 'active' : ''}`}
                      onClick={() => setVisualizationType('comparison')}
                    >
                      📊 Offer对比分析
                    </button>
                    <button 
                      className={`control-btn ${defaultViz.type === 'timeline' ? 'active' : ''}`}
                      onClick={() => setVisualizationType('timeline')}
                    >
                      ⏰ 时间轴
                    </button>
                    <button 
                      className={`control-btn ${defaultViz.type === 'skilltree' ? 'active' : ''}`}
                      onClick={() => setVisualizationType('skilltree')}
                    >
                      🌳 技能树
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  console.log('渲染可视化面板，visualizationType:', visualizationType, 'activeTab:', activeTab);
  
  return (
    <>
      <div className={`visualization-panel ${isExpanded ? 'expanded' : ''} ${className}`}>
        <div className="panel-header">
          <div className="header-left">
            <span className="panel-icon">{getVisualizationIcon()}</span>
            <h3 className="panel-title">{getVisualizationTitle()}</h3>
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
          {(() => {
            console.log('渲染组件内容，visualizationType:', visualizationType);
            return getVisualizationComponent();
          })()}
        </div>
        
        <div className="panel-footer">
          <div className="visualization-controls">
            <span className="control-label">切换视图:</span>
            <div className="control-buttons">
              <button 
                className={`control-btn ${visualizationType === 'planning' ? 'active' : ''}`}
                onClick={() => {
                  console.log('用户点击规划指导按钮');
                  console.log('设置前 - isUserSelected:', isUserSelectedRef.current, 'visualizationType:', visualizationType);
                  isUserSelectedRef.current = true;
                  setVisualizationType('planning');
                  console.log('设置后 - 应该显示职业规划指导');
                }}
              >
                🎯 规划指导
              </button>
              <button 
                className={`control-btn ${visualizationType === 'comparison' ? 'active' : ''}`}
                onClick={() => {
                  console.log('用户点击Offer对比分析按钮');
                  isUserSelectedRef.current = true;
                  setVisualizationType('comparison');
                }}
              >
                📊 Offer对比分析
              </button>
              <button 
                className={`control-btn ${visualizationType === 'timeline' ? 'active' : ''}`}
                onClick={() => {
                  console.log('用户点击时间轴按钮');
                  isUserSelectedRef.current = true;
                  setVisualizationType('timeline');
                }}
              >
                ⏰ 时间轴
              </button>
              <button 
                className={`control-btn ${visualizationType === 'skilltree' ? 'active' : ''}`}
                onClick={() => {
                  console.log('用户点击技能树按钮');
                  isUserSelectedRef.current = true;
                  setVisualizationType('skilltree');
                }}
              >
                🌳 技能树
              </button>
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
                <span className="panel-icon">{getVisualizationIcon()}</span>
                <h2 className="panel-title">{getVisualizationTitle()}</h2>
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
              {getVisualizationComponent()}
            </div>
            
            <div className="fullscreen-footer">
              <div className="visualization-controls">
                <span className="control-label">切换视图:</span>
                <div className="control-buttons">
                  <button 
                    className={`control-btn ${visualizationType === 'planning' ? 'active' : ''}`}
                    onClick={() => {
                      console.log('用户在全屏模式点击规划指导按钮');
                      isUserSelectedRef.current = true;
                      setVisualizationType('planning');
                    }}
                  >
                    🎯 规划指导
                  </button>
                  <button 
                    className={`control-btn ${visualizationType === 'comparison' ? 'active' : ''}`}
                    onClick={() => {
                      console.log('用户在全屏模式点击Offer对比分析按钮');
                      isUserSelectedRef.current = true;
                      setVisualizationType('comparison');
                    }}
                  >
                    📊 Offer对比分析
                  </button>
                  <button 
                    className={`control-btn ${visualizationType === 'timeline' ? 'active' : ''}`}
                    onClick={() => {
                      console.log('用户在全屏模式点击时间轴按钮');
                      isUserSelectedRef.current = true;
                      setVisualizationType('timeline');
                    }}
                  >
                    ⏰ 时间轴
                  </button>
                  <button 
                    className={`control-btn ${visualizationType === 'skilltree' ? 'active' : ''}`}
                    onClick={() => {
                      console.log('用户在全屏模式点击技能树按钮');
                      isUserSelectedRef.current = true;
                      setVisualizationType('skilltree');
                    }}
                  >
                    🌳 技能树
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VisualizationPanel;
