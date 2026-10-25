import type { DailyLog } from '../../lib/store';
import { FLOW_LABELS } from '../../lib/store';

/** 1-tap circular quick-log dock: flow, water, movement, sleep. */
export default function QuickActionDock({ log, onChange }: { log: DailyLog; onChange: (patch: Partial<DailyLog>) => void }) {
  const nextFlow = () => {
    const next = (log.flowLevel + 1) % FLOW_LABELS.length;
    onChange({ flowLevel: next, flow: FLOW_LABELS[next] });
  };
  return (
    <div className="dock">
      <div><div className="ring">🩸</div><button type="button" className="ghost small" onClick={nextFlow}>Flow +</button><div className="status">{log.flow || 'Not logged'}</div></div>
      <div><div className="ring">💧</div><button type="button" className="ghost small" onClick={() => onChange({ waterMl: log.waterMl + 250 })}>+ 250 ml</button><div className="status">{(log.waterMl / 1000).toFixed(2)} / 2.0 L</div></div>
      <div><div className="ring">🚲</div><button type="button" className="ghost small" onClick={() => onChange({ exerciseMinutes: log.exerciseMinutes + 30 })}>+ 30 min</button><div className="status">{log.exerciseMinutes} min</div></div>
      <div><div className="ring">😴</div><button type="button" className="ghost small" onClick={() => onChange({ sleepHours: Math.round((log.sleepHours + 0.5) * 10) / 10 })}>+ 0.5 h</button><div className="status">{log.sleepHours} h</div></div>
    </div>
  );
}
