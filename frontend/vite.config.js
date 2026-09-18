import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: true, // δέχεται requests έξω από το container, όχι μόνο localhost
    port: 5173,
    watch: {
      usePolling: true, // απαραίτητο ώστε το hot-reload να δουλεύει με bind mounts σε docker
    },
  },
})
