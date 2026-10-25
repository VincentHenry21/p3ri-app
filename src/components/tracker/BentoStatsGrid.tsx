import { addDays, todayISO } from '../../lib/cycleEngine';
import type { DailyLog } from '../../lib/store';

/** 2-column bento analytics row: 7-day sleep pill bars, workout ring. */
export default function BentoStatsGrid({ logs, today }: { logs: Record<string, DailyLog>; today: DailyLog }) {
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(todayISO(), i - 6);
    return { h: logs[date]?.sleepHours ?? 0, letter: 'SMTWTFS'[new Date(date + 'T12:00:00').getDay()] };
  });
  const maxSleep = Math.max(8, ...last7.map((d) => d.h));
  const ringR = 34;
  const ringC = 2 * Math.PI * ringR;
  const frac = Math.min(1, today.exerciseMinutes / 60);
  return (
    <div className="bento-analytics">
      <div className="card bento-analytics-card">
        <b>Sleep time</b>
        <div className="sleep-bars">
          {last7.map((d, i) => (
            <div key={i} className="sleep-bar-col">
              <span className="sleep-bar-value">{d.h ? `${d.h}h` : ''}</span>
              <div className="sleep-bar" style={{ height: `${Math.max(6, Math.round((d.h / maxSleep) * 64))}px` }} />
              <span className="sleep-bar-label">{d.letter}</span>
            </div>
          ))}
        </div>
        <p className="status">Last 7 days, oldest to newest</p>
      </div>
      <div className="card bento-analytics-card">
        <b>Workout time</b>
        <div className="workout-ring-wrap">
          <svg viewBox="0 0 84 84" className="workout-ring" aria-label={`${today.exerciseMinutes} minutes of exercise today`}>
            <circle cx="42" cy="42" r={ringR} fill="none" stroke="#F1F5F9" strokeWidth="8" />
            <circle cx="42" cy="42" r={ringR} fill="none" stroke="#10B981" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={ringC} strokeDashoffset={ringC * (1 - frac)} transform="rotate(-90 42 42)" style={{ overflow: 'visible' }} />
          </svg>
          <span className="workout-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#312E81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17l4-9h4l2 5M10 8l2 4h6" /></svg>
          </span>
        </div>
        <p className="workout-label">{(today.exerciseMinutes / 60).toFixed(1)} Hours Today</p>
      </div>
    </div>
  );
}
