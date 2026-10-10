// app/(consumer)/login/page.jsx
import Link from 'next/link'
import EmailAuthForm from '@/components/consumer/EmailAuthForm'

export const metadata = { title: 'Log in' }

export default function ConsumerLoginPage() {
  return (
    <div className="consumer-root min-h-screen flex flex-col items-center justify-center px-5">
      <EmailAuthForm mode="login" />
      <p className="text-sm text-[color:var(--consumer-muted)] mt-6">
        New here?{' '}
        <Link
          href="/signup"
          className="text-[color:var(--consumer-accent)] font-medium"
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}
