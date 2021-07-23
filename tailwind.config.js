module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      opacity: ['disabled'],
    }  
  },
  //Install elevations to enhance image rendering
  plugins: [
    require('tailwindcss-elevation')(['responsive']),
  ],
}
