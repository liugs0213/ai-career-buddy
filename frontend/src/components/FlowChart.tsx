import React, { useState, useEffect } from 'react';
import './FlowChart.css';

interface FlowNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
  position: { x: number; y: number };
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

interface FlowConnection {
  from: string;
  to: string;
  label?: string;
  type?: 'solid' | 'dashed';
}

interface FlowChartProps {
  title?: string;
  nodes: FlowNode[];
  connections: FlowConnection[];
  onNodeClick?: (node: FlowNode) => void;
  className?: string;
}

const FlowChart: React.FC<FlowChartProps> = ({
  title = "流程图",
  nodes,
  connections,
  onNodeClick,
  className = ""
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getNodeStyle = (node: FlowNode) => {
    const baseStyle = {
      left: `${node.position.x}px`,
      top: `${node.position.y}px`,
    };

    const sizeStyles = {
      small: { width: '100px', height: '50px', fontSize: '13px' },
      medium: { width: '150px', height: '75px', fontSize: '15px' },
      large: { width: '200px', height: '100px', fontSize: '17px' }
    };

    const typeStyles = {
      start: {
        borderRadius: '50%',
        backgroundColor: '#10b981',
        color: 'white',
        border: '2px solid #059669'
      },
      process: {
        borderRadius: '8px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: '2px solid #2563eb'
      },
      decision: {
        borderRadius: '8px',
        backgroundColor: '#f59e0b',
        color: 'white',
        border: '2px solid #d97706',
        transform: 'rotate(45deg)',
        transformOrigin: 'center'
      },
      end: {
        borderRadius: '50%',
        backgroundColor: '#ef4444',
        color: 'white',
        border: '2px solid #dc2626'
      }
    };

    const stateStyles = {
      selected: {
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
        transform: 'scale(1.05)'
      },
      hovered: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transform: 'scale(1.02)'
      }
    };

    return {
      ...baseStyle,
      ...sizeStyles[node.size || 'medium'],
      ...typeStyles[node.type],
      ...(selectedNode === node.id ? stateStyles.selected : {}),
      ...(hoveredNode === node.id ? stateStyles.hovered : {}),
      backgroundColor: node.color || typeStyles[node.type].backgroundColor,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      textAlign: 'center',
      wordBreak: 'break-word' as const,
      padding: '8px',
      boxSizing: 'border-box' as const
    };
  };

  const getConnectionStyle = (connection: FlowConnection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return {};

    const fromX = fromNode.position.x + (fromNode.size === 'small' ? 40 : fromNode.size === 'large' ? 80 : 60);
    const fromY = fromNode.position.y + (fromNode.size === 'small' ? 20 : fromNode.size === 'large' ? 40 : 30);
    const toX = toNode.position.x + (toNode.size === 'small' ? 40 : toNode.size === 'large' ? 80 : 60);
    const toY = toNode.position.y + (toNode.size === 'small' ? 20 : toNode.size === 'large' ? 40 : 30);

    const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;

    return {
      position: 'absolute' as const,
      left: `${fromX}px`,
      top: `${fromY}px`,
      width: `${length}px`,
      height: '2px',
      backgroundColor: connection.type === 'dashed' ? 'transparent' : '#64748b',
      borderTop: connection.type === 'dashed' ? '2px dashed #64748b' : 'none',
      transform: `rotate(${angle}deg)`,
      transformOrigin: '0 0',
      zIndex: 1
    };
  };

  const handleNodeClick = (node: FlowNode) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
    onNodeClick?.(node);
  };

  return (
    <div className={`flow-chart ${className}`}>
      {title && <h3 className="flow-chart-title">{title}</h3>}
      
      <div className="flow-chart-container">
        {connections.map((connection, index) => (
          <div
            key={`connection-${index}`}
            className="flow-connection"
            style={getConnectionStyle(connection)}
          >
            {connection.label && (
              <div className="connection-label">
                {connection.label}
              </div>
            )}
          </div>
        ))}
        
        {nodes.map((node) => (
          <div
            key={node.id}
            className="flow-node"
            style={getNodeStyle(node)}
            onClick={() => handleNodeClick(node)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {node.type === 'decision' ? (
              <div className="decision-content">
                <div className="decision-text">{node.label}</div>
              </div>
            ) : (
              node.label
            )}
          </div>
        ))}
      </div>
      
      {selectedNode && (
        <div className="node-details">
          <h4>节点详情</h4>
          <p>ID: {selectedNode}</p>
          <p>类型: {nodes.find(n => n.id === selectedNode)?.type}</p>
          <p>标签: {nodes.find(n => n.id === selectedNode)?.label}</p>
        </div>
      )}
    </div>
  );
};

