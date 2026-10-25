import { describe, it, expect } from 'vitest';
import {
  addDays, cycleDay, ovulationDay, phaseForDay, predictedOvulation,
  predictedNextStart, isFertile, analyzeRegularity,
} from './cycleEngine';

describe('ovulation anchoring', () => {
  it('anchors ovulation 14 days before the predicted next start (28-day cycle)', () => {
    expect(predictedNextStart('2026-10-25', 28)).toBe('2026-11-22');
    expect(predictedOvulation('2026-10-25', 28)).toBe('2026-11-08');
    expect(ovulationDay(28)).toBe(14);
  });
  it('anchors ovulation for a 21-day cycle (day 7, not day 14)', () => {
    expect(ovulationDay(21)).toBe(7);
    expect(predictedNextStart('2026-10-25', 21)).toBe('2026-11-15');
    expect(predictedOvulation('2026-10-25', 21)).toBe('2026-11-01');
  });
  it('anchors ovulation for a 35-day cycle (day 21, not day 14)', () => {
    expect(ovulationDay(35)).toBe(21);
    expect(predictedNextStart('2026-10-25', 35)).toBe('2026-11-29');
    expect(predictedOvulation('2026-10-25', 35)).toBe('2026-11-15');
  });
  it('puts the fertile window 5 days before ovulation through ovulation day', () => {
    expect(isFertile('2026-11-03', '2026-10-25', 28)).toBe(true); // ov - 5
    expect(isFertile('2026-11-08', '2026-10-25', 28)).toBe(true); // ovulation
    expect(isFertile('2026-11-09', '2026-10-25', 28)).toBe(false);
    expect(isFertile('2026-11-02', '2026-10-25', 28)).toBe(false);
  });
});

describe('phase boundaries (28-day cycle, per spec)', () => {
  it('maps days 1-5 menstrual, 6-13 follicular, 14-16 ovulatory, 17-28 luteal', () => {
    expect(phaseForDay(1, 28, 5).key).toBe('menstrual');
    expect(phaseForDay(5, 28, 5).key).toBe('menstrual');
    expect(phaseForDay(6, 28, 5).key).toBe('follicular');
    expect(phaseForDay(13, 28, 5).key).toBe('follicular');
    expect(phaseForDay(14, 28, 5).key).toBe('ovulatory');
    expect(phaseForDay(16, 28, 5).key).toBe('ovulatory');
    expect(phaseForDay(17, 28, 5).key).toBe('luteal');
    expect(phaseForDay(28, 28, 5).key).toBe('luteal');
  });
  it('scales phase bands from anchored ovulation for non-28-day cycles', () => {
    // 21-day cycle: ovulation day 7, so day 6-8 are ovulatory, day 9+ luteal
    expect(phaseForDay(6, 21, 5).key).toBe('ovulatory');
    expect(phaseForDay(9, 21, 5).key).toBe('luteal');
    // 35-day cycle: ovulation day 21, so day 20-22 ovulatory
    expect(phaseForDay(20, 35, 5).key).toBe('ovulatory');
    expect(phaseForDay(23, 35, 5).key).toBe('luteal');
  });
  it('cycles day numbers wrap across cycle boundaries', () => {
    expect(cycleDay('2026-10-25', '2026-11-22', 28)).toBe(1);
    expect(cycleDay('2026-10-25', '2026-10-25', 28)).toBe(1);
    expect(addDays('2026-10-25', 28)).toBe('2026-11-22');
  });
});

describe('regularity analysis', () => {
  it('accepts 21-35 day cycles and 2-7 day bleeds', () => {
    expect(analyzeRegularity(28, 5)).toMatchObject({ cycleOk: true, bleedOk: true });
    expect(analyzeRegularity(21, 2)).toMatchObject({ cycleOk: true, bleedOk: true });
    expect(analyzeRegularity(35, 7)).toMatchObject({ cycleOk: true, bleedOk: true });
  });
  it('flags out-of-range cycles and bleeds', () => {
    expect(analyzeRegularity(20, 5).cycleOk).toBe(false);
    expect(analyzeRegularity(36, 5).cycleOk).toBe(false);
    expect(analyzeRegularity(28, 8).bleedOk).toBe(false);
    expect(analyzeRegularity(28, 1).bleedOk).toBe(false);
  });
});
