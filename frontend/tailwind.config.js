/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981', // Emerald Green
          light: '#34D399',
          dark: '#059669',
        },
        secondary: {
          DEFAULT: '#14B8A6', // Teal
          light: '#2DD4BF',
          dark: '#0D9488',
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber
          light: '#FBBF24',
          dark: '#D97706',
        },
        darkbg: {
          DEFAULT: '#0F172A', // Deep Dark Slate
          card: '#1E293B',
          border: '#334155',
        },
        lightbg: {
          DEFAULT: '#F8FAFC', // Off White
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        text: {
          DEFAULT: '#334155', // Slate
          light: '#64748B',
          dark: '#1E293B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        'premium': '18px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
