/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // TAVI Brand Colours
        'deep-emerald': '#064E3B',
        'emerald-800': '#065F46',
        'primary-green': '#047857',
        'action-green': '#059669',
        'green-highlight': '#10B981',
        'mint': '#A7F3D0',
        'pale-mint': '#D1FAE5',
        'midnight-navy': '#0F172A',
        'slate-800': '#1E293B',
        'slate-600': '#475569',
        'slate-500': '#64748B',
        'app-bg': '#F8FAFC',
        'input-bg': '#F1F5F9',
        'border-color': '#E2E8F0',
        'success': '#15803D',
        'warning': '#B45309',
        'error': '#B91C1C',
        'information': '#1D4ED8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'icon': '10px',
        'input': '12px',
        'btn': '12px',
        'card': '16px',
        'hero': '20px',
        'sheet': '24px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      fontSize: {
        'hero': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'heading': ['26px', { lineHeight: '34px', fontWeight: '700' }],
        'section': ['19px', { lineHeight: '27px', fontWeight: '600' }],
        'card-title': ['15px', { lineHeight: '23px', fontWeight: '600' }],
        'body': ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'btn': ['15px', { lineHeight: '22px', fontWeight: '600' }],
        'label': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'meta': ['11px', { lineHeight: '16px', fontWeight: '500' }],
      },
      screens: {
        'xs': '320px',
        'sm': '390px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
      animation: {
        'skeleton': 'skeleton 1.4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.18s ease-out',
        'slide-up': 'slideUp 0.22s ease-out',
        'slide-down': 'slideDown 0.22s ease-out',
      },
      keyframes: {
        skeleton: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
