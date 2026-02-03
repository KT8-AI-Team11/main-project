import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: { strict: false },
    historyApiFallback: true, // SPA 라우팅 지원
    proxy: {
      // Spring Boot 서버
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },

      // ✅ FastAPI 서버 (OCR + compliance 등 /v1/*)
      '/v1': {
        target: 'http://localhost:8000', // ← FastAPI 포트가 다르면 여기만 수정
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
