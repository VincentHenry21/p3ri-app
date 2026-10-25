// The 12 Jelly Cloud / Peri expressions from the spec.
// The spec names 9 symptom-linked states plus the eye styles (||, |<, @ @);
// the remaining three are the default plush state, a calm state, and the
// luteal low-energy state, giving 12 distinct, selectable expressions.

import type { PhaseKey } from './cycleEngine';

export interface PeriExpression {
  id: string;
  label: string;
  face: string;
  trigger: string;
}

export const PERI_EXPRESSIONS: PeriExpression[] = [
  { id: 'starry', label: 'Starry-Eyed Glow', face: '🤩', trigger: 'High energy / follicular phase' },
  { id: 'cookie', label: 'Cookie Munching', face: '🍪', trigger: 'Cravings logged' },
  { id: 'wink', label: 'Winking Happy |<', face: '😉', trigger: 'Goal streak of 3+ days' },
  { id: 'dizzy', label: 'Dizzy Swirl @ @', face: '😵', trigger: 'Cramps, headache, or fatigue logged' },
  { id: 'sleeping', label: 'Peaceful Sleeping', face: '😴', trigger: '8+ hours sleep logged' },
  { id: 'sparkle', label: 'Sparkle Burst', face: '✨', trigger: 'Ovulation peak' },
  { id: 'book', label: 'Cozy Book Reader', face: '📖', trigger: 'Cycle journal habit logged' },
  { id: 'melting', label: 'Melting Puddle', face: '🫠', trigger: 'Heavy flow / exhausted' },
  { id: 'heart', label: 'Warm Heart Core', face: '💗', trigger: 'Happy mood / self-compassion' },
  { id: 'plush', label: 'Plush Happy', face: '🌸', trigger: 'Default happy state' },
  { id: 'calm', label: 'Calm Cloud ||', face: '😌', trigger: 'Calm mood logged' },
  { id: 'low', label: 'Low-Energy Amber', face: '🧡', trigger: 'Luteal / PMS state' },
];

export interface ExpressionContext {
  phase: PhaseKey;
  symptoms: string[];
  moods: string[];
  flow: string;
  sleepHours: number;
  streak: number;
  journalDone: boolean;
}

/** Priority-ordered selection: symptoms first, then phase, then default. */
export function selectExpression(ctx: ExpressionContext): PeriExpression {
  const byId = (id: string) => PERI_EXPRESSIONS.find((e) => e.id === id) ?? PERI_EXPRESSIONS[9];
  const has = (s: string) => ctx.symptoms.includes(s);
  if (has('Cramps') || has('Headache') || has('Fatigue')) return byId('dizzy');
  if (has('Cravings') || ctx.moods.includes('Cravings')) return byId('cookie');
  if (ctx.sleepHours >= 8) return byId('sleeping');
  if (ctx.flow === 'Heavy' || ctx.flow === 'Super Heavy') return byId('melting');
  if (ctx.journalDone) return byId('book');
  if (ctx.phase === 'ovulatory') return byId('sparkle');
  if (ctx.streak >= 3) return byId('wink');
  if (ctx.moods.includes('Happy')) return byId('heart');
  if (ctx.moods.includes('Calm')) return byId('calm');
  if (ctx.phase === 'follicular') return byId('starry');
  if (ctx.phase === 'luteal') return byId('low');
  if (ctx.phase === 'menstrual') return byId('melting');
  return byId('plush');
}
