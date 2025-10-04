const nextConfig = {
  // App directory is enabled by default in Next.js 13+
  
  // Optimize for faster HMR and development
  experimental: {
    // Enable faster refresh
    optimizePackageImports: ['react', 'react-dom'],
  },
  
  // Webpack optimizations for development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimize HMR for faster development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      
      // Reduce bundle size for faster compilation
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Create a separate chunk for vendor libraries
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20
            },
            // Create a separate chunk for common modules
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true
            }
          }
        }
      };
    }
    
    return config;
  },
  
  // Enable faster builds
  swcMinify: true,
  
  // Optimize images
  images: {
    domains: [],
  },
}

module.exports = nextConfig
