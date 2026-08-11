// app/rider/(protected)/jobs/page.jsx
import { createClient } from '@/lib/supabase/server'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import JobMarketList from '@/components/JobMarketList'

export const metadata = {
  title: 'Job market',
}

export default async function JobMarketPage() {
  const supabase = await createClient()

  const { data: openJobs, error } = await supabase
    .from('delivery_orders')
    .select(
      'id, pickup_name, pickup_address, dropoff_name, dropoff_address, delivery_fee, created_at, parcels(description, weight_kg, fragile)'
    )
    .eq('status', 'pending')
    .is('rider_id', null)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-md mx-auto">
      <RealtimeRefresher table="delivery_orders" />

      <h2 className="font-display text-lg font-semibold mb-3">Job market</h2>

      {error && (
        <p className="text-sm text-red-600 mb-4">
          Couldn&apos;t load open jobs: {error.message}
        </p>
      )}

      <JobMarketList jobs={openJobs || []} />
    </div>
  )
}
