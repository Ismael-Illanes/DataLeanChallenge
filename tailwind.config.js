module.exports = {
  content: ["src/**/*.{js,html,css,scss}"],
  theme: {
    extend: {
      colors: {
        'custom-color-darkgray': '#0D1117',
        'custom-color-lightgray': '#E7EDF2',
        'custom-color-lightblack': '#010409'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
};
