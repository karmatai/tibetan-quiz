import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // Quiz app uses root index.html + main.js, not Vue SPA
  root: '.',
  publicDir: 'public',
  plugins: [vue()],
  server: {
    open: true, // open browser when dev server starts
  },
})
