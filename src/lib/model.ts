import { google } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';

/**
 * Picks the models from the environment, in the order to try them:
 * - GOOGLE_GENERATIVE_AI_API_KEY set: Gemini directly (has a free tier).
 * - Otherwise: "provider/model" strings through Vercel AI Gateway (AI_GATEWAY_API_KEY).
 * AI_MODEL overrides the model names: one name, or several separated by commas as
 * backups for when a model is overloaded.
 * Returns [] when no AI is configured; the chat then answers with search results only.
 */
export function getModels(): LanguageModel[] {
  const names = (process.env.AI_MODEL ?? '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return (names.length ? names : ['gemini-3.8-flash']).map((n) => google(n));
  }
  if (process.env.AI_GATEWAY_API_KEY) {
    return names.length ? names : ['google/gemini-3.8-flash'];
  }
  return [];
}
