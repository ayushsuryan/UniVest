module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',     // Navy blue
        secondary: '#3b82f6',   // Lighter blue
        tertiary: '#1f2937',    // Dark gray
        quaternary: '#374151',  // Medium gray
        quinary: '#6b7280',     // Light gray
        accent: '#60a5fa',      // Accent blue
        background: '#f8fafc',  // Light background
        surface: '#ffffff',     // White surface
      },
    },
  },
  plugins: [],
}