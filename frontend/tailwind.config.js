/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF5A5F', // Airbnb pinkish red
        secondary: '#00A699', // Airbnb teal
        accent: '#FC642D',
        dark: '#484848',
        light: '#767676',
      }
    },
  },
  plugins: [],
}
