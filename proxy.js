// proxy.js (project root)
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function hasSupabaseSessionCookie(request) {
  return request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))
}

async function refreshSessionSafely(request) {
  // Build a response up front so the Supabase client can attach
  // refreshed cookies to it if a refresh happens.
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    await Promise.race([
      supabase.auth.getUser(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
    ])
    return response
  } catch {
    // Supabase unreachable or slow — fail open, no cookie rewrite.
    // The caller falls back to the cheap presence check below.
    return null
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl

  const isLoginPage =
    pathname === '/admin/login' || pathname === '/rider/login'
  const isProtectedRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/rider')

  if (!isProtectedRoute || isLoginPage) {
    return NextResponse.next()
  }

  if (!hasSupabaseSessionCookie(request)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = pathname.startsWith('/rider')
      ? '/rider/login'
      : '/admin/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Cookie exists — try to refresh it. If this hangs or fails,
  // we still let the request through; the real check in the
  // protected layout's getUser() call is the actual security
  // boundary, same as before.
  const refreshed = await refreshSessionSafely(request)
  return refreshed ?? NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/rider/:path*'],
}