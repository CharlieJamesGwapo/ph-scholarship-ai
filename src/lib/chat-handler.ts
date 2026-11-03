import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  type LanguageModel,
  type UIMessage,
  type UIMessageStreamWriter,
} from 'ai';

import { getModels } from '@/lib/model';
import { buildContext, INSTRUCTIONS } from '@/lib/prompt';
import type { Scholarship } from '@/lib/scholarships';
import { searchScholarships } from '@/lib/search';

const THINKING_LEVELS = ['minimal', 'low', 'medium', 'high'] as const;

function thinkingLevel(): (typeof THINKING_LEVELS)[number] {
  const v = process.env.AI_THINKING_LEVEL as (typeof THINKING_LEVELS)[number] | undefined;
  return v && THINKING_LEVELS.includes(v) ? v : 'low';
}

const MAX_MESSAGES = 12;
const MAX_QUESTION_CHARS = 1000;
/** Per-model time limit. Kept short so an overloaded model falls through to the next one (or to the list). */
const MODEL_TIMEOUT_MS = 20_000;

function textOf(m: UIMessage): string {
  return m.parts.map((p) => (p.type === 'text' ? p.text : '')).join(' ');
}

/** Reply used when no AI model is configured: the search results, without an AI summary. */
export function searchOnlyAnswer(results: Scholarship[]): string {
  if (results.length === 0) {
    return "I couldn't find a matching scholarship. Try naming your level (SHS, college, grad school, TESDA), your course, or your city.";
  }
  const lines = results.map((s, i) => `- **${s.name}** (${s.provider}) [${i + 1}]`);
  return ['These scholarships match your question. Open each official page for requirements and deadlines:', ...lines].join('\n');
}

function writeText(writer: UIMessageStreamWriter, id: string, text: string) {
  writer.write({ type: 'text-start', id });
  writer.write({ type: 'text-delta', id, delta: text });
  writer.write({ type: 'text-end', id });
}

export function createChatHandler(models: () => LanguageModel[] = getModels) {
  return async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const recent = messages.slice(-MAX_MESSAGES);

    // Search with the last two user turns so follow-ups like "how about for SHS?" keep their context.
    const userTurns = recent.filter((m) => m.role === 'user').map(textOf);
    const question = userTurns.at(-1)?.slice(0, MAX_QUESTION_CHARS) ?? '';
    if (!question.trim()) return new Response('Empty question', { status: 400 });
    const query = userTurns.slice(-2).join(' ').slice(0, MAX_QUESTION_CHARS * 2);

    const results = searchScholarships(query);

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // One "start" for the whole reply, so the sources and the answer land in the same message.
        writer.write({ type: 'start' });
        results.forEach((s, i) =>
          writer.write({ type: 'source-url', sourceId: String(i + 1), url: s.official_url, title: s.name }),
        );

        const candidates = models();
        if (candidates.length > 0) {
          const modelMessages = await convertToModelMessages(recent);
          // Try each model once, quickly; Gemini often answers 503 "high demand" on the free tier.
          for (const model of candidates) {
            try {
              const { text } = await generateText({
                model,
                instructions: `${INSTRUCTIONS}\n\n${buildContext(results)}`,
                messages: modelMessages,
                maxOutputTokens: 1200,
                maxRetries: 0,
                abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
                // Answers are lookups over the sources, so keep hidden reasoning short (long reasoning
                // caused timeouts). gemini-3.8-flash rejects 'minimal'; AI_THINKING_LEVEL changes it.
                providerOptions: { google: { thinkingConfig: { thinkingLevel: thinkingLevel() } } },
              });
              if (text.trim()) {
                writeText(writer, 'answer', text);
                writer.write({ type: 'finish' });
                return;
              }
            } catch (err) {
              console.error('AI model failed, trying the next one:', err instanceof Error ? err.message : err);
            }
          }
        }

        // No AI configured, or every model failed: the search results still answer the question.
        const prefix = candidates.length > 0 ? "The AI summary isn't available right now. " : '';
        writeText(writer, 'search-only', prefix + searchOnlyAnswer(results));
        writer.write({ type: 'finish' });
      },
      onError: () => 'Sorry, something went wrong. Please try again in a moment.',
    });

    return createUIMessageStreamResponse({ stream });
  };
}
