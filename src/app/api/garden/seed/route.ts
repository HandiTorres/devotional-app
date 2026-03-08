import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { getTodaysVerse } from '@/lib/verses'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const WEEKLY_THEMES = [
  'Rest',
  'Identity',
  'Trust',
  'Courage',
  'Joy',
  'Connection',
  'Purpose',
]

function getWeeklyTheme(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekNumber = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)
  )
  return WEEKLY_THEMES[weekNumber % WEEKLY_THEMES.length]
}

const SYSTEM_PROMPT = `You are a warm, wise companion for women's faith journeys.
Write like a trusted friend — gentle, reflective, affirming.
No guilt. No pressure. Always end with hope.`

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]
    const weeklyTheme = getWeeklyTheme()

    // Check cache in garden_progress
    const { data: cached } = await supabase
      .from('garden_progress')
      .select('seed_text, seed_verse')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()

    const cachedRow = cached as { seed_text: string; seed_verse: string } | null
    if (cachedRow?.seed_text) {
      return NextResponse.json({
        seed: cachedRow.seed_text,
        verse: cachedRow.seed_verse,
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
Weekly Garden theme: ${weeklyTheme}
Her challenge area: ${challengeArea}

Generate ONE reflective prompt for her to sit with today. Under 50 words.
Make it a gentle invitation to reflect, not a task.
Use "you" language. No scripture quoting — just the prompt.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    const seedText = content.type === 'text' ? content.text : ''

    // Cache it
    await supabase
      .from('garden_progress')
      .insert({
        user_id: user.id,
        date: today,
        seed_text: seedText,
        seed_verse: reference,
        weekly_theme: weeklyTheme,
        completed: false,
      } as never)

    return NextResponse.json({
      seed: seedText,
      verse: reference,
      weeklyTheme,
      alreadyCompleted: false,
    })
  } catch (error) {
    console.error('Garden seed error:', error)
    return NextResponse.json({ error: 'Failed to generate seed' }, { status: 500 })
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
      .from('garden_progress')
      .update({ completed: true } as never)
      .eq('user_id', user.id)
      .eq('date', today)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Garden complete error:', error)
    return NextResponse.json({ error: 'Failed to complete seed' }, { status: 500 })
  }
}
