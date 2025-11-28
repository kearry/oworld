/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['bcrypt'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google profile images
      { protocol: 'https', hostname: 'i.pravatar.cc' }, // Pravatar avatars (seed)
      { protocol: 'https', hostname: 'picsum.photos' }, // Lorem Picsum (seed)
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }, // GitHub profile images
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' }, // Facebook profile images
      { protocol: 'https', hostname: 'pbs.twimg.com' }, // Twitter images
      { protocol: 'http', hostname: 'localhost' }, // local dev
    ],
  },
  experimental: {
  
  },
};

module.exports = nextConfig;
