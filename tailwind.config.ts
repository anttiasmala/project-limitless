import type { Config } from 'tailwindcss';

const config: Config = {
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
        bgPage: '#FAF6F2',
        bgForms: '#F7F7F5',
        primaryDark: '#A3766B', // Rosa dark
        primary: '#BC9288', // Rosa
        primaryLight: '#ECD7D2', // Rosa light
        secondaryDark: '#6A744C', // Green dark
        secondary: '#6A744C', // Green
        lines: '#594F47',
        text: '#BC9288',
        primaryText: '#404040',
        textWhite: '#FFFFFF',
        // Port Royal (/port-royal) — a self-contained parchment-and-ink palette
        // lifted from the `Port Royal Prototype.dc.html` design hand-off. It is
        // deliberately independent of the rosa/green site theme and has no dark
        // counterpart: the board commits to one aesthetic and ignores `.dark`.
        portRoyal: {
          ground: '#EFE3C8', // board / parchment ground
          parchment: '#E2D2AF', // recessed panel fills
          vellum: '#F5EBD6', // modal + drawer surfaces
          card: '#FFFCF4', // card faces
          ink: '#1F2A33', // primary text, dark chrome
          slate: '#4A5560', // secondary text
          steel: '#3C4B57', // dividers on dark chrome
          brass: '#B8862F', // primary accent
          brassLight: '#C9963A', // accent text on dark chrome
          brassDeep: '#6B4D18', // glyphs on brass chips
          wood: '#8C6A43', // rules, borders, small caps labels
          teal: '#1B4B4F', // secondary accent (influence)
          tealDeep: '#123437',
          crimson: '#8E3B2F', // bust / loss / tax
          crimsonDeep: '#6D2C23',
          sand: '#D9C79C', // handover subtitle
          blush: '#F0D9CF', // bust body copy
        },
      },
      fontFamily: {
        spectral: ['var(--font-spectral)', 'Georgia', 'serif'],
        archivo: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
        'archivo-narrow': ['var(--font-archivo-narrow)', 'sans-serif'],
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
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.4)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        highlight: 'highlight 1200ms ease-in-out',
        rainbowBackGroundColor: 'rainbowBackGroundColor 1000ms',
        background: 'background 1200ms ease-in-out',
        width: 'width 1200ms',
        opacity: 'opacity 800ms',
        pop: 'pop 0.3s ease-out',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
export default config;
