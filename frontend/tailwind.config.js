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
                    purple: '#2563EB',        // Herozi blue
                    dark: '#F3F4F6',          // Herozi light gray sidebar
                    light: '#3B82F6',         // Herozi hover blue
                    bg: '#FFFFFF',            // White background
                    error: '#EF4444',         // Red error
                    'text-dark': '#1F2937',   // Dark text
                    'text-light': '#6B7280',  // Light gray text
                    'border': '#E5E7EB'       // Border color
                }
            }
        },
    },
    plugins: [],
}
