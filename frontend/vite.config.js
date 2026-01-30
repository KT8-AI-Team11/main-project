import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server : {
      fs:{
          strict : false,
      },
      historyApiFallback: true, // SPA 라우팅 지원
      proxy: {
          '/api': {
              target: 'http://localhost:8080', // Spring Boot 서버
              changeOrigin: true,
              secure: false,
          }
        }
    },
})
