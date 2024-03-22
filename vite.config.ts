import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import { createRequire } from 'node:module'
import { viteGhPages } from 'vite-plugin-gh-pages'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/device-shop-master',
  plugins: [
    vue(),
    viteGhPages({
      domain: 'device-shop-master.github.io',
      base: '/device-shop-master/'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
