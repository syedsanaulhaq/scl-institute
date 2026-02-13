import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 3000,
        allowedHosts: [
            'scli-frontend-prod',
            'system.sclsandbox.xyz',
            'sclsandbox.xyz',
            'localhost',
            '127.0.0.1',
            '.sclsandbox.xyz'
        ]
    }
})
