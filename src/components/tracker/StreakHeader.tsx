import { addDays, todayISO } from '../../lib/cycleEngine';
import type { DailyLog } from '../../lib/store';

function hasActivity(log?: DailyLog): boolean {
  return Boolean(log && (log.flow || log.symptoms.length > 0 || log.waterMl > 0 || log.completedHabits.length > 0));
}

export default function StreakHeader({ logs, streak }: { logs: Record<string, DailyLog>; streak: number }) {
  return (
    <div className="card">
      <b>7-day streak · {streak} days</b>
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {Array.from({ length: 7 }, (_, i) => {
          const date = addDays(todayISO(), i - 6);
          const active = hasActivity(logs[date]);
          return (
            <div key={date} style={{ flex: 1, textAlign: 'center', background: active ? '#EDE9FE' : '#fff', border: '1px solid #eee', borderRadius: 12, padding: '8px 2px' }}>
              {date.slice(5)}<br />{active ? '✓' : '·'}
            </div>
          );
        })}
      </div>
    </div>
  );
}
