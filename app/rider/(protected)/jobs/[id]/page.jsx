// app/rider/(protected)/jobs/[id]/page.jsx
import RiderJobDetailView from '@/components/RiderJobDetailView'

// Static title: the old generateMetadata read the order with the
// cookie-based server client, which the Bearer-token flow doesn't use.
export const metadata = {
  title: 'Job details',
}

export default async function RiderJobDetailPage({ params }) {
  const { id } = await params
  return <RiderJobDetailView id={id} />
}