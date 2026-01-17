import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  // Create client directly with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
  
  // Try getSession first (reads from cookies)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  // Then try getUser
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  return NextResponse.json({
    user: user ? { id: user.id, email: user.email } : null,
    session: session ? { user: session.user.email, expires_at: session.expires_at } : null,
    error: userError?.message || sessionError?.message || null,
    cookies: allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 50) + '...' })).filter(c => c.name.startsWith('sb-')),
    cookieCount: allCookies.length,
  })
}
