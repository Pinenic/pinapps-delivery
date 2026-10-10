// app/(consumer)/(protected)/book/page.jsx
import { createClient } from '@/lib/supabase/server'
import BookingFlow from '@/components/consumer/BookingFlow'

export const metadata = { title: 'Send a package' }

export default async function BookPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: consumer } = await supabase
    .from('consumers')
    .select('name, phone')
    .eq('id', user.id)
    .maybeSingle()

  // Same pricing source the order route uses when it recalculates
  // the fee server-side — the picker and the charge can't disagree.
  const { data: pricing } = await supabase
    .from('platform_pricing')
    .select('fee_rule')
    .maybeSingle()

  const feeRule = pricing?.fee_rule ?? {}

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Send a package</h1>
      <p className="text-sm text-[color:var(--consumer-muted)] mb-6">
        Tell us where it&apos;s going and we&apos;ll get a rider to it.
      </p>

      <BookingFlow
        tiers={feeRule.type === 'tiered' ? feeRule.tiers ?? [] : []}
        feeRuleType={feeRule.type ?? null}
        flatAmount={feeRule.type === 'flat' ? feeRule.amount : null}
        consumer={consumer}
      />
    </div>
  )
}
