import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Reset streak to 0
    await supabase
      .from('streaks')
      .update({
        current_streak: 0,
        last_completed_date: null,
      } as never)
      .eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resetting streak:', error)
    return NextResponse.json(
      { error: 'Failed to reset streak' },
      { status: 500 }
    )
  }
}
