import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: parseInt(process.env.PORT || '3000'),
    allowedHosts: [
      '.manusvm.computer',
      '.onrender.com',
      'localhost',
    ],
  },
  preview: {
    host: true,
    port: parseInt(process.env.PORT || '3000'),
    allowedHosts: [
      'slidecoffee-v2-new-prod.onrender.com',
      '.onrender.com', // Allow all Render subdomains
      'localhost',
    ],
  },
})

