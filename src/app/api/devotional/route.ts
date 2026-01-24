import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDevotional, UserContext } from '@/lib/claude'
import { getTodaysVerse } from '@/lib/verses'

type UserProfile = {
  gender: 'him' | 'her' | null
  age_range: string | null
  faith_background: string | null
  faith_background_other: string | null
  life_stage: string | null
  life_stage_other: string | null
  current_challenge: string | null
  challenge_other: string | null
  family_situation: string | null
  family_other: string | null
  primary_goal: string | null
  primary_goal_other: string | null
  personal_context: string | null
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

    // Get current user
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

    // 3. Not cached - need to generate
    // Get full user profile with all context fields
    const { data: profileData } = await supabase
      .from('users')
      .select(`
        gender,
        age_range,
        faith_background,
        faith_background_other,
        life_stage,
        life_stage_other,
        current_challenge,
        challenge_other,
        family_situation,
        family_other,
        primary_goal,
        primary_goal_other,
        personal_context
      `)
      .eq('id', user.id)
      .maybeSingle()

    const profile = profileData as UserProfile | null

    if (!profile?.gender) {
      return NextResponse.json(
        { error: 'Profile incomplete' },
        { status: 400 }
      )
    }

    // Get today's verse
    const { verse, reference } = getTodaysVerse()

    // Build user context for devotional generation
    const userContext: UserContext = {
      gender: profile.gender,
      ageRange: profile.age_range,
      faithBackground: profile.faith_background,
      faithBackgroundOther: profile.faith_background_other,
      lifeStage: profile.life_stage,
      lifeStageOther: profile.life_stage_other,
      challenge: profile.current_challenge,
      challengeOther: profile.challenge_other,
      familySituation: profile.family_situation,
      familyOther: profile.family_other,
      primaryGoal: profile.primary_goal,
      primaryGoalOther: profile.primary_goal_other,
      personalContext: profile.personal_context,
    }

    // Generate devotional with Claude
    const devotionalText = await generateDevotional(verse, reference, userContext)

    const devotionalContent: DevotionalContent = {
      scripture: verse,
      scripture_reference: reference,
      reflection: devotionalText,
      generated_at: new Date().toISOString(),
    }

    // 4. Save to cache
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
    return NextResponse.json(
      { error: 'Failed to generate devotional' },
      { status: 500 }
    )
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
      // Get current streak to return
      const { data: streakData } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .maybeSingle()

      const streak = streakData as { current_streak: number } | null
      return NextResponse.json({
        message: 'Already completed today',
        streak: streak?.current_streak || 0
      })
    }

    // Get cached devotional (should exist from GET call)
    const { data: cachedData } = await supabase
      .from('daily_devotionals')
      .select('devotional_content')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()

    const cached = cachedData as CachedDevotional | null
    const devotionalContent = cached?.devotional_content || null

    // Insert completion (with or without content)
    await supabase
      .from('completions')
      .insert({
        user_id: user.id,
        completed_date: today,
        devotional_content: devotionalContent,
      } as never)

    // Get current streak
    const { data: streakData } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const streak = streakData as StreakData | null

    let newStreak = 1
    let newLongest = streak?.longest_streak || 1

    if (streak?.last_completed_date === yesterday) {
      // Continuing streak
      newStreak = (streak.current_streak || 0) + 1
      newLongest = Math.max(newStreak, streak.longest_streak || 0)
    } else if (streak?.last_completed_date === today) {
      // Already completed today (shouldn't happen but handle it)
      newStreak = streak.current_streak
    }
    // else: streak broken, start fresh at 1

    // Update streak
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
    return NextResponse.json(
      { error: 'Failed to complete devotional' },
      { status: 500 }
    )
  }
}
