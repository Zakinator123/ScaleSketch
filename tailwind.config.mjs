/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#1a1a1a',
          secondary: '#252525',
          tertiary: '#2a2a2a',
        },
        border: {
          DEFAULT: '#3a3a3a',
          hover: '#4a4a4a',
        },
        text: {
          DEFAULT: '#e0e0e0',
          secondary: '#b0b0b0',
          muted: '#808080',
        },
        primary: {
          DEFAULT: '#3a7bc8',
          hover: '#5a9bd8',
        },
        accent: {
          blue: '#3a7bc8',
          green: '#4caf50',
          red: '#dc3545',
          yellow: '#ffc107',
        },
        ring: '#5a9bd8',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      keyframes: {
        "in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "in": "in 0.2s ease-out",
        "out": "out 0.2s ease-in",
      },
    },
  },
  plugins: [],
};

