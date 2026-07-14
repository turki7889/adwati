/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for deploy flexibility
  output: process.env.NEXT_EXPORT === "true" ? "export" : undefined,

  // Allow @ffmpeg/ffmpeg WASM assets
  webpack(config, { isServer }) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Ignore Node.js-specific modules from @huggingface/transformers
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        "onnxruntime-node": false,
      };
    }

    // Fix: Treat .mjs files from node_modules as javascript/auto
    // so Terser doesn't choke on ESM syntax
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    // Ignore Node.js .node binary modules
    config.module.rules.push({
      test: /\.node$/,
      loader: "ignore-loader",
    });

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

  // Performance optimizations
  compress: true,
  swcMinify: true,

  // Cache-control headers for static assets
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
      {
        source: "/tools/:category/:tool",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },

  // Optimize package imports for tree-shaking
  experimental: {
    optimizePackageImports: ["pdf-lib", "jszip"],
  },
};

export default nextConfig;
