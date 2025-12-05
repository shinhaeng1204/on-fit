import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // 🔥 Supabase Storage 이미지 허용 설정
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mrezpxcbewhsqccbdptd.supabase.co", 
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
