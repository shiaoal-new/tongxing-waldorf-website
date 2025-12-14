module.exports = {
  // i18n: {
  //   locales: ["en"],
  //   defaultLocale: "en",
  // },
  output: "export",
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
