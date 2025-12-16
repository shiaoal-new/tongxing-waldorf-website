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

  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  // basePath: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}` : '',
  images: {
    unoptimized: true,
  },
};
