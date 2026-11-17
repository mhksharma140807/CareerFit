/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F3FF',   // Softest lilac tint
          100: '#EDE9FE',  // Light lavender badge backgrounds
          200: '#DDD6FE',  // Delicate borders & dividers
          300: '#C4B5FD',  // Active tab pills & subtle glows
          400: '#A78BFA',  // Icon highlights & secondary accents
          500: '#8B5CF6',  // Primary interactive purple
          600: '#7C3AED',  // Vibrant primary brand CTA
          700: '#6D28D9',  // Deep button hover state
          800: '#5B21B6',  // High-contrast text on lilac
          900: '#4C1D95',  // Dark accent headings
          950: '#2E1065',  // Dark mode primary base
        },
        obsidian: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E1B2E',  // Card background in dark mode
          850: '#151221',  // Muted card container in dark mode
          900: '#0F0D1A',  // Deep dark surface
          950: '#090711',  // Deepest background for dark heroes
        },
        surface: {
          canvas: '#FAF8FF',
          card: '#FFFFFF',
          tint: '#F4F1FD',
          darkCanvas: '#090711',
          darkCard: '#131022',
          darkBorder: '#26203D',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(124, 58, 237, 0.35)',
        'glow-sm': '0 0 15px -3px rgba(124, 58, 237, 0.25)',
        'glass': '0 8px 32px 0 rgba(15, 13, 26, 0.06)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 1.5s infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
