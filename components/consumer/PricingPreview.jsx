// PLACEHOLDER DATA. The plan (section 9) calls for this to read live
// from `platform_pricing` so it never drifts from what checkout
// actually charges. These numbers are stand-ins until that table

import { createServiceClient } from "@/lib/supabase/serviceClient";

// exists and has real tiers set via the admin FeeRuleEditor.
async function getTiers() {
  try {
    const service = createServiceClient();
    const { data } = await service
      .from("platform_pricing")
      .select("fee_rule")
      .maybeSingle();

    const rule = data?.fee_rule;
    if (rule?.type === "tiered") return rule.tiers ?? [];
    if (rule?.type === "flat" && rule.amount != null) {
      return [{ key: "flat", label: "Any parcel", price: rule.amount }];
    }
    return [];
  } catch {
    // A pricing outage shouldn't take the whole marketing page down —
    // the section just doesn't render.
    return [];
  }
}

const TIERS = [
  { name: "Small", detail: "Envelopes, small parcels", price: "K25" },
  { name: "Medium", detail: "Boxes up to 5kg", price: "K45" },
  { name: "Large", detail: "Boxes up to 15kg", price: "K70" },
];

export default async function PricingPreview() {
  const tiers = await getTiers();
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold mb-12 max-w-md">
        Simple, tiered pricing
      </h2>
      <div className="grid sm:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div key={tier.key} className="consumer-card p-6">
            <p className="font-medium mb-1">{tier.label ?? tier.key}</p>
            {(tier.max_weight_kg || tier.max_items) && (
              <p className="text-xs text-[color:var(--consumer-muted)] mb-3">
                {tier.max_weight_kg ? `Up to ${tier.max_weight_kg}kg` : ""}
                {tier.max_weight_kg && tier.max_items ? " · " : ""}
                {tier.max_items ? `Up to ${tier.max_items} items` : ""}
              </p>
            )}
            <p className="text-3xl font-semibold">K{tier.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
