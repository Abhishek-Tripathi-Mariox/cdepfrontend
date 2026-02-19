/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#f8fafc'
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca'
        },
        accent: {
          400: '#fb923c',
          500: '#f97316'
        }
      },
      boxShadow: {
        glass: '0 20px 25px -5px rgba(15,23,42,0.1), 0 10px 10px -5px rgba(15,23,42,0.04)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};

