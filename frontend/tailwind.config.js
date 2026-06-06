/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#013e37',
        forestLight: '#025c52',
        butter: '#ffefb3',
        riskLow: '#4ade80',
        riskMedium: '#fbbf24',
        riskHigh: '#f87171',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        gradient: 'linear-gradient(135deg, #013e37 0%, #025c52 50%, #013e37 100%)',
      },
      boxShadow: {
        glow: '0 0 30px rgba(255, 239, 179, 0.15)',
        glowStrong: '0 0 40px rgba(255, 239, 179, 0.3)',
      },
    },
  },
  plugins: [],
}
