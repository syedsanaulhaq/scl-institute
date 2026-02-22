import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  appType: 'spa',
  plugins: [
    react(),
    {
      name: 'fallback-to-index',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            // If the request is for a path without an extension, try index.html
            if (req.url === '/' || (!path.extname(req.url) && req.url.startsWith('/'))) {
              req.url = '/index.html'
            }
            next()
          })
        }
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 7777,
    middlewareMode: false,
    allowedHosts: [
      'scli-public-portal-prod',
      'sclsandbox.xyz',
      'www.sclsandbox.xyz',
      'localhost',
      '127.0.0.1',
      '.sclsandbox.xyz'
    ],
    watch: {
      usePolling: true
    },
    hmr: {
      host: process.env.VITE_HMR_HOST || 'localhost',
      port: 7777,
      protocol: 'http'
    },
    proxy: {
      '/api': {
        target: 'http://scli-backend:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})