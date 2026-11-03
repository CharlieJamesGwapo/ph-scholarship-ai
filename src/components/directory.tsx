'use client';

import { useMemo, useState } from 'react';

import type { Level, Scholarship } from '@/lib/scholarships';

const LEVELS: { value: Level | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'senior_high', label: 'Senior high' },
  { value: 'college', label: 'College' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'tech_voc', label: 'Tech-voc' },
];

export function Directory({ items }: { items: Scholarship[] }) {
  const [level, setLevel] = useState<Level | 'all'>('all');
  const shown = useMemo(
    () => (level === 'all' ? items : items.filter((s) => s.levels.includes(level))),
    [items, level],
  );

  return (
    <section className="space-y-4" aria-labelledby="directory-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="directory-title" className="text-xl font-semibold">
          All scholarships ({shown.length})
        </h2>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by level">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              type="button"
              aria-pressed={level === l.value}
              onClick={() => setLevel(l.value)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                level === l.value
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-border text-muted hover:text-foreground'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {shown.map((s) => (
          <li key={s.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <div>
              <h3 className="font-medium leading-snug">{s.name}</h3>
              <p className="text-sm text-muted">{s.provider}</p>
            </div>
            <p className="text-sm">{s.summary}</p>
            {s.application_period && (
              <p className="text-sm text-muted">
                <span className="font-medium text-foreground">When: </span>
                {s.application_period}
              </p>
            )}
            <a
              href={s.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto text-sm text-accent underline underline-offset-2"
            >
              Official page ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
