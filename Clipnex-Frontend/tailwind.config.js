/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        Outfit: ["Outfit","Fira Sans", "Arial", "Helvetica", "sans-serif"]
      },
      colors:{
        darkbg:"#1E1E1E",
        fadetext:"#D9D9D9"
      }
    },
  },
  plugins: [],
}