// 预设的职业转型流程图
export const CareerTransitionFlow: React.FC = () => {
  const nodes: FlowNode[] = [
    {
      id: 'start',
      label: '技术岗位',
      type: 'start',
      position: { x: 50, y: 80 },
      size: 'medium'
    },
    {
      id: 'skill-assessment',
      label: '技能评估',
      type: 'process',
      position: { x: 250, y: 80 },
      size: 'medium'
    },
    {
      id: 'decision',
      label: '是否具备管理能力？',
      type: 'decision',
      position: { x: 450, y: 80 },
      size: 'large'
    },
    {
      id: 'skill-development',
      label: '技能提升',
      type: 'process',
      position: { x: 250, y: 220 },
      size: 'medium'
    },
    {
      id: 'practice',
      label: '实践锻炼',
      type: 'process',
      position: { x: 700, y: 80 },
      size: 'medium'
    },
    {
      id: 'end',
      label: '管理岗位',
      type: 'end',
      position: { x: 900, y: 80 },
      size: 'medium'
    }
  ];

  const connections: FlowConnection[] = [
    { from: 'start', to: 'skill-assessment', label: '开始转型' },
    { from: 'skill-assessment', to: 'decision', label: '评估结果' },
    { from: 'decision', to: 'skill-development', label: '需要提升', type: 'dashed' },
    { from: 'decision', to: 'practice', label: '已具备' },
    { from: 'skill-development', to: 'skill-assessment', label: '重新评估', type: 'dashed' },
    { from: 'practice', to: 'end', label: '成功转型' }
  ];

  return (
    <FlowChart
      title="技术转管理流程图"
      nodes={nodes}
      connections={connections}
      onNodeClick={(node) => console.log('点击节点:', node)}
    />
  );
};

// 预设的技能提升流程图
export const SkillDevelopmentFlow: React.FC = () => {
  const nodes: FlowNode[] = [
    {
      id: 'start',
      label: '技能现状',
      type: 'start',
      position: { x: 50, y: 80 },
      size: 'medium'
    },
    {
      id: 'gap-analysis',
      label: '缺口分析',
      type: 'process',
      position: { x: 250, y: 80 },
      size: 'medium'
    },
    {
      id: 'plan',
      label: '制定计划',
      type: 'process',
      position: { x: 450, y: 80 },
      size: 'medium'
    },
    {
      id: 'learning',
      label: '学习实践',
      type: 'process',
      position: { x: 650, y: 80 },
      size: 'medium'
    },
    {
      id: 'assessment',
      label: '效果评估',
      type: 'decision',
      position: { x: 450, y: 220 },
      size: 'large'
    },
    {
      id: 'end',
      label: '技能提升',
      type: 'end',
      position: { x: 850, y: 80 },
      size: 'medium'
    }
  ];

  const connections: FlowConnection[] = [
    { from: 'start', to: 'gap-analysis', label: '分析现状' },
    { from: 'gap-analysis', to: 'plan', label: '识别缺口' },
    { from: 'plan', to: 'learning', label: '执行计划' },
    { from: 'learning', to: 'assessment', label: '阶段评估' },
    { from: 'assessment', to: 'plan', label: '调整计划', type: 'dashed' },
    { from: 'assessment', to: 'end', label: '达到目标' }
  ];

  return (
    <FlowChart
      title="技能提升流程图"
      nodes={nodes}
      connections={connections}
      onNodeClick={(node) => console.log('点击节点:', node)}
    />
  );
};

export default FlowChart;
