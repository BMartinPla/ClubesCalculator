import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Anek Malayalam"',
          "Tahoma",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        base: "#0d0f12",
        panel: "#161a22",
        "panel-solid": "#11151f",
        line: "#242b35",
        "line-strong": "#3b4554",
        brand: {
          DEFAULT: "#c61044",
          hi: "#ff1767",
        },
        pitch: "#00ff87",
        gold: "#fbbf24",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out both",
        "pop-in": "pop-in 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;