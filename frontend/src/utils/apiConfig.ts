/**
 * API配置工具
 * 统一管理API基础URL，支持开发和生产环境
 */

/**
 * 获取API基础URL
 * @returns API基础URL
 */
export const getApiBaseURL = (): string => {
  // 生产环境：使用相对路径，通过nginx代理
  if (import.meta.env.PROD) {
    return '';
  }
  // 开发环境：使用localhost
  return 'http://localhost:8080';
};

/**
 * 获取完整的API端点URL
 * @param endpoint API端点路径（如 '/api/messages'）
 * @returns 完整的API URL
 */
export const getApiURL = (endpoint: string): string => {
  const baseURL = getApiBaseURL();
  return `${baseURL}${endpoint}`;
};

/**
 * 获取Stream API URL
 * @returns Stream API的完整URL
 */
export const getStreamApiURL = (): string => {
  return getApiURL('/api/messages/stream');
};

/**
 * 获取健康检查API URL
 * @returns 健康检查API的完整URL
 */
export const getHealthApiURL = (): string => {
  return getApiURL('/health');
};

/**
 * 环境信息
 */
export const envInfo = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseURL: getApiBaseURL(),
};

// 调试信息
if (import.meta.env.DEV) {
  console.log('=== API配置信息 ===');
  console.log('环境模式:', envInfo.mode);
  console.log('是否开发环境:', envInfo.isDev);
  console.log('是否生产环境:', envInfo.isProd);
  console.log('API基础URL:', envInfo.baseURL);
  console.log('Stream API URL:', getStreamApiURL());
  console.log('健康检查URL:', getHealthApiURL());
  console.log('==================');
}
