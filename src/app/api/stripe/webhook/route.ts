import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

// Use service role client for webhook (no user session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.userId
    const type = session.metadata?.type

    if (!userId || type !== 'streak_extension') {
      return NextResponse.json({ received: true })
    }

    // Calculate yesterday's date
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    try {
      // Insert donation record
      await supabase
        .from('donations')
        .insert({
          user_id: userId,
          amount_cents: 299,
          type: 'streak_extension',
          stripe_payment_id: session.payment_intent as string,
        })

      // Get current streak data
      const { data: streak } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (streak) {
        // Update streak: set last_completed_date to yesterday so streak continues
        await supabase
          .from('streaks')
          .update({
            last_completed_date: yesterday,
            total_extensions: (streak.total_extensions || 0) + 1,
          })
          .eq('user_id', userId)
      }

      console.log(`Streak extension processed for user ${userId}`)
    } catch (error) {
      console.error('Error processing streak extension:', error)
      // Still return 200 to acknowledge receipt
    }
  }

  return NextResponse.json({ received: true })
}
