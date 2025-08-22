import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: { bodySizeLimit: '2mb' }
  },
  async headers() { 
    return [];  // ← must be an array
  },
  async redirects() {
    return [];  // ← must be an array
  },
  async rewrites() {
    return { beforeFiles: [], afterFiles: [], fallback: [] };
  },
}

export default nextConfig
