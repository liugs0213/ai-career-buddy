import React, { useState } from 'react';
import './SkillTree.css';

interface SkillNode {
  id: string;
  name: string;
  description: string;
  level: number;
  category: string;
  prerequisites?: string[];
  progress: number; // 0-100
  isUnlocked: boolean;
  icon?: string;
  color?: string;
  courses?: string[]; // 推荐课程
  books?: string[]; // 推荐书籍
  learningTips?: string[]; // 自定义学习建议
}

interface SkillTreeProps {
  title?: string;
  skills: SkillNode[];
  onSkillClick?: (skill: SkillNode) => void;
  className?: string;
}

const SkillTree: React.FC<SkillTreeProps> = ({
  title = "技能树",
  skills,
  onSkillClick,
  className = ""
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const getSkillColor = (progress: number) => {
    if (progress >= 80) return '#10b981'; // 绿色 - 精通
    if (progress >= 60) return '#3b82f6'; // 蓝色 - 熟练
    if (progress >= 40) return '#f59e0b'; // 橙色 - 了解
    if (progress >= 20) return '#ef4444'; // 红色 - 入门
    return '#64748b'; // 灰色 - 未开始
  };

  const getSkillLevel = (progress: number) => {
    if (progress >= 80) return '精通';
    if (progress >= 60) return '熟练';
    if (progress >= 40) return '了解';
    if (progress >= 20) return '入门';
    return '未开始';
  };

  const getSkillSize = (level: number) => {
    const sizes = ['small', 'medium', 'large', 'xlarge'];
    return sizes[level] || 'medium';
  };

  const handleSkillClick = (skill: SkillNode) => {
    setSelectedSkill(selectedSkill === skill.id ? null : skill.id);
    onSkillClick?.(skill);
  };

  // 按类别和层级分组技能
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, SkillNode[]>);

  // 按层级排序
  Object.keys(groupedSkills).forEach(category => {
    groupedSkills[category].sort((a, b) => a.level - b.level);
  });

  return (
    <div className={`skill-tree ${className}`}>
      {title && <h3 className="skill-tree-title">{title}</h3>}
      
      <div className="skill-tree-container">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <div key={category} className="skill-category">
            <div className="category-header">
              <h4 className="category-title">{category}</h4>
              <div className="category-progress">
                <span className="progress-text">
                  {categorySkills.filter(s => s.isUnlocked).length} / {categorySkills.length}
                </span>
                <div className="category-progress-bar">
                  <div 
                    className="category-progress-fill"
                    style={{ 
                      width: `${(categorySkills.filter(s => s.isUnlocked).length / categorySkills.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="skills-grid">
              {categorySkills.map((skill, index) => (
                <div
                  key={skill.id}
                  className={`skill-card ${skill.isUnlocked ? 'unlocked' : 'locked'} ${selectedSkill === skill.id ? 'selected' : ''}`}
                  onClick={() => skill.isUnlocked && handleSkillClick(skill)}
                >
                  <div className="skill-card-header">
                    <div className="skill-icon-wrapper">
                      <span className="skill-icon">{skill.icon}</span>
                      {skill.isUnlocked && (
                        <div className="skill-level-badge">
                          {getSkillLevel(skill.progress)}
                        </div>
                      )}
                    </div>
                    <div className="skill-info">
                      <h5 className="skill-name">{skill.name}</h5>
                      <p className="skill-description">{skill.description}</p>
                    </div>
                  </div>
                  
                  <div className="skill-card-body">
                    <div className="skill-progress-section">
                      <div className="progress-info">
                        <span className="progress-label">掌握程度</span>
                        <span className="progress-value">{skill.progress}%</span>
                      </div>
                      <div className="skill-progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${skill.progress}%`,
                            backgroundColor: getSkillColor(skill.progress)
                          }}
                        />
                      </div>
                    </div>
                    
                    {skill.prerequisites && skill.prerequisites.length > 0 && (
                      <div className="prerequisites-section">
                        <span className="prereq-label">前置技能</span>
                        <div className="prereq-tags">
                          {skill.prerequisites.map(prereqId => {
                            const prereqSkill = skills.find(s => s.id === prereqId);
                            return (
                              <span 
                                key={prereqId}
                                className={`prereq-tag ${prereqSkill?.isUnlocked ? 'unlocked' : 'locked'}`}
                              >
                                {prereqSkill?.name || prereqId}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!skill.isUnlocked && (
                    <div className="locked-overlay">
                      <span className="locked-icon">🔒</span>
                      <span className="locked-text">未解锁</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {selectedSkill && (
        <div className="skill-details-modal">
          <div className="skill-details-content">
            <div className="skill-details-header">
              <div className="selected-skill-icon">
                {skills.find(s => s.id === selectedSkill)?.icon}
              </div>
              <div className="selected-skill-info">
                <h4>{skills.find(s => s.id === selectedSkill)?.name}</h4>
                <p>{skills.find(s => s.id === selectedSkill)?.description}</p>
              </div>
              <button 
                className="close-details"
                onClick={() => setSelectedSkill(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="skill-details-body">
              <div className="detail-section">
                <h5>掌握程度</h5>
                <div className="progress-display">
                  <div className="progress-circle">
                    <span className="progress-percentage">
                      {skills.find(s => s.id === selectedSkill)?.progress}%
                    </span>
                  </div>
                  <span className="progress-level">
                    {getSkillLevel(skills.find(s => s.id === selectedSkill)?.progress || 0)}
                  </span>
                </div>
              </div>
              
              <div className="detail-section">
                <h5>学习建议</h5>
                <ul className="learning-tips">
                  <li>制定详细的学习计划</li>
                  <li>寻找相关的实践项目</li>
                  <li>加入学习社区交流经验</li>
                  <li>定期评估学习进度</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 预设的技术技能树
export const TechnicalSkillTree: React.FC = () => {
  const skills: SkillNode[] = [
    {
      id: 'programming-basics',
      name: '编程基础',
      description: '掌握基本的编程概念和语法',
      level: 0,
      category: '编程技能',
      progress: 80,
      isUnlocked: true,
      icon: '💻',
      color: '#10b981'
    },
    {
      id: 'data-structures',
      name: '数据结构',
      description: '理解常用数据结构的实现和应用',
      level: 1,
      category: '编程技能',
      prerequisites: ['programming-basics'],
      progress: 60,
      isUnlocked: true,
      icon: '📊',
      color: '#3b82f6'
    },
    {
      id: 'algorithms',
      name: '算法设计',
      description: '掌握常用算法和复杂度分析',
      level: 2,
      category: '编程技能',
      prerequisites: ['data-structures'],
      progress: 40,
      isUnlocked: true,
      icon: '🧮',
      color: '#f59e0b'
    },
    {
      id: 'system-design',
      name: '系统设计',
      description: '设计大规模分布式系统',
      level: 3,
      category: '编程技能',
      prerequisites: ['algorithms'],
      progress: 20,
      isUnlocked: false,
      icon: '🏗️',
      color: '#ef4444'
    },
    {
      id: 'communication',
      name: '沟通能力',
      description: '有效表达想法和倾听他人',
      level: 0,
      category: '软技能',
      progress: 70,
      isUnlocked: true,
      icon: '💬',
      color: '#10b981'
    },
    {
      id: 'leadership',
      name: '领导力',
      description: '带领团队达成目标',
      level: 1,
      category: '软技能',
      prerequisites: ['communication'],
      progress: 50,
      isUnlocked: true,
      icon: '👑',
      color: '#3b82f6'
    },
    {
      id: 'team-management',
      name: '团队管理',
      description: '管理团队绩效和发展',
      level: 2,
      category: '软技能',
      prerequisites: ['leadership'],
      progress: 30,
      isUnlocked: false,
      icon: '👥',
      color: '#f59e0b'
    },
    {
      id: 'strategic-thinking',
      name: '战略思维',
      description: '制定长期战略规划',
      level: 3,
      category: '软技能',
      prerequisites: ['team-management'],
      progress: 10,
      isUnlocked: false,
      icon: '🎯',
      color: '#ef4444'
    }
  ];

  return (
    <SkillTree
      title="技术技能树"
      skills={skills}
      onSkillClick={(skill) => console.log('点击技能:', skill)}
    />
  );
};

// 预设的管理技能树
export const ManagementSkillTree: React.FC = () => {
  const skills: SkillNode[] = [
    {
      id: 'project-management',
      name: '项目管理',
      description: '规划、执行和监控项目',
      level: 0,
      category: '管理技能',
      progress: 60,
      isUnlocked: true,
      icon: '📋',
      color: '#10b981'
    },
    {
      id: 'team-building',
      name: '团队建设',
      description: '建立高效协作的团队',
      level: 1,
      category: '管理技能',
      prerequisites: ['project-management'],
      progress: 40,
      isUnlocked: true,
      icon: '🤝',
      color: '#3b82f6'
    },
    {
      id: 'performance-management',
      name: '绩效管理',
      description: '评估和提升团队绩效',
      level: 2,
      category: '管理技能',
      prerequisites: ['team-building'],
      progress: 25,
      isUnlocked: false,
      icon: '📈',
      color: '#f59e0b'
    },
    {
      id: 'change-management',
      name: '变革管理',
      description: '引导组织变革和创新',
      level: 3,
      category: '管理技能',
      prerequisites: ['performance-management'],
      progress: 10,
      isUnlocked: false,
      icon: '🔄',
      color: '#ef4444'
    },
    {
      id: 'business-analysis',
      name: '商业分析',
      description: '分析业务需求和机会',
      level: 0,
      category: '商业技能',
      progress: 50,
      isUnlocked: true,
      icon: '📊',
      color: '#10b981'
    },
    {
      id: 'financial-management',
      name: '财务管理',
      description: '管理预算和财务资源',
      level: 1,
      category: '商业技能',
      prerequisites: ['business-analysis'],
      progress: 30,
      isUnlocked: false,
      icon: '💰',
      color: '#3b82f6'
    },
    {
      id: 'strategic-planning',
      name: '战略规划',
      description: '制定长期发展战略',
      level: 2,
      category: '商业技能',
      prerequisites: ['financial-management'],
      progress: 15,
      isUnlocked: false,
      icon: '🎯',
      color: '#f59e0b'
    }
  ];

  return (
    <SkillTree
      title="管理技能树"
      skills={skills}
      onSkillClick={(skill) => console.log('点击技能:', skill)}
    />
  );
};

export default SkillTree;
