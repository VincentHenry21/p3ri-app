import { describe, it, expect } from 'vitest';
import { PERI_EXPRESSIONS, selectExpression } from './periExpressions';

const base = {
  phase: 'follicular' as const, symptoms: [] as string[], moods: [] as string[],
  flow: '', sleepHours: 0, streak: 0, journalDone: false,
};

describe('Peri expressions', () => {
  it('defines exactly 12 expressions', () => {
    expect(PERI_EXPRESSIONS).toHaveLength(12);
    expect(new Set(PERI_EXPRESSIONS.map((e) => e.id)).size).toBe(12);
  });
  it('prioritises symptoms over phase', () => {
    expect(selectExpression({ ...base, symptoms: ['Cramps'] }).id).toBe('dizzy');
    expect(selectExpression({ ...base, symptoms: ['Cravings'] }).id).toBe('cookie');
    expect(selectExpression({ ...base, sleepHours: 8.5 }).id).toBe('sleeping');
    expect(selectExpression({ ...base, flow: 'Heavy' }).id).toBe('melting');
    expect(selectExpression({ ...base, journalDone: true }).id).toBe('book');
  });
  it('uses phase and streak fallbacks', () => {
    expect(selectExpression({ ...base, phase: 'ovulatory' }).id).toBe('sparkle');
    expect(selectExpression({ ...base, streak: 4 }).id).toBe('wink');
    expect(selectExpression({ ...base, moods: ['Happy'] }).id).toBe('heart');
    expect(selectExpression({ ...base, moods: ['Calm'] }).id).toBe('calm');
    expect(selectExpression({ ...base, phase: 'luteal' }).id).toBe('low');
    expect(selectExpression(base).id).toBe('starry'); // follicular default
  });
});
