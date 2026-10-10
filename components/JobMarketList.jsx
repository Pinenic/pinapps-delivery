'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { SlidersHorizontal } from 'lucide-react'
import RouteLine from '@/components/ui/RouteLine'
import { formatFee, formatRelativeDate } from '@/lib/formatters'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'fee_high', label: 'Highest fee' },
  { value: 'fee_low', label: 'Lowest fee' },
]

function jobIsFragile(job) {
  return job.parcels?.some((p) => p.fragile) || false
}

export default function JobMarketList({ jobs }) {
  const [sort, setSort] = useState('newest')
  const [fragileFilter, setFragileFilter] = useState('all') // all | fragile | not_fragile
  const [minFee, setMinFee] = useState('')
  const [maxFee, setMaxFee] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredJobs = useMemo(() => {
    let result = [...jobs]

    if (fragileFilter === 'fragile') {
      result = result.filter((j) => jobIsFragile(j))
    } else if (fragileFilter === 'not_fragile') {
      result = result.filter((j) => !jobIsFragile(j))
    }

    const min = minFee !== '' ? Number(minFee) : null
    const max = maxFee !== '' ? Number(maxFee) : null
    if (min !== null || max !== null) {
      result = result.filter((j) => {
        // Jobs with no fee set yet aren't excluded by a price filter —
        // there's nothing to compare, so hiding them would be surprising.
        if (j.delivery_fee == null) return true
        if (min !== null && j.delivery_fee < min) return false
        if (max !== null && j.delivery_fee > max) return false
        return true
      })
    }

    result.sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at)
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
      if (sort === 'fee_high') return (b.delivery_fee || 0) - (a.delivery_fee || 0)
      if (sort === 'fee_low') return (a.delivery_fee || 0) - (b.delivery_fee || 0)
      return 0
    })

    return result
  }, [jobs, sort, fragileFilter, minFee, maxFee])

  const inputClass =
    'w-full px-2.5 py-1.5 rounded-lg text-sm bg-white/70 border border-[color:var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/30 focus:border-[color:var(--color-primary)]'

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className={`${inputClass} w-auto`}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-[color:var(--color-primary-dark)] px-3 py-1.5 rounded-full bg-[color:var(--color-primary-pale)]"
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="glass-card-solid p-4 mb-3 space-y-3">
          <div>
            <p className="text-xs font-medium mb-1.5">Fragile</p>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'fragile', label: 'Fragile only' },
                { value: 'not_fragile', label: 'Not fragile' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFragileFilter(opt.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    fragileFilter === opt.value
                      ? 'bg-[color:var(--color-primary)] text-white'
                      : 'bg-black/5 text-[color:var(--color-muted)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium mb-1.5">Fee range (K)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minFee}
                onChange={(e) => setMinFee(e.target.value)}
                className={inputClass}
              />
              <span className="text-[color:var(--color-muted)]">–</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <p className="text-[11px] text-[color:var(--color-muted)]">
            Location filtering is coming soon.
          </p>
        </div>
      )}

      {filteredJobs.length === 0 && (
        <p className="text-sm text-[color:var(--color-muted)] text-center py-8">
          {jobs.length === 0
            ? 'No unclaimed jobs right now — check back soon.'
            : 'No jobs match these filters.'}
        </p>
      )}

      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <Link
            key={job.id}
            href={`/rider/jobs/${job.id}`}
            className="block glass-card p-4 border-dashed"
            style={{ borderColor: 'var(--color-primary)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[color:var(--color-primary-pale)] text-[color:var(--color-primary-dark)]">
                  Unclaimed
                </span>
                {jobIsFragile(job) && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[color:var(--color-warning-pale)] text-[color:var(--color-warning)]">
                    Fragile
                  </span>
                )}
              </div>
              <span className="font-mono-tracking text-sm font-medium">
                {formatFee(job.delivery_fee)}
              </span>
            </div>

            <RouteLine
              pickupLabel={job.pickup_name}
              pickupSub={job.pickup_address}
              dropoffLabel={job.dropoff_name}
              dropoffSub={job.dropoff_address}
              compact
            />

            <p className="text-[11px] text-[color:var(--color-muted)] mt-2 text-right">
              Added {formatRelativeDate(job.created_at)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
