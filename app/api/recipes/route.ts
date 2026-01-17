import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

const recipeSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  cover_image_url: z.string().url().optional().nullable(),
  ingredients: z.array(z.string()).min(1),
  steps: z.array(z.string()).min(1),
  prep_minutes: z.number().int().min(0).default(0),
  cook_minutes: z.number().int().min(0).default(0),
  servings: z.number().int().min(1).default(1),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().nullable(),
  tags: z.array(z.string()).default([]),
  is_pro: z.boolean().default(false),
})

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
        setAll(cookiesToSet) {
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

  console.log('=== ADMIN CHECK DEBUG ===')
  console.log('User:', user?.email)
  console.log('Admin Emails:', getAdminEmails())
  console.log('Is Admin:', user && user.email && getAdminEmails().includes(user.email))

  if (!user || !user.email) {
    return false
  }

  const adminEmails = getAdminEmails()
  return adminEmails.includes(user.email)
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseClient()
  const searchParams = request.nextUrl.searchParams

  let query = supabase.from('recipes').select('*')

  // Search filter
  const search = searchParams.get('search')
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Tag filter
  const tag = searchParams.get('tag')
  if (tag) {
    query = query.contains('tags', [tag])
  }

  // Sorting
  const sort = searchParams.get('sort') || 'newest'
  if (sort === 'trending') {
    query = query.order('views', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // Pagination
  const limit = parseInt(searchParams.get('limit') || '50')
  query = query.limit(limit)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ recipes: data || [] })
}

export async function POST(request: NextRequest) {
  const isAdmin = await checkAdminAccess()

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validatedData = recipeSchema.parse(body)

    const supabase = await createSupabaseClient()
    const { data, error } = await supabase
      .from('recipes')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ recipe: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
