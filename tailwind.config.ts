import type { Config } from "tailwindcss";
// Force rebuild for ChessBotBuddies branding

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        
        // Semantic Theme Colors (Mapped to globals.css variables)
        "bg-primary": "var(--color-bg-primary)",
        "bg-secondary": "var(--color-bg-secondary)",
        "bg-tertiary": "var(--color-bg-tertiary)",
        "bg-elevated": "var(--color-bg-elevated)",
        "border-color": "var(--color-border)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",

        // Primary Palette (Brand) - Updated to Jungle Green Theme
        "jungle-green": {
          50: "var(--color-jungle-green-50)",
          100: "var(--color-jungle-green-100)",
          200: "var(--color-jungle-green-200)",
          300: "var(--color-jungle-green-300)",
          400: "var(--color-jungle-green-400)",
          500: "var(--color-jungle-green-500)",
          600: "var(--color-jungle-green-600)",
          700: "var(--color-jungle-green-700)",
          800: "var(--color-jungle-green-800)",
          900: "var(--color-jungle-green-900)",
          950: "var(--color-jungle-green-950)",
        },
        "sky-blue": "var(--color-jungle-green-400)",
        "sunny-yellow": "var(--color-jungle-green-200)",

        // Secondary Palette remapped to Jungle Green
        "mint-green": "var(--color-jungle-green-300)",
        "soft-orange": "var(--color-jungle-green-500)",
        "warm-purple": "var(--color-jungle-green-700)",
        "royal-blue": "var(--color-jungle-green-800)",
        
        // Neutrals (Legacy/Static)
        "soft-white": "#fafafa",
        "clean-gray": "#e4e7eb",
        "deep-navy": "#14213d",

        // Redesign Palette - Updated to match Jungle Theme
        "redesign-bg": "#0b0f1a",
        "redesign-cyan": "var(--color-jungle-green-500)", // Swapped from explicit cyan
        "redesign-glass-bg": "rgba(255, 255, 255, 0.03)",
        "redesign-glass-border": "rgba(255, 255, 255, 0.08)",

        // Override legacy accent palettes to the green family
        blue: {
          50: "var(--color-jungle-green-50)",
          100: "var(--color-jungle-green-100)",
          200: "var(--color-jungle-green-200)",
          300: "var(--color-jungle-green-300)",
          400: "var(--color-jungle-green-400)",
          500: "var(--color-jungle-green-500)",
          600: "var(--color-jungle-green-600)",
          700: "var(--color-jungle-green-700)",
          800: "var(--color-jungle-green-800)",
          900: "var(--color-jungle-green-900)",
        },
        cyan: {
          50: "var(--color-jungle-green-50)",
          100: "var(--color-jungle-green-100)",
          200: "var(--color-jungle-green-200)",
          300: "var(--color-jungle-green-300)",
          400: "var(--color-jungle-green-400)",
          500: "var(--color-jungle-green-500)",
          600: "var(--color-jungle-green-600)",
          700: "var(--color-jungle-green-700)",
          800: "var(--color-jungle-green-800)",
          900: "var(--color-jungle-green-900)",
        },
        teal: {
          50: "var(--color-jungle-green-50)",
          100: "var(--color-jungle-green-100)",
          200: "var(--color-jungle-green-200)",
          300: "var(--color-jungle-green-300)",
          400: "var(--color-jungle-green-400)",
          500: "var(--color-jungle-green-500)",
          600: "var(--color-jungle-green-600)",
          700: "var(--color-jungle-green-700)",
          800: "var(--color-jungle-green-800)",
          900: "var(--color-jungle-green-900)",
        },
        indigo: {
          50: "var(--color-jungle-green-50)",
          100: "var(--color-jungle-green-100)",
          200: "var(--color-jungle-green-200)",
          300: "var(--color-jungle-green-300)",
          400: "var(--color-jungle-green-400)",
          500: "var(--color-jungle-green-500)",
          600: "var(--color-jungle-green-600)",
          700: "var(--color-jungle-green-700)",
          800: "var(--color-jungle-green-800)",
          900: "var(--color-jungle-green-900)",
        },
        amber: {
          50: "var(--color-jungle-green-50)",
          100: "var(--color-jungle-green-100)",
          200: "var(--color-jungle-green-200)",
          300: "var(--color-jungle-green-300)",
          400: "var(--color-jungle-green-400)",
          500: "var(--color-jungle-green-500)",
          600: "var(--color-jungle-green-600)",
          700: "var(--color-jungle-green-700)",
          800: "var(--color-jungle-green-800)",
          900: "var(--color-jungle-green-900)",
        },
        orange: {
          50: "var(--color-jungle-green-50)",
          100: "var(--color-jungle-green-100)",
          200: "var(--color-jungle-green-200)",
          300: "var(--color-jungle-green-300)",
          400: "var(--color-jungle-green-400)",
          500: "var(--color-jungle-green-500)",
          600: "var(--color-jungle-green-600)",
          700: "var(--color-jungle-green-700)",
          800: "var(--color-jungle-green-800)",
          900: "var(--color-jungle-green-900)",
        },
        purple: {
          50: "var(--color-jungle-green-50)",
          100: "var(--color-jungle-green-100)",
          200: "var(--color-jungle-green-200)",
          300: "var(--color-jungle-green-300)",
          400: "var(--color-jungle-green-400)",
          500: "var(--color-jungle-green-500)",
          600: "var(--color-jungle-green-600)",
          700: "var(--color-jungle-green-700)",
          800: "var(--color-jungle-green-800)",
          900: "var(--color-jungle-green-900)",
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "sans-serif"],
        display: ["var(--font-baloo)", "sans-serif"],
        lexend: ["var(--font-lexend)", "sans-serif"],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      }
    },
  },
  plugins: [],
};
export default config;
