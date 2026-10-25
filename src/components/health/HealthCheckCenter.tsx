import { useState } from 'react';
import { analyzeRegularity, predictedNextStart, predictedOvulation } from '../../lib/cycleEngine';
import type { DailyLog, Profile } from '../../lib/store';

export const SYMPTOMS = ['Cramps', 'Tender breasts', 'Bloating', 'Headache', 'Lower back ache', 'Acne', 'Ovulation twinge', 'Fatigue', 'Anxious', 'Irritable', 'Brain fog', 'Cravings'];
const PCOS_QS = [
  'Pelvic pain most days, not just during your period?',
  'Bleeding longer than 7 days, or soaking a pad every hour?',
  'Cycles often shorter than 21 days or longer than 35 days?',
  'Unusual hair growth, acne, or weight changes with irregular cycles?',
  'Pain during sex, or pain that keeps coming back between periods?',
];

interface Props {
  profile: Profile;
  todayLog: DailyLog;
  cycleDay: number;
  onToggleSymptom: (symptom: string) => void;
}

export default function HealthCheckCenter({ profile, todayLog, cycleDay, onToggleSymptom }: Props) {
  const [pcos, setPcos] = useState<boolean[]>([false, false, false, false, false]);
  const reg = analyzeRegularity(profile.averageCycleLength, profile.averagePeriodLength);
  const flags = pcos.filter(Boolean).length;
  const heavy = todayLog.flow === 'Heavy' || todayLog.flow === 'Super Heavy';
  const fatigued = todayLog.symptoms.includes('Fatigue');
  return (
    <div>
      <div className="card">
        <b>Today's symptoms</b>
        <div>
          {SYMPTOMS.map((s) => (
            <button type="button" key={s} className={`chip${todayLog.symptoms.includes(s) ? ' on' : ''}`} onClick={() => onToggleSymptom(s)}>{s}</button>
          ))}
        </div>
        <p className="status">Tap to toggle. These also change Peri's mood.</p>
      </div>
      <div className="card">
        <b>Cycle regularity · vital sign check</b>
        <p>Cycle length: {profile.averageCycleLength} days. <span className={reg.cycleOk ? 'ok' : 'warn'}>{reg.cycleNote}</span></p>
        <p>Period length: {profile.averagePeriodLength} days. <span className={reg.bleedOk ? 'ok' : 'warn'}>{reg.bleedNote}</span></p>
      </div>
      <div className="card">
        <b>PCOS and endometriosis pattern screener</b>
        <p className="status">5 questions. This is education only, not a diagnosis.</p>
        {PCOS_QS.map((q, i) => (
          <label key={q} style={{ display: 'block', fontWeight: 400, padding: '6px 0' }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={pcos[i]} onChange={(e) => setPcos(pcos.map((v, j) => (j === i ? e.target.checked : v)))} /> {q}
          </label>
        ))}
        <p>{flags === 0 ? 'No pattern flags checked today.' : flags <= 2 ? 'A few flags checked. Worth noting for your next clinician visit.' : 'Several flags checked. Consider sharing this summary with a healthcare provider for a proper assessment.'}</p>
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
      <div className="card">
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
