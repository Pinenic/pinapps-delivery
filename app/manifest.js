// app/manifest.js
// Next.js's native manifest file convention — this generates
// /manifest.webmanifest automatically and Next injects the
// <link rel="manifest"> tag into every page's <head> for us, so no
// changes to layout.js are needed.
//
// Content is scoped to the rider app specifically (it's the one meant
// to be installed to a home screen); `scope`/`start_url` point at
// /rider so "Add to Home Screen" from the rider PWA behaves correctly
// even though this file is technically served site-wide.
//
// NOTE: icon-192.png / icon-512.png / icon-512-maskable.png in
// public/icons are placeholders (a plain "CM" monogram on the brand
// primary color) generated to unblock installability — swap these for
// real branded icons whenever you have them ready.
export default function manifest() {
  return {
    name: "Pinapps Delivery — Rider",
    short_name: "PA Rider",
    description: "Claim jobs, track deliveries, and manage your rider profile.",
    start_url: "/rider",
    scope: "/rider",
    display: "standalone",
    background_color: "#fbf4f1",
    theme_color: "#b5473c",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
