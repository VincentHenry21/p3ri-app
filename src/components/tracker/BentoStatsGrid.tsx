import { addDays, todayISO } from '../../lib/cycleEngine';
import type { DailyLog } from '../../lib/store';

/** Sleep bar chart, movement ring, hydration and cycle-history bento cards. */
export default function BentoStatsGrid({ logs, today }: { logs: Record<string, DailyLog>; today: DailyLog }) {
  const last7 = Array.from({ length: 7 }, (_, i) => logs[addDays(todayISO(), i - 6)]?.sleepHours ?? 0);
  const maxSleep = Math.max(8, ...last7);
  return (
    <div>
      <div className="card">
        <b>Sleep, last 7 days</b>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90, marginTop: 10 }}>
          {last7.map((h, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: `${Math.round((h / maxSleep) * 60)}px`, background: 'linear-gradient(#FF8C3B,#F97316)', borderRadius: 8 }} />
              <span className="status">{h}h</span>
            </div>
          ))}
        </div>
        <p className="status">S M T W T F S (oldest to newest)</p>
      </div>
      <div className="card">
        <b>Movement today</b>
        <p>{today.exerciseMinutes} minutes logged. A full ring is 60 minutes.</p>
        <div style={{ width: 110, height: 110, borderRadius: '50%', margin: '8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `10px solid #10B981`, borderTopColor: today.exerciseMinutes >= 60 ? '#10B981' : '#E5E7EB', fontWeight: 800 }}>
          {today.exerciseMinutes} min
        </div>
      </div>
      <div className="card">
        <b>Hydration</b>
        <p>{(today.waterMl / 1000).toFixed(2)} L of 2.0 L today ({Math.round(today.waterMl / 250)} glasses of 250 ml).</p>
        <div className="bar"><i style={{ width: `${Math.min(100, Math.round((today.waterMl / 2000) * 100))}%` }} /></div>
      </div>
    </div>
  );
}
