import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/community-home/',
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },
  server: {
    port: 3000,
    proxy: {
      '/wyapi': {
        target: 'https://ncys.nnkcy.com',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/wyapi/, '/wyapi')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: { outDir: 'dist' }
})