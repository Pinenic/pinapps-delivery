import { IconChecklist, IconParcelHand, IconPin } from "./icons";

const STEPS = [
  {
    icon: IconChecklist,
    title: "Book",
    body: "Enter your pickup and drop-off details and confirm your price.",
  },
  {
    icon: IconParcelHand,
    title: "We pick up",
    body: "A verified rider accepts your delivery and collects your package.",
  },
  {
    icon: IconPin,
    title: "Track it live",
    body: "Follow your delivery from pickup to drop-off in real time.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold mb-12 max-w-md">How it works</h2>
      <div className="grid sm:grid-cols-3 gap-10">
        {STEPS.map((step, i) => (
          <div key={step.title}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-[color:var(--consumer-muted)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <step.icon className="w-8 h-8 text-[color:var(--consumer-accent-primary)]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-[color:var(--consumer-muted)] leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
