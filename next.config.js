/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/attachments/:path*',
        destination: 'http://localhost:3001/attachments/:path*',
      },
    ];
  },
};

export default nextConfig;
