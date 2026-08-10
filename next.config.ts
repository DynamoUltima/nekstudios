import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // The seed catalogue's photography.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Anything uploaded through the admin. Download-token URLs all live
      // under /v0/b/<bucket>/o/, so the path narrows this to that one API.
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Two product shots at the 4MB ceiling `lib/firebase/storage.ts` enforces,
      // plus multipart overhead and the rest of the fields. Raise both together.
      bodySizeLimit: "9mb",
    },
  },
  // firebase-admin and its gRPC/OpenTelemetry dependencies expect to be
  // required at runtime, not bundled. Leaving them external keeps the
  // dynamic requires inside @google-cloud/firestore working.
  serverExternalPackages: ["firebase-admin", "@google-cloud/firestore"],
};

export default nextConfig;
