import { addDays, todayISO } from '../../lib/cycleEngine';
import type { DailyLog } from '../../lib/store';
import PeriSvg from '../mascot/PeriSvg';

function hasActivity(log?: DailyLog): boolean {
  return Boolean(log && (log.flow || log.symptoms.length > 0 || log.waterMl > 0 || log.completedHabits.length > 0));
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Streak hero: cheering Peri in a pulsing pink/coral aura, then a
 * 7-day timeline ribbon on a pink progress track. */
export default function StreakHeader({ logs, streak, style = 'plush' }: {
  logs: Record<string, DailyLog>; streak: number; style?: 'plush' | 'jelly';
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(todayISO(), i - 6);
    return { date, weekday: WEEKDAYS[new Date(date + 'T12:00:00').getDay()], done: hasActivity(logs[date]), today: date === todayISO() };
  });
  return (
    <div className="card streak-hero">
      <div className="streak-aura"><PeriSvg style={style} small /></div>
      <h2 className="streak-title">{streak} Day{streak === 1 ? '' : 's'} Streak</h2>
      <p className="streak-sub">Rise and Glow</p>
      <div className="ribbon">
        {days.map((d) => (
          <div key={d.date} className="ribbon-day">
            <span className={`ribbon-node${d.done ? ' done' : ''}${d.today ? ' today' : ''}`}>{d.done ? '✓' : d.date.slice(8)}</span>
            <span className="ribbon-label">{d.weekday}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
