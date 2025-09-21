import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Card, Typography } from 'antd';
import { ReloadOutlined, BugOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary捕获到错误:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 调用外部错误处理回调
    this.props.onError?.(error, errorInfo);

    // 发送错误报告到服务器（可选）
    this.reportErrorToService(error, errorInfo);
  }

  private reportErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // 这里可以集成错误监控服务，如Sentry
      console.log('错误报告:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    } catch (reportError) {
      console.error('发送错误报告失败:', reportError);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <Card 
          style={{ 
            margin: '20px auto', 
            maxWidth: 600,
            textAlign: 'center'
          }}
        >
          <BugOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 16 }} />
          
          <Title level={3} type="danger">
            出现了一个错误
          </Title>
          
          <Paragraph>
            抱歉，应用程序遇到了意外错误。请尝试刷新页面或联系技术支持。
          </Paragraph>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Alert
              message="开发模式错误详情"
              description={
                <div style={{ textAlign: 'left' }}>
                  <Text code>{this.state.error.message}</Text>
                  <br />
                  <details style={{ marginTop: 8 }}>
                    <summary>错误堆栈</summary>
                    <pre style={{ 
                      fontSize: 12, 
                      background: '#f5f5f5', 
                      padding: 8, 
                      borderRadius: 4,
                      overflow: 'auto',
                      maxHeight: 200
                    }}>
                      {this.state.error.stack}
                    </pre>
                  </details>
                </div>
              }
              type="error"
              showIcon
              style={{ margin: '16px 0', textAlign: 'left' }}
            />
          )}

          <div style={{ marginTop: 24 }}>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={this.handleReload}
              style={{ marginRight: 8 }}
            >
              刷新页面
            </Button>
            
            <Button onClick={this.handleReset}>
              重试
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

