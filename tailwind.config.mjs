/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        game: ['"Press Start 2P"', 'cursive']
      },
      keyframes: {
        dropPiece: {
          '0%': { transform: 'translateY(-300px)' },
          '100%': { transform: 'translateY(0)' }
        }
      },
      animation: {
        'drop-piece': 'dropPiece 0.5s ease-in-out'
      }
    }
  },
  plugins: []
}
