import data from '../../data/scholarships.json';

export type Level = 'senior_high' | 'college' | 'graduate' | 'tech_voc';

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  provider_type: 'government' | 'lgu' | 'private' | 'university';
  levels: Level[];
  fields: string[];
  regions: string[];
  summary: string;
  eligibility: string[];
  benefits: string[];
  application_period: string | null;
  how_to_apply: string | null;
  official_url: string;
  source_urls: string[];
  last_checked: string;
  notes: string | null;
}

export const scholarships = data as Scholarship[];

/** Plain-text version of one scholarship, used both for search and as model context. */
export function toContext(s: Scholarship): string {
  const lines = [
    `Name: ${s.name}`,
    `Provider: ${s.provider} (${s.provider_type})`,
    `Levels: ${s.levels.join(', ')}`,
    `Fields: ${s.fields.join(', ')}`,
    `Where: ${s.regions.join(', ')}`,
    `Summary: ${s.summary}`,
    `Eligibility: ${s.eligibility.join('; ') || 'not stated'}`,
    `Benefits: ${s.benefits.join('; ') || 'not stated'}`,
    `Application period: ${s.application_period ?? 'not stated on the official page'}`,
    `How to apply: ${s.how_to_apply ?? 'not stated'}`,
    `Official page: ${s.official_url}`,
    `Last checked: ${s.last_checked}`,
  ];
  if (s.notes) lines.push(`Notes: ${s.notes}`);
  return lines.join('\n');
}
