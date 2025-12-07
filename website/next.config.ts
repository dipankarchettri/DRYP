import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Enables the new React Compiler (from your original config) */
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },

  /* Your API proxy rewrites */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://dryp.onrender.com/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'https://dryp.onrender.com/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;