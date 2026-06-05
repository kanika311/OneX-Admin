import type { NextConfig } from "next";

const apiHost = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, "").replace(/\/api\/?$/, "").split("/")[0];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost", port: "5000", pathname: "/uploads/**" },
      { protocol: "https", hostname: "onex-backend-7p9r.onrender.com", pathname: "/uploads/**" },
      ...(apiHost && apiHost !== "onex-backend-7p9r.onrender.com"
        ? [{ protocol: "https" as const, hostname: apiHost, pathname: "/uploads/**" }]
        : []),
    ],
  },
};

export default nextConfig;
