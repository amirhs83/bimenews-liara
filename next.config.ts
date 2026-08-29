import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const cspDirectives = [
  "default-src 'self'",
  // Next.js injects inline boot/hydration scripts -> 'unsafe-inline' is required.
  // React-refresh (dev only) additionally needs 'unsafe-eval'.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Tailwind + style attributes used across the design system
  "style-src 'self' 'unsafe-inline'",
  // blob: needed by react-easy-crop (object URLs created for the crop tool)
  "img-src 'self' data: https: blob:",
  "media-src 'self' https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  // video embeds (Aparat / YouTube) only
  "frame-src https://www.aparat.com https://aparat.com https://www.youtube.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // HSTS only makes sense over HTTPS (production); never send it on localhost
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "c267562.parspack.net" },
      { protocol: "https", hostname: "**.parspack.net" },
    ],
  },
  experimental: {
    // admin video uploads can be up to 100MB (multipart overhead included)
    proxyClientMaxBodySize: "120mb",
    // avoid recurring Turbopack cache corruption on this Windows dev machine
    turbopackFileSystemCacheForDev: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
