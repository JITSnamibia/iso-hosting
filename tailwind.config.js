/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: {
    files: [
      './public/index.html',
      './src/**/*.{js,jsx,ts,tsx}',
      './pages/**/*.{js,jsx}'
    ],
    transform: {
      '.js': (content) => content
    }
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
};