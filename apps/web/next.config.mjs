/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gotogether/ui', '@gotogether/shared'],
  output: 'standalone',
};

export default nextConfig;
