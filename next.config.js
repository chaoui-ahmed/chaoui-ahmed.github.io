/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [
      "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      "cdn.jsdelivr.net",
      "upload.wikimedia.org",
      "cdn.countryflags.com",
    ],
  },
  experimental: {
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig
