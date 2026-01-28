import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ✅ 개발 중 CORS 회피용 프록시
  // 프론트(기본 5173)에서 상대경로로 호출하면,
  // Vite가 아래 target으로 대신 전달해줘서 CORS 없이 테스트할 수 있어요.
  server: {
    proxy: {
      // Spring API
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // FastAPI OCR (health 포함)
      '/v1': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
