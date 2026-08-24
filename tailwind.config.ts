import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // "Gabay" palette — warm, calm, sun-and-mango inspired, not clinical.
        cream: {
          50: "#FFFBF5",
          100: "#FFF6EA",
          200: "#FDEBD3",
        },
        blush: {
          50: "#FFF1F0",
          100: "#FFE1DE",
          300: "#F7B4AC",
          500: "#EE7E70",
          600: "#DA5F50",
          700: "#B8483C",
        },
        mango: {
          100: "#FFEFC2",
          300: "#FFD873",
          500: "#F6AE2D",
          600: "#E0921A",
        },
        teal: {
          50: "#EFFAF8",
          100: "#D7F1EC",
          300: "#8FD4C6",
          500: "#3E9C8C",
          600: "#2E7C6F",
          700: "#215A51",
        },
        ink: {
          50: "#F7F6F4",
          100: "#EDEBE7",
          400: "#8A8378",
          600: "#5B564D",
          800: "#332F29",
          900: "#211E1A",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 16px rgba(51, 47, 41, 0.06)",
        card: "0 1px 3px rgba(51, 47, 41, 0.08), 0 1px 2px rgba(51, 47, 41, 0.06)",
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};
export default config;
