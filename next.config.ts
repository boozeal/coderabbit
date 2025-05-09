import type { NextConfig } from "next";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

const nextConfig: NextConfig = {
  /* config options here */

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ["javascript", "typescript", "json", "css", "html"],
          filename: "static/[name].worker.js", // 워커가 _next/static 아래로 들어갑니다
        })
      );
    }

    return config;
  },
};

export default nextConfig;
