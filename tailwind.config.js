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
  // installed elevations to enhance image rendering
  // installed text-shadow for better contrast against svg background (diasbled as it's not working well)
  plugins: [
    require('tailwindcss-elevation')(['responsive']),
    require('tailwindcss-textshadow'),
  ],
}
