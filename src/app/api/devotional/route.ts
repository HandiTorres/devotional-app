import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDevotional, UserContext } from '@/lib/claude'
import { getTodaysVerse } from '@/lib/verses'

type UserProfile = {
  gender: 'him' | 'her' | null
  life_stage: string | null
  life_stage_other: string | null
  current_challenge: string | null
  challenge_other: string | null
}

type StreakData = {
  current_streak: number
  longest_streak: number
  last_completed_date: string | null
  total_extensions: number
}

type DevotionalContent = {
  scripture: string
  scripture_reference: string
  reflection: string
  generated_at: string
}

type CachedDevotional = {
  devotional_content: DevotionalContent
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    // 1. Check if already completed today
    const { data: existingCompletion } = await supabase
      .from('completions')
      .select('devotional_content')
      .eq('user_id', user.id)
      .eq('completed_date', today)
      .maybeSingle()

    const completion = existingCompletion as { devotional_content: DevotionalContent } | null
    if (completion?.devotional_content) {
      return NextResponse.json({
        devotional: completion.devotional_content,
        alreadyCompleted: true,
      })
    }

    // 2. Check daily_devotionals cache
    const { data: cachedData } = await supabase
      .from('daily_devotionals')
      .select('devotional_content')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()

    const cached = cachedData as CachedDevotional | null
    if (cached?.devotional_content) {
      return NextResponse.json({
        devotional: cached.devotional_content,
        alreadyCompleted: false,
      })
    }

    // 3. Not cached — generate with Claude
    const { data: profileData } = await supabase
      .from('users')
      .select('gender, life_stage, life_stage_other, current_challenge, challenge_other')
      .eq('id', user.id)
      .maybeSingle()

    const profile = profileData as UserProfile | null

    if (!profile?.gender) {
      return NextResponse.json({ error: 'Profile incomplete' }, { status: 400 })
    }

    const { verse, reference } = getTodaysVerse()

    const userContext: UserContext = {
      gender: profile.gender,
      lifeStage: profile.life_stage,
      lifeStageOther: profile.life_stage_other,
      challenge: profile.current_challenge,
      challengeOther: profile.challenge_other,
    }

    const devotionalText = await generateDevotional(verse, reference, userContext)

    const devotionalContent: DevotionalContent = {
      scripture: verse,
      scripture_reference: reference,
      reflection: devotionalText,
      generated_at: new Date().toISOString(),
    }

    // 4. Cache the result
    await supabase
      .from('daily_devotionals')
      .insert({
        user_id: user.id,
        date: today,
        verse_reference: reference,
        devotional_content: devotionalContent,
      } as never)

    return NextResponse.json({
      devotional: devotionalContent,
      alreadyCompleted: false,
    })
  } catch (error) {
    console.error('Error generating devotional:', error)
    return NextResponse.json({ error: 'Failed to generate devotional' }, { status: 500 })
  }
}

// Mark devotional as complete
export async function POST() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // Check if already completed today
    const { data: existingCompletion } = await supabase
      .from('completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('completed_date', today)
      .maybeSingle()

    if (existingCompletion) {
      const { data: streakData } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .maybeSingle()

      const streak = streakData as { current_streak: number } | null
      return NextResponse.json({
        message: 'Already completed today',
        streak: streak?.current_streak || 0,
      })
    }

    // Get cached devotional content
    const { data: cachedData } = await supabase
      .from('daily_devotionals')
      .select('devotional_content')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()

    const cached = cachedData as CachedDevotional | null

    // Insert completion
    await supabase
      .from('completions')
      .insert({
        user_id: user.id,
        completed_date: today,
        devotional_content: cached?.devotional_content || null,
      } as never)

    // Get and update streak
    const { data: streakData } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const streak = streakData as StreakData | null

    let newStreak = 1
    let newLongest = streak?.longest_streak || 1

    if (streak?.last_completed_date === yesterday) {
      newStreak = (streak.current_streak || 0) + 1
      newLongest = Math.max(newStreak, streak.longest_streak || 0)
    } else if (streak?.last_completed_date === today) {
      newStreak = streak.current_streak
    }

    await supabase
      .from('streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_completed_date: today,
      } as never)
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      streak: newStreak,
      longest: newLongest,
    })
  } catch (error) {
    console.error('Error completing devotional:', error)
    return NextResponse.json({ error: 'Failed to complete devotional' }, { status: 500 })
  }
}
