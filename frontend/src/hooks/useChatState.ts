import { useState, useCallback, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  lastMessageAt: number;
}

export interface TabChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  input: string;
  isLoading: boolean;
  error?: string;
}

type TabKey = 'career' | 'offer' | 'contract' | 'monitor';

export const useChatState = () => {
  const [tabChats, setTabChats] = useState<Record<TabKey, TabChatState>>({
    career: { sessions: [], currentSessionId: null, input: '', isLoading: false },
    offer: { sessions: [], currentSessionId: null, input: '', isLoading: false },
    contract: { sessions: [], currentSessionId: null, input: '', isLoading: false },
    monitor: { sessions: [], currentSessionId: null, input: '', isLoading: false }
  });

  const [activeTab, setActiveTab] = useState<TabKey>('contract');
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // 防抖的状态更新函数
  const debouncedUpdate = useCallback((tabKey: TabKey, updates: Partial<TabChatState>) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      setTabChats(prev => ({
        ...prev,
        [tabKey]: { ...prev[tabKey], ...updates }
      }));
    }, 50); // 50ms 防抖
  }, []);

  // 安全的状态更新函数
  const updateTabChat = useCallback((tabKey: TabKey, updates: Partial<TabChatState>) => {
    setTabChats(prev => {
      const currentState = prev[tabKey];
      if (!currentState) {
        console.warn(`尝试更新不存在的标签页: ${tabKey}`);
        return prev;
      }
      
      return {
        ...prev,
        [tabKey]: { ...currentState, ...updates }
      };
    });
  }, []);

  // 添加会话
  const addSession = useCallback((tabKey: TabKey, session: ChatSession) => {
    setTabChats(prev => {
      const currentState = prev[tabKey];
      const existingSession = currentState.sessions.find(s => s.id === session.id);
      
      if (existingSession) {
        console.warn(`会话已存在: ${session.id}`);
        return prev;
      }
      
      const updatedSessions = [session, ...currentState.sessions].sort(
        (a, b) => b.lastMessageAt - a.lastMessageAt
      );
      
      return {
        ...prev,
        [tabKey]: {
          ...currentState,
          sessions: updatedSessions,
          currentSessionId: currentState.currentSessionId || session.id
        }
      };
    });
  }, []);

  // 更新会话消息
  const updateSessionMessages = useCallback((
    tabKey: TabKey, 
    sessionId: string, 
    messages: ChatMessage[]
  ) => {
    setTabChats(prev => {
      const currentState = prev[tabKey];
      const updatedSessions = currentState.sessions.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              messages,
              lastMessageAt: Math.max(...messages.map(m => m.timestamp), session.lastMessageAt)
            }
          : session
      );
      
      return {
        ...prev,
        [tabKey]: { ...currentState, sessions: updatedSessions }
      };
    });
  }, []);

  // 添加消息到会话
  const addMessageToSession = useCallback((
    tabKey: TabKey,
    sessionId: string,
    message: ChatMessage
  ) => {
    setTabChats(prev => {
      const currentState = prev[tabKey];
      const updatedSessions = currentState.sessions.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              messages: [...session.messages, message],
              lastMessageAt: message.timestamp
            }
          : session
      );
      
      return {
        ...prev,
        [tabKey]: { ...currentState, sessions: updatedSessions }
      };
    });
  }, []);

  // 更新消息内容（用于流式更新）
  const updateMessageContent = useCallback((
    tabKey: TabKey,
    sessionId: string,
    messageId: string,
    content: string
  ) => {
    setTabChats(prev => {
      const currentState = prev[tabKey];
      const updatedSessions = currentState.sessions.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              messages: session.messages.map(msg => 
                msg.id === messageId 
                  ? { ...msg, content }
                  : msg
              )
            }
          : session
      );
      
      return {
        ...prev,
        [tabKey]: { ...currentState, sessions: updatedSessions }
      };
    });
  }, []);

  // 设置当前会话
  const setCurrentSession = useCallback((tabKey: TabKey, sessionId: string | null) => {
    updateTabChat(tabKey, { currentSessionId: sessionId });
  }, [updateTabChat]);

  // 设置加载状态
  const setLoading = useCallback((tabKey: TabKey, isLoading: boolean) => {
    updateTabChat(tabKey, { isLoading });
  }, [updateTabChat]);

  // 设置错误状态
  const setError = useCallback((tabKey: TabKey, error?: string) => {
    updateTabChat(tabKey, { error });
  }, [updateTabChat]);

  // 批量加载历史会话
  const loadHistorySessions = useCallback((tabKey: TabKey, sessions: ChatSession[]) => {
    setTabChats(prev => {
      const currentState = prev[tabKey];
      
      // 去重处理
      const sessionMap = new Map<string, ChatSession>();
      
      // 先添加现有会话
      currentState.sessions.forEach(session => {
        sessionMap.set(session.id, session);
      });
      
      // 添加新会话，按时间排序
      sessions.forEach(session => {
        if (!sessionMap.has(session.id)) {
          sessionMap.set(session.id, session);
        }
      });
      
      const mergedSessions = Array.from(sessionMap.values()).sort(
        (a, b) => b.lastMessageAt - a.lastMessageAt
      );
      
      return {
        ...prev,
        [tabKey]: {
          ...currentState,
          sessions: mergedSessions,
          // 如果没有当前会话且有会话存在，选择最新的
          currentSessionId: currentState.currentSessionId || (mergedSessions.length > 0 ? mergedSessions[0].id : null)
        }
      };
    });
  }, []);

  // 清理函数
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const currentChat = tabChats[activeTab];
  const currentSession = currentChat?.sessions.find(s => s.id === currentChat.currentSessionId);

  return {
    // 状态
    tabChats,
    activeTab,
    currentChat,
    currentSession,
    
    // 操作函数
    setActiveTab,
    updateTabChat,
    addSession,
    updateSessionMessages,
    addMessageToSession,
    updateMessageContent,
    setCurrentSession,
    setLoading,
    setError,
    loadHistorySessions,
    debouncedUpdate
  };
};

