// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: {
    files: [
      './public/index.html',
      './src/**/*.{js,jsx}',
      './pages/**/*.{js,jsx}'
    ]
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