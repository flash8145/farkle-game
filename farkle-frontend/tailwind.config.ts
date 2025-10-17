import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Game theme colors
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
        // Custom game colors
        game: {
          purple: {
            DEFAULT: "#7C3AED",
            light: "#A78BFA",
            dark: "#5B21B6",
          },
          gold: {
            DEFAULT: "#F59E0B",
            light: "#FBBF24",
            dark: "#D97706",
          },
          green: {
            DEFAULT: "#10B981",
            light: "#34D399",
            dark: "#059669",
          },
          red: {
            DEFAULT: "#EF4444",
            light: "#F87171",
            dark: "#DC2626",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // Dice roll animation
        diceRoll: {
          "0%": {
            transform: "rotate(0deg) scale(1)",
          },
          "25%": {
            transform: "rotate(90deg) scale(1.1)",
          },
          "50%": {
            transform: "rotate(180deg) scale(1)",
          },
          "75%": {
            transform: "rotate(270deg) scale(1.1)",
          },
          "100%": {
            transform: "rotate(360deg) scale(1)",
          },
        },
        // Dice shake animation
        diceShake: {
          "0%, 100%": {
            transform: "translateX(0)",
          },
          "10%, 30%, 50%, 70%, 90%": {
            transform: "translateX(-5px) rotate(-5deg)",
          },
          "20%, 40%, 60%, 80%": {
            transform: "translateX(5px) rotate(5deg)",
          },
        },
        // Score counting animation
        scoreUp: {
          "0%": {
            transform: "translateY(0) scale(1)",
            opacity: "1",
          },
          "50%": {
            transform: "translateY(-20px) scale(1.5)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(-40px) scale(1)",
            opacity: "0",
          },
        },
        // Pulse for hot dice
        hotPulse: {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.7)",
          },
          "50%": {
            boxShadow: "0 0 0 15px rgba(245, 158, 11, 0)",
          },
        },
        // Farkle animation
        farkle: {
          "0%": {
            transform: "scale(1) rotate(0deg)",
            opacity: "1",
          },
          "25%": {
            transform: "scale(1.2) rotate(-10deg)",
            opacity: "0.8",
          },
          "50%": {
            transform: "scale(0.8) rotate(10deg)",
            opacity: "0.6",
          },
          "75%": {
            transform: "scale(1.1) rotate(-5deg)",
            opacity: "0.4",
          },
          "100%": {
            transform: "scale(0) rotate(0deg)",
            opacity: "0",
          },
        },
        // Win celebration
        celebrate: {
          "0%, 100%": {
            transform: "scale(1) rotate(0deg)",
          },
          "25%": {
            transform: "scale(1.1) rotate(5deg)",
          },
          "50%": {
            transform: "scale(1.2) rotate(-5deg)",
          },
          "75%": {
            transform: "scale(1.1) rotate(5deg)",
          },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "dice-roll": "diceRoll 0.6s ease-in-out",
        "dice-shake": "diceShake 0.5s ease-in-out",
        "score-up": "scoreUp 1s ease-out forwards",
        "hot-pulse": "hotPulse 1.5s ease-in-out infinite",
        farkle: "farkle 0.8s ease-in-out forwards",
        celebrate: "celebrate 0.6s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;