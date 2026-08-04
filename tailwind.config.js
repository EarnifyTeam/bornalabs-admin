/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "#070817",
        bg2: "#0a0c20",
        surface: "#10132d",
        surface2: "#151a3a",
        foreground: "#f7f8ff",
        text: "#f7f8ff",
        muted: "#9299ba",
        cyan: "#58d5ff",
        violet: "#8a6cff",
        gold: "#f5ca52",
        green: "#51e49a",
        red: "#ef4444",
        border: "rgba(225, 230, 255, 0.08)",
        "border-active": "rgba(88, 213, 255, 0.25)",
      },
      fontFamily: {
        bricolage: ["Bricolage Grotesque", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
    },
  },
  plugins: [],
}
