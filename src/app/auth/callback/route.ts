import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const gender = searchParams.get('gender') as 'him' | 'her' | null

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Update user's gender if provided
      if (gender) {
        await supabase
          .from('users')
          .update({ gender } as never)
          .eq('id', data.user.id)
      }

      // Redirect to onboarding (middleware will handle if already complete)
      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  // Auth error - redirect to home with error
  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
