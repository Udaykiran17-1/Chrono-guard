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
        canvas: '#F6F5FF',
        brand: {
          indigo: '#4F35C9',
          'indigo-light': '#6652E6',
          'indigo-dark': '#39249D',
          cobalt: '#3158D4',
          'cobalt-light': '#5273E6',
          'cobalt-dark': '#2443B1',
          teal: '#0D9488',
          'teal-light': '#14B8A6',
          'teal-dark': '#0F766E',
        },
        card: {
          DEFAULT: '#FFFFFF',
          border: 'rgba(71, 52, 158, 0.12)',
        },
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 6px 24px rgba(57, 36, 157, 0.07)',
        'card-hover': '0 14px 30px rgba(57, 36, 157, 0.13)',
        nav: '0 4px 20px rgba(57, 36, 157, 0.06)',
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
