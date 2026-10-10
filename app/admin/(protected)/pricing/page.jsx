// app/admin/(protected)/pricing/page.jsx
import { createClient } from '@/lib/supabase/server'
import FeeRuleEditor from '@/components/FeeRuleEditor'

export const metadata = {
  title: 'Consumer pricing',
}

export default async function ConsumerPricingPage() {
  const supabase = await createClient()

  // Single-row table (see the `singleton` constraint in
  // 008_consumer_deliveries.sql) — there's exactly one consumer
  // price list, so no id needs to be passed in from anywhere.
  const { data: pricing, error } = await supabase
    .from('platform_pricing')
    .select('id, fee_rule, updated_at')
    .maybeSingle()

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="font-display text-xl font-semibold">Consumer pricing</h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          What individual customers pay to send a package. Business clients are
          priced separately on their own client record.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">
          Couldn&apos;t load pricing: {error.message}
        </p>
      )}

      {!error && !pricing && (
        <div className="glass-card-solid p-6 text-sm text-[color:var(--color-muted)]">
          No pricing row found — run 008_consumer_deliveries.sql, which seeds
          it.
        </div>
      )}

      {pricing && (
        <div className="glass-card-solid p-5">
          <FeeRuleEditor
            table="platform_pricing"
            rowId={pricing.id}
            feeRule={pricing.fee_rule}
          />

          {pricing.updated_at && (
            <p className="text-[11px] text-[color:var(--color-muted)] mt-4">
              Last updated {new Date(pricing.updated_at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div className="glass-card p-5 mt-4">
        <h2 className="font-display font-semibold text-sm mb-1">
          Where these prices show up
        </h2>
        <p className="text-sm text-[color:var(--color-muted)]">
          Customers see these tiers when booking a delivery, and on the pricing
          section of the public site. Changes take effect immediately — an
          order already paid for keeps the price it was charged.
        </p>
      </div>
    </div>
  )
}
