import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: './src',
  build: {
    outDir: '../public',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/alerts': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/machines': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/inventory': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/agents': {
        target: 'ws://localhost:4000',
        ws: true,
      }
    }
  }
})

