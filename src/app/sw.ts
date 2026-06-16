import {
  Serwist,
  CacheFirst,
  StaleWhileRevalidate,
  NetworkFirst,
} from "serwist";

declare global {
  interface ServiceWorkerGlobalScope {
    __SW_MANIFEST: (string | { url: string; revision: string })[];
  }
}

const swManifest = (
  self as unknown as ServiceWorkerGlobalScope
).__SW_MANIFEST;

const serwist = new Serwist({
  precacheEntries: swManifest,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: "google-fonts-webfonts",
      }),
    },
    {
      matcher: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: new StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
      }),
    },
    {
      matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "static-font-assets",
      }),
    },
    {
      matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "static-image-assets",
      }),
    },
    {
      matcher: /\/_next\/static.+\.js$/i,
      handler: new CacheFirst({
        cacheName: "next-static-js-assets",
      }),
    },
    {
      matcher: /\.(?:js)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "static-js-assets",
      }),
    },
    {
      matcher: /\.(?:css|less)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "static-style-assets",
      }),
    },
    {
      matcher: /\/_next\/data\/.+\/.+\.json$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "next-data",
      }),
    },
    {
      matcher: /\.(?:json|xml|csv)$/i,
      handler: new NetworkFirst({
        cacheName: "static-data-assets",
      }),
    },
    {
      matcher: ({ url, request }: { url: URL; request: Request }) => {
        const isSameOrigin = self.origin === url.origin;
        if (!isSameOrigin) return false;
        if (request.method !== "GET") return false;
        const pathname = url.pathname;
        if (pathname.startsWith("/api/")) return false;
        if (pathname.startsWith("/offline")) return false;
        return true;
      },
      handler: new NetworkFirst({
        cacheName: "pages",
      }),
    },
  ],
});

serwist.addEventListeners();
