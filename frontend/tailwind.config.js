/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  darkMode: 'class', // 3.x uses 'class', not 'selector'
  theme: {
    extend: {
      fontFamily: {
        'text': ['IBM Plex Sans Devanagari', 'system-ui', 'sans-serif'],
        'heading': ['IBM Plex Sans Devanagari', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}