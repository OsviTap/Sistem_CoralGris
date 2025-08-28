import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          axios: ['axios']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: import.meta.env.VITE_API_URL || 'http://localhost:3006',
        changeOrigin: true
      }
    }
  }
})
