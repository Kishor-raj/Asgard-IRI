/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#03060f',
          dark:    '#02040a',
          light:   '#0c142a',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#E2C97E',
          dark:    '#A6873A',
        },
        grey: {
          50:  '#F8F9FB',
          100: '#F1F3F7',
          200: '#E2E6EE',
          400: '#9CA3AF',
          600: '#4B5563',
          900: '#111827',
        },
        ink: {
          900: '#03060f',
          800: '#060b18',
          700: '#091021',
          600: '#0c142a',
          500: '#101a36',
        },
        cream: '#fbf9f3',
        parchment: {
          DEFAULT: '#f7f3ea',
          2: '#efe8d8',
        },
        success: '#16A34A',
        warning: '#D97706',
        error:   '#DC2626',
        info:    '#2563EB',
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif:   ['Cormorant Garamond', 'Georgia', 'serif'],
        display: ['Cormorant Garamond', 'Poppins', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1rem' }],
        'sm':   ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem',     { lineHeight: '1.75rem' }],
        'lg':   ['1.125rem', { lineHeight: '1.875rem' }],
        'xl':   ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl':  ['1.5rem',   { lineHeight: '2rem' }],
        '3xl':  ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl':  ['2.25rem',  { lineHeight: '2.75rem' }],
        '5xl':  ['3rem',     { lineHeight: '3.5rem' }],
      },
      borderRadius: {
        'sm':  '0.25rem',
        'md':  '0.5rem',
        'lg':  '0.75rem',
        'xl':  '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card':    '0 2px 8px rgba(0,0,0,0.08)',
        'card-md': '0 4px 16px rgba(0,0,0,0.12)',
        'card-lg': '0 8px 32px rgba(0,0,0,0.16)',
        'nav':     '0 2px 12px rgba(11,31,75,0.15)',
      },
      maxWidth: {
        'content': '1200px',
        'narrow':  '800px',
        'wide':    '1440px',
      },
      screens: {
        'xs':  '480px',
        'sm':  '640px',
        'md':  '768px',
        'lg':  '1024px',
        'xl':  '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};
