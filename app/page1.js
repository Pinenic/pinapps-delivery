import { redirect } from "next/navigation";

// This only ever renders on the bare domain (delivery.pinapps.net or a
// Vercel preview URL) — admin.delivery.* and rider.delivery.* never reach
// here, proxy.js rewrites "/" straight to /admin or /rider for those hosts.
//
// TODO: once the delivery.pinapps.net marketing/landing page is built,
// replace this redirect with the actual landing page content and give it
// its own `metadata` (including `robots: { index: true }` to opt back
// into indexing — the root layout defaults to noindex since almost
// everything else in this app is a private admin/rider tool).
export default function Home() {
  redirect("/consumer");
}