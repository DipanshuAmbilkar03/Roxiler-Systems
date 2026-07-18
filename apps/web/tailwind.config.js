/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        canvas: {
          DEFAULT: '#050510',
          soft: '#0a0a1e',
          deep: '#030308',
        },
        panel: {
          DEFAULT: '#0c0c1e',
          muted: '#12122a',
        },
        ink: {
          DEFAULT: '#e8edf8',
          soft: '#c0c8e0',
        },
        muted: {
          DEFAULT: '#94a3b8',
        },
        line: {
          DEFAULT: '#18182f',
          strong: '#28284a',
        },
        surface: {
          DEFAULT: '#050510',
          elevated: '#0c0c1e',
          muted: '#0a0a18',
        },
        sidebar: {
          DEFAULT: '#06061a',
          elevated: '#0c0c22',
          border: '#1a1a38',
          muted: '#8b9bb0',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        token: '0.9rem',
        'token-sm': '0.65rem',
        'token-lg': '1.15rem',
      },
      boxShadow: {
        soft: '0 1px 0 rgba(255,255,255,0.03), 0 10px 24px rgba(0,0,0,0.28)',
        glow: '0 0 0 1px rgba(59,130,246,0.12), 0 14px 32px rgba(0,0,0,0.32)',
        card: '0 1px 0 rgba(255,255,255,0.03), 0 16px 36px -18px rgba(0,0,0,0.5)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      transitionDuration: {
        fast: '140ms',
        base: '220ms',
        slow: '320ms',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'shimmer-slide': {
          to: { transform: 'translate(calc(100cqw - 100%), 0)' },
        },
        'spin-around': {
          '0%': { transform: 'translateZ(0) rotate(0)' },
          '15%, 35%': { transform: 'translateZ(0) rotate(90deg)' },
          '65%, 85%': { transform: 'translateZ(0) rotate(270deg)' },
          '100%': { transform: 'translateZ(0) rotate(360deg)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        'marquee-vertical': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(calc(-100% - var(--gap)))' },
        },
        shine: {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          to: { backgroundPosition: '0% 0%' },
        },
        gradient: {
          to: { backgroundPosition: 'var(--bg-size, 300%) 0' },
        },
        ripple: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { transform: 'translate(-50%, -50%) scale(0.9)' },
        },
        meteor: {
          '0%': {
            transform: 'rotate(var(--angle)) translateX(0)',
            opacity: '1',
          },
          '70%': { opacity: '1' },
          '100%': {
            transform: 'rotate(var(--angle)) translateX(-500px)',
            opacity: '0',
          },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
        float: 'float 5s ease-in-out infinite',
        'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
        'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
        marquee: 'marquee var(--duration) linear infinite',
        'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
        shine: 'shine var(--duration) infinite linear',
        gradient: 'gradient 8s linear infinite',
        ripple: 'ripple var(--duration, 2s) ease calc(var(--i, 0) * 0.2s) infinite',
        meteor: 'meteor 5s linear infinite',
      },
    },
  },
  plugins: [],
};


