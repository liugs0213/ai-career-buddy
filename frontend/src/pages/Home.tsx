import { useEffect, useState, useRef } from 'react';
import { api } from '../api';
import VisualizationPanel from '../components/VisualizationPanel';
import FormattedText from '../components/FormattedText';
import TaskQueueStatus from '../components/TaskQueueStatus';
import UserSelector from '../components/UserSelector';
import { addStreamMessageTask } from '../utils/TaskQueue';
import './Home.css';

interface ChatMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  attachments?: string[]; // 文件URL数组（支持图片和PDF）
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  lastMessageAt: number;
}

interface TabChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  input: string;
  isLoading: boolean;
}

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  type: 'chat';
  description: string;
  isPrivate: boolean;
}

const MODEL_CONFIGS: ModelConfig[] = [
  // Azure OpenAI - 推荐模型
  { id: 'azure/gpt-5-mini', name: 'GPT-5 Mini (推荐)', provider: '微软Azure', type: 'chat', description: '🌟 最新模型 | 高性能 | 默认选择 | Azure OpenAI', isPrivate: false },
  { id: 'azure/gpt-5', name: 'GPT-5', provider: '微软Azure', type: 'chat', description: '🚀 最强性能 | 最新技术 | Azure OpenAI', isPrivate: false },
  { id: 'azure/gpt-5-chat', name: 'GPT-5 Chat', provider: '微软Azure', type: 'chat', description: '💬 对话优化 | 专业聊天 | Azure OpenAI', isPrivate: false },
  { id: 'azure/gpt-5-nano', name: 'GPT-5 Nano', provider: '微软Azure', type: 'chat', description: '⚡ 轻量快速 | 高效响应 | Azure OpenAI', isPrivate: false },
  
  // Arsenal 私有部署 - 推荐模型
  { id: 'deepseek-v3-0324', name: 'DeepSeek V3', provider: 'Arsenal', type: 'chat', description: '🌟 高性能推理 | 私有安全', isPrivate: true },
  { id: 'qwen-v3-235b', name: 'Qwen V3 235B', provider: 'Arsenal', type: 'chat', description: '💪 超大模型 | 超强理解力 | 私有部署', isPrivate: true },
  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'Arsenal', type: 'chat', description: '🧠 推理专家 | 逻辑分析 | 私有部署', isPrivate: true },
  { id: 'gpt-oss-120b', name: 'GPT-OSS 120B', provider: 'Arsenal', type: 'chat', description: '🚀 开源大模型 | 120B参数 | 私有部署', isPrivate: true },
  { id: 'gpt-oss-20b', name: 'GPT-OSS 20B', provider: 'Arsenal', type: 'chat', description: '⚡ 轻量模型 | 快速响应 | 私有部署', isPrivate: true },
  { id: 'qwen-v2.5-7b-vl', name: 'Qwen V2.5 7B VL', provider: 'Arsenal', type: 'chat', description: '👁️ 多模态 | 图像理解 | 私有部署', isPrivate: true },
  
  // 百炼 外部供应商 - 流式响应
  { id: 'bailian/qwen-flash', name: '通义千问 Flash', provider: '百炼', type: 'chat', description: '⚡ 快速响应 | 轻量高效 | 外部API', isPrivate: false },
  { id: 'nbg-v3-33b', name: 'NBG V3 33B', provider: '百炼', type: 'chat', description: '🌊 流式响应 | 实时输出 | 外部API', isPrivate: false },
  { id: 'bailian/qwen-plus', name: '通义千问 Plus', provider: '百炼', type: 'chat', description: '🎯 平衡性能 | 中文优化 | 外部API', isPrivate: false },
  { id: 'bailian/qwen-vl-plus', name: '通义千问 VL Plus', provider: '百炼', type: 'chat', description: '👁️ 多模态 | 图像理解 | 外部API', isPrivate: false },
  { id: 'bailian/qwen-vl-max', name: '通义千问 VL Max', provider: '百炼', type: 'chat', description: '🔥 最强多模态 | 图像理解 | 外部API', isPrivate: false },
  { id: 'bailian/deepseek-v3', name: 'DeepSeek V3 (百炼)', provider: '百炼', type: 'chat', description: '🧠 推理专家 | 外部API | 需注意数据安全', isPrivate: false },
  { id: 'bailian/deepseek-r1', name: 'DeepSeek R1 (百炼)', provider: '百炼', type: 'chat', description: '🎯 逻辑推理 | 外部API | 需注意数据安全', isPrivate: false },
  { id: 'bailian/deepseek-v3.1', name: 'DeepSeek V3.1 (百炼)', provider: '百炼', type: 'chat', description: '🚀 最新版本 | 外部API | 需注意数据安全', isPrivate: false },
];

