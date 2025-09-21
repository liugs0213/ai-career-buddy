import axios from 'axios';
import { getApiBaseURL } from '../utils/apiConfig';

// 使用统一的API配置
const baseURL = getApiBaseURL();

console.log('=== API配置信息 ===');
console.log('最终使用的API Base URL:', baseURL);
console.log('========================');

export const http = axios.create({ 
  baseURL,
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
  }
});

// 添加请求拦截器
http.interceptors.request.use(
  (config) => {
    console.log('🚀 发送请求:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ 请求错误:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器
http.interceptors.response.use(
  (response) => {
    console.log('✅ 收到响应:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ 响应错误:', error.response?.status, error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 连接被拒绝，请检查后端服务是否启动');
    }
    return Promise.reject(error);
  }
);

export type Message = { id?: number; role: string; content: string; threadId?: string; createdAt?: string; attachments?: string };
export type Note = { id?: number; title: string; content: string; updatedAt?: string };

export const api = {
  health: () => http.get('/health').then(r => r.data),
  sendMessage: (p: { userId: string; threadId?: string; content: string; attachments?: string[]; modelId?: string; deepThinking?: boolean; networkSearch?: boolean }) => http.post('/api/messages', p).then(r => r.data),
  streamMessage: (p: { userId: string; threadId?: string; content: string; attachments?: string[]; modelId?: string; deepThinking?: boolean; networkSearch?: boolean }) => http.post('/api/messages/stream', p, { responseType: 'text' }),
  listMessages: (threadId?: string) => http.get('/api/messages', { params: { threadId } }).then(r => r.data as Message[]),
  extractPDFText: (base64Data: string) => http.post('/api/pdf/extract', { base64Data }).then(r => r.data),
  listNotes: () => http.get('/api/notes').then(r => r.data as Note[]),
  createNote: (n: Partial<Note>) => http.post('/api/notes', n).then(r => r.data as Note),
  updateNote: (id: number, n: Partial<Note>) => http.put(`/api/notes/${id}`, n).then(r => r.data as Note),
  deleteNote: (id: number) => http.delete(`/api/notes/${id}`).then(r => r.data),
  getCareerHistory: (userId: string, category?: string) => http.get(`/api/users/${userId}/career-history`, { params: { category } }).then(r => r.data),
  
  // 用户模型偏好相关
  getUserDefaultModel: (userId: string) => http.get(`/api/users/${userId}/default-model`).then(r => r.data),
  updateUserDefaultModel: (userId: string, defaultModel: string) => http.put(`/api/users/${userId}/default-model`, { defaultModel }).then(r => r.data),
  
  // 文档管理相关
  uploadDocument: (userId: string, file: File, documentType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return http.post(`/api/users/${userId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
  getDocumentExtractedInfo: (userId: string, documentId: string) => 
    http.get(`/api/users/${userId}/documents/${documentId}/extracted-info`).then(r => r.data),
  processDocument: (userId: string, documentId: string) => 
    http.post(`/api/users/${userId}/documents/${documentId}/process`).then(r => r.data),
};


