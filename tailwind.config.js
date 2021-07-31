module.exports = {
  purge: [ './src/**/*.{js,tsx}' ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      zIndex: {
        '-1': '-1',
        '-2': '-2',
      },
      colors: {
        black: '#000',
        white: '#fff',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
