import React, { useState } from 'react';
import { Card, Button, Space, Tag, Typography, Alert, Divider } from 'antd';
import { InfoCircleOutlined, BugOutlined, ApiOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const EnvDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const envInfo = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    BASE_URL: import.meta.env.BASE_URL,
    allEnv: import.meta.env
  };

  const testApiConnection = async () => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${baseURL}/api/health`);
      const data = await response.json();
      
      console.log('🔍 API连接测试成功:', data);
      alert(`API连接成功！\n状态: ${response.status}\n响应: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('🔍 API连接测试失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`API连接失败！\n错误: ${errorMessage}`);
    }
  };

  const testStreamApi = async () => {
    try {
      const baseURL = 'http://localhost:8080';
      const response = await fetch(`${baseURL}/api/messages/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user',
          threadId: 'test-thread',
          content: '测试消息',
          modelId: 'deepseek-v3-0324',
          deepThinking: false,
          networkSearch: false
        })
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        content += chunk;
        console.log('📦 流式响应块:', chunk);
      }

      console.log('🔍 流式API测试完成:', content);
      alert(`流式API测试成功！\n响应长度: ${content.length}\n内容预览: ${content.substring(0, 100)}...`);
    } catch (error) {
      console.error('🔍 流式API测试失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`流式API测试失败！\n错误: ${errorMessage}`);
    }
  };

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
      <Card
        title={
          <Space>
            <BugOutlined />
            环境调试
            <Button
              type="text"
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => setIsVisible(!isVisible)}
            />
          </Space>
        }
        size="small"
        style={{ 
          width: '350px', 
          maxHeight: '600px',
          display: isVisible ? 'block' : 'none'
        }}
      >
        <div style={{ maxHeight: '500px', overflow: 'auto' }}>
          <Alert
            message="环境信息"
            description="当前前端环境配置"
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          <div style={{ marginBottom: '16px' }}>
            <Text strong>API 基础URL:</Text>
            <br />
            <Text code>{envInfo.VITE_API_BASE_URL || '未设置'}</Text>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Text strong>构建模式:</Text>
            <br />
            <Space>
              <Tag color={envInfo.DEV ? 'green' : 'blue'}>
                {envInfo.MODE}
              </Tag>
              <Tag color={envInfo.DEV ? 'green' : 'red'}>
                {envInfo.DEV ? '开发' : '生产'}
              </Tag>
            </Space>
          </div>

          <Divider />

          <div style={{ marginBottom: '16px' }}>
            <Text strong>API 测试:</Text>
            <br />
            <Space direction="vertical" style={{ width: '100%', marginTop: '8px' }}>
              <Button
                type="primary"
                size="small"
                icon={<ApiOutlined />}
                onClick={testApiConnection}
                block
              >
                测试健康检查
              </Button>
              <Button
                type="default"
                size="small"
                icon={<ApiOutlined />}
                onClick={testStreamApi}
                block
              >
                测试流式API
              </Button>
            </Space>
          </div>

          <Divider />

          <div>
            <Text strong>完整环境变量:</Text>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '8px', 
              borderRadius: '4px',
              fontSize: '10px',
              maxHeight: '150px',
              overflow: 'auto',
              marginTop: '8px'
            }}>
              {JSON.stringify(envInfo.allEnv, null, 2)}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EnvDebugger;
