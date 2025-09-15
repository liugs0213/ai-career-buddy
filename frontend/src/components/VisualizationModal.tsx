import React from 'react';
import FlowChart, { CareerTransitionFlow, SkillDevelopmentFlow } from './FlowChart';
import MindMap, { CareerPlanningMindMap, SkillDevelopmentMindMap, OfferAnalysisMindMap } from './MindMap';
import Timeline, { CareerDevelopmentTimeline, SkillDevelopmentTimeline } from './Timeline';
import SkillTree, { TechnicalSkillTree, ManagementSkillTree } from './SkillTree';
import './VisualizationModal.css';

interface VisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  visualizationType: 'flowchart' | 'mindmap' | 'timeline' | 'skilltree';
  title: string;
}

const VisualizationModal: React.FC<VisualizationModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  visualizationType,
  title
}) => {
  if (!isOpen) return null;

  const getVisualizationComponent = () => {
    switch (visualizationType) {
      case 'flowchart':
        if (activeTab === 'career') {
          return <CareerTransitionFlow />;
        } else if (activeTab === 'offer') {
          return <SkillDevelopmentFlow />;
        } else if (activeTab === 'contract') {
          return <CareerTransitionFlow />;
        }
        return <CareerTransitionFlow />;
        
      case 'mindmap':
        if (activeTab === 'career') {
          return <CareerPlanningMindMap />;
        } else if (activeTab === 'offer') {
          return <OfferAnalysisMindMap />;
        } else if (activeTab === 'contract') {
          return <CareerPlanningMindMap />;
        }
        return <CareerPlanningMindMap />;
        
      case 'timeline':
        if (activeTab === 'career') {
          return <CareerDevelopmentTimeline />;
        } else if (activeTab === 'offer') {
          return <SkillDevelopmentTimeline />;
        } else if (activeTab === 'monitor') {
          return <CareerDevelopmentTimeline />;
        }
        return <CareerDevelopmentTimeline />;
        
      case 'skilltree':
        if (activeTab === 'career') {
          return <TechnicalSkillTree />;
        } else if (activeTab === 'offer') {
          return <ManagementSkillTree />;
        }
        return <TechnicalSkillTree />;
        
      default:
        return null;
    }
  };

  const getVisualizationIcon = () => {
    switch (visualizationType) {
      case 'flowchart': return '📊';
      case 'mindmap': return '🧠';
      case 'timeline': return '⏰';
      case 'skilltree': return '🌳';
      default: return '📋';
    }
  };

  return (
    <div className="visualization-modal-overlay" onClick={onClose}>
      <div className="visualization-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <span className="modal-icon">{getVisualizationIcon()}</span>
            <h2 className="modal-title">{title}</h2>
          </div>
          <div className="header-actions">
            <button className="modal-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>
        
        <div className="modal-content">
          {getVisualizationComponent()}
        </div>
        
        <div className="modal-footer">
          <div className="footer-info">
            <span className="info-text">💡 提示：点击节点可展开/收起，拖拽可移动视图</span>
          </div>
          <div className="footer-actions">
            <button className="action-btn secondary" onClick={onClose}>
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationModal;
