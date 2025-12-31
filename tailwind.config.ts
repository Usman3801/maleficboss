import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#ffffff",
          hover: "#e5e5e5",
        },
        secondary: {
          DEFAULT: "#1a1a1a",
          hover: "#2a2a2a",
        },
        accent: {
          DEFAULT: "#333333",
          hover: "#444444",
        },
        border: "#222222",
      },
    },
  },
  plugins: [],
};
export default config;
