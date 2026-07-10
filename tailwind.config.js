const getSpacing = function () {
  const len = 50;
  const obj = {};
  for (let index = 0; index <= len; index++) {
    obj[index] = index * 2 + 'px';
  }
  return obj;
};

const allSpacing = {
  ...getSpacing(),
  56: '112px',
  75: '150px',
  100: '200px',
  108: '216px',
  150: '300px',
  200: '400px',
  256: '512px',
  275: '450px',
  '1/2': '50%',
  '1/3': '33.33%',
  '2/3': '66.66%',
  '1/4': '25%',
  '3/4': '75%',
  '1/5': '20%',
  '2/5': '40%',
  '1/10': '10%',
  line: '1px',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/portfolio/**/*.{js,ts,jsx,tsx,mdx}',
    './src/projects/mint-forest/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        disabled: 'var(--disabled-color)',
        success: 'var(--success-color)',
        waring: 'var(--waring-color)',
        error: 'var(--error-color)',
        border: 'var(--border-color)',
        line: 'var(--line-color)',
        'text-lv1': 'var(--text-lv1-color)',
        'text-lv2': 'var(--text-lv2-color)',
        'background-lv1': 'var(--background-lv1-color)',
        'background-lv2': 'var(--background-lv2-color)',
      },
      fontFamily: {
        montserrat: ['var(--font-montserrat)'],
        DINCond: ['var(--font-DINCond)'],
      },
      fontSize: {
        sm: [
          '12px',
          {
            lineHeight: '1.2',
            fontWeight: '400',
          },
        ],
        md: [
          '14px',
          {
            lineHeight: '24px',
            fontWeight: '500',
          },
        ],
        lg: [
          '16px',
          {
            lineHeight: '24px',
            fontWeight: '500',
          },
        ],
      },
      borderRadius: {
        none: '0',
        circle: '50%',
        '2xs': '2px',
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '14px',
        '3xl': '16px',
      },
      borderWidth: {
        half: '0.5px',
      },
      boxShadow: {
        md: '0px 8px 32px rgba(0, 0, 0, 0.10)',
      },
      spacing: allSpacing,
    },
  },
  plugins: [],
};
