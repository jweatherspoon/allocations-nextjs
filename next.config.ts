import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    // Routes from the pre-redesign app now live on the home screen / this month.
    return [
      { source: '/funds', destination: '/', permanent: true },
      { source: '/funds/new-fund', destination: '/', permanent: true },
      { source: '/plans', destination: '/', permanent: true },
      { source: '/plans/:path*', destination: '/', permanent: true },
      { source: '/profile', destination: '/', permanent: true },
      { source: '/analytics', destination: '/month', permanent: true },
      { source: '/insights', destination: '/month', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
