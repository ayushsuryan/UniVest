module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#037A59',
        secondary: '#00BB87',
        tertiary: '#222222',
        quaternary: '#333333',
        quinary: '#444444',
      },
    },
  },
  plugins: [],
}