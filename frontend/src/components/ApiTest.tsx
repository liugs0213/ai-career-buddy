import React, { useState } from 'react';
import { Button, Card, Typography, Space, Alert, Divider } from 'antd';
import { api } from '../api';

const { Title, Text, Paragraph } = Typography;

const ApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    try {
      console.log(`🧪 开始测试: ${testName}`);
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      const testResult = {
        name: testName,
        status: 'success',
        duration,
        result: result,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [testResult, ...prev]);
      console.log(`✅ 测试成功: ${testName}`, result);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const testResult = {
        name: testName,
        status: 'error',
        duration,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [testResult, ...prev]);
      console.error(`❌ 测试失败: ${testName}`, error);
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    console.log('🚀 开始API连接测试...');
    
    // 测试1: 健康检查
    await runTest('健康检查', () => api.health());
    
    // 测试2: 发送消息
    await runTest('发送消息', () => 
      api.sendMessage({
        userId: 'test-user',
        threadId: 'test-thread',
        content: '这是一条测试消息',
        attachments: [],
        modelId: 'azure/gpt-5-mini',
        deepThinking: false,
        networkSearch: false
      })
    );
    
    // 测试3: 获取消息列表
    await runTest('获取消息列表', () => 
      api.listMessages('test-thread')
    );
    
    // 测试4: 获取笔记列表
    await runTest('获取笔记列表', () => 
      api.listNotes()
    );
    
    setIsLoading(false);
    console.log('🎉 API连接测试完成!');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card 
      title={
        <Space>
          <span>🧪 API连接测试</span>
          <Text type="secondary">测试前端到远程API的连接</Text>
        </Space>
      }
      extra={
        <Space>
          <Button 
            type="primary" 
            onClick={runAllTests}
            loading={isLoading}
          >
            运行所有测试
          </Button>
          <Button onClick={clearResults}>
            清空结果
          </Button>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>📡 测试说明</Title>
        <Paragraph>
          这个测试组件会直接调用API函数，测试前端到远程API服务器的连接。
          如果curl可以但前端无返回，这个测试会帮助定位问题。
        </Paragraph>
        
        <Alert
          message="测试目标"
          description="远程API服务器: http://10.98.208.222:80"
          type="info"
          style={{ marginBottom: 16 }}
        />
      </div>

      <Divider />

      <div>
        <Title level={5}>📋 测试结果</Title>
        {testResults.length === 0 ? (
          <Text type="secondary">暂无测试结果，点击"运行所有测试"开始测试</Text>
        ) : (
          testResults.map((result, index) => (
            <Card 
              key={index}
              size="small" 
              style={{ 
                marginBottom: 8,
                borderLeft: result.status === 'success' ? '4px solid #52c41a' : '4px solid #ff4d4f'
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space>
                  <Text strong>{result.name}</Text>
                  <Text type="secondary">({result.timestamp})</Text>
                  <Text type="secondary">耗时: {result.duration}ms</Text>
                </Space>
                
                {result.status === 'success' ? (
                  <Alert
                    message="✅ 测试成功"
                    description={
                      <div>
                        <Text>响应数据: </Text>
                        <pre style={{ fontSize: '12px', margin: 0 }}>
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                      </div>
                    }
                    type="success"
                    size="small"
                  />
                ) : (
                  <Alert
                    message="❌ 测试失败"
                    description={
                      <div>
                        <Text>错误信息: {result.error}</Text>
                      </div>
                    }
                    type="error"
                    size="small"
                  />
                )}
              </Space>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
};

export default ApiTest;
