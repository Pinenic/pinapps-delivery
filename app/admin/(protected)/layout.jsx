// Wraps every admin page except /admin/login. Confirms the visitor
// is signed in AND has a row in `admins` — a rider account or any
// other authenticated-but-non-admin user gets bounced back to login.
//
// This is the real security boundary (see proxy.js for why the
// lightweight cookie check there is NOT enough on its own). The
// getUser() call below is wrapped in try/catch specifically because
// it's a network call to Supabase — if that network is unreachable
// (see the ConnectTimeoutError explanation in chat), this shows a
// clear "can't reach the server" message instead of an unhandled crash.
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminAuthProvider from '@/components/AdminAuthProvider'
import AdminHeader from '@/components/ui/AdminHeader'
import Image from 'next/image'

export const metadata = {
  title: {
    default: 'Admin',
    template: '%s — Pinapps Delivery Admin',
  },
}

function ConnectionError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F2] px-4">
      <div className="max-w-sm text-center">
        <p className="text-sm font-medium text-[#262620] mb-1">
          Can&apos;t reach the server
        </p>
        <p className="text-sm text-[#6B6A61]">
          There was a problem connecting to Supabase. Check your connection
          (or that the Supabase project isn&apos;t paused) and try again.
        </p>
      </div>
    </div>
  )
}

export default async function AdminLayout({ children }) {
  const supabase = await createClient()

  let user
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    return <ConnectionError />
  }

  if (!user) {
    redirect('/admin/login')
  }

  const { data: admin } = await supabase
    .from('admins')
    .select('id, name')
    .eq('id', user.id)
    .maybeSingle()

  if (!admin) {
    await supabase.auth.signOut()
    redirect('/admin/login')
  }

  return (
    <AdminAuthProvider>
      <div className="flex h-[100vh] overflow-scroll">
      <Image
        src="/images/bg-light.png"
        alt="Background Description"
        fill
        className="object-cover -z-10"
        priority // Add this if it's the Largest Contentful Paint (LCP)
      />
        {/* <Sidebar /> */}
        <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader adminName={admin.name} />
          {/* <header className="flex items-center justify-end gap-4 px-6 py-4 border-b border-[#E5E1D8]">
            <span className="text-sm text-[#6B6A61]">{admin.name}</span>
            <LogoutButton />
          </header> */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AdminAuthProvider>
  )
}