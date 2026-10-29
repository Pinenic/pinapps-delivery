//import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./consumer-theme.css";

// Headline font distinct from the admin/rider brand's Space Grotesk —
// the consumer surface is meant to read as its own thing.
//const displayFont = Plus_Jakarta_Sans({
//  variable: "--font-consumer-display",
//  subsets: ["latin"],
//  weight: ["600", "700"],
//});
//
// Body font shared in spirit with the rest of the platform (Inter),
// so the two surfaces don't feel unrelated.
//const bodyFont = Inter({
//  variable: "--font-consumer-body",
//  subsets: ["latin"],
//  weight: ["400", "500", "600"],
//});

export const metadata = {
  title: "Send a package — Pinapps Delivery",
  description:
    "Book a rider, pay in the app, and track your delivery in real time. Now delivering in Kitwe.",
  robots: {
    // Staging path — keep this out of search results until it's
    // promoted to the real "/" landing page.
    index: false,
    follow: false,
  },
};

export default function ConsumerLayout({ children }) {
  return (
    <div className={`$ consumer-theme min-h-full`}>
      {children}
    </div>
  );
}
