import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Handle email confirmation links (Supabase sends users here)
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'signup' | 'email',
      token_hash,
    })

    if (!error) {
      // Successful verification - redirect to onboarding
      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  // Verification failed
  return NextResponse.redirect(`${origin}/?error=verification_failed`)
}
