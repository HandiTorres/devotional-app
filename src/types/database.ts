export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
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
          onboarding_complete: boolean
          preferred_pastor: string
          preferred_charity: string | null
          milestones_shown: number[] | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          gender?: 'him' | 'her' | null
          age_range?: string | null
          faith_background?: string | null
          faith_background_other?: string | null
          life_stage?: string | null
          life_stage_other?: string | null
          current_challenge?: string | null
          challenge_other?: string | null
          family_situation?: string | null
          family_other?: string | null
          primary_goal?: string | null
          primary_goal_other?: string | null
          personal_context?: string | null
          onboarding_complete?: boolean
          preferred_pastor?: string
          preferred_charity?: string | null
          milestones_shown?: number[] | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          gender?: 'him' | 'her' | null
          age_range?: string | null
          faith_background?: string | null
          faith_background_other?: string | null
          life_stage?: string | null
          life_stage_other?: string | null
          current_challenge?: string | null
          challenge_other?: string | null
          family_situation?: string | null
          family_other?: string | null
          primary_goal?: string | null
          primary_goal_other?: string | null
          personal_context?: string | null
          onboarding_complete?: boolean
          preferred_pastor?: string
          preferred_charity?: string | null
          milestones_shown?: number[] | null
          created_at?: string
        }
      }
      streaks: {
        Row: {
          user_id: string
          current_streak: number
          longest_streak: number
          last_completed_date: string | null
          total_extensions: number
        }
        Insert: {
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_completed_date?: string | null
          total_extensions?: number
        }
        Update: {
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_completed_date?: string | null
          total_extensions?: number
        }
      }
      completions: {
        Row: {
          id: string
          user_id: string
          completed_date: string
          devotional_content: DevotionalContent
          time_spent_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          completed_date: string
          devotional_content: DevotionalContent
          time_spent_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          completed_date?: string
          devotional_content?: DevotionalContent
          time_spent_seconds?: number | null
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          user_id: string
          amount_cents: number
          type: 'streak_extension' | 'voluntary'
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount_cents: number
          type: 'streak_extension' | 'voluntary'
          stripe_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount_cents?: number
          type?: 'streak_extension' | 'voluntary'
          stripe_payment_id?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type DevotionalContent = {
  scripture: string
  scripture_reference: string
  reflection: string
  generated_at?: string
  // Legacy fields (old completions may have these)
  action_step?: string
  prayer?: string
}

export type User = Database['public']['Tables']['users']['Row']
export type Streak = Database['public']['Tables']['streaks']['Row']
export type Completion = Database['public']['Tables']['completions']['Row']
export type Donation = Database['public']['Tables']['donations']['Row']
