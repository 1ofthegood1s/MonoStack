import type { NextConfig } from 'next';

// Static export served from GitHub Pages at /MonoStack. To host as a normal
// Next.js server app (e.g. on Lily), drop `output` and `basePath`.
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/MonoStack',
  images: { unoptimized: true },
  // The game boots imperatively and owns window listeners; StrictMode's dev
  // double-mount would detach its canvas.
  reactStrictMode: false,
};

export default nextConfig;
