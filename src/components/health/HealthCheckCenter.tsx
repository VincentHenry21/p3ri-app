import { useState } from 'react';
import { analyzeRegularity, predictedNextStart, predictedOvulation } from '../../lib/cycleEngine';
import type { DailyLog, Profile } from '../../lib/store';

export const SYMPTOMS = ['Cramps', 'Tender breasts', 'Bloating', 'Headache', 'Lower back ache', 'Acne', 'Ovulation twinge', 'Fatigue', 'Anxious', 'Irritable', 'Brain fog', 'Cravings'];

const GROUPS: { label: string; items: string[] }[] = [
  { label: 'Physical', items: ['Cramps', 'Headache', 'Lower back ache', 'Ovulation twinge', 'Acne'] },
  { label: 'Flow & Cycle', items: ['Tender breasts', 'Bloating'] },
  { label: 'Mood & Energy', items: ['Fatigue', 'Anxious', 'Irritable', 'Brain fog', 'Cravings'] },
];

const PCOS_QS = [
  'Pelvic pain most days, not just during your period?',
  'Bleeding longer than 7 days, or soaking a pad every hour?',
  'Cycles often shorter than 21 days or longer than 35 days?',
  'Unusual hair growth, acne, or weight changes with irregular cycles?',
  'Pain during sex, or pain that keeps coming back between periods?',
];

