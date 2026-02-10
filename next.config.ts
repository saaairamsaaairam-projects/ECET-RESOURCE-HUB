import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jzahoijywicbyxcarucd.supabase.co",
      },
    ],
  },
};

export default nextConfig;
