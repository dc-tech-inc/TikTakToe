/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        retro: ['"Silkscreen"', 'monospace'],
        comic: ['"Comic Neue"', 'cursive', 'sans-serif']
      },
      colors: {
        pixel: {
          dark: '#181425',
          panel: '#262b44',
          border: '#3a4466',
          yellow: '#fee761',
          gold: '#feae34',
          orange: '#f77622',
          red: '#e43b44',
          pink: '#f6757a',
          purple: '#68386c',
          blue: '#3b5dc9',
          cyan: '#41a6f6',
          mint: '#73eff7',
          green: '#38b764',
          lime: '#a7f070',
          cream: '#f4f4f4',
          brown: '#8b5e34'
        }
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px #000000',
        'pixel-sm': '2px 2px 0px 0px #000000',
        'pixel-lg': '6px 6px 0px 0px #000000',
        'pixel-inset': 'inset 3px 3px 0px #ffffff40, inset -3px -3px 0px #00000040'
      },
      animation: {
        'bounce-gentle': 'bounce-gentle 1.8s infinite ease-in-out',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'pop': 'pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      },
      keyframes: {
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-6deg)' },
          '75%': { transform: 'rotate(6deg)' }
        },
        'pop': {
          '0%': { transform: 'scale(0.8)' },
          '70%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' }
        }
      }
    },
  },
  plugins: [],
}
