/** @type {import('tailwindcss').Config} */
/* eslint-disable @typescript-eslint/no-require-imports */

module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{mdx,tsx}",
  ],
  theme: {
    extend: {
      // Serif font for luxury headings ("YOUR SHOPPING BAG", "ORDER SUMMARY")
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      // Subtle shake animation for problem items in the cart
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '50%': { transform: 'translateX(4px)' },
          '75%': { transform: 'translateX(-4px)' },
        },
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
};