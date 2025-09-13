import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/cars': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // สามารถเพิ่ม route อื่น ๆ ที่ต้อง proxy
      '/images': {
        target: 'http://localhost:8080/public/images/cars/',
        changeOrigin: true,
      }
    }
  }
})
