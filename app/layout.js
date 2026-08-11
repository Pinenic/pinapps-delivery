import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://delivery.pinapps.net"),
  title: {
    default: "Pinapps Delivery",
    template: "%s — Pinapps Delivery",
  },
  description:
    "Delivery management platform powering Corn Mart's rider network and delivery operations.",
  applicationName: "Pinapps Delivery",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
  // Default to noindex: this app is almost entirely a private admin
  // dashboard and rider tool, not public-facing. When the
  // delivery.pinapps.net landing page ships, give that page its own
  // `metadata.robots = { index: true, follow: true }` to opt back in —
  // page-level metadata overrides this layout default.
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport = {
  themeColor: "#b5473c",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}