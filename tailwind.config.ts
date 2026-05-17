import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tm-blue':          '#7697F5',
        'tm-blue-700':      '#5A7DDC',
        'tm-blue-100':      '#E4ECFE',
        'tm-blue-050':      '#EFF3FF',
        'tm-orange':        '#EF9B5B',
        'tm-orange-700':    '#D17F3D',
        'tm-green':         '#9CF1C4',
        'tm-green-700':     '#4FBA88',
        'tm-ink':           '#1A1A2E',
        'tm-ink-700':       '#3B3B55',
        'tm-ink-500':       '#6B6B85',
        'tm-ink-300':       '#A6A6BA',
        'tm-surface':       '#F5F7FF',
        'tm-error':         '#E53935',
        'tm-border':        '#E5E7F0',
        'tm-border-strong': '#CDD2E1',
      },
      borderRadius: {
        'card':  '12px',
        'btn':   '20px',
        'sheet': '24px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(26,26,46,0.08)',
        'pop':  '0 8px 24px rgba(26,26,46,0.12)',
        'press':'0 1px 2px rgba(26,26,46,0.06)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
}

export default config
