const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        // 品牌主色調 (Primary Brand Colors)
        'tunghin-amber': '#F2A154',      // 同心暖陽 - 溫暖、生命力與和諧
        'forest-green': '#2D5A27',       // 森林深綠 - 紮根與成長

        // 品牌輔助色 (Secondary Brand Colors)
        'morning-gold': '#FFD700',       // 晨曦金
        'earthy-taupe': '#8D7B68',       // 大地灰褐
        'ethereal-blue': '#A2C2E1',      // 天空粉藍

        // 品牌中性色 (Brand Neutrals)
        'paper-white': '#FDFCF8',        // 紙漿白 - 網頁底色
        'charcoal-text': '#333333',      // 木炭灰 - 主要文字顏色

        // Tailwind 預設色彩系統 (保留作為輔助)
        trueGray: colors.stone,
        neutral: colors.stone,
        primary: colors.amber,           // 保留 amber 作為 primary 的色階
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
