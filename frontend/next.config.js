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
    NEXT_PUBLIC_ACTION_RUN_TIME: process.env.NEXT_PUBLIC_ACTION_RUN_TIME || '',
  },

  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  // basePath: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}` : '',
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
  async rewrites() {
    const rewrites = [
      {
        source: '/admin',
        destination: '/admin/index.html',
      },
      {
        source: '/admin/',
        destination: '/admin/index.html',
      },
    ];

    // 只有在非導出模式（開發模式）才加入 API 代理，讓 npm run dev 能接到 Emulator
    if (process.env.NEXT_OUTPUT !== 'export') {
      rewrites.push({
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5001/tongxing-waldorf-website/us-central1/:path*',
      });
    }

    return rewrites;
  },
};
