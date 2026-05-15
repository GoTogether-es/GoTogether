/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gotogether/ui', '@gotogether/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
