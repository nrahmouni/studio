
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Suppress warnings for optional modules that may not be installed
    // or for modules that generate noise during the build.

    // For "@opentelemetry/exporter-jaeger":
    // This is an optional OpenTelemetry exporter. Genkit/OpenTelemetry might try to
    // dynamically require it based on environment variables. If it's not present
    // and not configured for use, the application should still run.
    // We use IgnorePlugin to prevent Webpack from erroring or warning on its absence.
    if (!config.plugins) {
      config.plugins = [];
    }
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@opentelemetry\/exporter-jaeger$/,
      })
    );

    // For "require.extensions is not supported by webpack" from Handlebars:
    // This warning is common when Handlebars (a CJS module) is bundled by Webpack.
    // It's generally safe to ignore if Handlebars itself works in your Genkit flows.
    if (!config.ignoreWarnings) {
      config.ignoreWarnings = [];
    }
    config.ignoreWarnings.push(
      {
        module: /node_modules\/handlebars\//,
        message: /require\.extensions/,
      },
      {
        file: /node_modules\/handlebars\//,
        message: /require\.extensions/,
      }
    );

    return config;
  },
};

export default nextConfig;
