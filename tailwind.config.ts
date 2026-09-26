import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Manrope"',
          "Tahoma",
          "system-ui",
          "sans-serif",
        ],
        mono: ['"DM Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        base: "#080c0a",
        panel: "#101613",
        "panel-solid": "#0b100e",
        surface: "#101613",
        "surface-raised": "#151c18",
        "surface-input": "#0b100e",
        line: "#27332d",
        "line-strong": "#3a4a40",
        muted: "#a0aca4",
        brand: {
          DEFAULT: "#bafa4c",
          hi: "#caff6a",
        },
        pitch: "#bafa4c",
        gold: "#f3c969",
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
