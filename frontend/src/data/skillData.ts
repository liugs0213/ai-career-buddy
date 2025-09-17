import type { SkillNode } from '../types/SkillTree';

// 技术技能数据
export const technicalSkills: SkillNode[] = [
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

// 管理技能数据
export const managementSkills: SkillNode[] = [
  {
    id: 'project-management',
    name: '项目管理',
    description: '规划、执行和监控项目',
    level: 0,
    category: '管理技能',
    progress: 60,
    isUnlocked: true,
    icon: '📋',
    color: '#10b981',
    courses: [
      'PMP项目管理专业人士认证课程',
      'Google项目管理专业证书',
      'Coursera项目管理基础',
      '清华大学项目管理EMBA课程',
      'Scrum Master认证培训',
      'PMI-ACP敏捷项目管理认证'
    ],
    books: [
      '《项目管理知识体系指南(PMBOK指南)第七版》',
      '《项目管理实战手册》- 张斌',
      '《敏捷项目管理》- Jim Highsmith',
      '《项目管理艺术》- Scott Berkun',
      '《关键链》- 高德拉特',
      '《项目管理修炼之道》- Andrew Hunt'
    ],
    learningTips: [
      '从小项目开始实践，逐步积累经验',
      '学习使用项目管理工具如Jira、Trello、Monday.com',
      '参与真实项目，观察经验丰富的项目经理',
      '定期复盘项目，总结成功经验和失败教训',
      '建立项目管理模板和流程文档',
      '培养跨部门沟通协调能力'
    ]
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
    color: '#3b82f6',
    courses: [
      '哈佛商学院团队管理课程',
      '斯坦福大学团队动力学',
      'LinkedIn Learning团队建设',
      '中欧商学院团队领导力',
      'Coursera组织行为学',
      'MasterClass团队管理艺术'
    ],
    books: [
      '《团队协作的五大障碍》- Patrick Lencioni',
      '《高效团队的秘密》- 帕特里克·兰西奥尼',
      '《团队领导力》- 约翰·麦克斯韦尔',
      '《团队合作的艺术》- Tom DeMarco',
      '《从优秀到卓越》- 吉姆·柯林斯',
      '《团队管理必读12篇》- 哈佛商业评论'
    ],
    learningTips: [
      '了解团队成员的性格特点和工作风格',
      '建立清晰的团队目标和价值观',
      '定期组织团队建设活动和培训',
      '创建开放透明的沟通环境',
      '培养团队成员的互信和协作精神',
      '学会处理团队冲突和分歧'
    ]
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
    color: '#f59e0b',
    courses: [
      'Wharton商学院绩效管理',
      'SHRM绩效管理认证',
      'Coursera人力资源管理',
      '北大光华绩效管理MBA课程',
      'LinkedIn Learning绩效评估',
      'DDI绩效管理领导力培训'
    ],
    books: [
      '《绩效管理实务》- 付亚和',
      '《OKR工作法》- 克里斯蒂娜·沃特克',
      '《绩效管理：让员工和组织都受益》',
      '《关键绩效指标》- David Parmenter',
      '《绩效管理的艺术》- Ferdinand Fournies',
      '《激励员工全攻略》- 安妮·布鲁斯'
    ],
    learningTips: [
      '建立科学的绩效评估体系和指标',
      '学会设定SMART目标和OKR',
      '掌握绩效面谈和反馈技巧',
      '定期跟踪和监控绩效数据',
      '建立绩效改进计划和培训体系',
      '培养公平公正的评估态度'
    ]
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
    color: '#ef4444',
    courses: [
      'MIT斯隆管理学院变革管理',
      'Kotter变革管理8步法',
      'INSEAD组织变革课程',
      '中山大学变革管理EMBA',
      'Prosci变革管理认证',
      'Coursera组织发展与变革'
    ],
    books: [
      '《变革之心》- 约翰·科特',
      '《领导变革》- John P. Kotter',
      '《变革的力量》- 约翰·科特',
      '《组织变革管理》- Daryl Conner',
      '《变革管理实践指南》- Jeff Hiatt',
      '《创新者的窘境》- 克里斯坦森'
    ],
    learningTips: [
      '理解变革的必要性和紧迫感',
      '建立变革愿景和沟通策略',
      '识别变革阻力并制定应对方案',
      '培养变革代理人和支持者',
      '建立变革成果的衡量标准',
      '学会管理变革过程中的风险'
    ]
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
    color: '#10b981',
    courses: [
      'IIBA商业分析师认证(CBAP)',
      'Coursera商业分析专业证书',
      '哈佛商学院商业分析',
      'Google数据分析专业证书',
      'Tableau商业智能分析',
      'Power BI商业分析课程'
    ],
    books: [
      '《商业分析师实践指南》- IIBA',
      '《商业分析技术与实践》- 刘奕群',
      '《数据驱动的商业分析》- Foster Provost',
      '《商业分析方法与工具》- 詹姆斯·卡瓦纳',
      '《精益数据分析》- Alistair Croll',
      '《商业模式新生代》- 奥斯特瓦德'
    ],
    learningTips: [
      '掌握数据收集和分析方法',
      '学习使用Excel、SQL、Python等分析工具',
      '培养业务理解能力和行业洞察',
      '练习需求收集和文档编写',
      '学会制作数据可视化报告',
      '建立与业务部门的有效沟通'
    ]
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
    color: '#3b82f6',
    courses: [
      'CFA特许金融分析师',
      'Coursera公司财务专业证书',
      '清华五道口财务管理',
      'Wharton财务管理课程',
      'FRM金融风险管理师',
      'CPA注册会计师培训'
    ],
    books: [
      '《公司财务管理》- 罗斯',
      '《财务管理学》- 荆新',
      '《财务分析与决策》- 汤谷良',
      '《预算管理实务》- 王斌',
      '《财务报表分析》- 马丁·弗里德森',
      '《价值评估》- 麦肯锡'
    ],
    learningTips: [
      '掌握财务报表分析和解读',
      '学习预算编制和成本控制',
      '了解投资决策和风险评估',
      '熟悉现金流管理和资金规划',
      '掌握财务比率分析方法',
      '学会使用财务管理软件工具'
    ]
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
    color: '#f59e0b',
    courses: [
      'Harvard商学院战略管理',
      'INSEAD全球高管MBA',
      'Coursera战略管理专业证书',
      '中欧商学院战略课程',
      'MIT斯隆战略规划',
      'McKinsey战略咨询方法论'
    ],
    books: [
      '《竞争战略》- 迈克尔·波特',
      '《战略管理》- 汤普森',
      '《蓝海战略》- 金伟灿',
      '《从优秀到卓越》- 吉姆·柯林斯',
      '《战略地图》- 罗伯特·卡普兰',
      '《定位》- 艾·里斯'
    ],
    learningTips: [
      '学习SWOT分析和波特五力模型',
      '掌握战略制定和执行方法',
      '培养行业分析和市场洞察能力',
      '学会制定KPI和战略地图',
      '建立战略监控和调整机制',
      '培养长远思维和全局观念'
    ]
  }
];

