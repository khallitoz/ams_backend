/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  basePath: "/app/ams",
  transpilePackages: [
    "@mui/material",
    "@mui/icons-material",
    "@mui/x-data-grid",
    "@mui/x-date-pickers",
    "@mui/utils", // Added @mui/utils to ensure it's transpiled
    "@mui/system", // Added @mui/system as it's often related
  ],
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "developers.google.com",
      "f003.backblazeb2.com",
    ],
  },
  webpack: (config, { isServer }) => {
    // Add resolver for .js extensions to properly handle MUI imports
    config.resolve.extensionAlias = {
      ".js": [".js", ".jsx", ".ts", ".tsx"],
    };

    // Add resolution for MUI imports
    config.resolve.alias = {
      ...config.resolve.alias,
      "@mui/utils/composeClasses": "@mui/utils/composeClasses/index.js",
    };

    return config;
  },
};

module.exports = nextConfig;
