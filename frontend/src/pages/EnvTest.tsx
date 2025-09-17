import React from 'react';
import { debugEnv } from '../debug-env';

const EnvTest: React.FC = () => {
  const envInfo = debugEnv();

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>环境变量测试页面</h1>
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <h2>当前环境变量:</h2>
        <ul>
          <li><strong>VITE_API_BASE_URL:</strong> {envInfo.VITE_API_BASE_URL}</li>
          <li><strong>MODE:</strong> {envInfo.MODE}</li>
          <li><strong>DEV:</strong> {envInfo.DEV ? 'true' : 'false'}</li>
          <li><strong>PROD:</strong> {envInfo.PROD ? 'true' : 'false'}</li>
          <li><strong>BASE_URL:</strong> {envInfo.BASE_URL}</li>
        </ul>
        
        <h3>完整环境对象:</h3>
        <pre style={{ background: '#fff', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(envInfo.allEnv, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => {
            console.log('手动测试API调用...');
            fetch('/api/health')
              .then(res => res.json())
              .then(data => console.log('API响应:', data))
              .catch(err => console.error('API错误:', err));
          }}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          测试API调用
        </button>
      </div>
    </div>
  );
};

export default EnvTest;
