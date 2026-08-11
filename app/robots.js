// app/robots.js
// Native Next.js convention — generates /robots.txt automatically.
// The whole app defaults to noindex via layout metadata already, but an
// explicit robots.txt disallow is a second, crawler-respected layer —
// belt and suspenders, and it's what most SEO checkers look for first.
//
// When the delivery.pinapps.net landing page ships, add an `allow: "/"`
// rule for that path here (or scope this per-host if that ever becomes
// necessary) so it can be indexed while /admin and /rider stay blocked.
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/admin", "/rider"],
    },
  };
}
