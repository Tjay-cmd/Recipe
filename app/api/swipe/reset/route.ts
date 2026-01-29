import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      cookies: {},
    }
  )
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Count swipes before deletion
    const { count: beforeCount } = await supabase
      .from('recipe_swipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    console.log(`[Reset] User ${user.id} has ${beforeCount} swipes before reset`)

    // Delete all swipes for this user
    const { error, count: deletedCount } = await supabase
      .from('recipe_swipes')
      .delete({ count: 'exact' })
      .eq('user_id', user.id)

    if (error) {
      console.error('[Reset] Error deleting swipes:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log(`[Reset] Successfully deleted ${deletedCount} swipes for user ${user.id}`)

    // Verify deletion
    const { count: afterCount } = await supabase
      .from('recipe_swipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    console.log(`[Reset] User now has ${afterCount} swipes (should be 0)`)

    return NextResponse.json({ 
      success: true,
      message: 'Swipe history reset successfully',
      deleted_count: deletedCount,
    })
  } catch (error) {
    console.error('[Reset] Error in swipe reset API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
