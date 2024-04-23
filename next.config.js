/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'referrer-policy', value: 'no-referrer' }
        ]
      }
    ]
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // async redirects() {
  //   return [
  //     // Basic redirect
  //     {
  //       source: '/',
  //       destination: '/invoices',
  //       permanent: false,
  //     },
  //     // // Wildcard path matching
  //     // {
  //     //   source: '/blog/:slug',
  //     //   destination: '/news/:slug',
  //     //   permanent: true,
  //     // },
  //   ]
  // },
}

module.exports = nextConfig
