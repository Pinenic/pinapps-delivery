import { IconShieldCheck, IconPulse } from "./icons";

const SIGNALS = [
  {
    icon: IconShieldCheck,
    title: "Verified riders",
    body: "Every rider is identity-verified before they can accept a delivery.",
  },
  {
    icon: IconPulse,
    title: "Live tracking",
    body: "Follow your package from pickup to drop-off, the whole way.",
  },
];

export default function TrustSignals() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid sm:grid-cols-2 gap-10 max-w-2xl">
        {SIGNALS.map((signal) => (
          <div key={signal.title} className="flex gap-4">
            <signal.icon className="w-9 h-9 shrink-0 text-[color:var(--consumer-accent-primary)]" />
            <div>
              <h3 className="text-lg font-semibold mb-1">{signal.title}</h3>
              <p className="text-[color:var(--consumer-muted)] leading-relaxed">{signal.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
