import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConsumerAuthProvider from '@/components/consumer/ConsumerAuthProvider'
import ConsumerNav from '@/components/consumer/ConsumerNav'

function ConnectionError() {
  return (
    <div className="consumer-root min-h-screen flex items-center justify-center px-5">
      <div className="consumer-card p-6 max-w-sm text-center">
        <p className="text-sm font-medium mb-1">Can&apos;t reach the server</p>
        <p className="text-sm text-[color:var(--consumer-muted)]">
          Check your connection and try again.
        </p>
      </div>
    </div>
  )
}

export default async function ConsumerProtectedLayout({ children }) {
  const supabase = await createClient()

  let user
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    return <ConnectionError />
  }

  if (!user) {
    redirect('/login')
  }

  const { data: consumer } = await supabase
    .from('consumers')
    .select('id, name, phone')
    .eq('id', user.id)
    .maybeSingle()

  // Authenticated but no consumer profile — either a half-finished
  // signup, or an admin/rider account hitting a consumer URL. Either
  // way, signup is where they need to go: it detects the verified
  // session and picks up at the name step rather than starting over.
  if (!consumer) {
    redirect('/signup')
  }

  return (
    <ConsumerAuthProvider initialUser={user} initialConsumer={consumer}>
      <div className="consumer-root min-h-screen">
        <ConsumerNav consumerName={consumer.name} />
        <main className="px-5 py-6 pb-24 md:pb-6 max-w-2xl mx-auto">
          {children}
        </main>
      </div>
    </ConsumerAuthProvider>
  )
}
