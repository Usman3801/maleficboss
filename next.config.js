/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Add fallbacks for Node.js modules not available in browser
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
    };

    // Fix @scure/bip39 wordlist imports for demosdk
    config.resolve.alias = {
      ...config.resolve.alias,
      '@scure/bip39/wordlists/english.js': require.resolve('@scure/bip39/wordlists/english'),
    };

    // Ignore specific warnings from ethers/wagmi/demosdk
    config.ignoreWarnings = [
      { module: /node_modules\/@wagmi/ },
      { module: /node_modules\/wagmi/ },
      { module: /node_modules\/@kynesyslabs\/demosdk/ },
    ];

    // Handle external modules properly
    if (!isServer) {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
    }

    return config;
  },
};

module.exports = nextConfig;
