/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        zimbabwe: {
          copper: '#b87333',
          emerald: '#047857',
          teal: '#0d9488',
          gold: '#d4af37',
          stone: '#78716c',
        }
      }
    },
  },
  plugins: [],
}

