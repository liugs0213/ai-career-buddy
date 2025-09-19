import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  console.log('Vite构建模式:', mode);
  console.log('环境变量VITE_API_BASE_URL:', process.env.VITE_API_BASE_URL);
  
  // 获取API基础URL，优先使用环境变量
  const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8080';
  console.log('使用的API基础URL:', apiBaseUrl);
  
  return {
    server:{
      host: '0.0.0.0', // 允许外部访问
      port: 3000, // 明确指定端口
      proxy:{
        "/api":{
          target: apiBaseUrl, // 使用环境变量中的地址
          changeOrigin:true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    plugins: [react()],
    // 开发环境：使用代理，生产环境：使用环境变量
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        mode === 'development' 
          ? '/'  // 开发环境使用代理
          : apiBaseUrl  // 生产环境使用环境变量
      )
    }
  }
})
