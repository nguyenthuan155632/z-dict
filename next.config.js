/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig

