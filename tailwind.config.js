/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ms: {
          black:    '#0A0A0A',
          charcoal: '#1A1A1A',
          blue:     '#1B3670',    // dark blue from the Jeepney graphic
          'blue-mid': '#2A4A94',
          cream:    '#F5F4F0',
          white:    '#FAFAFA',
          gray:     '#9A9A9A',
          'gray-light': '#E8E7E3',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:  ['"DM Mono"', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.3em',
      },
      animation: {
        'grain': 'grain 8s steps(10) infinite',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.4s ease',
      },
      keyframes: {
        grain: {
          '0%, 100%': { transform: 'translate(0,0)' },
          '10%':  { transform: 'translate(-5%,-10%)' },
          '20%':  { transform: 'translate(-15%,5%)' },
          '30%':  { transform: 'translate(7%,-25%)' },
          '40%':  { transform: 'translate(-5%,25%)' },
          '50%':  { transform: 'translate(-15%,10%)' },
          '60%':  { transform: 'translate(15%,0%)' },
          '70%':  { transform: 'translate(0%,15%)' },
          '80%':  { transform: 'translate(3%,35%)' },
          '90%':  { transform: 'translate(-10%,10%)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
