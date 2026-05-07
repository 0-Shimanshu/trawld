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
      '/state': 'http://localhost:4000',
      '/alerts': 'http://localhost:4000',
      '/machines': 'http://localhost:4000',
      '/projects': 'http://localhost:4000',
      '/inventory': 'http://localhost:4000',
      '/scan-machine': 'http://localhost:4000',
      '/scan-project': 'http://localhost:4000',
      '/ingest-now': 'http://localhost:4000',
      '/register': 'http://localhost:4000',
      '/api': 'http://localhost:4000',
      '/agents': {
        target: 'ws://localhost:4000',
        ws: true,
      }
    }
  }
})

