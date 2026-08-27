/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        prisma: { 50: '#F1FBF9', 100: '#D7F5EF', 500: '#0FAF9E', 700: '#087267' },
        ink: '#17211F', muted: '#64706D', surface: '#FFFFFF', canvas: '#F7FAF9', danger: '#C93C38', warning: '#8A5A12',
      },
    },
  },
  plugins: [],
};
