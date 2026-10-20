/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Storm Command brand palette ─────────────────────────────────
        // Core backgrounds
        midnight:   '#0B1220',
        'deep-slate': '#172638',
        surface:    '#111C2B',
        border:     '#26394D',

        // Text
        'cloud-white': '#F4F5F2',
        'text-secondary': '#B8C6D4',
        'text-muted': '#8798AA',

        // Accents / status
        cyan:       '#36D6C4',
        amber:      '#FFB547',
        coral:      '#FF6268',
        'success-green': '#65D6A6',
        'info-blue': '#79B8FF',

        // Legacy palette – kept for backward compat with existing pages
        emergency: {
          50:  '#fff1f1',
          100: '#ffe0e0',
          200: '#ffc5c5',
          300: '#ff9898',
          400: '#FF6268',
          500: '#FF6268',
          600: '#e8474d',
          700: '#c83138',
          800: '#a62328',
          900: '#841e24',
          950: '#3f0a0e',
        },
        relief: {
          50:  '#edfcf9',
          100: '#d3f7f2',
          200: '#aaeee6',
          300: '#71e0d5',
          400: '#36D6C4',
          500: '#22b9a8',
          600: '#1a948a',
          700: '#1a7570',
          800: '#1a5e5b',
          900: '#1a4e4b',
          950: '#082f2d',
        },
        slate: {
          850: '#151f32',
          950: '#070d19',
        },
      },

      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },

      borderRadius: {
        'control': '8px',
        'card':    '14px',
        'panel':   '16px',
      },

      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.25), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
        'card': '0 4px 16px -2px rgba(11, 18, 32, 0.5), 0 2px 6px -2px rgba(11, 18, 32, 0.3)',
        'modal': '0 20px 40px -8px rgba(0, 0, 0, 0.65)',
        'drawer': '-8px 0 24px -4px rgba(0, 0, 0, 0.5)',
      },

      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
        'fadeIn': 'fadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slideLeft': 'slideLeft 220ms cubic-bezier(0.16, 1, 0.3, 1)',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
