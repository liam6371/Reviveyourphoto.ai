/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['replicate.delivery', 'pbxt.replicate.delivery'],
    formats: ['image/webp', 'image/avif'],
    unoptimized: true,
  },
  
  // Optimize static assets
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side optimizations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    
    return config
  },

  // Handle large files better
  experimental: {
    largePageDataBytes: 128 * 1024, // 128KB
  },

  // Compress responses
  compress: true,
}

export default nextConfig
