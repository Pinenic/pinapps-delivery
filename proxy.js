// proxy.js (project root)
// Renamed from middleware.js — Next.js 16 renamed both the file
// convention and the exported function (middleware -> proxy). Same
// mechanism, but the guidance changed too: this file now does a
// cheap, cookie-only check instead of calling supabase.auth.getUser().
//
// Why: proxy runs on every matching request. The old version called
// Supabase's auth server here, so any network hiccup (see the
// ConnectTimeoutError explanation in chat) took down every request
// under /admin and /rider, not just the ones that needed protecting.
//
// This version only checks whether a Supabase session cookie exists —
// no network call, so it can't time out. It is a fast-path redirect
// for the obvious "definitely not logged in" case, NOT the real
// security boundary. The actual verification (supabase.auth.getUser(),
// which validates the token against Supabase) still happens
// server-side in app/admin/(protected)/layout.jsx and
// app/rider/(protected)/layout.jsx, before any protected data is
// fetched — so a forged cookie gets no further than that layout.
import { NextResponse } from 'next/server'

function hasSupabaseSessionCookie(request) {
  return request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))
}

export function proxy(request) {
  const { pathname } = request.nextUrl

  const isLoginPage =
    pathname === '/admin/login' || pathname === '/rider/login'
  const isProtectedRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/rider')

  if (isProtectedRoute && !isLoginPage && !hasSupabaseSessionCookie(request)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = pathname.startsWith('/rider')
      ? '/rider/login'
      : '/admin/login'
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/rider/:path*'],
}
