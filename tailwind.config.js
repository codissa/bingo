/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Festive neon palette — tweak freely on the night.
        ink: '#070617', // deep background
        panel: '#120f2e',
        neon: {
          pink: '#ff3db5',
          purple: '#a855f7',
          blue: '#38bdf8',
          green: '#34d399',
          yellow: '#fde047',
          orange: '#fb923c',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 12px rgba(168,85,247,0.55), 0 0 32px rgba(56,189,248,0.35)',
        'neon-pink': '0 0 16px rgba(255,61,181,0.65), 0 0 42px rgba(255,61,181,0.35)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.2s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 12s ease infinite',
      },
    },
  },
  plugins: [],
}
