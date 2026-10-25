import type { DailyLog } from '../../lib/store';
import { FLOW_LABELS } from '../../lib/store';

/**
 * 4 clean soft-shadow white circular quick-log buttons, 64x64, each
 * wrapped in an inline SVG progress ring (track #F1F5F9). Below each
 * circle only a tiny + and a muted gray metric subtitle. No emojis,
 * no purple borders, no blocky pills. The circle itself is the tap target.
 */
const R = 26;
const CIRC = 2 * Math.PI * R;

function RingButton({ frac, color, onClick, label, icon }: {
  frac: number; color: string; onClick: () => void; label: string; icon: React.ReactNode;
}) {
  const f = Math.max(0, Math.min(1, frac));
  return (
    <button type="button" className="quick-ring-btn" onClick={onClick} aria-label={label}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={R} fill="none" stroke="#F1F5F9" strokeWidth="6" />
        <circle cx="32" cy="32" r={R} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - f)}
          transform="rotate(-90 32 32)" style={{ overflow: 'visible' }} />
      </svg>
      <span className="quick-icon">{icon}</span>
    </button>
  );
}

const drop = <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#312E81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c3.5 4.5 6 7.5 6 11a6 6 0 1 1-12 0c0-3.5 2.5-6.5 6-11z" /></svg>;
const droplet = <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#312E81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z" /></svg>;
const bike = <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#312E81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17l4-9h4l2 5M10 8l2 4h6" /></svg>;
const moon = <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#312E81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" /></svg>;

export default function QuickActionDock({ log, onChange }: { log: DailyLog; onChange: (patch: Partial<DailyLog>) => void }) {
  const nextFlow = () => {
    const next = (log.flowLevel + 1) % FLOW_LABELS.length;
    onChange({ flowLevel: next, flow: FLOW_LABELS[next] });
  };
  return (
    <div className="dock">
      <div className="quick-item">
        <RingButton frac={log.flowLevel / 5} color="#8B5CF6" onClick={nextFlow} label="Log flow level" icon={drop} />
        <span className="quick-meta"><span className="quick-plus">+</span> {log.flow || 'Log Flow'}</span>
      </div>
      <div className="quick-item">
        <RingButton frac={log.waterMl / 2000} color="#38BDF8" onClick={() => onChange({ waterMl: log.waterMl + 250 })} label="Add 250 ml water" icon={droplet} />
        <span className="quick-meta"><span className="quick-plus">+</span> {(log.waterMl / 1000).toFixed(1)} / 2.0 L</span>
      </div>
      <div className="quick-item">
        <RingButton frac={log.exerciseMinutes / 60} color="#10B981" onClick={() => onChange({ exerciseMinutes: log.exerciseMinutes + 30 })} label="Add 30 minutes exercise" icon={bike} />
        <span className="quick-meta"><span className="quick-plus">+</span> {log.exerciseMinutes} / 60 min</span>
      </div>
      <div className="quick-item">
        <RingButton frac={log.sleepHours / 8} color="#FF2E93" onClick={() => onChange({ sleepHours: Math.round((log.sleepHours + 0.5) * 10) / 10 })} label="Add half an hour sleep" icon={moon} />
        <span className="quick-meta"><span className="quick-plus">+</span> {log.sleepHours} / 8 h</span>
      </div>
    </div>
  );
}
