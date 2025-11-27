/** @type {import('tailwindcss').Config} */
/* eslint-disable @typescript-eslint/no-require-imports */

module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{mdx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/line-clamp')],

};