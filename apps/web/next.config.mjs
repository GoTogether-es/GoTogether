import bundleAnalyzer from '@next/bundle-analyzer';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);

function findZodV4Core() {
  const zodPkg = path.dirname(require.resolve('zod/package.json'));
  const cjsPath = path.join(zodPkg, 'v4', 'core', 'index.cjs');
  if (fs.existsSync(cjsPath)) return cjsPath;
  const jsPath = path.join(zodPkg, 'v4', 'core', 'index.js');
  if (fs.existsSync(jsPath)) return jsPath;
  return cjsPath;
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@gotogether/ui', '@gotogether/shared'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'zod/v4/core': findZodV4Core(),
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://*.supabase.co",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co http://localhost:4000 https://go-together-api-tau.vercel.app wss: ws:",
              "frame-ancestors 'none'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
});

export default nextConfig;
