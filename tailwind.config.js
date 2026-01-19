/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ApercuPro-Regular', 'system-ui', 'sans-serif'],
        medium: ['ApercuPro-Medium', 'system-ui', 'sans-serif'],
        bold: ['ApercuPro-Bold', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}