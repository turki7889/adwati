/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for deploy flexibility
  output: process.env.NEXT_EXPORT === "true" ? "export" : undefined,

  // Allow @ffmpeg/ffmpeg WASM assets
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },

  // Image optimization for browser-side tools
  images: {
    unoptimized: true,
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // React strict mode for dev
  reactStrictMode: true,
};

export default nextConfig;
