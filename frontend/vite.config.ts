import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  console.log('Vite构建模式:', mode);
  console.log('环境变量VITE_API_BASE_URL:', process.env.VITE_API_BASE_URL);
  
  return {
    server:{
      proxy:{
        "/api":{target:"http://localhost:8080",changeOrigin:true}
      }
    },
    plugins: [react()],
    // 开发环境：使用代理，生产环境：使用环境变量
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        mode === 'development' 
          ? '/'  // 开发环境使用代理
          : (process.env.VITE_API_BASE_URL || 'http://localhost:8080')  // 生产环境使用环境变量
      )
    }
  }
})
