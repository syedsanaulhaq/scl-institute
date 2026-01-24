import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 3000,
        allowedHosts: ['sclsandbox.xyz', 'backend.sclsandbox.xyz', 'lms.sclsandbox.xyz']
    }
})
