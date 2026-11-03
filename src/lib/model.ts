import { google } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';

/**
 * Picks the model from the environment:
 * - GOOGLE_GENERATIVE_AI_API_KEY set: Gemini directly (has a free tier).
 * - Otherwise: a "provider/model" string through Vercel AI Gateway (AI_GATEWAY_API_KEY).
 * AI_MODEL overrides the model name for either path.
 * Returns null when no AI is configured; the chat then answers with search results only.
 */
export function getModel(): LanguageModel | null {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google(process.env.AI_MODEL ?? 'gemini-3.8-flash');
  }
  if (process.env.AI_GATEWAY_API_KEY) {
    return process.env.AI_MODEL ?? 'google/gemini-3.8-flash';
  }
  return null;
}
