// app/(consumer)/(protected)/orders/[id]/page.jsx
import OrderDetailView from '@/components/consumer/OrderDetailView'

export const metadata = { title: 'Tracking' }

export default async function TrackOrderPage({ params }) {
  const { id } = await params
  return <OrderDetailView id={id} />
}