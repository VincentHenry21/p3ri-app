// P3RI cycle engine. Ovulation is always anchored 14 days before the
// predicted next period start (standard luteal calculation), never hardcoded
// to day 14. Phase bands follow the spec for a 28-day cycle and scale from
// the anchored ovulation day for other cycle lengths.

export type PhaseKey = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface Phase {
  key: PhaseKey;
  label: string;
  color: string;
  bleed: string;
  tip: string;
}

export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, n: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return todayISO(d);
}

export function diffDays(from: string, to: string): number {
  return Math.round((parseISO(to).getTime() - parseISO(from).getTime()) / 86400000);
}

/** 1-based day within the current cycle. */
export function cycleDay(lastPeriodStart: string, date: string, cycleLength: number): number {
  const d = diffDays(lastPeriodStart, date);
  return ((d % cycleLength) + cycleLength) % cycleLength + 1;
}

/** Ovulation day within the cycle: cycleLength - 14. */
export function ovulationDay(cycleLength: number): number {
  return cycleLength - 14;
}

export function phaseForDay(day: number, cycleLength: number, periodLength: number): Phase {
  const menstrual: Phase = { key: 'menstrual', label: 'Menstrual Phase', color: '#FF2E93', bleed: '#FFE4E6', tip: 'Rest, iron-rich food, gentle warmth and cramp relief today.' };
  const follicular: Phase = { key: 'follicular', label: 'Follicular Phase', color: '#8B5CF6', bleed: '#EDE9FE', tip: 'Your energy is rising. Good day for strength, creativity and new habits.' };
  const ovulatory: Phase = { key: 'ovulatory', label: 'Ovulatory Phase', color: '#38BDF8', bleed: '#E0F2FE', tip: 'Peak energy and fertile window. Hydrate well and enjoy the social lift.' };
  const luteal: Phase = { key: 'luteal', label: 'Luteal Phase', color: '#FF8C3B', bleed: '#FFEDD5', tip: 'Progesterone is peaking. Swap intense HIIT for a cozy walk and extra magnesium.' };
  if (cycleLength === 28) {
    if (day <= 5) return menstrual;
    if (day <= 13) return follicular;
    if (day <= 16) return ovulatory;
    return luteal;
  }
  const ov = ovulationDay(cycleLength);
  if (day <= periodLength) return menstrual;
  if (day < ov - 1) return follicular;
  if (day <= ov + 1) return ovulatory;
  return luteal;
}

export function predictedNextStart(lastPeriodStart: string, cycleLength: number): string {
  return addDays(lastPeriodStart, cycleLength);
}

export function predictedOvulation(lastPeriodStart: string, cycleLength: number): string {
  return addDays(predictedNextStart(lastPeriodStart, cycleLength), -14);
}

/** Fertile window: 5 days before ovulation through ovulation day. */
export function isFertile(date: string, lastPeriodStart: string, cycleLength: number): boolean {
  const ov = predictedOvulation(lastPeriodStart, cycleLength);
  const d = diffDays(ov, date);
  return d >= -5 && d <= 0;
}

export function isPredictedPeriod(date: string, lastPeriodStart: string, cycleLength: number, periodLength: number): boolean {
  const next = predictedNextStart(lastPeriodStart, cycleLength);
  const d = diffDays(next, date);
  return d >= 0 && d < periodLength;
}

export interface RegularityResult {
  cycleOk: boolean;
  bleedOk: boolean;
  cycleNote: string;
  bleedNote: string;
}

/** ACOG-aligned vital-sign ranges: cycle 21-35 days, bleed 2-7 days. */
export function analyzeRegularity(cycleLength: number, periodLength: number): RegularityResult {
  const cycleOk = cycleLength >= 21 && cycleLength <= 35;
  const bleedOk = periodLength >= 2 && periodLength <= 7;
  return {
    cycleOk,
    bleedOk,
    cycleNote: cycleOk
      ? 'Within the typical adult range (21 to 35 days).'
      : 'Outside the typical adult range (21 to 35 days). Gentle note: consider checking in with a healthcare provider if this pattern repeats.',
    bleedNote: bleedOk
      ? 'Bleed length within the typical 2 to 7 days.'
      : 'Bleed length outside the typical 2 to 7 days. Gentle note: consider checking in with a healthcare provider if this pattern repeats.',
  };
}
