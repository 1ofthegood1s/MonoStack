import type { NextConfig } from 'next';

// Two deploy targets from one repo:
// - GitHub Pages (CI sets GITHUB_ACTIONS=true): static export under /MonoStack.
// - Lily / any Next server host (and local dev): standard server build at /.
const pagesBuild = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  ...(pagesBuild ? { output: 'export' as const, basePath: '/MonoStack' } : {}),
  images: { unoptimized: true },
  // The game boots imperatively and owns window listeners; StrictMode's dev
  // double-mount would detach its canvas.
  reactStrictMode: false,
};

export default nextConfig;
