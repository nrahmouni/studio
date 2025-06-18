
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
  // The webpack function is removed as it's not used by Turbopack
  // and was causing the warning: "Webpack is configured while Turbopack is not".
  // If warnings previously suppressed by this block (e.g., for OpenTelemetry or Handlebars)
  // reappear and are problematic, they may need Turbopack-specific solutions or to be accepted.
};

export default nextConfig;
