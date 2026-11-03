import type { UIMessage } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { describe, expect, it } from 'vitest';

import { createChatHandler } from '../src/lib/chat-handler';

function answering(text: string, seen: { prompt?: unknown } = {}) {
  return new MockLanguageModelV4({
    doGenerate: async (options) => {
      seen.prompt = options.prompt;
      return {
        content: [{ type: 'text', text }],
        finishReason: { unified: 'stop', raw: undefined },
        usage: {
          inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined },
          outputTokens: { total: 5, text: 5, reasoning: undefined },
        },
        warnings: [],
      };
    },
  });
}

function failing(message: string) {
  return new MockLanguageModelV4({
    doGenerate: async () => {
      throw new Error(message);
    },
  });
}

const ask = (text: string): UIMessage[] => [{ id: 'u1', role: 'user', parts: [{ type: 'text', text }] }];

async function post(handler: (r: Request) => Promise<Response>, messages: UIMessage[]) {
  return handler(new Request('http://x/api/chat', { method: 'POST', body: JSON.stringify({ messages }) }));
}

describe('chat handler', () => {
  it('sends source parts first, then the answer, with sources in the instructions', async () => {
    const seen: { prompt?: unknown } = {};
    const res = await post(createChatHandler(() => [answering('Try DOST [1].', seen)]), ask('engineering scholarship for college'));
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

  it('falls back to the next model when the first is overloaded', async () => {
    const res = await post(
      createChatHandler(() => [failing('This model is currently experiencing high demand'), answering('Backup answer [1].')]),
      ask('scholarship for children of OFWs'),
    );
    const body = await res.text();
    expect(body).toContain('Backup answer [1].');
    expect(body).not.toContain('high demand');
  });

  it('answers with search results only when no model is configured', async () => {
    const body = await (await post(createChatHandler(() => []), ask('scholarship for children of OFWs'))).text();
    expect(body).toContain('"type":"source-url"');
    expect(body).toContain('These scholarships match your question');
    expect(body).toContain('OWWA');
    expect(body).not.toContain("isn't available");
  });

  it('keeps the sources and lists them when every model fails', async () => {
    const res = await post(createChatHandler(() => [failing('API key not valid')]), ask('scholarship for children of OFWs'));
    const body = await res.text();
    expect(body).toContain('"type":"source-url"');
    expect(body).toContain("The AI summary isn't available right now.");
    expect(body).toContain('OWWA');
    expect(body).not.toContain('API key not valid');
    expect(body).not.toContain('"type":"error"');
  });

  it('rejects an empty question', async () => {
    const res = await post(createChatHandler(() => [answering('x')]), ask('   '));
    expect(res.status).toBe(400);
  });
});
