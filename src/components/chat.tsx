'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { type FormEvent, type ReactNode, useState } from 'react';

const EXAMPLES = [
  'Incoming college ako, BS Engineering. Anong scholarship pwede?',
  'Scholarships for children of OFWs',
  'May scholarship ba for TESDA courses?',
  'Grad school scholarships for science',
];

type Source = { id: string; url: string; title?: string };

function sourcesOf(m: UIMessage): Source[] {
  return m.parts.flatMap((p) => (p.type === 'source-url' ? [{ id: p.sourceId, url: p.url, title: p.title }] : []));
}

/** Renders **bold** and turns [n] citations into links to the matching source. */
function inline(text: string, sources: Source[], key: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((piece, i) => {
    const k = `${key}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(piece)) return <strong key={k}>{piece.slice(2, -2)}</strong>;
    const cite = piece.match(/^\[(\d+)\]$/);
    if (cite) {
      const src = sources.find((s) => s.id === cite[1]);
      if (!src) return piece;
      return (
        <a
          key={k}
          href={src.url}
          target="_blank"
          rel="noopener noreferrer"
          title={src.title}
          className="mx-0.5 align-super text-xs text-accent no-underline hover:underline"
        >
          [{cite[1]}]
        </a>
      );
    }
    return piece;
  });
}

function Answer({ text, sources }: { text: string; sources: Source[] }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      const items = list;
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc space-y-1 pl-5">
          {items.map((li, i) => (
            <li key={i}>{inline(li, sources, `li-${blocks.length}-${i}`)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  for (const line of text.split('\n')) {
    const bullet = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
    if (bullet) list.push(bullet[1]);
    else {
      flush();
      if (line.trim()) blocks.push(<p key={`p-${blocks.length}`}>{inline(line, sources, `p-${blocks.length}`)}</p>);
    }
  }
  flush();
  return <div className="space-y-2 leading-relaxed">{blocks}</div>;
}

export function Chat() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const [input, setInput] = useState('');
  const busy = status === 'submitted' || status === 'streaming';

  const ask = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text });
    setInput('');
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <section className="space-y-4" aria-label="Ask Iskolar AI">
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => ask(ex)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-sm hover:border-accent"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4" aria-live="polite">
        {messages.map((m) => {
          const text = m.parts.map((p) => (p.type === 'text' ? p.text : '')).join('');
          if (m.role === 'user') {
            return (
              <div key={m.id} className="ml-auto w-fit max-w-[85%] rounded-2xl bg-accent px-4 py-2 text-white dark:text-[#12110f]">
                {text}
              </div>
            );
          }
          const sources = sourcesOf(m);
          return (
            <div key={m.id} className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <Answer text={text} sources={sources} />
              {sources.length > 0 && (
                <ol className="space-y-1 border-t border-border pt-3 text-sm">
                  {sources.map((s) => (
                    <li key={s.id} className="flex gap-2">
                      <span className="text-muted">[{s.id}]</span>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">
                        {s.title ?? s.url}
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
        {status === 'submitted' && <p className="text-sm text-muted">Searching scholarships…</p>}
        {error && (
          <p className="text-sm text-red-600">
            {error.message && !error.message.startsWith('{') ? error.message : 'Something went wrong. Please try again.'}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <label htmlFor="q" className="sr-only">
          Your question
        </label>
        <input
          id="q"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          placeholder="e.g. Scholarship para sa nursing sa Cebu?"
          className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-3 outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-accent px-5 py-3 font-medium text-white disabled:opacity-50 dark:text-[#12110f]"
        >
          Ask
        </button>
      </form>
    </section>
  );
}
