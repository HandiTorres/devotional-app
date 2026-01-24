export const SYSTEM_PROMPT = `You are a devotional writer creating personalized daily Scripture reflections.
Write with theological accuracy, pastoral warmth, and practical application.
Never be preachy. Never use guilt. Always end with hope.
Do not use markdown formatting. Write in plain prose with natural paragraph breaks.`

export const GENDER_PROMPTS = {
  him: `Tone: Direct, challenging, like a coach calling out your potential. Action-oriented.
Length: 400-600 words (3-5 min read).
Structure:
1. Scripture verse
2. "Here's what this means for you today..." - direct application to men's real challenges
3. One specific action step (concrete, doable today)
4. Brief prayer (30 words max)
Topics to weave in naturally: Purpose, integrity, leadership, work, relationships, temptation, strength.
Avoid: Soft language, passive voice, vague spirituality, "quiet time" framing.`,

  her: `Tone: Warm, validating, like a wise friend walking alongside. Reflective.
Length: 600-900 words (5-7 min read).
Structure:
1. Scripture verse
2. "You're not alone in feeling..." - validation of common struggles
3. Walk through the application together using "we" language
4. One gentle action step (not adding to her plate)
5. Prayer of affirmation (40 words max)
Topics to weave in naturally: Identity, worth, relationships, anxiety, balance, seasons, rest.
Avoid: Guilt, pressure, assumptions about her feelings, "you should" language.`
}

export type UserContext = {
  gender: 'him' | 'her'
  ageRange?: string | null
  faithBackground?: string | null
  faithBackgroundOther?: string | null
  lifeStage?: string | null
  lifeStageOther?: string | null
  challenge?: string | null
  challengeOther?: string | null
  familySituation?: string | null
  familyOther?: string | null
  primaryGoal?: string | null
  primaryGoalOther?: string | null
  personalContext?: string | null
}

const formatAgeRange = (age: string | null | undefined): string => {
  if (!age) return 'not specified'
  const labels: Record<string, string> = {
    '18-24': '18-24 years old',
    '25-34': '25-34 years old',
    '35-44': '35-44 years old',
    '45-54': '45-54 years old',
    '55+': '55 or older',
    'prefer_not_to_say': 'not specified'
  }
  return labels[age] || age
}

const formatFaithBackground = (faith: string | null | undefined, other: string | null | undefined): string => {
  if (!faith) return 'not specified'
  if (faith === 'other' && other) return other
  const labels: Record<string, string> = {
    'new': 'new to faith, just beginning to explore',
    'few_years': 'a few years into their faith journey',
    'lifelong': 'a lifelong believer',
    'rediscovering': 'rediscovering faith after time away'
  }
  return labels[faith] || faith
}

const formatLifeStage = (stage: string | null | undefined, other: string | null | undefined): string => {
  if (!stage) return 'not specified'
  if (stage === 'other' && other) return other
  const labels: Record<string, string> = {
    'student': 'a student',
    'early_career': 'in early career',
    'building_career': 'building their career',
    'married': 'married',
    'parent': 'a parent',
    'empty_nest': 'an empty nester',
    'retired': 'retired'
  }
  return labels[stage] || stage
}

const formatChallenge = (challenge: string | null | undefined, other: string | null | undefined): string => {
  if (!challenge) return 'not specified'
  if (challenge === 'other' && other) return other
  const labels: Record<string, string> = {
    'work_stress': 'work stress',
    'relationship': 'relationship challenges',
    'health': 'health concerns',
    'purpose': 'searching for purpose',
    'anxiety': 'anxiety and worry',
    'faith_doubts': 'faith questions and doubts',
    'grief': 'grief and loss'
  }
  return labels[challenge] || challenge
}

const formatFamily = (family: string | null | undefined, other: string | null | undefined): string => {
  if (!family) return 'not specified'
  if (family === 'other' && other) return other
  const labels: Record<string, string> = {
    'single': 'single',
    'dating': 'dating',
    'engaged': 'engaged',
    'married_no_kids': 'married without kids',
    'married_with_kids': 'married with kids',
    'single_parent': 'a single parent'
  }
  return labels[family] || family
}

const formatGoal = (goal: string | null | undefined, other: string | null | undefined): string => {
  if (!goal) return 'spiritual growth'
  if (goal === 'other' && other) return other
  const labels: Record<string, string> = {
    'peace': 'finding inner peace',
    'purpose': 'discovering their sense of purpose',
    'discipline': 'building stronger spiritual discipline',
    'closer_to_god': 'growing closer to God',
    'community': 'finding community connection'
  }
  return labels[goal] || goal
}

export const generateDevotionalPrompt = (
  verse: string,
  reference: string,
  context: UserContext
): string => {
  const age = formatAgeRange(context.ageRange)
  const faith = formatFaithBackground(context.faithBackground, context.faithBackgroundOther)
  const lifeStage = formatLifeStage(context.lifeStage, context.lifeStageOther)
  const challenge = formatChallenge(context.challenge, context.challengeOther)
  const family = formatFamily(context.familySituation, context.familyOther)
  const goal = formatGoal(context.primaryGoal, context.primaryGoalOther)

  let prompt = `Today's Scripture: "${verse}" - ${reference}

About this person:
- Gender: ${context.gender === 'him' ? 'Male' : 'Female'}
- Age: ${age}
- Faith journey: ${faith}
- Life stage: ${lifeStage}
- Current challenge: ${challenge}
- Family situation: ${family}
- Primary goal: ${goal}`

  // Add personal context if provided
  if (context.personalContext && context.personalContext.trim()) {
    prompt += `

Personal context they shared:
"${context.personalContext.trim()}"`
  }

  prompt += `

Write a devotional that speaks directly to their situation. Reference their specific challenge and goal naturally within the reflection. Make it feel like it was written just for them — like you truly know what they're going through.

${GENDER_PROMPTS[context.gender]}`

  return prompt
}

// Legacy function for backwards compatibility
export const generateDevotionalPromptLegacy = (
  verse: string,
  reference: string,
  gender: 'him' | 'her',
  lifeStage: string,
  challenge: string,
  familySituation: string
): string => {
  return generateDevotionalPrompt(verse, reference, {
    gender,
    lifeStage,
    challenge,
    familySituation
  })
}
