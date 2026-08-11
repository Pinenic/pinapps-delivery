// app/admin/(protected)/deliveries/new/layout.jsx
// page.jsx in this segment is a Client Component ('use client'), and
// client components can't export `metadata` — a thin server layout is
// the standard way to still get a page title for a client-rendered route.
export const metadata = {
  title: "New delivery",
};

export default function NewDeliveryLayout({ children }) {
  return children;
}
