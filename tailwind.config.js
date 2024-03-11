const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.{njk,js,html,md,yml,yaml,webc}",
  ],
  daisyui: {
    darkTheme: "dark", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    themeRoot: ":root", // The element that receives theme color CSS variables
    themes: [
      {
        mytheme: {
          "primary": "#a991f7",
          "secondary": "#f6d860",
          "accent": "#37cdbe",
          "neutral": "#3d4451",
          "base-100": "#ffffff",
        },
      },
      "dark",
      "corporate",
      "wireframe"
    ],
  },
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
        // primary: colors.zinc,
        // secondary: colors.slate,
        scheme1: {
          DEFAULT: {
            background: '#3498db',
            text: '#2ecc71',
          },
          secondary: {
            background: '#2ecc71',
            text: '#3498db',
          },
          mytheme: {
            "primary": "#a991f7",
            "secondary": "#f6d860",
            "accent": "#37cdbe",
            "neutral": "#3d4451",
            "base-100": "#ffffff",
          },
          // Add more color variations as needed
        }
      },
    },
  },
  plugins: [require('@tailwindcss/typography'),require("daisyui")],
}
