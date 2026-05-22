/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-neon'],
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  allowedDevOrigins: ['mayflower-recipient-overcome.ngrok-free.dev'],
}

module.exports = nextConfig