import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/')) {
              return 'react-core'
            }
            if (id.includes('/react-router-dom/') || id.includes('/react-router/')) {
              return 'router-core'
            }
            if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) {
              return 'form-vendor'
            }
            if (id.includes('react-grid-layout')) return 'layout-vendor'
            if (id.includes('axios')) return 'http-vendor'
            return 'vendor'
          }

          if (id.includes('/src/pages/clients/') || id.includes('/src/pages/Clients.tsx')) {
            return 'clients-pages'
          }

          if (id.includes('/src/pages/projects/') || id.includes('/src/pages/Projects.tsx')) {
            return 'projects-pages'
          }

          if (id.includes('/src/pages/proposals/') || id.includes('/src/pages/Proposals.tsx')) {
            return 'proposals-pages'
          }

          if (id.includes('/src/pages/invoices/') || id.includes('/src/pages/Invoices.tsx')) {
            return 'invoices-pages'
          }
        },
      },
    },
  },
  server: {
    port: 3089,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://backend:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})