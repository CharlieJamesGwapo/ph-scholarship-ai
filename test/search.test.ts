import { describe, expect, it } from 'vitest';

import { buildContext } from '../src/lib/prompt';
import { detectLevel, expandQuery, searchScholarships } from '../src/lib/search';
import { fixtures } from './fixtures';

const ids = (q: string) => searchScholarships(q, 6, fixtures).map((s) => s.id);

describe('searchScholarships', () => {
  it('finds STEM college programs from a Taglish question', () => {
    expect(ids('Incoming college ako, engineering. Anong scholarship?')[0]).toBe('dost-ug');
  });

  it('maps OFW to OWWA programs and drops weak matches', () => {
    expect(ids('scholarship para sa anak ng OFW')[0]).toBe('owwa-edsp');
    expect(ids('Scholarships for children of OFWs')[0]).toBe('owwa-edsp');
    expect(ids('Scholarships for children of OFWs')).not.toContain('dost-grad');
  });

  it('drops programs for other levels when a level is named', () => {
    const r = ids('science scholarship for grad school');
    expect(r).toContain('dost-grad');
    expect(r).not.toContain('dost-ug');
  });

  it('finds tech-voc and senior high programs', () => {
    expect(ids('TESDA courses')).toEqual(['tesda-twsp']);
    expect(ids('voucher for SHS')).toEqual(['shs-voucher']);
  });

  it('adds open nationwide programs when only a few match', () => {
    expect(ids('nursing scholarship for college')).toContain('owwa-edsp');
  });

  it('returns nothing for unrelated questions', () => {
    expect(ids('xyzzy qwerty')).toEqual([]);
  });
});

describe('query helpers', () => {
  it('detects levels', () => {
    expect(detectLevel('Grade 11 ako')).toBe('senior_high');
    expect(detectLevel('PhD in physics')).toBe('graduate');
    expect(detectLevel('any scholarship?')).toBeUndefined();
  });

  it('does not treat the English word "it" as IT', () => {
    expect(expandQuery('is it free?')).toBe('is it free?');
  });
});

describe('buildContext', () => {
  it('numbers sources from 1 and marks missing details', () => {
    const ctx = buildContext(fixtures.slice(0, 2));
    expect(ctx).toContain('[1]\nName: DOST-SEI Undergraduate Scholarship');
    expect(ctx).toContain('[2]\nName: OWWA');
    expect(ctx).toContain('Application period: not stated on the official page');
  });

  it('says when nothing matched', () => {
    expect(buildContext([])).toContain('no matching scholarships found');
  });
});
