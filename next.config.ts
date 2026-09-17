import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/docs/action",
        destination: "/guides/install-github-action-failure-teaser",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
