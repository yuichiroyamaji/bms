import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* output: "standalone", */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: { svgo: false },
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
