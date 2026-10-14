import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function copyPdfWorker() {
  const candidates = ["pdfjs-dist/build/pdf.worker.min.mjs", "pdfjs-dist/build/pdf.worker.mjs"];
  for (const candidate of candidates) {
    try {
      const source = require.resolve(candidate);
      const publicDir = path.join(root, "public");
      mkdirSync(publicDir, { recursive: true });
      copyFileSync(source, path.join(publicDir, "pdf.worker.min.mjs"));
      return;
    } catch {
      // Try the next worker filename shipped by pdfjs-dist.
    }
  }
  throw new Error("Could not find the pdf.js worker in pdfjs-dist. Run npm install before building.");
}

copyPdfWorker();

const nextConfig: NextConfig = {
  outputFileTracingRoot: root,
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  serverExternalPackages: ["pdfjs-dist", "docx", "@ffmpeg/ffmpeg", "@ffmpeg/util"],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
