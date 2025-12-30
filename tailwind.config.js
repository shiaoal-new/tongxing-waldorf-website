const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

const { brandMeta, tunghinAmberScale } = require("./lib/brand-config");

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

module.exports = {
  brand: brandMeta,
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/data/**/*.{yml,yaml,md}"
  ],
  darkMode: ["class", '[data-theme="dark"]'], // Support both class and daisyUI dark theme
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
      spacing: {
        'section': 'var(--spacing-section)',
        'component': 'var(--spacing-component)',
        'paragraph': 'var(--spacing-paragraph)',
        'ultrawide-margin': 'var(--spacing-ultrawide-margin)',
        'desktop-margin': 'var(--spacing-desktop-margin)',
        'mobile-margin': 'var(--spacing-mobile-margin)',
      },
      screens: {
        'sm': '40rem',   // 640px
        'md': '48rem',   // 768px
        'lg': '64rem',   // 1024px
        // 寬度超過 1200px 時使用動態縮放，因此停用更高的中斷點以維持 1200px 的佈局結構
        'xl': '9999rem',
        '2xl': '9999rem',
        '3xl': '9999rem',
      },
      maxWidth: {
        'brand': 'var(--layout-max-width)',
      },
      lineHeight: {
        'brand': 'var(--typography-line-height)',
      },
      letterSpacing: {
        'brand': 'var(--typography-letter-spacing)',
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
      scale: {
        '98': '0.98',
      },
    },
    fontFamily: {
      sans: ['var(--font-body)', "Inter", ...defaultTheme.fontFamily.sans],
      serif: ['var(--font-heading)', ...defaultTheme.fontFamily.serif],
      heading: ['var(--font-heading)', ...defaultTheme.fontFamily.serif],
      body: ['var(--font-body)', ...defaultTheme.fontFamily.sans],
      accent: ['var(--font-accent)', 'cursive'],
      stock: [defaultTheme.fontFamily.sans],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      {
        tongxing: {
          "primary": "#f2a154",
          "secondary": "#2d5a27",
          "accent": "#ffd700",
          "neutral": "#333333",
          "base-100": "#fdfcf8",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
    ],
  },
};
