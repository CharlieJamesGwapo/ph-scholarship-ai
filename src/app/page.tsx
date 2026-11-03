import { Chat } from '@/components/chat';
import { Directory } from '@/components/directory';
import { scholarships } from '@/lib/scholarships';

export default function Home() {
  const lastChecked = scholarships.map((s) => s.last_checked).sort().at(-1);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-10 font-sans sm:py-14">
      <header className="space-y-3">
        <p className="text-sm font-medium tracking-wide text-accent">🇵🇭 Iskolar AI</p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Find a scholarship that fits you. Ask in English or Taglish.
        </h1>
        <p className="text-muted">
          Answers come only from {scholarships.length} programs checked against their official pages, and every
          answer links to the source. Always confirm deadlines on the official page before applying.
        </p>
      </header>

      <Chat />

      <Directory items={scholarships} />

      <footer className="border-t border-border pt-6 text-sm text-muted">
        Data last checked {lastChecked}. Not affiliated with any agency or foundation listed. Spotted something
        wrong or missing?{' '}
        <a className="text-accent underline" href="https://github.com/CharlieJamesGwapo/ph-scholarship-ai/issues">
          Open an issue
        </a>
        .
        <p className="mt-3">
          Free and open source.{' '}
          <a className="text-accent underline" href="https://github.com/CharlieJamesGwapo/ph-scholarship-ai">
            ⭐ Star it on GitHub
          </a>{' '}
          so more students find it, or{' '}
          <a className="text-accent underline" href="https://github.com/sponsors/CharlieJamesGwapo">
            💖 sponsor the maintainer
          </a>{' '}
          to keep the data checked.
        </p>
      </footer>
    </main>
  );
}
