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
import { searchScholarships } from '@/lib/search';

const MAX_MESSAGES = 12;
const MAX_QUESTION_CHARS = 1000;

function textOf(m: UIMessage): string {
  return m.parts.map((p) => (p.type === 'text' ? p.text : '')).join(' ');
}

export function createChatHandler(model: () => LanguageModel = getModel) {
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
        const result = streamText({
          model: model(),
          instructions: `${INSTRUCTIONS}\n\n${buildContext(results)}`,
          messages: await convertToModelMessages(recent),
        });
        writer.merge(toUIMessageStream({ stream: result.stream, sendStart: false }));
      },
      onError: () => 'Sorry, the AI is busy right now. Please try again in a moment.',
    });

    return createUIMessageStreamResponse({ stream });
  };
}
