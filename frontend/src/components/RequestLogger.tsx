import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, Typography, Collapse, Badge } from 'antd';
import { ReloadOutlined, ClearOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'request' | 'response' | 'error' | 'stream';
  level: 'info' | 'error' | 'warn';
  message: string;
  data?: any;
  requestId?: string;
}

const RequestLogger: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // 监听控制台日志
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (level: 'info' | 'error' | 'warn', ...args: any[]) => {
      const message = args.join(' ');
      
      // 解析日志类型和请求ID
      let type: 'request' | 'response' | 'error' | 'stream' = 'request';
      let requestId: string | undefined;
      
      if (message.includes('🚀')) {
        type = 'request';
        const match = message.match(/\[([a-z0-9]+)\]/);
        if (match) requestId = match[1];
      } else if (message.includes('✅')) {
        type = 'response';
        const match = message.match(/\[([a-z0-9]+)\]/);
        if (match) requestId = match[1];
      } else if (message.includes('❌')) {
        type = 'error';
        const match = message.match(/\[([a-z0-9]+)\]/);
        if (match) requestId = match[1];
      } else if (message.includes('📦') || message.includes('🏁')) {
        type = 'stream';
        const match = message.match(/\[([a-z0-9]+)\]/);
        if (match) requestId = match[1];
      }

      const logEntry: LogEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        type,
        level,
        message,
        data: args.length > 1 ? args[1] : undefined,
        requestId
      };

      setLogs(prev => {
        const newLogs = [logEntry, ...prev.slice(0, 99)]; // 保留最近100条
        return newLogs;
      });
    };

    console.log = (...args) => {
      originalLog.apply(console, args);
      addLog('info', ...args);
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      addLog('error', ...args);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      addLog('warn', ...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'request': return 'blue';
      case 'response': return 'green';
      case 'error': return 'red';
      case 'stream': return 'purple';
      default: return 'default';
    }
  };

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'request': return '🚀';
      case 'response': return '✅';
      case 'error': return '❌';
      case 'stream': return '📦';
      default: return '📋';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'red';
      case 'warn': return 'orange';
      case 'info': return 'blue';
      default: return 'default';
    }
  };

  const formatLogData = (data: any) => {
    if (!data) return null;
    
    if (typeof data === 'string') {
      return <Text code>{data}</Text>;
    }
    
    if (typeof data === 'object') {
      return (
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '8px', 
          borderRadius: '4px',
          fontSize: '12px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    }
    
    return <Text>{String(data)}</Text>;
  };

  const requestLogs = logs.filter(log => log.type === 'request');
  const responseLogs = logs.filter(log => log.type === 'response');
  const errorLogs = logs.filter(log => log.type === 'error');
  const streamLogs = logs.filter(log => log.type === 'stream');

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <Card
        title={
          <Space>
            <Badge count={logs.length} size="small">
              <EyeOutlined />
            </Badge>
            请求日志
            <Button
              type="text"
              size="small"
              icon={isVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => setIsVisible(!isVisible)}
            />
          </Space>
        }
        size="small"
        style={{ 
          width: '400px', 
          maxHeight: '500px',
          display: isVisible ? 'block' : 'none'
        }}
        extra={
          <Space>
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={clearLogs}
            />
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
            />
          </Space>
        }
      >
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          <Collapse size="small" ghost>
            {requestLogs.length > 0 && (
              <Panel header={`🚀 请求 (${requestLogs.length})`} key="requests">
                {requestLogs.slice(0, 10).map(log => (
                  <div key={log.id} style={{ marginBottom: '8px', fontSize: '12px' }}>
                    <Space>
                      <Tag color={getLogTypeColor(log.type)} size="small">
                        {getLogTypeIcon(log.type)}
                      </Tag>
                      <Text type="secondary">{log.timestamp}</Text>
                      {log.requestId && (
                        <Tag size="small">{log.requestId}</Tag>
                      )}
                    </Space>
                    <div style={{ marginTop: '4px' }}>
                      <Text code>{log.message}</Text>
                      {log.data && formatLogData(log.data)}
                    </div>
                  </div>
                ))}
              </Panel>
            )}
            
            {responseLogs.length > 0 && (
              <Panel header={`✅ 响应 (${responseLogs.length})`} key="responses">
                {responseLogs.slice(0, 10).map(log => (
                  <div key={log.id} style={{ marginBottom: '8px', fontSize: '12px' }}>
                    <Space>
                      <Tag color={getLogTypeColor(log.type)} size="small">
                        {getLogTypeIcon(log.type)}
                      </Tag>
                      <Text type="secondary">{log.timestamp}</Text>
                      {log.requestId && (
                        <Tag size="small">{log.requestId}</Tag>
                      )}
                    </Space>
                    <div style={{ marginTop: '4px' }}>
                      <Text code>{log.message}</Text>
                      {log.data && formatLogData(log.data)}
                    </div>
                  </div>
                ))}
              </Panel>
            )}
            
            {errorLogs.length > 0 && (
              <Panel header={`❌ 错误 (${errorLogs.length})`} key="errors">
                {errorLogs.slice(0, 5).map(log => (
                  <div key={log.id} style={{ marginBottom: '8px', fontSize: '12px' }}>
                    <Space>
                      <Tag color={getLogTypeColor(log.type)} size="small">
                        {getLogTypeIcon(log.type)}
                      </Tag>
                      <Text type="secondary">{log.timestamp}</Text>
                      {log.requestId && (
                        <Tag size="small">{log.requestId}</Tag>
                      )}
                    </Space>
                    <div style={{ marginTop: '4px' }}>
                      <Text code>{log.message}</Text>
                      {log.data && formatLogData(log.data)}
                    </div>
                  </div>
                ))}
              </Panel>
            )}
            
            {streamLogs.length > 0 && (
              <Panel header={`📦 流式 (${streamLogs.length})`} key="streams">
                {streamLogs.slice(0, 10).map(log => (
                  <div key={log.id} style={{ marginBottom: '8px', fontSize: '12px' }}>
                    <Space>
                      <Tag color={getLogTypeColor(log.type)} size="small">
                        {getLogTypeIcon(log.type)}
                      </Tag>
                      <Text type="secondary">{log.timestamp}</Text>
                      {log.requestId && (
                        <Tag size="small">{log.requestId}</Tag>
                      )}
                    </Space>
                    <div style={{ marginTop: '4px' }}>
                      <Text code>{log.message}</Text>
                      {log.data && formatLogData(log.data)}
                    </div>
                  </div>
                ))}
              </Panel>
            )}
          </Collapse>
        </div>
      </Card>
    </div>
  );
};

export default RequestLogger;