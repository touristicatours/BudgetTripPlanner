/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for Next.js
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

module.exports = nextConfig
