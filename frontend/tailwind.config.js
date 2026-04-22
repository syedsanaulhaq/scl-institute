/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                scl: {
                    purple: '#4F6FE8',
                    dark: '#1E2B4A',
                    light: '#6B8EF0',
                    bg: '#F0F4FF',
                    error: '#EF4444'
                }
            }
        },
    },
    plugins: [],
}
