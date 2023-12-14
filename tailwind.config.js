const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{njk,js,html,md,yml,yaml,webc}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        sans: ['Gotham A','Gotham B', 'sans-serif'],
        // sans: ['Graphik', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        display: ['Oswald', 'ui-serif'], // Adds a new `font-display` class
      },
      colors: {
        primary: colors.zinc,
        secondary: colors.slate,
        scheme1: {
          DEFAULT: {
            background: '#3498db',
            text: '#2ecc71',
          },
          secondary: {
            background: '#2ecc71',
            text: '#3498db',
          },

          // Add more color variations as needed
        }
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
