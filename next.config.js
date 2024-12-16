/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com", "developers.google.com"], // Include both domains in the array
  },
};

module.exports = nextConfig;
