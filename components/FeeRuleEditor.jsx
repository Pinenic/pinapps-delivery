'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function emptyTier() {
  return {
    key: '',
    label: '',
    price: '',
    max_weight_kg: '',
    max_items: '',
  }
}

function toEditableState(feeRule) {
  if (feeRule?.type === 'tiered') {
    return {
      type: 'tiered',
      amount: '',
      tiers: (feeRule.tiers || []).map((t) => ({
        key: t.key ?? '',
        label: t.label ?? '',
        price: t.price ?? '',
        max_weight_kg: t.max_weight_kg ?? '',
        max_items: t.max_items ?? '',
      })),
    }
  }
  return {
    type: 'flat',
    amount: feeRule?.amount ?? '',
    tiers: [],
  }
}

const inputClass =
  'px-2 py-1.5 rounded-lg text-xs bg-white/70 border border-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/30 focus:border-[color:var(--color-primary)]'

// Writes a fee_rule to any table that has one. Defaults to the
// `clients` table so existing per-client usage on the Clients page
// keeps working unchanged; the consumer pricing page passes
// table="platform_pricing" instead.
export default function FeeRuleEditor({
  clientId,
  rowId,
  table = 'clients',
  feeRule,
}) {
  const router = useRouter()
  const supabase = createClient()

  const [state, setState] = useState(() => toEditableState(feeRule))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  function updateTier(index, field, value) {
    setState((s) => ({
      ...s,
      tiers: s.tiers.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    }))
  }

  function addTier() {
    setState((s) => ({ ...s, tiers: [...s.tiers, emptyTier()] }))
  }

  function removeTier(index) {
    setState((s) => ({ ...s, tiers: s.tiers.filter((_, i) => i !== index) }))
  }

  async function handleSave() {
    setSaving(true)
    setStatus(null)

    let fee_rule
    if (state.type === 'flat') {
      const amount = Number(state.amount)
      if (Number.isNaN(amount) || amount < 0) {
        setStatus({ type: 'error', message: 'Enter a valid flat amount.' })
        setSaving(false)
        return
      }
      fee_rule = { type: 'flat', amount }
    } else {
      // Every tier needs a unique, non-empty key — that's what
      // Corn Mart sends back as parcel_size, so a blank or duplicate
      // key would silently break dispatching for that size.
      const keys = state.tiers.map((t) => t.key.trim())
      if (keys.some((k) => !k)) {
        setStatus({ type: 'error', message: 'Every tier needs a key (e.g. "small").' })
        setSaving(false)
        return
      }
      if (new Set(keys).size !== keys.length) {
        setStatus({ type: 'error', message: 'Tier keys must be unique.' })
        setSaving(false)
        return
      }
      if (state.tiers.some((t) => t.price === '' || Number.isNaN(Number(t.price)))) {
        setStatus({ type: 'error', message: 'Every tier needs a price.' })
        setSaving(false)
        return
      }

      fee_rule = {
        type: 'tiered',
        tiers: state.tiers.map((t) => ({
          key: t.key.trim(),
          label: t.label.trim() || t.key.trim(),
          price: Number(t.price),
          ...(t.max_weight_kg !== '' ? { max_weight_kg: Number(t.max_weight_kg) } : {}),
          ...(t.max_items !== '' ? { max_items: Number(t.max_items) } : {}),
        })),
      }
    }

    const { error } = await supabase
      .from(table)
      .update({ fee_rule })
      .eq('id', rowId ?? clientId)

    setSaving(false)

    if (error) {
      setStatus({ type: 'error', message: error.message })
      return
    }

    setStatus({ type: 'success', message: 'Pricing saved.' })
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium">Delivery pricing</p>
        <div className="flex gap-1.5">
          {['flat', 'tiered'].map((type) => (
            <button
              key={type}
              onClick={() => setState((s) => ({ ...s, type }))}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize transition-colors ${
                state.type === type
                  ? 'bg-[color:var(--color-primary)] text-white'
                  : 'bg-black/5 text-[color:var(--color-muted)]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {state.type === 'flat' ? (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-[color:var(--color-muted)]">K</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={state.amount}
            onChange={(e) => setState((s) => ({ ...s, amount: e.target.value }))}
            className={`${inputClass} w-24`}
          />
        </div>
      ) : (
        <div className="space-y-2 mb-2">
          {state.tiers.length === 0 && (
            <p className="text-[11px] text-[color:var(--color-muted)]">
              No tiers yet — add one below.
            </p>
          )}
          {state.tiers.map((tier, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_70px_70px_70px_auto] gap-1.5 items-center"
            >
              <input
                placeholder="key (small)"
                value={tier.key}
                onChange={(e) => updateTier(i, 'key', e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="label"
                value={tier.label}
                onChange={(e) => updateTier(i, 'label', e.target.value)}
                className={inputClass}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="price K"
                value={tier.price}
                onChange={(e) => updateTier(i, 'price', e.target.value)}
                className={inputClass}
              />
              <input
                type="number"
                min="0"
                placeholder="max kg"
                value={tier.max_weight_kg}
                onChange={(e) => updateTier(i, 'max_weight_kg', e.target.value)}
                className={inputClass}
              />
              <input
                type="number"
                min="0"
                placeholder="max items"
                value={tier.max_items}
                onChange={(e) => updateTier(i, 'max_items', e.target.value)}
                className={inputClass}
              />
              <button
                onClick={() => removeTier(i)}
                className="text-[color:var(--color-muted)] hover:text-red-600 p-1"
                aria-label="Remove tier"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={addTier}
            className="flex items-center gap-1 text-xs text-[color:var(--color-primary-dark)] mt-1"
          >
            <Plus size={13} /> Add tier
          </button>
        </div>
      )}

      {status && (
        <p className={`text-xs mb-2 ${status.type === 'error' ? 'text-red-600' : 'text-[color:var(--color-success)]'}`}>
          {status.message}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="text-xs bg-[color:var(--color-primary)] text-white px-3 py-1.5 rounded-full hover:bg-[color:var(--color-primary-dark)] transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save pricing'}
      </button>
    </div>
  )
}
