const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

const tunghinAmberScale = {
  50: '#fff9ed',
  100: '#ffefd4',
  200: '#ffdca9',
  300: '#ffbf71',
  400: '#f2a154', // 品牌主色
  500: '#eb8129',
  600: '#df661b',
  700: '#b94c18',
  800: '#933d1b',
  900: '#773419',
  950: '#401809',
};

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        // 品牌設計系統色彩 (對應 docs/design-system.md)
        'brand-accent': withOpacity('--color-brand-accent'),
        'brand-structural': withOpacity('--color-brand-structural'),
        'brand-gold': withOpacity('--color-brand-gold'),
        'brand-taupe': withOpacity('--color-brand-taupe'),
        'brand-blue': withOpacity('--color-brand-blue'),
        'brand-bg': withOpacity('--color-brand-bg'),
        'brand-text': withOpacity('--color-brand-text'),

        // Tailwind 預設色彩系統 (保留作為輔助)
        trueGray: colors.stone,
        neutral: colors.stone,
        primary: tunghinAmberScale,
        secondary: colors.indigo,
        success: colors.emerald,
        info: colors.blue,
        warning: colors.yellow,
        error: colors.red,
      },
      keyframes: {
        slideInLeft: {
          '0%': {
            transform: 'translateX(-20%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
      },
      animation: {
        slideInLeft: 'slideInLeft 1s ease-out',
      },
    },
    fontFamily: {
      sans: ["Inter", ...defaultTheme.fontFamily.sans],
      stock: [defaultTheme.fontFamily.sans],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
