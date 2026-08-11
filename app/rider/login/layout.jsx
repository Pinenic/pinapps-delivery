// app/rider/login/layout.jsx
// page.jsx here is a Client Component, so metadata lives in this thin
// server layout instead (client components can't export `metadata`).
export const metadata = {
  title: "Rider login",
  robots: { index: false, follow: false },
};

export default function RiderLoginLayout({ children }) {
  return children;
}
