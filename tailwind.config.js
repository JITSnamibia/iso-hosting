/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        neon: {
          DEFAULT: '#00f2ff',
          light: '#00f2ff88',
        },
        pink: {
          DEFAULT: '#ff00d4',
          light: '#ff00d488'
        }
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}