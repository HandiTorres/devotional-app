import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, generateDevotionalPrompt, UserContext } from './prompts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function generateDevotional(
  verse: string,
  reference: string,
  context: UserContext
): Promise<string> {
  const userPrompt = generateDevotionalPrompt(verse, reference, context)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return content.text
}

// Re-export types
export type { UserContext }
