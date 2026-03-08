import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { getTodaysVerse } from '@/lib/verses'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const WEEKLY_THEMES = [
  'Discipline',
  'Leadership',
  'Integrity',
  'Purpose',
  'Relationships',
  'Faith',
  'Service',
]

function getWeeklyTheme(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekNumber = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)
  )
  return WEEKLY_THEMES[weekNumber % WEEKLY_THEMES.length]
}

const SYSTEM_PROMPT = `You are a direct, no-nonsense men's faith coach.
Write like a coach calling out your potential — brief, powerful, actionable.
No fluff. No passive voice. No vague spirituality.`

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]
    const weeklyTheme = getWeeklyTheme()

    // Check cache in forge_progress
    const { data: cached } = await supabase
      .from('forge_progress')
      .select('challenge_text, challenge_verse')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()

    const cachedRow = cached as { challenge_text: string; challenge_verse: string } | null
    if (cachedRow?.challenge_text) {
      return NextResponse.json({
        challenge: cachedRow.challenge_text,
        verse: cachedRow.challenge_verse,
        weeklyTheme,
        alreadyCompleted: false,
      })
    }

    // Get user's challenge area
    const { data: profileData } = await supabase
      .from('users')
      .select('current_challenge, challenge_other')
      .eq('id', user.id)
      .maybeSingle()

    const profile = profileData as { current_challenge: string | null; challenge_other: string | null } | null
    const challengeArea = profile?.current_challenge === 'other'
      ? profile?.challenge_other || 'general life'
      : profile?.current_challenge || 'general life'

    const { reference } = getTodaysVerse()

    const prompt = `Today's verse theme: "${reference}"
Weekly Forge theme: ${weeklyTheme}
This man's challenge area: ${challengeArea}

Generate ONE specific, actionable challenge for today. Under 50 words.
Start with a verb. Make it something he can do TODAY.
No scripture quoting — just the challenge.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    const challengeText = content.type === 'text' ? content.text : ''

    // Cache it
    await supabase
      .from('forge_progress')
      .insert({
        user_id: user.id,
        date: today,
        challenge_text: challengeText,
        challenge_verse: reference,
        weekly_theme: weeklyTheme,
        completed: false,
      } as never)

    return NextResponse.json({
      challenge: challengeText,
      verse: reference,
      weeklyTheme,
      alreadyCompleted: false,
    })
  } catch (error) {
    console.error('Forge challenge error:', error)
    return NextResponse.json({ error: 'Failed to generate challenge' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    await supabase
      .from('forge_progress')
      .update({ completed: true } as never)
      .eq('user_id', user.id)
      .eq('date', today)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forge complete error:', error)
    return NextResponse.json({ error: 'Failed to complete challenge' }, { status: 500 })
  }
}
