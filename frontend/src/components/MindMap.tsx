import React, { useState, useEffect } from 'react';
import './MindMap.css';

interface MindMapNode {
  id: string;
  text: string;
  level: number;
  parentId?: string;
  children?: MindMapNode[];
  color?: string;
  icon?: string;
  expanded?: boolean;
  description?: string;
  tips?: string[];
  resources?: string[];
}

interface MindMapProps {
  title?: string;
  data: MindMapNode[];
  onNodeClick?: (node: MindMapNode) => void;
  className?: string;
}

const MindMap: React.FC<MindMapProps> = ({
  title = "思维导图",
  data,
  onNodeClick,
  className = ""
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    // 默认展开第一层节点
    const firstLevelNodes = data.filter(node => node.level === 0);
    setExpandedNodes(new Set(firstLevelNodes.map(node => node.id)));
  }, [data]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeClick = (node: MindMapNode) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
    onNodeClick?.(node);
    if (node.children && node.children.length > 0) {
      toggleNode(node.id);
    }
  };

  const getNodeColor = (level: number) => {
    const colors = [
      '#3b82f6', // 蓝色 - 主节点
      '#10b981', // 绿色 - 第二层
      '#f59e0b', // 橙色 - 第三层
      '#ef4444', // 红色 - 第四层
      '#8b5cf6', // 紫色 - 第五层
      '#06b6d4', // 青色 - 第六层
    ];
    return colors[level] || '#64748b';
  };

  const getNodeSize = (level: number) => {
    const sizes = ['large', 'medium', 'small', 'small', 'small', 'small'];
    return sizes[level] || 'small';
  };

  const renderNode = (node: MindMapNode, index: number) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const nodeColor = node.color || getNodeColor(node.level);
    const nodeSize = getNodeSize(node.level);

    return (
      <div
        key={node.id}
        className={`mind-map-node level-${node.level} ${nodeSize} ${isSelected ? 'selected' : ''}`}
        style={{
          backgroundColor: nodeColor,
          marginLeft: `${node.level * 20}px`,
          marginTop: `${index * 60}px`
        }}
        onClick={() => handleNodeClick(node)}
      >
        <div className="node-content">
          {node.icon && <span className="node-icon">{node.icon}</span>}
          <span className="node-text">{node.text}</span>
          {hasChildren && (
            <span className="expand-icon">
              {isExpanded ? '−' : '+'}
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="node-children">
            {node.children!.map((child, childIndex) => 
              renderNode(child, childIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`mind-map ${className}`}>
      {title && <h3 className="mind-map-title">{title}</h3>}
      
      <div className="mind-map-container">
        {data.map((node, index) => renderNode(node, index))}
      </div>
      
      {selectedNode && (
        <div className="node-details">
          <h4>💡 {data.find(n => n.id === selectedNode)?.text}</h4>
          {data.find(n => n.id === selectedNode)?.description && (
            <div className="description">
              <p>{data.find(n => n.id === selectedNode)?.description}</p>
            </div>
          )}
          {data.find(n => n.id === selectedNode)?.tips && data.find(n => n.id === selectedNode)?.tips!.length > 0 && (
            <div className="tips">
              <h5>📝 实用建议：</h5>
              <ul>
                {data.find(n => n.id === selectedNode)?.tips!.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
          {data.find(n => n.id === selectedNode)?.resources && data.find(n => n.id === selectedNode)?.resources!.length > 0 && (
            <div className="resources">
              <h5>🔗 相关资源：</h5>
              <ul>
                {data.find(n => n.id === selectedNode)?.resources!.map((resource, index) => (
                  <li key={index}>{resource}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 预设的职业规划思维导图
export const CareerPlanningMindMap: React.FC = () => {
  const data: MindMapNode[] = [
    {
      id: 'career-planning',
      text: '职业规划',
      level: 0,
      icon: '🎯',
      color: '#3b82f6',
      children: [
        {
          id: 'self-assessment',
          text: '自我评估',
          level: 1,
          parentId: 'career-planning',
          icon: '🔍',
          children: [
            {
              id: 'skills-assessment',
              text: '技能评估',
              level: 2,
              parentId: 'self-assessment',
              icon: '💡',
              description: '全面评估自己的技能水平，识别优势和不足，为职业发展制定技能提升计划。',
              tips: [
                '列出所有相关技能并评估熟练程度',
                '寻求同事、上级或导师的反馈',
                '对比目标岗位的技能要求',
                '制定技能提升的优先级和时间表'
              ],
              resources: [
                '技能评估工具和测试',
                '行业技能标准参考',
                '在线技能评估平台',
                '专业认证考试大纲'
              ],
              children: [
                {
                  id: 'technical-skills',
                  text: '技术技能',
                  level: 3,
                  parentId: 'skills-assessment',
                  icon: '💻',
                  description: '评估专业技术能力，包括编程、工具使用、系统设计等硬技能。',
                  tips: [
                    '列出掌握的技术栈和工具',
                    '评估各技能的熟练程度',
                    '了解行业主流技术趋势',
                    '制定技术学习计划'
                  ]
                },
                {
                  id: 'soft-skills',
                  text: '软技能',
                  level: 3,
                  parentId: 'skills-assessment',
                  icon: '🤝',
                  description: '评估沟通、协作、解决问题等软技能，这些对职业发展同样重要。',
                  tips: [
                    '评估沟通表达能力',
                    '分析团队协作能力',
                    '评估问题解决能力',
                    '提升情商和人际交往能力'
                  ]
                },
                {
                  id: 'leadership-skills',
                  text: '领导力',
                  level: 3,
                  parentId: 'skills-assessment',
                  icon: '👑',
                  description: '评估领导和管理能力，为未来晋升做准备。',
                  tips: [
                    '评估团队管理能力',
                    '分析决策能力',
                    '评估激励和指导他人能力',
                    '寻找领导力发展机会'
                  ]
                },
                {
                  id: 'skill-gaps',
                  text: '技能缺口',
                  level: 3,
                  parentId: 'skills-assessment',
                  icon: '📊',
                  description: '识别当前技能与目标岗位要求的差距，制定弥补计划。',
                  tips: [
                    '对比目标岗位的技能要求',
                    '识别关键技能缺口',
                    '制定技能提升计划',
                    '寻找学习和实践机会'
                  ]
                }
              ]
            },
            {
              id: 'interests-analysis',
              text: '兴趣分析',
              level: 2,
              parentId: 'self-assessment',
              icon: '❤️',
              children: [
                {
                  id: 'work-preferences',
                  text: '工作偏好',
                  level: 3,
                  parentId: 'interests-analysis',
                  icon: '⚙️'
                },
                {
                  id: 'industry-interests',
                  text: '行业兴趣',
                  level: 3,
                  parentId: 'interests-analysis',
                  icon: '🏭'
                },
                {
                  id: 'role-preferences',
                  text: '角色偏好',
                  level: 3,
                  parentId: 'interests-analysis',
                  icon: '👤'
                }
              ]
            },
            {
              id: 'values-clarification',
              text: '价值观',
              level: 2,
              parentId: 'self-assessment',
              icon: '⭐',
              children: [
                {
                  id: 'work-values',
                  text: '工作价值观',
                  level: 3,
                  parentId: 'values-clarification',
                  icon: '💼'
                },
                {
                  id: 'life-values',
                  text: '生活价值观',
                  level: 3,
                  parentId: 'values-clarification',
                  icon: '🏠'
                },
                {
                  id: 'priority-values',
                  text: '优先级排序',
                  level: 3,
                  parentId: 'values-clarification',
                  icon: '📋'
                }
              ]
            },
            {
              id: 'personality-assessment',
              text: '性格分析',
              level: 2,
              parentId: 'self-assessment',
              icon: '🧠',
              children: [
                {
                  id: 'personality-type',
                  text: '性格类型',
                  level: 3,
                  parentId: 'personality-assessment',
                  icon: '🎭'
                },
                {
                  id: 'work-style',
                  text: '工作风格',
                  level: 3,
                  parentId: 'personality-assessment',
                  icon: '⚡'
                },
                {
                  id: 'communication-style',
                  text: '沟通风格',
                  level: 3,
                  parentId: 'personality-assessment',
                  icon: '💬'
                }
              ]
            }
          ]
        },
        {
          id: 'market-research',
          text: '市场调研',
          level: 1,
          parentId: 'career-planning',
          icon: '📊',
          children: [
            {
              id: 'industry-analysis',
              text: '行业分析',
              level: 2,
              parentId: 'market-research',
              icon: '🏭',
              children: [
                {
                  id: 'industry-trends',
                  text: '行业趋势',
                  level: 3,
                  parentId: 'industry-analysis',
                  icon: '📈'
                },
                {
                  id: 'market-size',
                  text: '市场规模',
                  level: 3,
                  parentId: 'industry-analysis',
                  icon: '📏'
                },
                {
                  id: 'growth-potential',
                  text: '增长潜力',
                  level: 3,
                  parentId: 'industry-analysis',
                  icon: '🚀'
                },
                {
                  id: 'key-players',
                  text: '主要玩家',
                  level: 3,
                  parentId: 'industry-analysis',
                  icon: '🏢'
                }
              ]
            },
            {
              id: 'job-market',
              text: '就业市场',
              level: 2,
              parentId: 'market-research',
              icon: '💼',
              children: [
                {
                  id: 'job-demand',
                  text: '岗位需求',
                  level: 3,
                  parentId: 'job-market',
                  icon: '📊'
                },
                {
                  id: 'skill-requirements',
                  text: '技能要求',
                  level: 3,
                  parentId: 'job-market',
                  icon: '📋'
                },
                {
                  id: 'competition-level',
                  text: '竞争程度',
                  level: 3,
                  parentId: 'job-market',
                  icon: '⚔️'
                },
                {
                  id: 'job-security',
                  text: '工作稳定性',
                  level: 3,
                  parentId: 'job-market',
                  icon: '🔒'
                }
              ]
            },
            {
              id: 'salary-research',
              text: '薪资调研',
              level: 2,
              parentId: 'market-research',
              icon: '💰',
              children: [
                {
                  id: 'salary-levels',
                  text: '薪资水平',
                  level: 3,
                  parentId: 'salary-research',
                  icon: '📊'
                },
                {
                  id: 'salary-factors',
                  text: '薪资因素',
                  level: 3,
                  parentId: 'salary-research',
                  icon: '⚖️'
                },
                {
                  id: 'benefits-packages',
                  text: '福利待遇',
                  level: 3,
                  parentId: 'salary-research',
                  icon: '🎁'
                },
                {
                  id: 'salary-growth',
                  text: '薪资增长',
                  level: 3,
                  parentId: 'salary-research',
                  icon: '📈'
                }
              ]
            }
          ]
        },
        {
          id: 'goal-setting',
          text: '目标设定',
          level: 1,
          parentId: 'career-planning',
          icon: '🎯',
          children: [
            {
              id: 'career-vision',
              text: '职业愿景',
              level: 2,
              parentId: 'goal-setting',
              icon: '🔮',
              children: [
                {
                  id: 'long-term-vision',
                  text: '长期愿景',
                  level: 3,
                  parentId: 'career-vision',
                  icon: '🗓️'
                },
                {
                  id: 'ideal-position',
                  text: '理想职位',
                  level: 3,
                  parentId: 'career-vision',
                  icon: '👑'
                },
                {
                  id: 'lifestyle-goals',
                  text: '生活方式目标',
                  level: 3,
                  parentId: 'career-vision',
                  icon: '🏠'
                }
              ]
            },
            {
              id: 'short-term-goals',
              text: '短期目标',
              level: 2,
              parentId: 'goal-setting',
              icon: '📅',
              children: [
                {
                  id: 'skill-goals',
                  text: '技能目标',
                  level: 3,
                  parentId: 'short-term-goals',
                  icon: '📚'
                },
                {
                  id: 'job-goals',
                  text: '工作目标',
                  level: 3,
                  parentId: 'short-term-goals',
                  icon: '💼'
                },
                {
                  id: 'network-goals',
                  text: '人脉目标',
                  level: 3,
                  parentId: 'short-term-goals',
                  icon: '🤝'
                },
                {
                  id: 'achievement-goals',
                  text: '成就目标',
                  level: 3,
                  parentId: 'short-term-goals',
                  icon: '🏆'
                }
              ]
            },
            {
              id: 'milestone-planning',
              text: '里程碑规划',
              level: 2,
              parentId: 'goal-setting',
              icon: '🏁',
              children: [
                {
                  id: 'quarterly-milestones',
                  text: '季度里程碑',
                  level: 3,
                  parentId: 'milestone-planning',
                  icon: '📊'
                },
                {
                  id: 'annual-milestones',
                  text: '年度里程碑',
                  level: 3,
                  parentId: 'milestone-planning',
                  icon: '📅'
                },
                {
                  id: 'career-milestones',
                  text: '职业里程碑',
                  level: 3,
                  parentId: 'milestone-planning',
                  icon: '🎯'
                }
              ]
            }
          ]
        },
        {
          id: 'action-plan',
          text: '行动计划',
          level: 1,
          parentId: 'career-planning',
          icon: '📋',
          children: [
            {
              id: 'skill-development',
              text: '技能提升',
              level: 2,
              parentId: 'action-plan',
              icon: '📚',
              children: [
                {
                  id: 'learning-plan',
                  text: '学习计划',
                  level: 3,
                  parentId: 'skill-development',
                  icon: '📖'
                },
                {
                  id: 'training-courses',
                  text: '培训课程',
                  level: 3,
                  parentId: 'skill-development',
                  icon: '🎓'
                },
                {
                  id: 'certifications',
                  text: '证书认证',
                  level: 3,
                  parentId: 'skill-development',
                  icon: '🏅'
                },
                {
                  id: 'practice-projects',
                  text: '实践项目',
                  level: 3,
                  parentId: 'skill-development',
                  icon: '🛠️'
                }
              ]
            },
            {
              id: 'network-building',
              text: '人脉建设',
              level: 2,
              parentId: 'action-plan',
              icon: '🤝',
              children: [
                {
                  id: 'professional-networking',
                  text: '专业社交',
                  level: 3,
                  parentId: 'network-building',
                  icon: '💼'
                },
                {
                  id: 'mentorship',
                  text: '导师关系',
                  level: 3,
                  parentId: 'network-building',
                  icon: '👨‍🏫'
                },
                {
                  id: 'industry-events',
                  text: '行业活动',
                  level: 3,
                  parentId: 'network-building',
                  icon: '🎪'
                },
                {
                  id: 'online-communities',
                  text: '在线社区',
                  level: 3,
                  parentId: 'network-building',
                  icon: '🌐'
                }
              ]
            },
            {
              id: 'experience-gain',
              text: '经验积累',
              level: 2,
              parentId: 'action-plan',
              icon: '💪',
              children: [
                {
                  id: 'project-leadership',
                  text: '项目领导',
                  level: 3,
                  parentId: 'experience-gain',
                  icon: '🚀'
                },
                {
                  id: 'volunteer-work',
                  text: '志愿工作',
                  level: 3,
                  parentId: 'experience-gain',
                  icon: '❤️'
                },
                {
                  id: 'side-projects',
                  text: '副业项目',
                  level: 3,
                  parentId: 'experience-gain',
                  icon: '⚡'
                },
                {
                  id: 'internships',
                  text: '实习机会',
                  level: 3,
                  parentId: 'experience-gain',
                  icon: '🎓'
                }
              ]
            },
            {
              id: 'job-search-strategy',
              text: '求职策略',
              level: 2,
              parentId: 'action-plan',
              icon: '🔍',
              children: [
                {
                  id: 'resume-optimization',
                  text: '简历优化',
                  level: 3,
                  parentId: 'job-search-strategy',
                  icon: '📄'
                },
                {
                  id: 'interview-preparation',
                  text: '面试准备',
                  level: 3,
                  parentId: 'job-search-strategy',
                  icon: '🎤'
                },
                {
                  id: 'portfolio-building',
                  text: '作品集建设',
                  level: 3,
                  parentId: 'job-search-strategy',
                  icon: '📁'
                },
                {
                  id: 'application-strategy',
                  text: '申请策略',
                  level: 3,
                  parentId: 'job-search-strategy',
                  icon: '📝'
                }
              ]
            }
          ]
        },
        {
          id: 'career-transition',
          text: '职业转型',
          level: 1,
          parentId: 'career-planning',
          icon: '🔄',
          children: [
            {
              id: 'transition-planning',
              text: '转型规划',
              level: 2,
              parentId: 'career-transition',
              icon: '🗺️',
              children: [
                {
                  id: 'transition-timing',
                  text: '转型时机',
                  level: 3,
                  parentId: 'transition-planning',
                  icon: '⏰'
                },
                {
                  id: 'skill-transfer',
                  text: '技能转移',
                  level: 3,
                  parentId: 'transition-planning',
                  icon: '🔄'
                },
                {
                  id: 'gap-analysis',
                  text: '差距分析',
                  level: 3,
                  parentId: 'transition-planning',
                  icon: '📊'
                }
              ]
            },
            {
              id: 'industry-switch',
              text: '行业转换',
              level: 2,
              parentId: 'career-transition',
              icon: '🏭',
              children: [
                {
                  id: 'target-industry',
                  text: '目标行业',
                  level: 3,
                  parentId: 'industry-switch',
                  icon: '🎯'
                },
                {
                  id: 'industry-knowledge',
                  text: '行业知识',
                  level: 3,
                  parentId: 'industry-switch',
                  icon: '📚'
                },
                {
                  id: 'network-transition',
                  text: '人脉转换',
                  level: 3,
                  parentId: 'industry-switch',
                  icon: '🤝'
                }
              ]
            },
            {
              id: 'role-change',
              text: '角色转换',
              level: 2,
              parentId: 'career-transition',
              icon: '👤',
              children: [
                {
                  id: 'functional-change',
                  text: '职能转换',
                  level: 3,
                  parentId: 'role-change',
                  icon: '⚙️'
                },
                {
                  id: 'level-change',
                  text: '级别转换',
                  level: 3,
                  parentId: 'role-change',
                  icon: '🪜'
                },
                {
                  id: 'leadership-transition',
                  text: '领导力转换',
                  level: 3,
                  parentId: 'role-change',
                  icon: '👑'
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  return (
    <MindMap
      title="职业规划思维导图"
      data={data}
      onNodeClick={(node) => console.log('点击节点:', node)}
    />
  );
};

// 预设的技能提升思维导图
export const SkillDevelopmentMindMap: React.FC = () => {
  const data: MindMapNode[] = [
    {
      id: 'skill-development',
      text: '技能提升',
      level: 0,
      icon: '🚀',
      color: '#10b981',
      children: [
        {
          id: 'technical-skills',
          text: '技术技能',
          level: 1,
          parentId: 'skill-development',
          icon: '💻',
          children: [
            {
              id: 'programming',
              text: '编程语言',
              level: 2,
              parentId: 'technical-skills',
              icon: '⌨️'
            },
            {
              id: 'frameworks',
              text: '框架工具',
              level: 2,
              parentId: 'technical-skills',
              icon: '🔧'
            },
            {
              id: 'databases',
              text: '数据库',
              level: 2,
              parentId: 'technical-skills',
              icon: '🗄️'
            }
          ]
        },
        {
          id: 'soft-skills',
          text: '软技能',
          level: 1,
          parentId: 'skill-development',
          icon: '🤝',
          children: [
            {
              id: 'communication',
              text: '沟通能力',
              level: 2,
              parentId: 'soft-skills',
              icon: '💬'
            },
            {
              id: 'leadership',
              text: '领导力',
              level: 2,
              parentId: 'soft-skills',
              icon: '👑'
            },
            {
              id: 'problem-solving',
              text: '问题解决',
              level: 2,
              parentId: 'soft-skills',
              icon: '🧩'
            }
          ]
        },
        {
          id: 'learning-methods',
          text: '学习方法',
          level: 1,
          parentId: 'skill-development',
          icon: '📚',
          children: [
            {
              id: 'online-courses',
              text: '在线课程',
              level: 2,
              parentId: 'learning-methods',
              icon: '💻'
            },
            {
              id: 'practice',
              text: '实践项目',
              level: 2,
              parentId: 'learning-methods',
              icon: '🛠️'
            },
            {
              id: 'mentorship',
              text: '导师指导',
              level: 2,
              parentId: 'learning-methods',
              icon: '👨‍🏫'
            }
          ]
        }
      ]
    }
  ];

  return (
    <MindMap
      title="技能提升思维导图"
      data={data}
      onNodeClick={(node) => console.log('点击节点:', node)}
    />
  );
};

// 预设的Offer分析思维导图
export const OfferAnalysisMindMap: React.FC = () => {
  const data: MindMapNode[] = [
    {
      id: 'offer-analysis',
      text: 'Offer分析',
      level: 0,
      icon: '💰',
      color: '#10b981',
      children: [
        {
          id: 'salary-analysis',
          text: '薪资分析',
          level: 1,
          parentId: 'offer-analysis',
          icon: '💵',
          children: [
            {
              id: 'base-salary',
              text: '基本工资',
              level: 2,
              parentId: 'salary-analysis',
              icon: '📊',
              description: '基本工资是Offer中最核心的组成部分，需要仔细分析其合理性和市场竞争力。',
              tips: [
                '对比同行业同级别岗位的市场薪资水平',
                '考虑公司规模、地理位置、行业地位等因素',
                '评估薪资增长潜力和晋升空间',
                '了解试用期薪资和转正后薪资的差异'
              ],
              resources: [
                '智联招聘薪资报告',
                '拉勾网薪资查询',
                'Boss直聘薪资对比',
                '猎聘网行业薪资分析'
              ],
              children: [
                {
                  id: 'monthly-salary',
                  text: '月薪分析',
                  level: 3,
                  parentId: 'base-salary',
                  icon: '📅',
                  description: '月薪是日常收入的主要来源，需要确保能够满足生活需求。',
                  tips: [
                    '计算税后实际到手金额',
                    '考虑五险一金扣除比例',
                    '评估在当地的生活成本',
                    '预留应急资金和储蓄空间'
                  ]
                },
                {
                  id: 'annual-salary',
                  text: '年薪计算',
                  level: 3,
                  parentId: 'base-salary',
                  icon: '🗓️',
                  description: '年薪计算包括基本工资、奖金、福利等所有收入的总和。',
                  tips: [
                    '包含年终奖、绩效奖金等所有收入',
                    '计算实际工作时间的时薪',
                    '考虑加班费和项目奖金',
                    '评估年薪的稳定性和可预测性'
                  ]
                },
                {
                  id: 'market-comparison',
                  text: '市场对比',
                  level: 3,
                  parentId: 'base-salary',
                  icon: '📈',
                  description: '与市场同类岗位进行薪资对比，判断Offer的竞争力。',
                  tips: [
                    '收集同行业同级别岗位的薪资数据',
                    '考虑公司品牌和平台价值',
                    '分析薪资结构和增长空间',
                    '评估长期职业发展价值'
                  ]
                }
              ]
            },
            {
              id: 'bonus',
              text: '奖金福利',
              level: 2,
              parentId: 'salary-analysis',
              icon: '🎁',
              children: [
                {
                  id: 'year-end-bonus',
                  text: '年终奖',
                  level: 3,
                  parentId: 'bonus',
                  icon: '🎊'
                },
                {
                  id: 'performance-bonus',
                  text: '绩效奖金',
                  level: 3,
                  parentId: 'bonus',
                  icon: '🏆'
                },
                {
                  id: 'project-bonus',
                  text: '项目奖金',
                  level: 3,
                  parentId: 'bonus',
                  icon: '🚀'
                }
              ]
            },
            {
              id: 'equity',
              text: '股权激励',
              level: 2,
              parentId: 'salary-analysis',
              icon: '📈',
              children: [
                {
                  id: 'stock-options',
                  text: '股票期权',
                  level: 3,
                  parentId: 'equity',
                  icon: '📊'
                },
                {
                  id: 'vesting-schedule',
                  text: '行权计划',
                  level: 3,
                  parentId: 'equity',
                  icon: '⏰'
                },
                {
                  id: 'equity-value',
                  text: '股权价值',
                  level: 3,
                  parentId: 'equity',
                  icon: '💎'
                }
              ]
            },
            {
              id: 'benefits',
              text: '福利待遇',
              level: 2,
              parentId: 'salary-analysis',
              icon: '🎁',
              children: [
                {
                  id: 'insurance',
                  text: '保险福利',
                  level: 3,
                  parentId: 'benefits',
                  icon: '🛡️'
                },
                {
                  id: 'vacation',
                  text: '假期制度',
                  level: 3,
                  parentId: 'benefits',
                  icon: '🏖️'
                },
                {
                  id: 'allowances',
                  text: '各类补贴',
                  level: 3,
                  parentId: 'benefits',
                  icon: '💳'
                }
              ]
            }
          ]
        },
        {
          id: 'company-evaluation',
          text: '公司评估',
          level: 1,
          parentId: 'offer-analysis',
          icon: '🏢',
          children: [
            {
              id: 'company-profile',
              text: '公司概况',
              level: 2,
              parentId: 'company-evaluation',
              icon: '📋',
              children: [
                {
                  id: 'company-size',
                  text: '公司规模',
                  level: 3,
                  parentId: 'company-profile',
                  icon: '📏'
                },
                {
                  id: 'company-culture',
                  text: '企业文化',
                  level: 3,
                  parentId: 'company-profile',
                  icon: '🎭'
                },
                {
                  id: 'company-history',
                  text: '发展历程',
                  level: 3,
                  parentId: 'company-profile',
                  icon: '📚'
                }
              ]
            },
            {
              id: 'industry-position',
              text: '行业地位',
              level: 2,
              parentId: 'company-evaluation',
              icon: '🏆',
              children: [
                {
                  id: 'market-share',
                  text: '市场份额',
                  level: 3,
                  parentId: 'industry-position',
                  icon: '📊'
                },
                {
                  id: 'competitors',
                  text: '竞争对手',
                  level: 3,
                  parentId: 'industry-position',
                  icon: '⚔️'
                },
                {
                  id: 'industry-ranking',
                  text: '行业排名',
                  level: 3,
                  parentId: 'industry-position',
                  icon: '🥇'
                }
              ]
            },
            {
              id: 'growth-potential',
              text: '发展潜力',
              level: 2,
              parentId: 'company-evaluation',
              icon: '🚀',
              children: [
                {
                  id: 'business-model',
                  text: '商业模式',
                  level: 3,
                  parentId: 'growth-potential',
                  icon: '💼'
                },
                {
                  id: 'innovation',
                  text: '创新能力',
                  level: 3,
                  parentId: 'growth-potential',
                  icon: '💡'
                },
                {
                  id: 'future-plans',
                  text: '发展规划',
                  level: 3,
                  parentId: 'growth-potential',
                  icon: '🗺️'
                }
              ]
            }
          ]
        },
        {
          id: 'negotiation-strategy',
          text: '谈判策略',
          level: 1,
          parentId: 'offer-analysis',
          icon: '🤝',
          children: [
            {
              id: 'preparation',
              text: '谈判准备',
              level: 2,
              parentId: 'negotiation-strategy',
              icon: '📝',
              children: [
                {
                  id: 'market-research',
                  text: '市场调研',
                  level: 3,
                  parentId: 'preparation',
                  icon: '🔍'
                },
                {
                  id: 'self-assessment',
                  text: '自我评估',
                  level: 3,
                  parentId: 'preparation',
                  icon: '🪞'
                },
                {
                  id: 'target-setting',
                  text: '目标设定',
                  level: 3,
                  parentId: 'preparation',
                  icon: '🎯'
                }
              ]
            },
            {
              id: 'negotiation-tactics',
              text: '谈判技巧',
              level: 2,
              parentId: 'negotiation-strategy',
              icon: '🎭',
              children: [
                {
                  id: 'value-proposition',
                  text: '价值主张',
                  level: 3,
                  parentId: 'negotiation-tactics',
                  icon: '💎'
                },
                {
                  id: 'timing-strategy',
                  text: '时机把握',
                  level: 3,
                  parentId: 'negotiation-tactics',
                  icon: '⏰'
                },
                {
                  id: 'communication-skills',
                  text: '沟通技巧',
                  level: 3,
                  parentId: 'negotiation-tactics',
                  icon: '💬'
                }
              ]
            },
            {
              id: 'alternative-strategies',
              text: '备选策略',
              level: 2,
              parentId: 'negotiation-strategy',
              icon: '🔄',
              children: [
                {
                  id: 'alternative-offers',
                  text: '备选方案',
                  level: 3,
                  parentId: 'alternative-strategies',
                  icon: '🔄'
                },
                {
                  id: 'walk-away-point',
                  text: '底线设定',
                  level: 3,
                  parentId: 'alternative-strategies',
                  icon: '🚪'
                },
                {
                  id: 'compromise-options',
                  text: '妥协方案',
                  level: 3,
                  parentId: 'alternative-strategies',
                  icon: '🤝'
                }
              ]
            }
          ]
        },
        {
          id: 'decision-factors',
          text: '决策因素',
          level: 1,
          parentId: 'offer-analysis',
          icon: '⚖️',
          children: [
            {
              id: 'career-growth',
              text: '职业发展',
              level: 2,
              parentId: 'decision-factors',
              icon: '📈',
              children: [
                {
                  id: 'promotion-path',
                  text: '晋升路径',
                  level: 3,
                  parentId: 'career-growth',
                  icon: '🪜'
                },
                {
                  id: 'skill-development',
                  text: '技能发展',
                  level: 3,
                  parentId: 'career-growth',
                  icon: '📚'
                },
                {
                  id: 'mentorship',
                  text: '导师指导',
                  level: 3,
                  parentId: 'career-growth',
                  icon: '👨‍🏫'
                }
              ]
            },
            {
              id: 'work-life-balance',
              text: '工作生活平衡',
              level: 2,
              parentId: 'decision-factors',
              icon: '⚖️',
              children: [
                {
                  id: 'working-hours',
                  text: '工作时间',
                  level: 3,
                  parentId: 'work-life-balance',
                  icon: '🕐'
                },
                {
                  id: 'flexibility',
                  text: '工作灵活性',
                  level: 3,
                  parentId: 'work-life-balance',
                  icon: '🔄'
                },
                {
                  id: 'stress-level',
                  text: '工作压力',
                  level: 3,
                  parentId: 'work-life-balance',
                  icon: '😰'
                }
              ]
            },
            {
              id: 'risk-assessment',
              text: '风险评估',
              level: 2,
              parentId: 'decision-factors',
              icon: '⚠️',
              children: [
                {
                  id: 'job-security',
                  text: '工作稳定性',
                  level: 3,
                  parentId: 'risk-assessment',
                  icon: '🔒'
                },
                {
                  id: 'company-stability',
                  text: '公司稳定性',
                  level: 3,
                  parentId: 'risk-assessment',
                  icon: '🏢'
                },
                {
                  id: 'industry-risks',
                  text: '行业风险',
                  level: 3,
                  parentId: 'risk-assessment',
                  icon: '📉'
                }
              ]
            }
          ]
        },
        {
          id: 'legal-clauses',
          text: '法律条款',
          level: 1,
          parentId: 'offer-analysis',
          icon: '⚖️',
          children: [
            {
              id: 'contract-terms',
              text: '合同条款',
              level: 2,
              parentId: 'legal-clauses',
              icon: '📋',
              children: [
                {
                  id: 'probation-period',
                  text: '试用期',
                  level: 3,
                  parentId: 'contract-terms',
                  icon: '⏳'
                },
                {
                  id: 'notice-period',
                  text: '离职通知期',
                  level: 3,
                  parentId: 'contract-terms',
                  icon: '📅'
                },
                {
                  id: 'termination-clause',
                  text: '解约条款',
                  level: 3,
                  parentId: 'contract-terms',
                  icon: '🚪'
                }
              ]
            },
            {
              id: 'restrictive-covenants',
              text: '限制性条款',
              level: 2,
              parentId: 'legal-clauses',
              icon: '🚫',
              children: [
                {
                  id: 'non-compete',
                  text: '竞业限制',
                  level: 3,
                  parentId: 'restrictive-covenants',
                  icon: '🚫'
                },
                {
                  id: 'confidentiality',
                  text: '保密协议',
                  level: 3,
                  parentId: 'restrictive-covenants',
                  icon: '🔒'
                },
                {
                  id: 'training-bond',
                  text: '培训协议',
                  level: 3,
                  parentId: 'restrictive-covenants',
                  icon: '📚'
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  return (
    <MindMap
      title="Offer分析思维导图"
      data={data}
      onNodeClick={(node) => console.log('点击节点:', node)}
    />
  );
};

export default MindMap;
