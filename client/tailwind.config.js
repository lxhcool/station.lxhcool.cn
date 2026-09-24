/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        squaredot: ['SquareDotMatrix', 'monospace', 'sans-serif'],
      },
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.18)',
          'light-hover': 'rgba(255, 255, 255, 0.28)',
          dark: 'rgba(20, 20, 25, 0.45)',
          'dark-hover': 'rgba(30, 30, 40, 0.65)',
          border: 'rgba(255, 255, 255, 0.22)',
          'border-light': 'rgba(255, 255, 255, 0.35)',
        }
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.12), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
        'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 1px 2px 0 rgba(255, 255, 255, 0.3)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.28), inset 0 1px 2px 0 rgba(255, 255, 255, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-primary': '0 0 30px -5px rgba(99, 102, 241, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '40px',
        '3xl': '64px',
      },
      animation: {
        'subtle-pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
