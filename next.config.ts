import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    cacheComponents: true,
    partialPrefetching: true,
    images: {
        remotePatterns: [new URL("https://cdn.buienradar.nl/resources/images/icons/weather/**")],
    },
    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
};

export default nextConfig;
