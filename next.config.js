// ❗ 必須是 tongxing-waldorf-website
const REPO_NAME = 'tongxing-waldorf-website';

let gitBranch = 'unknown';
let gitCommitMsg = 'unknown';
let gitCommitTime = 'unknown';
try {
  const { execSync } = require('child_process');
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  gitCommitMsg = execSync('git log -1 --format=%s').toString().trim();
  gitCommitTime = execSync('git log -1 --format=%cd').toString().trim();
} catch (e) {
  console.warn('Failed to fetch git info:', e);
}

module.exports = {
  env: {
    NEXT_PUBLIC_GIT_BRANCH: gitBranch,
    NEXT_PUBLIC_GIT_COMMIT_MSG: gitCommitMsg,
    NEXT_PUBLIC_GIT_COMMIT_TIME: gitCommitTime,
    NEXT_PUBLIC_BUILD_TIME: new Date().toString(),
    NEXT_PUBLIC_ACTION_RUN_TIME: process.env.NEXT_PUBLIC_ACTION_RUN_TIME || null,
  },

  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  // basePath: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}` : '',
  images: {
    unoptimized: true,
  },
  experimental: {
    reactCompiler: true,
  },
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin/index.html',
      },
      {
        source: '/admin/',
        destination: '/admin/index.html',
      },
    ]
  },
};
