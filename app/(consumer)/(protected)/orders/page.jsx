// app/(consumer)/(protected)/orders/page.jsx
import OrdersView from '@/components/consumer/OrdersView'

export const metadata = { title: 'Your orders' }

export default function OrdersPage() {
  return <OrdersView />
}