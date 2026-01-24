export interface Profile {
  id: string;
  full_name: string | null;
  preferred_topics: string[];
  subscription_tier: 'free' | 'premium';
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Devotional {
  id: string;
  date: string;
  scripture: string;
  scripture_reference: string;
  reflection: string;
  prayer: string;
  created_at: string;
}

export interface UserDevotional {
  id: string;
  user_id: string;
  topic: string;
  scripture: string;
  scripture_reference: string;
  reflection: string;
  prayer: string;
  is_favorite: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_end: string;
  created_at: string;
}

export interface DevotionalRequest {
  topic?: string;
  prayerRequest?: string;
}

export interface GeneratedDevotional {
  scripture: string;
  scripture_reference: string;
  reflection: string;
  prayer: string;
}
