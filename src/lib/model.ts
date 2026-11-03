import { google } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';

/**
 * Picks the model from the environment:
 * - GOOGLE_GENERATIVE_AI_API_KEY set: Gemini directly (has a free tier).
 * - Otherwise: a "provider/model" string through Vercel AI Gateway (AI_GATEWAY_API_KEY).
 * AI_MODEL overrides the model name for either path.
 */
export function getModel(): LanguageModel {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google(process.env.AI_MODEL ?? 'gemini-2.5-flash');
  }
  return process.env.AI_MODEL ?? 'google/gemini-2.5-flash';
}
