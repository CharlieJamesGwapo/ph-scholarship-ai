import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type LanguageModel,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';

import { getModel } from '@/lib/model';
import { buildContext, INSTRUCTIONS } from '@/lib/prompt';
import type { Scholarship } from '@/lib/scholarships';
import { searchScholarships } from '@/lib/search';

const MAX_MESSAGES = 12;
const MAX_QUESTION_CHARS = 1000;

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

export function createChatHandler(model: () => LanguageModel | null = getModel) {
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
        const llm = model();
        if (!llm) {
          writer.write({ type: 'text-start', id: 'search-only' });
          writer.write({ type: 'text-delta', id: 'search-only', delta: searchOnlyAnswer(results) });
          writer.write({ type: 'text-end', id: 'search-only' });
          writer.write({ type: 'finish' });
          return;
        }
        const result = streamText({
          model: llm,
          instructions: `${INSTRUCTIONS}\n\n${buildContext(results)}`,
          messages: await convertToModelMessages(recent),
          maxOutputTokens: 1200,
          // Answers are lookups over the sources, so skip long hidden reasoning (it caused timeouts).
          providerOptions: { google: { thinkingConfig: { thinkingLevel: 'minimal' } } },
        });
        writer.merge(
          toUIMessageStream({
            stream: result.stream,
            sendStart: false,
            // The sources were already sent, so the student can still use them.
            onError: () =>
              "The AI summary isn't available right now, but the scholarships listed above match your question. Open each official page for requirements and deadlines.",
          }),
        );
      },
      onError: () => 'Sorry, the AI is busy right now. Please try again in a moment.',
    });

    return createUIMessageStreamResponse({ stream });
  };
}
