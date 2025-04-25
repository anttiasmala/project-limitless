import type { Config } from 'tailwindcss';

export default {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
    keyframes: {
      rainbowBackGroundColor: {
        '0%': {
          backgroundColor: 'red',
        },
        '10%': {
          backgroundColor: 'orange',
        },
        '20%': {
          backgroundColor: 'yellow',
        },
        '30%': {
          backgroundColor: 'green',
        },
        '40%': {
          backgroundColor: 'blue',
        },
        '50%': {
          backgroundColor: 'indigo',
        },
        '60%': {
          backgroundColor: 'violet',
        },
        '70%': {
          backgroundColor: 'black',
        },
      },
      width: {
        '0%': {
          width: '0px',
        },
        '100%': {
          width: '100%',
        },
      },
      highlight: {
        '0%, 50%': {
          filter: 'drop-shadow(0 0px 10px rgb(0 80 190 / 0.05))',
        },
        '25%, 75%': {
          filter: 'drop-shadow(0px 0px 15px #269EEF)',
        },
      },
      background: {
        '0%': {
          backgroundColor: 'yellow',
        },
        '100%': {
          backgroundColor: 'blue',
        },
      },
      opacity: {
        '0%': {
          opacity: '0',
        },
        '100%': {
          opacity: '1',
        },
      },
      spin: {
        to: {
          transform: 'rotate(360deg)',
        },
      },
      ping: {
        '75%, 100%': {
          transform: 'scale(2)',
          opacity: '0',
        },
      },
      pulse: {
        '50%': {
          opacity: '0.5',
        },
      },
      bounce: {
        '0%, 100%': {
          transform: 'translateY(-25%)',
          'animation-timing-function': 'cubic bezier(0.8, 0, 1, 1)',
        },
        '50%': {
          transform: 'none',
          'animation-timing-function': 'cubic bezier(0.8, 0, 0.2, 1)',
        },
      },
    },
    animation: {
      highlight: 'highlight 1200ms ease-in-out',
      rainbowBackGroundColor: 'rainbowBackGroundColor 1000ms',
      background: 'background 1200ms ease-in-out',
      width: 'width 1200ms',
      opacity: 'opacity 800ms',
      spin: 'spin 1s linear infinite',
      ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      bounce: 'bounce 1s infinite',
    },
    backgroundImage: {
      'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      'gradient-conic':
        'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
    },
  },
  plugins: [],
} satisfies Config;
