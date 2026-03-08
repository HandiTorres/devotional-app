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
  lifeStage?: string | null
  lifeStageOther?: string | null
  challenge?: string | null
  challengeOther?: string | null
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

export const generateDevotionalPrompt = (
  verse: string,
  reference: string,
  context: UserContext
): string => {
  const lifeStage = formatLifeStage(context.lifeStage, context.lifeStageOther)
  const challenge = formatChallenge(context.challenge, context.challengeOther)

  const prompt = `Today's Scripture: "${verse}" - ${reference}

About this person:
- Gender: ${context.gender === 'him' ? 'Male' : 'Female'}
- Life stage: ${lifeStage}
- Current challenge: ${challenge}

Write a devotional that speaks directly to their situation. Reference their specific challenge naturally within the reflection. Make it feel like it was written just for them.

${GENDER_PROMPTS[context.gender]}`

  return prompt
}
