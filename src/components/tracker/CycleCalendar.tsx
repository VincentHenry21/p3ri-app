import { useState } from 'react';
import { isFertile, isPredictedPeriod, predictedOvulation, todayISO } from '../../lib/cycleEngine';
import type { DailyLog } from '../../lib/store';

interface Props {
  logs: Record<string, DailyLog>;
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
  selected: string;
  onSelect: (date: string) => void;
}

export default function CycleCalendar({ logs, lastPeriodStart, cycleLength, periodLength, selected, onSelect }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const title = new Date(year, month, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
  const step = (n: number) => {
    let m = month + n, y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m); setYear(y);
  };
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < first; i++) cells.push(<span key={`blank-${i}`} />);
  for (let d = 1; d <= days; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const log = logs[iso];
    let cls = 'd';
    if (log?.flow) cls += ' period';
    else if (isPredictedPeriod(iso, lastPeriodStart, cycleLength, periodLength)) cls += ' pred';
    else if (iso === predictedOvulation(lastPeriodStart, cycleLength)) cls += ' ovul';
    else if (isFertile(iso, lastPeriodStart, cycleLength)) cls += ' fertile';
    if (iso === todayISO()) cls += ' today';
    if (iso === selected) cls += ' selected';
    cells.push(<button type="button" key={iso} className={cls} onClick={() => onSelect(iso)}>{d}{iso === predictedOvulation(lastPeriodStart, cycleLength) ? ' ✦' : ''}</button>);
  }
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="ghost small" onClick={() => step(-1)}>‹ Prev</button>
        <b>{title}</b>
        <button type="button" className="ghost small" onClick={() => step(1)}>Next ›</button>
      </div>
      <div className="cal">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <b key={d}>{d}</b>)}</div>
      <div className="cal">{cells}</div>
      <p className="status">Rose solid: logged period · Rose dashed: predicted period · Sky: fertile · Sky solid with star: ovulation</p>
    </div>
  );
}
