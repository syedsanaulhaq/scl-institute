/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Blue theme
    'bg-blue-600', 'bg-blue-700', 'bg-yellow-500', 'text-blue-600', 'text-blue-700', 'text-yellow-500',
    'hover:bg-blue-700', 'hover:bg-blue-800', 'hover:bg-yellow-600', 'hover:text-blue-600', 'hover:text-blue-700', 'hover:text-yellow-500',
    'from-blue-600', 'to-blue-800', 'bg-gradient-to-br', 'from-blue-50', 'to-white',
    'border-blue-600', 'border-blue-700', 'border-yellow-500',
    
    // Purple theme
    'bg-purple-600', 'bg-purple-800', 'bg-yellow-400', 'text-purple-600', 'text-purple-800', 'text-yellow-400',
    'hover:bg-purple-700', 'hover:bg-purple-900', 'hover:bg-yellow-500', 'hover:text-purple-600', 'hover:text-purple-800', 'hover:text-yellow-400',
    'from-purple-600', 'to-purple-900', 'from-purple-50',
    'border-purple-600', 'border-purple-800', 'border-yellow-400',
    
    // Green theme  
    'bg-emerald-600', 'bg-emerald-800', 'bg-orange-500', 'text-emerald-600', 'text-emerald-800', 'text-orange-500',
    'hover:bg-emerald-700', 'hover:bg-emerald-900', 'hover:bg-orange-600', 'hover:text-emerald-600', 'hover:text-emerald-800', 'hover:text-orange-500',
    'from-emerald-600', 'to-teal-700', 'from-emerald-50',
    'border-emerald-600', 'border-emerald-800', 'border-orange-500',
    
    // Corporate theme
    'bg-slate-700', 'bg-slate-900', 'bg-blue-500', 'text-slate-700', 'text-slate-900', 'text-blue-500',
    'hover:bg-slate-800', 'hover:bg-slate-950', 'hover:bg-blue-600', 'hover:text-slate-700', 'hover:text-slate-900', 'hover:text-blue-500',
    'from-slate-700', 'to-slate-900', 'from-slate-100',
    'border-slate-700', 'border-slate-900', 'border-blue-500',
    
    // Orange theme
    'bg-orange-600', 'bg-red-700', 'bg-yellow-400', 'text-orange-600', 'text-red-700', 'text-yellow-400',
    'hover:bg-orange-700', 'hover:bg-red-800', 'hover:bg-yellow-500', 'hover:text-orange-600', 'hover:text-red-700', 'hover:text-yellow-400',
    'from-orange-600', 'to-red-600', 'from-orange-50',
    'border-orange-600', 'border-red-700', 'border-yellow-400',
    
    // Border variants
    'border-l-blue-600', 'border-l-purple-600', 'border-l-emerald-600', 'border-l-slate-700', 'border-l-orange-600'
  ],
  theme: {
    extend: {
      colors: {
        'college-blue': '#1e40af',
        'college-navy': '#1e3a8a', 
        'college-gold': '#f59e0b',
        'college-light': '#f8fafc'
      },
      fontFamily: {
        'serif': ['Georgia', 'Times New Roman', 'serif'],
      }
    },
  },
  plugins: [],
}