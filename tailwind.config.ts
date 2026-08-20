import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0A1F44",
        gold: {
          DEFAULT: "#C9A94A",
          light: "#D8BE6E",
          dark: "#9C7E2E",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        watermark: "url('/wildcat-watermark.png')",
      },
    },
  },
  plugins: [],
};

export default config;
