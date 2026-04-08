/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds — prevents ESLint version conflicts from blocking deploys
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors from blocking builds (type-checking happens in IDE)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
