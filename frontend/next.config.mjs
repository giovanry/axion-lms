const isExport = process.env.TAURI_BUILD === "true" || process.env.NEXT_EXPORT === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: isExport ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: isExport ? true : false,
  ...(isExport
    ? {}
    : {
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: "http://localhost:8000/api/:path*",
            },
          ];
        },
      }),
};

export default nextConfig;
