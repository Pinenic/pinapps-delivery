import Link from "next/link";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[color:var(--consumer-surface)]/90 backdrop-blur border-b border-[color:var(--consumer-border)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="#top" className="font-[family-name:var(--font-consumer-display)] font-bold text-lg tracking-tight">
          Pinapps
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-[color:var(--consumer-muted)]">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-[color:var(--consumer-ink)] transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="hidden sm:inline text-sm text-[color:var(--consumer-muted)] hover:text-[color:var(--consumer-ink)] transition-colors"
          >
            Sign up
          </Link>
          <Link
            href="/book"
            className="text-sm font-medium text-white bg-[color:var(--consumer-accent-primary)] hover:bg-[color:var(--consumer-accent-primary-dark)] transition-colors px-4 py-2 rounded-full"
          >
            Send a package
          </Link>
        </div>
      </div>
    </header>
  );
}
