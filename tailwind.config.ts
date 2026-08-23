import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0B2A4A",
          50: "#E8EFF6",
          100: "#C5D5E6",
          200: "#8AAAC8",
          300: "#4F7FAA",
          400: "#1E5485",
          500: "#0B2A4A",
          600: "#091F37",
          700: "#071525",
          800: "#040C12",
          900: "#020408",
        },
        teal: {
          DEFAULT: "#2BB6A3",
          50: "#E8F8F6",
          100: "#C0EDE8",
          200: "#80DAD2",
          300: "#45C8BB",
          400: "#2BB6A3",
          500: "#239489",
          600: "#1A716A",
          700: "#114F4B",
          800: "#082C2C",
          900: "#030F0F",
        },
        border: "#E1E8EF",
        background: "#F4F7FA",
        surface: "#FFFFFF",
        "text-primary": "#0B2A4A",
        "text-secondary": "#5A7A96",
        "text-muted": "#8FA8BE",
      },
      fontFamily: {
        heading: ["IBM Plex Sans Arabic", "sans-serif"],
        body: ["Tajawal", "sans-serif"],
        sans: ["Tajawal", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
