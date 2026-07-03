import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        peek: {
          // warm paper tones
          canvas: '#EDE7DA', // infinite canvas backdrop
          cream: '#F5F1E8', // panels / nav
          paper: '#FBF8F1', // scrap paper
          kraft: '#D8BC91',
          beige: '#E7DDC9',
          tan: '#D9C9B2',
          // ink + accents
          ink: '#3B3630',
          brown: '#8A7A64',
          muted: '#A99C88',
          dustpink: '#D6B2A8',
          dustblue: '#9BB4B2',
          sage: '#AEB79C',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        hand: ['Caveat', 'cursive'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        scrap: '0 1px 2px rgba(59,54,48,0.10), 0 6px 14px rgba(59,54,48,0.12)',
        'scrap-hover': '0 2px 4px rgba(59,54,48,0.12), 0 12px 26px rgba(59,54,48,0.18)',
        panel: '0 10px 40px rgba(59,54,48,0.14)',
        pill: '0 2px 10px rgba(59,54,48,0.12)',
      },
      transitionTimingFunction: {
        cozy: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
