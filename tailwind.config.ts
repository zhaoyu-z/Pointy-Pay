import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0e1a",
        surface: "#111827",
        "surface-hover": "#1f2937",
        border: "#1f2937",
        primary: {
          DEFAULT: "#10b981",
          hover: "#059669",
          foreground: "#f9fafb",
        },
        secondary: {
          DEFAULT: "#0ea5e9",
          foreground: "#f9fafb",
        },
        accent: {
          DEFAULT: "#6366f1",
          foreground: "#f9fafb",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#0a0e1a",
        },
        danger: {
          DEFAULT: "#ef4444",
          foreground: "#f9fafb",
        },
        "text-primary": "#f9fafb",
        "text-muted": "#9ca3af",
        card: {
          DEFAULT: "#111827",
          foreground: "#f9fafb",
        },
        muted: {
          DEFAULT: "#1f2937",
          foreground: "#9ca3af",
        },
        input: "#1f2937",
        ring: "#10b981",
        foreground: "#f9fafb",
        popover: {
          DEFAULT: "#111827",
          foreground: "#f9fafb",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#f9fafb",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "flow-right": {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
        "pulse-green": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "flow-right": "flow-right 1.5s linear infinite",
        "pulse-green": "pulse-green 2s ease-in-out infinite",
        "count-up": "count-up 0.3s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
