/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize for Vercel
  output: 'standalone',
  // Enable SWC minification
  swcMinify: true,
  // Optimize images
  images: {
    domains: ['logo.clearbit.com', 'cdn.simpleicons.org'],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig

