import Link from "next/link";
import { IllustrationParcel } from "./icons";

export default function Hero() {
  return (
    <section id="top" className="bg-[color:var(--consumer-surface-dark)] text-[color:var(--consumer-ink-on-dark)]">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm text-[color:var(--consumer-muted-on-dark)] mb-4">
            Now delivering in Kitwe
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-md">
            Send a package anywhere in Kitwe
          </h1>
          <p className="text-[color:var(--consumer-muted-on-dark)] text-lg leading-relaxed mb-8 max-w-sm">
            Book a rider, pay in the app, and track your delivery in real time
            from pickup to drop-off.
          </p>
          <Link
            href="/book"
            className="inline-block text-sm font-medium text-white bg-[color:var(--consumer-accent-primary)] hover:bg-[color:var(--consumer-accent-primary-dark)] transition-colors px-6 py-3 rounded-full"
          >
            Send a package
          </Link>
        </div>

        <div className="flex justify-center md:justify-end">
          <IllustrationParcel className="w-64 h-64 md:w-80 md:h-80" />
        </div>
      </div>
    </section>
  );
}
