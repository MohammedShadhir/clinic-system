/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#0d7c6b",
          light: "#e6f4f1",
          dark: "#095c4f",
          mid: "#3aab95",
        },
        ink: { DEFAULT: "#0a0f1e", muted: "#4a5068", faint: "#8990a8" },
        canvas: "#f7f8fc",
        surface: { DEFAULT: "#ffffff", 2: "#f0f2f8" },
        bdr: { DEFAULT: "#e2e5ef", strong: "#c8cde0" },
        violet: { DEFAULT: "#6b3fa0", light: "#f0eaf9" },
        amber: { DEFAULT: "#c47c00", light: "#fff4e0" },
        rose: { DEFAULT: "#c0392b", light: "#fdecea" },
        emerald: { DEFAULT: "#1a7a3c", light: "#e7f5ec" },
        sky: { DEFAULT: "#1a56a8", light: "#e8f0fb" },
      },
      fontFamily: {
        display: ['"DM Serif Display"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 4px rgba(10,15,30,0.08)",
        md: "0 4px 14px rgba(10,15,30,0.10)",
      },
      borderRadius: {
        card: "10px",
        btn: "6px",
      },
    },
  },
  plugins: [],
};
