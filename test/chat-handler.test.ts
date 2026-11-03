import { simulateReadableStream, type UIMessage } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { describe, expect, it } from 'vitest';

import { createChatHandler } from '../src/lib/chat-handler';

function mockModel(seen: { prompt?: unknown }) {
  return new MockLanguageModelV4({
    doStream: async (options) => {
      seen.prompt = options.prompt;
      return {
        stream: simulateReadableStream({
          chunks: [
            { type: 'text-start', id: 't1' },
            { type: 'text-delta', id: 't1', delta: 'Try DOST [1].' },
            { type: 'text-end', id: 't1' },
            {
              type: 'finish',
              finishReason: { unified: 'stop', raw: undefined },
              usage: {
                inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
                outputTokens: { total: 5, text: 5, reasoning: undefined },
              },
            },
          ],
        }),
      };
    },
  });
}

const ask = (text: string): UIMessage[] => [{ id: 'u1', role: 'user', parts: [{ type: 'text', text }] }];

async function post(handler: (r: Request) => Promise<Response>, messages: UIMessage[]) {
  return handler(new Request('http://x/api/chat', { method: 'POST', body: JSON.stringify({ messages }) }));
}

describe('chat handler', () => {
  it('streams source parts first, then the answer, with sources in the instructions', async () => {
    const seen: { prompt?: unknown } = {};
    const res = await post(createChatHandler(() => mockModel(seen)), ask('engineering scholarship for college'));
    expect(res.status).toBe(200);
    const body = await res.text();

    const firstSource = body.indexOf('"type":"source-url"');
    const firstText = body.indexOf('"type":"text-delta"');
    expect(firstSource).toBeGreaterThan(-1);
    expect(firstText).toBeGreaterThan(firstSource);
    expect(body).toContain('Try DOST [1].');
    expect(body.match(/"type":"start"/g)).toHaveLength(1);

    const system = JSON.stringify(seen.prompt);
    expect(system).toContain('<sources>');
    expect(system).toContain('[1]');
  });

  it('answers with search results only when no model is configured', async () => {
    const res = await post(createChatHandler(() => null), ask('scholarship for children of OFWs'));
    const body = await res.text();
    expect(body).toContain('"type":"source-url"');
    expect(body).toContain('These scholarships match your question');
    expect(body).toContain('OWWA');
  });

  it('keeps the sources and explains when the model call fails', async () => {
    const failing = new MockLanguageModelV4({
      doStream: async () => {
        throw new Error('API key not valid');
      },
    });
    const res = await post(createChatHandler(() => failing), ask('scholarship for children of OFWs'));
    const body = await res.text();
    expect(body).toContain('"type":"source-url"');
    expect(body).toContain("The AI summary isn't available right now");
    expect(body).not.toContain('API key not valid');
  });

  it('rejects an empty question', async () => {
    const res = await post(createChatHandler(() => mockModel({})), ask('   '));
    expect(res.status).toBe(400);
  });
});
