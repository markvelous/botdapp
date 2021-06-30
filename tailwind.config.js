module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  //Install elevations to enhance image rendering
  plugins: [
    require('tailwindcss-elevation')(['responsive']),
  ],
}
