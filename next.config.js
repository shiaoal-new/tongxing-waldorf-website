// ❗ 必須是 tongxing-waldorf-website
const REPO_NAME = 'tongxing-waldorf-website';

let gitBranch = 'unknown';
try {
  const { execSync } = require('child_process');
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
} catch (e) {
  console.warn('Failed to fetch git branch:', e);
}

module.exports = {
  env: {
    NEXT_PUBLIC_GIT_BRANCH: gitBranch,
  },
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
