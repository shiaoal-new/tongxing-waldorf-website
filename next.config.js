// ❗ 必須是 tongxing-waldorf-website
const REPO_NAME = 'tongxing-waldorf-website';

module.exports = {
  // i18n: {
  //   locales: ["en"],
  //   defaultLocale: "en",
  // },
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  basePath: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}` : '',
  // target: "serverless",
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback.fs = false;
  //   }
  //   return config;
  // },
  images: {
    unoptimized: true,
  },
};
