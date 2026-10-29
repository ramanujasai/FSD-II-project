/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0e0e14',
        darkCard: '#161622',
        darkCardBorder: '#232336',
        darkInput: '#1b1b2a',
        darkInputBorder: '#2f2f47',
        primaryPurple: '#9333ea',
        primaryPurpleHover: '#7e22ce',
        btnPurple: '#a855f7',
      }
    },
  },
  plugins: [],
}
