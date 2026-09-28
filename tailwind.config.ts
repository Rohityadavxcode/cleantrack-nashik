import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Government & Civic Trust Palette
        civic: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffe',
          300: '#7cc4fd',
          400: '#36a4fa',
          500: '#0c86eb',
          600: '#0067ca', // Primary civic blue
          700: '#0152a3',
          800: '#064686',
          900: '#0b3b6f',
          950: '#07254a',
        },
        // Indian Tiranga subtle accents (Saffron & India Green)
        tiranga: {
          saffron: '#FF9933',
          saffronDark: '#D97706',
          green: '#138808',
          greenDark: '#0D5F05',
          navy: '#000080',
        },
        nashik: {
          maroon: '#800020',
          gold: '#D4AF37',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
