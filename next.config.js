/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  basePath: "/app/ams",
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "developers.google.com",
      "f003.backblazeb2.com",
    ], // Include both domains in the array
  },
};

module.exports = nextConfig;
