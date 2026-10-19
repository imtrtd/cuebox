import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Required by OpenNext so the workerd build of Prisma is bundled.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  // pg loads pg-cloudflare lazily on workerd; make sure the tracer ships it.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/pg-cloudflare/**/*"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;

// Lets `next dev` read Cloudflare bindings/env the same way the Worker does.
if (process.env.NODE_ENV === "development" && process.env.CUEBOX_CF_DEV === "1") {
  import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
}
