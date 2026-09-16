/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require('./themes/hugo-saasify-theme/tailwind.config.js')],
    content: [
      "./themes/hugo-saasify-theme/layouts/**/*.html",
      "./layouts/**/*.html",
      "./content/**/*.{html,md}"
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#e6f6ee',
            100: '#c1ecd6',
            200: '#8fdab3',
            300: '#57c48b',
            400: '#22ab68',
            500: '#0a9955',
            600: '#008D49',
            700: '#00713b',
            800: '#065c33',
            900: '#064c2c',
          },
          secondary: {
            50: '#f5f5f5',
            100: '#e5e5e5',
            200: '#c7c7c7',
            300: '#a0a0a0',
            400: '#6b6b6b',
            500: '#404040',
            600: '#262626',
            700: '#171717',
            800: '#0f0f0f',
            900: '#0b0b0b',
          },
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          heading: ['Plus Jakarta Sans', 'sans-serif'],
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/typography'),
    ],
  }