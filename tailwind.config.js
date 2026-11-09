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
        'deep-emerald': '#022C22',
        'emerald-800': '#065F46',
        'primary-green': '#00A86B',
        'action-green': '#00C47D',
        'green-highlight': '#2EE59D',
        'mint': '#9FF5CF',
        'pale-mint': '#E3FCF1',
        'midnight-navy': '#0B1437',
        'slate-800': '#1E293B',
        'slate-600': '#475569',
        'slate-500': '#64748B',
        'app-bg': '#F3F6FD',
        'input-bg': '#EEF2FB',
        'border-color': '#E0E7F5',
        'success': '#0E9F5B',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'information': '#4F46E5',
        'royal': '#4F46E5',
        'violet-glow': '#7C3AED',
        'gold': '#F5B83D',
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
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #00C47D 0%, #00A3A3 55%, #4F46E5 100%)',
        'hero-gradient': 'linear-gradient(135deg, #0B1437 0%, #12307A 50%, #4F46E5 100%)',
        'gold-gradient': 'linear-gradient(135deg, #F5B83D 0%, #F97316 100%)',
      },
      boxShadow: {
        'glow': '0 10px 30px -8px rgba(0, 196, 125, 0.55)',
        'soft': '0 8px 30px -12px rgba(11, 20, 55, 0.18)',
        'lift': '0 20px 45px -15px rgba(79, 70, 229, 0.35)',
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
