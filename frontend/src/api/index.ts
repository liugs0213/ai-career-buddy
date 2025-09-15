import axios from 'axios';

// 使用环境变量配置API基础URL
// 开发环境：使用Vite代理 (vite.config.ts)
// 生产环境：使用构建时设置的环境变量

// 详细的环境变量调试信息
console.log('=== 环境变量调试信息 ===');
console.log('import.meta.env:', import.meta.env);
console.log('import.meta.env.VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('import.meta.env.MODE:', import.meta.env.MODE);
console.log('import.meta.env.DEV:', import.meta.env.DEV);
console.log('import.meta.env.PROD:', import.meta.env.PROD);

const baseURL = import.meta.env.VITE_API_BASE_URL || '/';

console.log('=== API配置信息 ===');
console.log('最终使用的API Base URL:', baseURL);
console.log('========================');

export const http = axios.create({ baseURL });

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