function miniIcon(symptom: string): React.ReactNode {
  const p = { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (symptom) {
    case 'Cramps': return <svg {...p}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" /></svg>;
    case 'Tender breasts': return <svg {...p}><circle cx="9" cy="10" r="4" /><circle cx="16" cy="10" r="4" /></svg>;
    case 'Bloating': return <svg {...p}><circle cx="12" cy="12" r="8" /><path d="M12 8v8" /></svg>;
    case 'Headache': return <svg {...p}><circle cx="12" cy="12" r="8" /><path d="M9 12h6" /></svg>;
    case 'Lower back ache': return <svg {...p}><path d="M4 18c4-2 4-8 8-10M12 8l4-2M16 6l2 3" /></svg>;
    case 'Acne': return <svg {...p}><circle cx="8" cy="9" r="2" /><circle cx="16" cy="8" r="2" /><circle cx="12" cy="16" r="2" /></svg>;
    case 'Ovulation twinge': return <svg {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></svg>;
    case 'Fatigue': return <svg {...p}><rect x="3" y="8" width="16" height="9" rx="2" /><path d="M21 11v3M7 11v3" /></svg>;
    case 'Anxious': return <svg {...p}><path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /></svg>;
    case 'Irritable': return <svg {...p}><path d="M12 3c1 3-1 5-1 8a4 4 0 0 0 8 0c0-2-1-3-2-4 .5 2-1 3-2 3-.5-2 0-4-3-7z" /></svg>;
    case 'Brain fog': return <svg {...p}><path d="M7 17a4 4 0 1 1 1-8 5 5 0 0 1 9 2 3.5 3.5 0 0 1-2 6z" /></svg>;
    case 'Cravings': return <svg {...p}><path d="M12 20C7 16 3 13 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5c0 4.5-4 7.5-9 11.5z" /></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="4" /></svg>;
  }
}

interface Props {
  profile: Profile;
  todayLog: DailyLog;
  cycleDay: number;
  onToggleSymptom: (symptom: string) => void;
}

export default function HealthCheckCenter({ profile, todayLog, cycleDay, onToggleSymptom }: Props) {
  const [pcos, setPcos] = useState<boolean[]>([false, false, false, false, false]);
  const reg = analyzeRegularity(profile.averageCycleLength, profile.averagePeriodLength);
  const luteal = profile.averageCycleLength - 14;
  const lutealOk = luteal >= 11 && luteal <= 17;
  const allNormal = reg.cycleOk && reg.bleedOk && lutealOk;
  const flags = pcos.filter(Boolean).length;
  const heavy = todayLog.flow === 'Heavy' || todayLog.flow === 'Super Heavy';
  const fatigued = todayLog.symptoms.includes('Fatigue');
  return (
    <div>
      <div className="card">
        <b>Today's symptoms</b>
        {GROUPS.map((g) => (
          <div key={g.label} className="symptom-group">
            <span className="symptom-group-label">{g.label}</span>
            <div className="symptom-chips">
              {g.items.map((s) => (
                <button type="button" key={s} className={`symptom-chip${todayLog.symptoms.includes(s) ? ' on' : ''}`} onClick={() => onToggleSymptom(s)}>
                  <span className="symptom-icon">{miniIcon(s)}</span>{s}
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="status">Tap to toggle. These also change Peri's mood.</p>
      </div>

      <div className="card scorecard">
        <div className="scorecard-head">
          <b>Cycle regularity · vital sign check</b>
          <span className={allNormal ? 'badge-emerald' : 'badge-amber'}>{allNormal ? '✓ ACOG Normal' : 'Outside typical range'}</span>
        </div>
        <div className="score-tiles">
          <div className="score-tile"><span className="score-label">Cycle Length</span><b>{profile.averageCycleLength} Days</b><span className="score-note">21–35d normal</span></div>
          <div className="score-tile"><span className="score-label">Bleed Duration</span><b>{profile.averagePeriodLength} Days</b><span className="score-note">2–7d normal</span></div>
          <div className="score-tile"><span className="score-label">Luteal Phase</span><b>{luteal} Days</b><span className="score-note">11–17d optimal</span></div>
        </div>
        <p className="status">{reg.cycleNote} · {reg.bleedNote}</p>
      </div>

      <div className="card">
        <b>PCOS and endometriosis pattern screener</b>
        <p className="status">5 questions. This is education only, not a diagnosis.</p>
        <div className="screen-rows">
          {PCOS_QS.map((q, i) => (
            <button type="button" key={q} className={`screen-row${pcos[i] ? ' on' : ''}`} onClick={() => setPcos(pcos.map((v, j) => (j === i ? !v : v)))} aria-pressed={pcos[i]}>
              <span className="screen-q">{q}</span>
              <span className="screen-check" aria-hidden="true">{pcos[i] ? '✓' : ''}</span>
            </button>
          ))}
        </div>
        <div className="card summary-card">
          <b>Live guidance</b>
          <p>{flags === 0 ? 'No pattern flags checked today.' : flags <= 2 ? 'A few flags checked. Worth noting for your next clinician visit.' : 'Several flags checked. Consider sharing this summary with a healthcare provider for a proper assessment.'}</p>
          <button type="button" onClick={() => document.getElementById('doctor-summary')?.scrollIntoView({ behavior: 'smooth' })}>Generate Doctor Summary</button>
        </div>
      </div>

      <div className="card">
        <b>Breast self-exam guide</b>
        <p>{cycleDay >= 7 && cycleDay <= 10
          ? 'Today is in the Days 7 to 10 window, when breast tissue swelling is usually lowest. A calm moment for a step-by-step self-exam: look, feel in circles, check nipples, and note anything new.'
          : `Breast self-exam is best scheduled for Days 7 to 10 of your cycle. Today is Day ${cycleDay}, so Peri will remind you when that window opens.`}</p>
      </div>
      <div className="card">
        <b>Iron and hydration check</b>
        <p>{heavy && fatigued
          ? 'Heavy flow plus fatigue logged today. Pair iron-rich foods with vitamin C (for example lentils with citrus, or red meat with peppers) and rest well.'
          : 'No heavy flow plus fatigue pattern today. Keep water and iron-rich foods steady, especially during your period.'}</p>
      </div>
      <div className="card" id="doctor-summary">
        <b>Doctor visit summary</b>
        <p className="status">Generated from your settings and logs. Print or save it from your browser.</p>
        <p>Name: {profile.displayName || 'Guest'}<br />
          Last period start: {profile.lastPeriodStart}<br />
          Average cycle: {profile.averageCycleLength} days · Period: {profile.averagePeriodLength} days<br />
          Next predicted period: {predictedNextStart(profile.lastPeriodStart, profile.averageCycleLength)} · Ovulation: {predictedOvulation(profile.lastPeriodStart, profile.averageCycleLength)}<br />
          Today's flow: {todayLog.flow || 'not logged'} · Symptoms: {todayLog.symptoms.join(', ') || 'none logged'}<br />
          Screener flags: {flags} of 5</p>
        <button type="button" onClick={() => window.print()}>Print summary</button>
      </div>
    </div>
  );
}
