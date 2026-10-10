'use client'

import { useConsumerStore } from '@/lib/store/consumerStore'
import { getProfile } from '@/lib/services/consumerService'
import { useApiData } from '@/lib/hooks/useApiData'
import ConsumerProfileForm from '@/components/consumer/ConsumerProfileForm'

export default function ConsumerProfileView() {
  const user = useConsumerStore((s) => s.user)
  const ready = useConsumerStore((s) => !!s.session)
  const { data: consumer, error, loading, refetch } = useApiData(getProfile, {
    enabled: ready,
  })

  if (loading) {
    return <p className="text-sm text-[color:var(--consumer-muted)]">Loading…</p>
  }

  if (error || !consumer) {
    return (
      <p className="text-sm text-red-600">
        Couldn&apos;t load your profile{error ? `: ${error.message}` : ''}.
      </p>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Profile</h1>
      <p className="text-sm text-[color:var(--consumer-muted)] mb-6">
        Member since{' '}
        {consumer?.created_at
          ? new Date(consumer.created_at).toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
            })
          : '—'}
      </p>

      <ConsumerProfileForm
        consumer={{ ...consumer, email: consumer?.email ?? user?.email }}
        onSaved={refetch}
      />
    </div>
  )
}