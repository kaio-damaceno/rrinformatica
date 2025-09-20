import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': {
          'DEFAULT': '#2563EB',
          'light': '#60A5FA',
        },
        'brand-red': {
          'DEFAULT': '#E60014',
          'dark': '#C00011',
        },
        'brand-gray': {
          '100': '#F3F4F6',
          '200': '#E5E7EB',
          '800': '#1F2937',
          '900': '#111827',
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        'fade-in-up': {
            '0%': {
                opacity: '0',
                transform: 'translateY(20px)'
            },
            '100%': {
                opacity: '1',
                transform: 'translateY(0)'
            },
        },
        'fade-in': {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
        },
        'scale-in-center': {
            '0%': {
                transform: 'scale(0.95)',
                opacity: '0',
            },
            '100%': {
                transform: 'scale(1)',
                opacity: '1',
            },
        },
      },
      animation: {
          'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
          'fade-in': 'fade-in 0.3s ease-out forwards',
          'scale-in-center': 'scale-in-center 0.3s ease-out forwards',
      },
      textShadow: {
        sm: '0 1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        md: '0 2px 8px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    }),
  ],
};
export default config;