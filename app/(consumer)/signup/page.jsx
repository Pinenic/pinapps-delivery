// app/(consumer)/signup/page.jsx
import Link from 'next/link'
import EmailAuthForm from '@/components/consumer/EmailAuthForm'

export const metadata = { title: 'Create an account' }

export default function ConsumerSignupPage() {
  return (
    <div className="consumer-root min-h-screen flex flex-col items-center justify-center px-5">
      <EmailAuthForm mode="signup" />
      <p className="text-sm text-[color:var(--consumer-muted)] mt-6">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-[color:var(--consumer-accent)] font-medium"
        >
          Log in
        </Link>
      </p>
    </div>
  )
}
