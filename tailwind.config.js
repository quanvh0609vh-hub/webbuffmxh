/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#0f0f1a',
          DEFAULT: '#0f0f1a',
        },
        secondary: {
          bg: '#1a1a2e',
          DEFAULT: '#1a1a2e',
        },
        card: {
          bg: '#1e1e32',
          DEFAULT: '#1e1e32',
        },
        accent: {
          DEFAULT: '#6C63FF',
          hover: '#5a52d5',
          light: '#8b85ff',
        },
        teal: {
          DEFAULT: '#00d4aa',
          hover: '#00b894',
          light: '#55efc4',
        },
        danger: {
          DEFAULT: '#ff4757',
          hover: '#ff3344',
        },
        warning: {
          DEFAULT: '#ffa502',
          hover: '#ff9500',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a0a0b0',
          muted: '#6b6b80',
        },
        border: {
          DEFAULT: '#2d2d44',
          light: '#3d3d5c',
        },
        sidebar: '#16162a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
