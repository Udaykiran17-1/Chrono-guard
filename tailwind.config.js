/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        canvas: '#F3F2EF',
        brand: {
          indigo: '#3730A3',
          'indigo-light': '#4F46E5',
          'indigo-dark': '#312E81',
          cobalt: '#2563EB',
          'cobalt-light': '#3B82F6',
          'cobalt-dark': '#1D4ED8',
          teal: '#0D9488',
          'teal-light': '#14B8A6',
          'teal-dark': '#0F766E',
        },
        card: {
          DEFAULT: '#FFFFFF',
          border: 'rgba(15, 23, 42, 0.08)',
        },
      },
      borderRadius: {
        card: '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.08)',
        nav: '0 1px 2px rgba(15, 23, 42, 0.06)',
      },
      height: {
        nav: '56px',
      },
      minHeight: {
        nav: '56px',
      },
    },
  },
  plugins: [],
};
