/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Nunito', 'system-ui', 'sans-serif'] },
      colors: {
        grape: { 50: '#f5f2ff', 100: '#ebe5ff', 200: '#d6caff', 300: '#b9a3ff', 400: '#9a78f7', 500: '#7c55e8', 600: '#6a3fd6', 700: '#5631b0', 800: '#43278a', 900: '#2e1b5e' },
        coral: { 50: '#fff3f0', 100: '#ffe3dc', 200: '#ffc6b8', 300: '#ffa18c', 400: '#ff7f66', 500: '#f4623f', 600: '#d94a29', 700: '#b33a1f' },
        mint: { 50: '#ecfbf5', 100: '#d2f5e7', 200: '#a6ead0', 300: '#6fd8b3', 400: '#3cc196', 500: '#1fa57c', 600: '#158564', 700: '#126a51' },
        cream: '#fffaf5',
        ink: '#2a2340',
      },
      borderRadius: { '4xl': '2rem' },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pop: { '0%': { transform: 'scale(.6)', opacity: 0 }, '70%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
        fadeUp: { '0%': { transform: 'translateY(12px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        wiggle: { '0%,100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        blink: { '0%,92%,100%': { transform: 'scaleY(1)' }, '96%': { transform: 'scaleY(0.1)' } },
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        pop: 'pop .45s ease-out both',
        fadeUp: 'fadeUp .5s ease-out both',
        wiggle: 'wiggle 1.2s ease-in-out infinite',
        blink: 'blink 5s infinite',
      },
    },
  },
  plugins: [],
}
