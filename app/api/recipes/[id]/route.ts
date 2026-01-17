import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getAdminEmails(): string[] {
  const emails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || ''
  return emails.split(',').map((e) => e.trim()).filter(Boolean)
}

async function createSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}

async function checkAdminAccess() {
  const supabase = await createSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return false
  }

  const adminEmails = getAdminEmails()
  return adminEmails.includes(user.email)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createSupabaseClient()
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json({ recipe: data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const supabase = await createSupabaseClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('recipes')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ recipe: data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const supabase = await createSupabaseClient()
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
