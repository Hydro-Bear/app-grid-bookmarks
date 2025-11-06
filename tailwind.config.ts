import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-alt': 'var(--surface-2)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        brand: 'var(--brand)'
      },
      borderRadius: {
        icon: 'var(--radius-icon)',
        card: 'var(--radius-card)',
        btn: 'var(--radius-btn)'
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        icon: 'var(--shadow-icon)',
        inset: 'var(--inset-gloss)'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif']
      },
      fontSize: {
        xs: 'var(--fs-sm)',
        sm: 'var(--fs-md)',
        base: 'var(--fs-lg)',
        lg: 'var(--fs-xl)',
        xl: 'var(--fs-2xl)'
      },
      lineHeight: {
        tight: 'var(--lh-tight)',
        normal: 'var(--lh-normal)'
      }
    }
  },
  plugins: []
};

export default config;
