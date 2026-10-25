import type { DailyLog } from '../../lib/store';
import { FLOW_LABELS } from '../../lib/store';

/**
 * Reference geometry: 4-column grid, 64x64 white circles with a soft
 * shadow, an outer SVG progress ring (track #F1F5F9, r28, width 3.5),
 * a dead-center 22x22 dark-navy icon, a standalone + button below the
 * circle, and a muted counter label below that. The four real log
 * actions are kept (flow, water, exercise, sleep); no invented
 * meals/steps data behind them.
 */
const R = 28;
const CIRC = 2 * Math.PI * R;

const navy = '#1E1B4B';
const flame = (
  <svg viewBox="0 0 24 24" width="22" height="22" fill={navy} aria-hidden="true">
    <path d="M12 2c1.2 3.5-1 5.5-2.5 8A5 5 0 0 0 12 20a5 5 0 0 0 2.5-9.5C13.8 12 13 12.5 12.5 11 12 8.5 11.5 5 12 2z" />
  </svg>
);
const droplet = (
  <svg viewBox="0 0 24 24" width="22" height="22" fill={navy} aria-hidden="true">
    <path d="M12 2c3.5 4.5 7 8 7 12.5a7 7 0 1 1-14 0C5 10 8.5 6.5 12 2z" />
  </svg>
);
const running = (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={navy} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="14" cy="4.5" r="2" />
    <path d="M11 8.5 13 13l-2.5 5M13 10l4-1.5M13 13l4.5 4" />
  </svg>
);
const moon = (
  <svg viewBox="0 0 24 24" width="22" height="22" fill={navy} aria-hidden="true">
    <path d="M20 13.5A8.5 8.5 0 1 1 10.5 4 7 7 0 0 0 20 13.5z" />
  </svg>
);

function QuickItem({ frac, color, onLog, label, icon, metric }: {
  frac: number; color: string; onLog: () => void; label: string; icon: React.ReactNode; metric: string;
}) {
  const f = Math.max(0, Math.min(1, frac));
  return (
    <div className="quick-item">
      <button type="button" className="quick-circle" onClick={onLog} aria-label={label}>
        <svg viewBox="0 0 64 64" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <circle cx="32" cy="32" r={R} fill="none" stroke="#F1F5F9" strokeWidth="3.5" />
          <circle cx="32" cy="32" r={R} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - f)} />
        </svg>
        <span className="quick-icon">{icon}</span>
      </button>
      <button type="button" className="quick-plus-btn" onClick={onLog} aria-label={`${label}, add one`}>+</button>
      <span className="quick-label">{metric}</span>
    </div>
  );
}

export default function QuickActionDock({ log, onChange }: { log: DailyLog; onChange: (patch: Partial<DailyLog>) => void }) {
  const nextFlow = () => {
    const next = (log.flowLevel + 1) % FLOW_LABELS.length;
    onChange({ flowLevel: next, flow: FLOW_LABELS[next] });
  };
  return (
    <div className="dock quick-dock">
      <QuickItem frac={log.flowLevel / 5} color="#FF2E93" onLog={nextFlow} label="Log flow level" icon={flame} metric={log.flow || 'Log flow'} />
      <QuickItem frac={log.waterMl / 2000} color="#38BDF8" onLog={() => onChange({ waterMl: log.waterMl + 250 })} label="Add 250 ml water" icon={droplet} metric={`${(log.waterMl / 1000).toFixed(1)} / 2.0 l`} />
      <QuickItem frac={log.exerciseMinutes / 60} color="#10B981" onLog={() => onChange({ exerciseMinutes: log.exerciseMinutes + 30 })} label="Add 30 minutes exercise" icon={running} metric={`${log.exerciseMinutes} / 60 min`} />
      <QuickItem frac={log.sleepHours / 8} color="#8B5CF6" onLog={() => onChange({ sleepHours: Math.round((log.sleepHours + 0.5) * 10) / 10 })} label="Add half an hour sleep" icon={moon} metric={`${log.sleepHours} / 8 h`} />
    </div>
  );
}