const TAB_CONFIGS = {
  career: {
    key: 'career',
    label: '职业生涯规划',
    icon: '🎯',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    introduction: {
      title: '职业规划专家',
      description: '我是您的专属职业规划顾问，拥有10年+的职业发展经验。',
      capabilities: [
        '职业路径规划与建议',
        '技能提升方案制定',
        '行业趋势分析',
        '个人品牌建设指导',
        '职业转型策略'
      ],
      greeting: '您好！我是您的职业规划专家。我可以帮您制定清晰的职业发展路径，分析行业趋势，制定技能提升计划。请告诉我您目前的职业状况和未来目标，我会为您提供专业的规划建议！'
    },
    examples: [
      {
        title: '职业转型咨询',
        description: '我想从技术岗位转向管理岗位，需要什么准备？',
        icon: '🔄'
      },
      {
        title: '技能提升规划',
        description: '作为产品经理，我需要学习哪些新技能来提升竞争力？',
        icon: '📈'
      },
      {
        title: '行业分析',
        description: '人工智能行业的发展前景如何？适合哪些背景的人进入？',
        icon: '🔍'
      },
      {
        title: '个人品牌建设',
        description: '如何在Boss直聘上建立专业的个人品牌形象？',
        icon: '🏷️'
      }
    ]
  },
  offer: {
    key: 'offer',
    label: 'offer分析',
    icon: '💰',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    introduction: {
      title: 'Offer分析专家',
      description: '我是专业的Offer分析师，擅长薪资谈判和职位评估。',
      capabilities: [
        '薪资水平分析与对比',
        '福利待遇评估',
        '职位发展前景分析',
        '谈判策略建议',
        '多Offer选择决策'
      ],
      greeting: '您好！我是您的Offer分析专家。我可以帮您分析薪资水平、评估福利待遇、对比不同Offer的优劣，并为您提供专业的谈判建议。请分享您收到的Offer详情，我会为您进行深度分析！'
    },
    examples: [
      {
        title: '薪资谈判',
        description: '我收到了一个15K的offer，但期望薪资是18K，如何谈判？',
        icon: '💬'
      },
      {
        title: 'Offer对比',
        description: '我有两个offer，一个是大厂但薪资低，一个是小公司但薪资高，怎么选择？',
        icon: '⚖️'
      },
      {
        title: '福利分析',
        description: '这个offer的股票期权和年终奖怎么评估价值？',
        icon: '📊'
      },
      {
        title: '市场行情',
        description: '前端开发3年经验，在北京的薪资水平大概是多少？',
        icon: '📈'
      }
    ]
  },
  contract: {
    key: 'contract',
    label: '劳动合同检查',
    icon: '📋',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    introduction: {
      title: '劳动合同专家',
      description: '我是专业的劳动合同审查专家，保护您的合法权益。',
      capabilities: [
        '合同条款详细解读',
        '风险点识别与提醒',
        '法律条款合规性检查',
        '权益保护建议',
        '合同修改建议'
      ],
      greeting: '您好！我是您的劳动合同检查专家。我可以帮您详细解读合同条款，识别潜在风险点，确保您的合法权益得到保护。请上传或描述您的劳动合同内容，我会为您进行专业审查！'
    },
    examples: [
      {
        title: '合同条款解读',
        description: '这个竞业限制条款是否合理？对我有什么影响？',
        icon: '📖'
      },
      {
        title: '风险点识别',
        description: '合同中的试用期条款有什么需要注意的风险点？',
        icon: '⚠️'
      },
      {
        title: '权益保护',
        description: '公司要求我签署保密协议，我的权益如何保护？',
        icon: '🛡️'
      },
      {
        title: '合同修改',
        description: '这个劳动合同有哪些条款需要修改？如何与HR沟通？',
        icon: '✏️'
      }
    ]
  },
  monitor: {
    key: 'monitor',
    label: '在职企业监控',
    icon: '🏢',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    introduction: {
      title: '企业监控专家',
      description: '我是专业的企业监控分析师，实时跟踪企业动态。',
      capabilities: [
        '企业财务状况监控',
        '行业地位变化追踪',
        '管理层变动分析',
        '业务发展动态监控',
        '风险预警提醒'
      ],
      greeting: '您好！我是您的企业监控专家。我可以帮您实时监控所在企业的发展动态，包括财务状况、行业地位、管理层变动等关键信息，为您提供及时的风险预警和发展建议！'
    },
    examples: [
      {
        title: '财务状况分析',
        description: '我们公司最近的财务状况如何？有什么风险需要关注？',
        icon: '💰'
      },
      {
        title: '行业地位评估',
        description: '我们公司在行业中的地位如何？与竞争对手相比有什么优势？',
        icon: '📊'
      },
      {
        title: '管理层变动',
        description: '公司最近的高管变动对公司发展有什么影响？',
        icon: '👥'
      },
      {
        title: '风险预警',
        description: '公司目前面临哪些潜在风险？我需要注意什么？',
        icon: '🚨'
      }
    ]
  }
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('contract');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uploadedFiles, setUploadedFiles] = useState<Array<{url: string, type: string, name: string}>>([]);
  const [selectedModel, setSelectedModel] = useState<string>('azure/gpt-5-mini'); // 默认选择GPT-5 Mini
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('default-user'); // 当前用户ID
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 更新时间显示
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // 加载用户默认模型
  useEffect(() => {
    const loadUserDefaultModel = async () => {
      try {
        const response = await api.getUserDefaultModel(currentUserId);
        if (response.defaultModel) {
          setSelectedModel(response.defaultModel);
          console.log('已加载用户默认模型:', response.defaultModel);
        }
      } catch (error) {
        console.error('加载用户默认模型失败:', error);
      }
    };

    loadUserDefaultModel();
  }, [currentUserId]);

  // 加载历史记录
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const categories = ['career', 'offer', 'contract', 'monitor'];
        
        for (const category of categories) {
          const response = await api.getCareerHistory(currentUserId, category);
          const histories = response.histories || [];
          
          // 去重：使用Map来避免重复的threadId
          const sessionMap = new Map<string, ChatSession>();
          
          histories.forEach((history: any) => {
            // 如果这个threadId已经存在，跳过
            if (sessionMap.has(history.threadId)) {
              return;
            }
            
            // 构建用户消息内容，包含原始内容和文档信息
            let userContent = history.content;
            
            // 如果有元数据，尝试解析文档信息
            if (history.metadata) {
              try {
                const metadata = JSON.parse(history.metadata);
                if (metadata.attachments && metadata.attachments.length > 0) {
                  // 添加文档附件信息到用户消息中
                  const documentInfo = metadata.attachments
                    .filter((att: string) => att.startsWith('document:'))
                    .map((att: string) => {
                      const docId = att.replace('document:', '');
                      return `📄 已上传文档 (ID: ${docId})`;
                    });
                  
                  if (documentInfo.length > 0) {
                    userContent += '\n\n' + documentInfo.join('\n');
                  }
                }
              } catch (error) {
                console.warn('解析历史记录元数据失败:', error);
              }
            }
            
            const session: ChatSession = {
              id: history.threadId,
              title: history.title,
              messages: [
                { 
                  id: `${history.threadId}-user-${Date.now()}`, 
                  role: 'user', 
                  content: userContent, 
                  threadId: history.threadId 
                },
                { 
                  id: `${history.threadId}-assistant-${Date.now()}`, 
                  role: 'assistant', 
                  content: history.aiResponse, 
                  threadId: history.threadId 
                }
              ],
              createdAt: new Date(history.createdAt).getTime(),
              lastMessageAt: new Date(history.createdAt).getTime()
            };
            
            sessionMap.set(history.threadId, session);
          });
          
          // 转换为数组并按时间排序
          const sessions: ChatSession[] = Array.from(sessionMap.values())
            .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
          
          // 更新对应标签页的会话列表
          setTabChats(prev => {
            console.log('更新标签页会话:', { category, sessionsCount: sessions.length, uniqueThreadIds: sessions.map(s => s.id) });
            return {
              ...prev,
              [category]: {
                ...prev[category],
                sessions: sessions,
                // 不自动选择会话，让用户手动选择
                currentSessionId: null
              }
            };
          });
        }
      } catch (error) {
        console.error('加载历史记录失败:', error);
      }
    };

    loadHistory();
  }, [currentUserId]);
  
  const [tabChats, setTabChats] = useState<Record<string, TabChatState>>({
    career: { sessions: [], currentSessionId: null, input: '', isLoading: false },
    offer: { sessions: [], currentSessionId: null, input: '', isLoading: false },
    contract: { sessions: [], currentSessionId: null, input: '', isLoading: false },
    monitor: { sessions: [], currentSessionId: null, input: '', isLoading: false }
  });
  
  // 页面加载时，如果有历史会话，自动选择最新的一个
  useEffect(() => {
    const autoSelectLatestSession = () => {
      setTabChats(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          const sessions = newState[key].sessions;
          if (sessions.length > 0 && !newState[key].currentSessionId) {
            // 选择最新的会话
            const latestSession = sessions[0]; // 已经按时间排序
            newState[key] = { ...newState[key], currentSessionId: latestSession.id };
            console.log(`自动选择最新会话: ${key} -> ${latestSession.id}`);
          }
        });
        return newState;
      });
    };

    // 延迟执行，确保历史记录已经加载完成
    const timer = setTimeout(autoSelectLatestSession, 1000);
    return () => clearTimeout(timer);
  }, []);
  const [deepThinkingActive, setDeepThinkingActive] = useState(false);
  const [networkSearchActive, setNetworkSearchActive] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = tabChats[activeTab];
  const currentConfig = TAB_CONFIGS[activeTab as keyof typeof TAB_CONFIGS];
  const currentSession = currentChat.sessions.find(s => s.id === currentChat.currentSessionId);

  // 当选择会话时，加载该会话的详细消息
  useEffect(() => {
    const loadSessionMessages = async () => {
      if (currentChat.currentSessionId) {
        try {
          console.log('加载会话消息:', currentChat.currentSessionId);
          const messages = await api.listMessages(currentChat.currentSessionId);
          
          // 将消息转换为ChatMessage格式
          const chatMessages: ChatMessage[] = messages.map((msg: any) => ({
            id: `${msg.id}`,
            threadId: msg.threadId,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.createdAt).getTime(),
            attachments: msg.attachments ? JSON.parse(msg.attachments) : []
          }));

          // 更新当前会话的消息
          setTabChats(prev => ({
            ...prev,
            [activeTab]: {
              ...prev[activeTab],
              sessions: prev[activeTab].sessions.map(session => 
                session.id === currentChat.currentSessionId 
                  ? { ...session, messages: chatMessages }
                  : session
              )
            }
          }));
          
          console.log('会话消息加载完成:', chatMessages.length, '条消息');
        } catch (error) {
          console.error('加载会话消息失败:', error);
        }
      }
    };

    loadSessionMessages();
  }, [currentChat.currentSessionId, activeTab]);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateTabChat = (tabKey: string, updates: Partial<TabChatState>) => {
    console.log('updateTabChat被调用', { tabKey, updates });
    setTabChats(prev => {
      const newState = {
        ...prev,
        [tabKey]: { ...prev[tabKey], ...updates }
      };
      console.log('更新后的tabChats状态', newState);
      return newState;
    });
  };

  const createNewChat = (tabKey: string) => {
    // 生成唯一的会话ID，使用时间戳和随机数确保唯一性
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    const sessionId = `${tabKey}-${timestamp}-${randomSuffix}`;
    
    // 生成更好听的对话标题
    const getChatTitle = (tabKey: string) => {
      const titles = {
        career: ['职业规划咨询', '职业发展探讨', '职场成长指导'],
        offer: ['Offer分析咨询', '薪资谈判指导', '职位评估分析'],
        contract: ['合同审查咨询', '法律条款分析', '权益保护指导'],
        monitor: ['企业监控分析', '公司动态追踪', '风险预警咨询']
      };
      const options = titles[tabKey as keyof typeof titles] || ['专业咨询'];
      return options[Math.floor(Math.random() * options.length)];
    };
    
    const newSession: ChatSession = {
      id: sessionId,
      title: getChatTitle(tabKey),
      messages: [],
      createdAt: timestamp,
      lastMessageAt: timestamp
    };

    updateTabChat(tabKey, {
      sessions: [newSession, ...currentChat.sessions],
      currentSessionId: sessionId,
      input: ''
    });
  };


  const updateSessionTitle = (tabKey: string, sessionId: string, title: string) => {
    const updatedSessions = currentChat.sessions.map(session => 
      session.id === sessionId ? { ...session, title } : session
    );
    updateTabChat(tabKey, { sessions: updatedSessions });
  };

  // 输入内容过滤和验证
  const validateInput = (input: string): { isValid: boolean; message?: string } => {
    const trimmedInput = input.trim();
    
    // 检查是否为空
    if (!trimmedInput) {
      return { isValid: false, message: '请输入您的问题' };
    }
    
    // 检查长度
    if (trimmedInput.length < 2) {
      return { isValid: false, message: '请输入至少2个字符的问题' };
    }
    
    if (trimmedInput.length > 2000) {
      return { isValid: false, message: '输入内容过长，请控制在2000字符以内' };
    }
    
    // 检查是否只包含特殊字符或数字
    const onlySpecialChars = /^[^a-zA-Z\u4e00-\u9fa5]+$/.test(trimmedInput);
    if (onlySpecialChars) {
      return { isValid: false, message: '请输入有意义的问题，不能只包含特殊字符或数字' };
    }
    
    // 检查是否包含明显的垃圾内容
    const spamPatterns = [
      /^[a-z]{1,3}$/i, // 只有1-3个字母
      /^[0-9]+$/, // 只有数字
      /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, // 只有特殊字符
      /^(.)\1{10,}$/, // 重复字符超过10次
      /^[aeiou]{5,}$/i, // 只有元音字母
      /^[bcdfghjklmnpqrstvwxyz]{5,}$/i, // 只有辅音字母
      /^[qwertyuiop]+$/i, // 只有键盘第一行字母
      /^[asdfghjkl]+$/i, // 只有键盘第二行字母
      /^[zxcvbnm]+$/i, // 只有键盘第三行字母
      /^(.)\1{5,}$/, // 重复字符超过5次
      /^[a-z]{1}\s*[a-z]{1}\s*[a-z]{1}$/i, // 三个字母用空格分隔
      /^[0-9]{1}\s*[0-9]{1}\s*[0-9]{1}$/, // 三个数字用空格分隔
      /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{3,}$/, // 3个以上特殊字符
      /^(.)\1{3,}(.)\2{3,}$/, // 两种字符各重复3次以上
    ];
    
    for (const pattern of spamPatterns) {
      if (pattern.test(trimmedInput)) {
        return { isValid: false, message: '请输入有意义的问题，避免无意义的字符组合' };
      }
    }
    
    // 检查是否包含过多的重复词汇
    const words = trimmedInput.split(/\s+/);
    if (words.length > 3) {
      const wordCounts: { [key: string]: number } = {};
      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
      
      const maxRepeats = Math.max(...Object.values(wordCounts));
      if (maxRepeats > words.length * 0.6) {
        return { isValid: false, message: '请避免重复使用相同的词汇' };
      }
    }
    
    // 检查是否包含无意义的重复短语
    const phrases = trimmedInput.split(/[，。！？；：]/);
    if (phrases.length > 1) {
      const phraseCounts: { [key: string]: number } = {};
      phrases.forEach(phrase => {
        const cleanPhrase = phrase.trim();
        if (cleanPhrase.length > 2) {
          phraseCounts[cleanPhrase] = (phraseCounts[cleanPhrase] || 0) + 1;
        }
      });
      
      const maxPhraseRepeats = Math.max(...Object.values(phraseCounts));
      if (maxPhraseRepeats > 1) {
        return { isValid: false, message: '请避免重复输入相同的句子' };
      }
    }
    
    // 检查是否包含明显的测试内容
    const testPatterns = [
      /^测试/i,
      /^test/i,
      /^hello/i,
      /^hi/i,
      /^你好/i,
      /^在吗/i,
      /^有人吗/i,
      /^123/i,
      /^abc/i,
    ];
    
    for (const pattern of testPatterns) {
      if (pattern.test(trimmedInput) && trimmedInput.length < 10) {
        return { isValid: false, message: '请提出具体的问题，而不是简单的测试内容' };
      }
    }
    
    return { isValid: true };
  };

  const send = async () => {
    console.log('send函数被调用', { 
      input: currentChat.input, 
      isLoading: currentChat.isLoading, 
      currentSession: currentSession,
      currentSessionId: currentChat.currentSessionId 
    });
    
    if (!currentChat.input.trim() || currentChat.isLoading) {
      console.log('发送被阻止：输入为空或正在加载');
      return;
    }

    // 验证输入内容
    const validation = validateInput(currentChat.input);
    if (!validation.isValid) {
      // 显示验证错误信息
      const getCurrentModelName = () => {
        const model = MODEL_CONFIGS.find(m => m.id === selectedModel);
        return model ? model.name : 'AI助手';
      };

      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        threadId: currentChat.currentSessionId || 'default',
        role: 'assistant',
        content: `❌ ${validation.message}\n\n🤖 我是${getCurrentModelName()}，专门为您提供${currentConfig.introduction.title}服务。\n\n✨ 我可以帮您：\n${currentConfig.introduction.capabilities.map(cap => `• ${cap}`).join('\n')}\n\n💬 请提出具体的问题，比如：\n• "${currentConfig.introduction.greeting.split('！')[0]}..."\n• 描述您的具体需求\n• 询问相关的专业建议\n\n我会为您提供专业、详细的帮助！`,
        timestamp: Date.now()
      };
      
      // 如果没有当前会话，创建一个
      if (!currentSession) {
        // 生成唯一的会话ID，使用时间戳和随机数确保唯一性
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substr(2, 9);
        const sessionId = `${activeTab}-${timestamp}-${randomSuffix}`;
        const newSession: ChatSession = {
          id: sessionId,
          title: '输入提示',
          messages: [errorMessage],
          createdAt: timestamp,
          lastMessageAt: timestamp
        };
        
        updateTabChat(activeTab, {
          sessions: [newSession, ...currentChat.sessions],
          currentSessionId: sessionId,
          input: ''
        });
      } else {
        // 更新现有会话
        const updatedSessions = currentChat.sessions.map(s => 
          s.id === currentSession.id 
            ? { 
                ...s, 
                messages: [...s.messages, errorMessage],
                lastMessageAt: Date.now()
              }
            : s
        );
        updateTabChat(activeTab, { sessions: updatedSessions, input: '' });
      }
      return;
    }

    const messageContent = currentChat.input;
    
    // 如果没有当前会话，自动创建一个
    if (!currentSession) {
      console.log('没有当前会话，创建新会话');
      // 生成唯一的会话ID，使用时间戳和随机数确保唯一性
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substr(2, 9);
      const sessionId = `${activeTab}-${timestamp}-${randomSuffix}`;
      
      // 生成更好听的对话标题
      const getChatTitle = (tabKey: string) => {
        const titles = {
          career: ['职业规划咨询', '职业发展探讨', '职场成长指导'],
          offer: ['Offer分析咨询', '薪资谈判指导', '职位评估分析'],
          contract: ['合同审查咨询', '法律条款分析', '权益保护指导'],
          monitor: ['企业监控分析', '公司动态追踪', '风险预警咨询']
        };
        const options = titles[tabKey as keyof typeof titles] || ['专业咨询'];
        return options[Math.floor(Math.random() * options.length)];
      };
      
      const newSession: ChatSession = {
        id: sessionId,
        title: getChatTitle(activeTab),
        messages: [],
        createdAt: timestamp,
        lastMessageAt: timestamp
      };

      // 创建会话
      updateTabChat(activeTab, {
        sessions: [newSession, ...currentChat.sessions],
        currentSessionId: sessionId,
        input: '', // 清空输入框
        isLoading: true
      });

      // 发送消息
      await performSendWithContent(newSession, messageContent);
      return;
    }

    // 有当前会话，直接发送
    updateTabChat(activeTab, { input: '', isLoading: true });
    await performSendWithContent(currentSession, messageContent);
  };

  const performSendWithContent = async (session: ChatSession, messageContent: string) => {
    console.log('performSendWithContent被调用', { sessionId: session.id, messageContent });
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      threadId: session.id,
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
      attachments: uploadedFiles.length > 0 ? uploadedFiles.map(f => f.url) : undefined
    };


    // 更新当前会话的消息，使用函数式更新确保获取最新状态
    setTabChats(prev => {
      const currentChat = prev[activeTab];
      const updatedSessions = currentChat.sessions.map(s => 
        s.id === session.id 
          ? { 
              ...s, 
              messages: [...s.messages, userMessage],
              lastMessageAt: Date.now()
            }
          : s
      );
      return {
        ...prev,
        [activeTab]: { ...currentChat, sessions: updatedSessions }
      };
    });

    // 清空已上传的文件
    setUploadedFiles([]);

    // 如果是第一条消息，更新会话标题
    if (session.messages.length === 0) {
      const title = userMessage.content.length > 20 
        ? userMessage.content.substring(0, 20) + '...' 
        : userMessage.content;
      updateSessionTitle(activeTab, session.id, title);
    }

    try {
      console.log('发送消息到API', { threadId: session.id, content: userMessage.content });
      
      // 检查是否使用支持流式响应的模型
      const isStreamModel = selectedModel.startsWith('bailian/') || selectedModel === 'nbg-v3-33b' || selectedModel.includes('deepseek') || selectedModel.includes('qwen');
      
      if (isStreamModel) {
        // 创建AI回复消息占位符
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          threadId: session.id,
          role: 'assistant',
          content: '',
          timestamp: Date.now()
        };
        
        // 先添加空的AI消息到界面，使用函数式更新确保获取最新状态
        setTabChats(prev => {
          const currentChat = prev[activeTab];
          const updatedSessions = currentChat.sessions.map(s => 
            s.id === session.id 
              ? { 
                  ...s, 
                  messages: [...s.messages, aiMessage],
                  lastMessageAt: Date.now()
                }
              : s
          );
          return {
            ...prev,
            [activeTab]: { ...currentChat, sessions: updatedSessions }
          };
        });
        
        // 检查是否有文档附件，如果有则先分析文档内容
        let enhancedContent = userMessage.content;
        if (userMessage.attachments && userMessage.attachments.length > 0) {
          for (const attachment of userMessage.attachments) {
            if (attachment.startsWith('document:')) {
              const documentId = attachment.replace('document:', '');
              try {
                const analysisResult = await api.getDocumentExtractedInfo(currentUserId, documentId);
                if (analysisResult.extractedInfo) {
                  enhancedContent += `\n\n[文档分析结果]\n${JSON.stringify(analysisResult.extractedInfo, null, 2)}`;
                }
              } catch (error) {
                console.error('获取文档分析结果失败:', error);
              }
            }
          }
        }

        // 使用后台任务队列处理流式响应
        const taskId = addStreamMessageTask(
          {
            userId: currentUserId,
            threadId: session.id,
            content: enhancedContent,
            attachments: userMessage.attachments,
            modelId: selectedModel,
            deepThinking: deepThinkingActive,
            networkSearch: networkSearchActive
          },
          // onChunk - 实时更新UI
          (accumulatedContent: string) => {
            console.log('Stream chunk received:', accumulatedContent);
            // 使用函数式更新确保获取最新状态
            setTabChats(prev => {
              const currentChat = prev[activeTab];
              const updatedSessions = currentChat.sessions.map(s => 
                s.id === session.id 
                  ? { 
                      ...s, 
                      messages: s.messages.map(m => 
                        m.id === aiMessage.id 
                          ? { ...m, content: accumulatedContent }
                          : m
                      ),
                      lastMessageAt: Date.now()
                    }
                  : s
              );
              return {
                ...prev,
                [activeTab]: { ...currentChat, sessions: updatedSessions }
              };
            });
          },
          // onComplete - 完成时停止loading并保存消息到数据库
          async (result: any) => {
            console.log('Stream task completed:', result);
            
            // 保存用户消息和AI回复到数据库（后台保存，不影响UI显示）
            try {
              await api.sendMessage({ 
                userId: currentUserId,
                threadId: session.id, 
                content: userMessage.content,
                attachments: userMessage.attachments,
                modelId: selectedModel,
                deepThinking: deepThinkingActive,
                networkSearch: networkSearchActive
              });
              console.log('消息已保存到数据库');
            } catch (error) {
              console.error('保存流式消息失败:', error);
            }
            
            // 只停止loading状态，不重新获取消息列表
            setTabChats(prev => ({
              ...prev,
              [activeTab]: { ...prev[activeTab], isLoading: false }
            }));
          },
          // onError - 错误处理
          (error: Error) => {
            console.error('Stream task error:', error);
            setTabChats(prev => ({
              ...prev,
              [activeTab]: { ...prev[activeTab], isLoading: false }
            }));
          }
        );
        
        console.log('Stream task queued:', taskId);
      } else {
        // 使用普通API
        const response = await api.sendMessage({ 
          userId: currentUserId,
          threadId: session.id, 
          content: userMessage.content,
          attachments: userMessage.attachments,
          modelId: selectedModel,
          deepThinking: deepThinkingActive,
          networkSearch: networkSearchActive
        });
        console.log('sendMessage API返回的消息', response);
        
        // 直接使用API返回的消息，解析附件
        const processedMessages: ChatMessage[] = response.map((msg: any) => ({
          ...msg,
          attachments: msg.attachments ? JSON.parse(msg.attachments) : undefined
        }));
        
        const currentChatState = tabChats[activeTab];
        console.log('当前聊天状态', currentChatState);
        
        const finalSessions = currentChatState.sessions.map(s => 
          s.id === session.id 
            ? { ...s, messages: processedMessages, lastMessageAt: Date.now() }
            : s
        );
        
        console.log('更新后的会话', finalSessions);
        updateTabChat(activeTab, { sessions: finalSessions, isLoading: false });
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 模拟GPT回复
      const gptMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        threadId: session.id,
        role: 'assistant',
        content: `${currentConfig.introduction.greeting}\n\n关于您提到的"${userMessage.content}"，作为${currentConfig.introduction.title}，我可以为您提供专业的分析和建议。请告诉我更多具体信息，我会为您提供更精准的帮助！`,
        timestamp: Date.now() + 1
      };
      
      const currentChatState = tabChats[activeTab];
      const finalSessions = currentChatState.sessions.map(s => 
        s.id === session.id 
          ? { 
              ...s, 
              messages: [...s.messages, userMessage, gptMessage],
              lastMessageAt: Date.now()
            }
          : s
      );
      
      updateTabChat(activeTab, { sessions: finalSessions, isLoading: false });
    }
  };


  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
  };

  const handleDeepThinking = () => {
    setDeepThinkingActive(!deepThinkingActive);
  };

  const handleNetworkSearch = () => {
    setNetworkSearchActive(!networkSearchActive);
  };

  // 处理文件上传
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 检查文件类型
    const allowedTypes = ['image/', 'application/pdf', 'text/markdown', 'text/plain'];
    const isAllowedType = allowedTypes.some(type => file.type.startsWith(type)) || 
                         file.name.toLowerCase().endsWith('.md') ||
                         file.name.toLowerCase().endsWith('.txt');
    
    if (!isAllowedType) {
      alert('请选择图片、PDF、Markdown或文本文件');
      return;
    }

    // 检查文件大小 (限制为10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB');
      return;
    }

    try {
      // 判断是否为文档类型（需要上传到文档API）
      const isDocumentType = file.name.toLowerCase().endsWith('.md') || 
                            file.name.toLowerCase().endsWith('.txt') ||
                            file.name.toLowerCase().endsWith('.pdf');
      
      if (isDocumentType) {
        // 确定文档类型
        let documentType = 'other';
        if (file.name.toLowerCase().includes('简历') || file.name.toLowerCase().includes('resume')) {
          documentType = 'resume';
        } else if (file.name.toLowerCase().includes('合同') || file.name.toLowerCase().includes('contract')) {
          documentType = 'contract';
        } else if (file.name.toLowerCase().includes('offer')) {
          documentType = 'offer';
        } else if (file.name.toLowerCase().includes('在职') || file.name.toLowerCase().includes('employment')) {
          documentType = 'employment';
        }

        // 上传文档到后端
        console.log('上传文档到后端:', { fileName: file.name, documentType });
        const uploadResult = await api.uploadDocument(currentUserId, file, documentType);
        console.log('文档上传结果:', uploadResult);

        // 如果是MD文档，等待分析完成
        if (file.name.toLowerCase().endsWith('.md') && uploadResult.autoAnalyze) {
          console.log('MD文档自动分析已触发');
          // 可以在这里添加分析进度提示
          setTimeout(async () => {
            try {
              const analysisResult = await api.getDocumentExtractedInfo(currentUserId, uploadResult.document.id);
              console.log('文档分析结果:', analysisResult);
              // 可以在这里显示分析结果
            } catch (error) {
              console.error('获取分析结果失败:', error);
            }
          }, 3000); // 等待3秒后获取分析结果
        }

        // 将文档信息添加到上传文件列表
        const fileInfo = {
          url: `document:${uploadResult.document.id}`,
          type: file.type,
          name: file.name,
          documentId: uploadResult.document.id,
          documentType: documentType
        };
        setUploadedFiles(prev => [...prev, fileInfo]);
      } else {
        // 图片文件，转换为base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          const fileInfo = {
            url: base64,
            type: file.type,
            name: file.name
          };
          setUploadedFiles(prev => [...prev, fileInfo]);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      alert('文件上传失败: ' + (error as Error).message);
    }

    // 清空input
    event.target.value = '';
  };

  // 删除已上传的文件
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 处理PDF查看
  const handleViewPdf = (base64Data: string) => {
    try {
      // 移除data:application/pdf;base64,前缀
      const base64 = base64Data.split(',')[1];
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // 注意：URL.revokeObjectURL(url) 不应立即调用，否则新窗口可能无法加载
    } catch (error) {
      console.error('PDF查看失败:', error);
      alert('PDF查看失败，请检查文件格式');
    }
  };

  // 处理模型选择
  const handleModelSelect = async (modelId: string) => {
    console.log('模型选择被点击:', modelId);
    setSelectedModel(modelId);
    setShowModelSelector(false);
    
    // 保存用户的模型选择到后端
    try {
      await api.updateUserDefaultModel(currentUserId, modelId);
      console.log('用户默认模型已保存:', modelId);
    } catch (error) {
      console.error('保存用户默认模型失败:', error);
    }
  };

  // 处理用户切换
  const handleUserChange = (userId: string) => {
    setCurrentUserId(userId);
    // 清空当前会话状态
    setTabChats({
      career: { sessions: [], currentSessionId: null, input: '', isLoading: false },
      offer: { sessions: [], currentSessionId: null, input: '', isLoading: false },
      contract: { sessions: [], currentSessionId: null, input: '', isLoading: false },
      monitor: { sessions: [], currentSessionId: null, input: '', isLoading: false }
    });
  };

  // 处理案例点击
  const handleExampleClick = (example: { title: string; description: string; icon: string }) => {
    // 确保有当前会话
    if (!currentSession) {
      createNewChat(activeTab);
    }
    
    // 设置输入内容
    updateTabChat(activeTab, { input: example.description });
    
    // 自动发送
    setTimeout(() => {
      send();
    }, 100);
  };

  // 获取当前选择的模型信息
  const currentModel = MODEL_CONFIGS.find(model => model.id === selectedModel) || MODEL_CONFIGS[0];

  // 获取当前Tab的聊天历史
  const currentTabHistory = currentChat.sessions.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  
  // 调试：检查会话数据
  console.log('当前标签页会话数据:', {
    activeTab,
    sessionsCount: currentChat.sessions.length,
    currentSessionId: currentChat.currentSessionId,
    sessions: currentChat.sessions.map(s => ({ id: s.id, title: s.title, messagesCount: s.messages.length }))
  });

  return (
    <div className="ai-career-buddy">
      {/* 任务队列状态显示器 */}
      <TaskQueueStatus />
      
      {/* 悬浮模型选择弹窗 */}
      {showModelSelector && (
        <div className="model-selector-overlay" onClick={() => setShowModelSelector(false)}>
          <div className="model-selector-popup" onClick={(e) => e.stopPropagation()}>
            <div className="model-dropdown-header">
              <span className="dropdown-title">选择模型</span>
              <span className="dropdown-note">私有部署可上传真实数据，外部供应商请勿上传公司内部数据</span>
              <button 
                className="close-btn"
                onClick={() => setShowModelSelector(false)}
              >
                ×
              </button>
            </div>
            
            <div className="model-content">
              {/* Arsenal 私有部署 - 推荐 */}
              <div className="model-group featured">
              <div className="group-header">
                <div className="group-title-section">
                  <span className="group-title">Arsenal 私有部署</span>
                  <span className="group-subtitle">⭐ 推荐使用 · 安全可靠</span>
                </div>
                <span className="group-badge private">可上传真实数据</span>
              </div>
              <div className="model-list">
                {MODEL_CONFIGS.filter(model => model.provider === 'Arsenal').map(model => (
                  <div 
                    key={model.id}
                        className={`model-item ${selectedModel === model.id ? 'selected' : ''} ${model.id === 'nbg-v3-33b' ? 'recommended' : ''}`}
                    onClick={() => handleModelSelect(model.id)}
                  >
                    <div className="model-item-main">
                      <div className="model-item-header">
                        <span className="model-item-name">{model.name}</span>
                        {model.id === 'nbg-v3-33b' && <span className="recommended-badge">默认</span>}
                      </div>
                      <div className="model-item-description">{model.description}</div>
                    </div>
                    <div className="model-item-meta">
                      <span className="model-item-type">聊天</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 百炼 外部供应商 - 流式响应 */}
            <div className="model-group">
              <div className="group-header">
                <div className="group-title-section">
                  <span className="group-title">百炼 外部供应商</span>
                  <span className="group-subtitle">🌊 流式响应 · 实时输出</span>
                </div>
                <span className="group-badge external">请勿上传内部数据</span>
              </div>
              <div className="model-list">
                {MODEL_CONFIGS.filter(model => model.provider === '百炼').map(model => (
                  <div 
                    key={model.id}
                    className={`model-item ${selectedModel === model.id ? 'selected' : ''} ${model.id === 'nbg-v3-33b' ? 'streaming' : ''}`}
                    onClick={() => handleModelSelect(model.id)}
                  >
                    <div className="model-item-main">
                      <div className="model-item-header">
                        <span className="model-item-name">{model.name}</span>
                        {model.id === 'nbg-v3-33b' && <span className="streaming-badge">流式</span>}
                      </div>
                      <div className="model-item-description">{model.description}</div>
                    </div>
                    <div className="model-item-meta">
                      <span className="model-item-type">聊天</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 微软Azure 外部供应商 */}
            <div className="model-group compact">
              <div className="group-header">
                <div className="group-title-section">
                  <span className="group-title">微软Azure</span>
                  <span className="group-subtitle">外部供应商</span>
                </div>
                <span className="group-badge external">请勿上传内部数据</span>
              </div>
              <div className="model-list">
                {MODEL_CONFIGS.filter(model => model.provider === '微软Azure').map(model => (
                  <div 
                    key={model.id}
                    className={`model-item compact ${selectedModel === model.id ? 'selected' : ''}`}
                    onClick={() => handleModelSelect(model.id)}
                  >
                    <span className="model-item-name">{model.name}</span>
                    <span className="model-item-type">{model.type}</span>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
      {/* 左侧聊天记录栏 */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {!sidebarCollapsed && (
        <div className="sidebar-header">
          <div className="sidebar-title">
            <div className="ai-icon">A</div>
            <span>AI职场管家</span>
          </div>
          <div className="sidebar-date">{currentConfig.label}</div>
          <div className="sidebar-time">
            {currentTime.toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })}
          </div>
          
          {/* 模型选择器 */}
          <div className="model-selector">
            <div className="current-model" onClick={() => setShowModelSelector(!showModelSelector)}>
              <div className="model-info">
                <span className="model-label">当前模型</span>
                <span className="model-name">{currentModel.name}</span>
              </div>
              <div className="model-actions">
                <span className={`model-badge ${currentModel.isPrivate ? 'private' : 'external'}`}>
                  {currentModel.isPrivate ? '私有' : '外部'}
                </span>
                <button className="model-toggle-btn">
                  {showModelSelector ? '收起' : '切换'}
                </button>
              </div>
            </div>
          </div>
          
          <button 
            className="new-chat-button"
            onClick={() => createNewChat(activeTab)}
          >
            <span className="new-chat-icon">+</span>
            <span>新建对话</span>
          </button>
          
          <div className="chat-history">
            {currentTabHistory.length === 0 ? (
              <div className="empty-history">
                <p>暂无聊天记录</p>
                <p>点击"新建对话"开始聊天</p>
              </div>
            ) : (
              currentTabHistory.map((session, index) => {
                // 强制确保只有当前选中的会话才显示为active
                const isActive = currentChat.currentSessionId === session.id && currentChat.currentSessionId !== null;
                console.log('渲染聊天历史项:', { 
                  sessionId: session.id, 
                  currentSessionId: currentChat.currentSessionId, 
                  isActive,
                  index,
                  activeTab,
                  强制检查: currentChat.currentSessionId === session.id,
                  非空检查: currentChat.currentSessionId !== null
                });
                return (
                  <div 
                    key={session.id} 
                    className={`chat-history-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      console.log('点击会话:', session.id, '当前标签:', activeTab);
                      // 确保只有当前点击的会话被选中
                      setTabChats(prev => ({
                        ...prev,
                        [activeTab]: {
                          ...prev[activeTab],
                          currentSessionId: session.id
                        }
                      }));
                    }}
                  >
                    <div className="chat-title">{session.title}</div>
                    <div className="chat-time">
                      {new Date(session.lastMessageAt).toLocaleString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        )}
        
        {/* 侧边栏折叠控制按钮 */}
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* 右侧主内容区 */}
      <div className="main-content">
        <div className="content-header">
          <div className="header-top">
            <h1 className="main-title">AI职场管家———————高效、轻松的职业生涯</h1>
            
            {/* 用户选择器 - 右上角 */}
            <UserSelector
              currentUserId={currentUserId}
              onUserChange={handleUserChange}
              className="header-user-selector"
            />
          </div>
          
          <div className="tab-navigation">
            {Object.values(TAB_CONFIGS).map(tab => (
              <button
                key={tab.key}
                className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.key)}
                style={activeTab === tab.key ? { 
                  background: tab.gradient,
                  color: 'white',
                  boxShadow: `0 4px 12px ${tab.color}40`
                } : {}}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 聊天消息区域和可视化面板 */}
        <div className="chat-container">
          <div className="chat-content">
            <div className="messages-area">
            {!currentSession || currentSession.messages.length === 0 ? (
              <div className="welcome-message">
                <div className="welcome-icon" style={{ background: currentConfig.gradient }}>
                  {currentConfig.icon}
                </div>
                <h3>{currentConfig.introduction.title}</h3>
                <p>{currentConfig.introduction.description}</p>
                <div className="capabilities-section">
                  <h4>我可以为您提供：</h4>
                  <ul>
                    {currentConfig.introduction.capabilities.map((capability, index) => (
                      <li key={index}>{capability}</li>
                    ))}
                  </ul>
                </div>
                <p className="greeting-text">{currentConfig.introduction.greeting}</p>
                
                {/* 案例示例 */}
                <div className="examples-section">
                  <h4>💡 常见问题示例</h4>
                  <div className="examples-grid">
                    {currentConfig.examples.map((example, index) => (
                      <div 
                        key={index}
                        className="example-card"
                        onClick={() => handleExampleClick(example)}
                      >
                        <div className="example-icon">{example.icon}</div>
                        <div className="example-content">
                          <h5 className="example-title">{example.title}</h5>
                          <p className="example-description">{example.description}</p>
                        </div>
                        <div className="example-arrow">→</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              currentSession.messages.map((message) => (
                <div key={message.id} className={`message ${message.role}`}>
                  <div 
                    className="message-avatar"
                    style={message.role === 'assistant' ? { background: currentConfig.gradient } : {}}
                  >
                    {message.role === 'user' ? '👤' : currentConfig.icon}
                  </div>
                  <div className="message-content">
                    {message.role === 'assistant' ? (
                      <FormattedText content={message.content} className="ai-message-text" />
                    ) : (
                      <div className="message-text">{message.content}</div>
                    )}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="message-attachments">
                        {message.attachments.map((attachment, index) => {
                          // 检查是否为图片
                          if (attachment.startsWith('data:image/')) {
                            return (
                              <div key={index} className="attachment-image">
                                <img src={attachment} alt={`图片附件 ${index + 1}`} />
                              </div>
                            );
                          }
                          // 检查是否为PDF
                          if (attachment.startsWith('data:application/pdf')) {
                            return (
                              <div key={index} className="attachment-pdf">
                                <div className="pdf-display">
                                  <div className="pdf-icon-large">📄</div>
                                  <div className="pdf-text">PDF文档</div>
                                  <button 
                                    className="view-pdf-btn"
                                    onClick={() => handleViewPdf(attachment)}
                                  >
                                    查看PDF
                                  </button>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                    <div className="message-time">
                      {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {currentChat.isLoading && (
              <div className="message assistant">
                <div className="message-avatar" style={{ background: currentConfig.gradient }}>
                  {currentConfig.icon}
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
            </div>
            
            {/* 可视化面板 */}
            <div className={`visualization-area ${rightPanelCollapsed ? 'collapsed' : ''}`}>
              {!rightPanelCollapsed && (
                <VisualizationPanel
                  activeTab={activeTab}
                  userInput={currentSession?.messages.filter(m => m.role === 'user').pop()?.content || currentChat.input || ''}
                  aiResponse={currentSession?.messages.filter(m => m.role === 'assistant').pop()?.content || ''}
                />
              )}
              
              {/* 右侧面板折叠控制按钮 */}
              <button 
                className="right-panel-toggle"
                onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                title={rightPanelCollapsed ? '展开可视化面板' : '折叠可视化面板'}
              >
                {rightPanelCollapsed ? '←' : '→'}
              </button>
            </div>
          </div>

          <div className="input-bar">
            <div className="input-buttons">
            <button 
              className={`action-button deep-thinking ${deepThinkingActive ? 'active' : ''}`}
              onClick={handleDeepThinking}
            >
              <span className="button-icon">🧠</span>
              <span>深度思考</span>
            </button>
            <button 
              className={`action-button network-search ${networkSearchActive ? 'active' : ''}`}
              onClick={handleNetworkSearch}
            >
              <span className="button-icon">🌐</span>
              <span>联网搜索</span>
            </button>
            </div>
            
            <div className="input-field-container">
            {/* 文件预览区域 */}
            {uploadedFiles.length > 0 && (
              <div className="file-preview-container">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="file-preview">
                    {file.type.startsWith('image/') ? (
                      <img src={file.url} alt={`预览 ${index + 1}`} />
                    ) : file.type === 'application/pdf' ? (
                      <div className="pdf-preview">
                        <div className="pdf-icon">📄</div>
                        <div className="pdf-name">{file.name}</div>
                      </div>
                    ) : null}
                    <button 
                      className="remove-file-btn"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <textarea
              className="input-field"
              value={currentChat.input}
              onChange={(e) => updateTabChat(activeTab, { input: e.target.value })}
              placeholder={`向${currentConfig.introduction.title}提问...`}
              rows={1}
              disabled={currentChat.isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            </div>
            
            <div className="input-icons">
            <button 
              className="icon-button attachment"
              onClick={handleFileUpload}
              title="上传文件（图片/PDF/MD/TXT）"
            >
              📎
            </button>
            <button 
              className="icon-button send" 
              onClick={send}
              disabled={currentChat.isLoading || (!currentChat.input.trim() && uploadedFiles.length === 0)}
              style={{ background: currentConfig.gradient }}
            >
              ⬆️
            </button>
            </div>
          </div>
          
          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,.md,.txt,text/markdown,text/plain"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}