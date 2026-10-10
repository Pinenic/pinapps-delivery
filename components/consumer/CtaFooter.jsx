import Link from "next/link";

export default function CtaFooter() {
  return (
    <section className="bg-[color:var(--consumer-surface-dark)] text-[color:var(--consumer-ink-on-dark)]">
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to send your first package?</h2>
        <Link
          href="/book"
          className="inline-block text-sm font-medium text-white bg-[color:var(--consumer-accent-primary)] hover:bg-[color:var(--consumer-accent-primary-dark)] transition-colors px-6 py-3 rounded-full"
        >
          Send a package
        </Link>
        <p className="mt-10 text-sm text-[color:var(--consumer-muted-on-dark)]">
          Pinapps Delivery — Kitwe
        </p>
      </div>
    </section>
  );
}
