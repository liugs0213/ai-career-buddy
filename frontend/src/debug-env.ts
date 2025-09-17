// 环境变量调试工具
export const debugEnv = () => {
  const envInfo = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    BASE_URL: import.meta.env.BASE_URL,
    allEnv: import.meta.env
  };

  console.log('🔍 环境变量调试信息:', envInfo);

  // 在页面上也显示环境变量信息
  const debugDiv = document.createElement('div');
  debugDiv.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    max-width: 300px;
  `;
  debugDiv.innerHTML = `
    <div><strong>环境变量调试:</strong></div>
    <div>VITE_API_BASE_URL: ${envInfo.VITE_API_BASE_URL}</div>
    <div>MODE: ${envInfo.MODE}</div>
    <div>DEV: ${envInfo.DEV}</div>
    <div>PROD: ${envInfo.PROD}</div>
  `;

  document.body.appendChild(debugDiv);

  return envInfo;
};
