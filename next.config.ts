/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',  // Google profile images
      'i.pravatar.cc',              // Pravatar avatars (used in seed data)
      'picsum.photos',              // Lorem Picsum (used in seed data)
      'avatars.githubusercontent.com', // GitHub profile images
      'platform-lookaside.fbsbx.com', // Facebook profile images
      'pbs.twimg.com',              // Twitter profile images
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['bcrypt'],
  },
};

module.exports = nextConfig;