/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f6ee",
          100: "#c1ecd6",
          200: "#8fdab3",
          300: "#57c48b",
          400: "#22ab68",
          500: "#0a9955",
          600: "#008D49",
          700: "#00713b",
          800: "#065c33",
          900: "#064c2c",
        },
      },
    },
  },
  plugins: [],
};
