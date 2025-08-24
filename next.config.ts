import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle Spline runtime dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        assert: false,
        constants: false,
        domain: false,
        punycode: false,
        querystring: false,
        string_decoder: false,
        sys: false,
        timers: false,
        tty: false,
        url: false,
        vm: false,
        zlib: false,
      };
    }

    // Handle Spline-specific chunks
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks?.cacheGroups,
        spline: {
          test: /[\\/]node_modules[\\/]@splinetool[\\/]/,
          name: 'spline',
          chunks: 'all',
          priority: 10,
        },
      },
    };

    return config;
  },
  // Disable static optimization for Spline components
  experimental: {
    optimizePackageImports: ['@splinetool/react-spline', '@splinetool/runtime'],
  },
  devIndicators: {
    buildActivity: false,
  },

};

export default nextConfig;
