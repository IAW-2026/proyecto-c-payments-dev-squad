/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
}

module.exports = nextConfig