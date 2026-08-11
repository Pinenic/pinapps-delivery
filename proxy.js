// proxy.js (project root)
//
// Two responsibilities, in order:
//   1. Host-based rewriting — admin.delivery.pinapps.net and
//      rider.delivery.pinapps.net serve clean URLs ("/", "/login",
//      "/clients") that map internally onto the existing /admin and
//      /rider route trees. The bare domain (delivery.pinapps.net,
//      Vercel preview URLs, localhost with no ?view=) is left
//      untouched — it keeps working exactly as it does today, and is
//      reserved for the future delivery.pinapps.net landing page.
//   2. Auth guarding — unchanged logic, just re-pointed at the
//      *effective* (possibly rewritten) pathname instead of the raw one.
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ADMIN_HOST_PREFIX = 'admin.delivery.'
const RIDER_HOST_PREFIX = 'rider.delivery.'

// Resolves which app a request belongs to, based on hostname.
// Returns '/admin', '/rider', or null (= bare domain, no rewrite).
function resolveHostPrefix(host, searchParams) {
  if (host.startsWith(ADMIN_HOST_PREFIX)) return '/admin'
  if (host.startsWith(RIDER_HOST_PREFIX)) return '/rider'

  // Local dev fallback: subdomains aren't easy to hit on localhost
  // without hosts-file edits, so ?view=admin / ?view=rider simulate them.
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    const view = searchParams.get('view')
    if (view === 'admin') return '/admin'
    if (view === 'rider') return '/rider'
  }

  return null
}

function hasSupabaseSessionCookie(request) {
  return request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))
}

async function refreshSessionSafely(request, rewriteUrl) {
  // Build a response up front so the Supabase client can attach
  // refreshed cookies to it if a refresh happens. If this request is
  // being rewritten to the admin/rider tree, the response needs to
  // carry that same rewrite so we don't lose it after the auth check.
  let response = rewriteUrl
    ? NextResponse.rewrite(rewriteUrl, { request })
    : NextResponse.next({ request })

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
          response = rewriteUrl
            ? NextResponse.rewrite(rewriteUrl, { request })
            : NextResponse.next({ request })
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
  const { pathname, searchParams } = request.nextUrl
  const host = request.headers.get('host') || ''

  // Belt-and-suspenders: the matcher below already excludes these,
  // but skip explicitly in case the matcher pattern is ever loosened.
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const hostPrefix = resolveHostPrefix(host, searchParams)

  // Only rewrite if we're on a subdomain AND the path isn't already
  // prefixed (avoids double-rewriting /admin/... requests that reach
  // this host directly, e.g. during testing).
  const needsRewrite = hostPrefix && !pathname.startsWith(hostPrefix)
  const rewriteUrl = needsRewrite ? request.nextUrl.clone() : null
  if (rewriteUrl) {
    rewriteUrl.pathname = `${hostPrefix}${pathname === '/' ? '' : pathname}`
  }
  const effectivePathname = rewriteUrl ? rewriteUrl.pathname : pathname

  const isLoginPage =
    effectivePathname === '/admin/login' || effectivePathname === '/rider/login'
  const isProtectedRoute =
    effectivePathname.startsWith('/admin') || effectivePathname.startsWith('/rider')

  if (!isProtectedRoute || isLoginPage) {
    return rewriteUrl ? NextResponse.rewrite(rewriteUrl) : NextResponse.next()
  }

  if (!hasSupabaseSessionCookie(request)) {
    const redirectUrl = request.nextUrl.clone()
    if (hostPrefix) {
      // On a subdomain, keep the visible URL clean: "/login", not "/admin/login".
      redirectUrl.pathname = '/login'
    } else {
      redirectUrl.pathname = effectivePathname.startsWith('/rider')
        ? '/rider/login'
        : '/admin/login'
    }
    return NextResponse.redirect(redirectUrl)
  }

  // Cookie exists — try to refresh it. If this hangs or fails,
  // we still let the request through; the real check in the
  // protected layout's getUser() call is the actual security
  // boundary, same as before.
  const refreshed = await refreshSessionSafely(request, rewriteUrl)
  if (refreshed) return refreshed
  return rewriteUrl ? NextResponse.rewrite(rewriteUrl) : NextResponse.next()
}

export const config = {
  // Runs on everything except Next internals, API routes, and common
  // static file extensions — public/ assets (images, manifest.json,
  // robots.txt, etc.) must never get rewritten into /admin or /rider.
  matcher: [
    '/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|avif|css|js|map|json|txt|xml|woff2?)$).*)',
  ],
}