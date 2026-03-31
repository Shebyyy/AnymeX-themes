import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
      // Remap hardcoded Tailwind colors used across the app to our token palette.
      // This makes the UX remap global without editing every page file.
      colors: {
        neutral: {
          950: "hsl(var(--background))",
          900: "hsl(var(--card))",
          800: "hsl(var(--card))",
          700: "hsl(var(--border))",
          600: "hsl(var(--muted))",
          500: "hsl(var(--muted-foreground))",
          400: "hsl(var(--muted-foreground))",
          300: "hsl(var(--muted))",
          200: "hsl(var(--border))",
          100: "hsl(var(--border))",
          50: "hsl(var(--border))",
        },
        // Collapse “status colors” into a single calm hue.
        green: {
          300: "hsl(var(--primary))",
          400: "hsl(var(--primary))",
          500: "hsl(var(--primary))",
          600: "hsl(var(--primary))",
          700: "hsl(var(--border))",
          800: "hsl(var(--border))",
          900: "hsl(var(--border))",
        },
        red: {
          300: "hsl(var(--primary))",
          400: "hsl(var(--primary))",
          500: "hsl(var(--primary))",
          600: "hsl(var(--primary))",
          700: "hsl(var(--border))",
          800: "hsl(var(--border))",
          900: "hsl(var(--border))",
        },
        orange: {
          300: "hsl(var(--primary))",
          400: "hsl(var(--primary))",
          500: "hsl(var(--primary))",
          600: "hsl(var(--primary))",
          700: "hsl(var(--border))",
          800: "hsl(var(--border))",
          900: "hsl(var(--border))",
        },
        yellow: {
          300: "hsl(var(--primary))",
          400: "hsl(var(--primary))",
          500: "hsl(var(--primary))",
          600: "hsl(var(--primary))",
          700: "hsl(var(--border))",
          800: "hsl(var(--border))",
          900: "hsl(var(--border))",
        },
        pink: {
          300: "hsl(var(--primary))",
          400: "hsl(var(--primary))",
          500: "hsl(var(--primary))",
          600: "hsl(var(--primary))",
          700: "hsl(var(--border))",
          800: "hsl(var(--border))",
          900: "hsl(var(--border))",
        },
        purple: {
          300: "hsl(var(--primary))",
          400: "hsl(var(--primary))",
          500: "hsl(var(--primary))",
          600: "hsl(var(--primary))",
          700: "hsl(var(--border))",
          800: "hsl(var(--border))",
          900: "hsl(var(--border))",
        },
        cyan: {
          300: "hsl(var(--primary))",
          400: "hsl(var(--primary))",
          500: "hsl(var(--primary))",
          600: "hsl(var(--primary))",
          700: "hsl(var(--border))",
          800: "hsl(var(--border))",
          900: "hsl(var(--border))",
        },

        // Token-backed semantic colors (components use these).
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
};
export default config;
