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
                    purple: '#6B46C1',
                    dark: '#553399',
                    light: '#8B5CF6',
                    bg: '#F7F9FC',
                    error: '#EF4444'
                }
            }
        },
    },
    plugins: [],
}
