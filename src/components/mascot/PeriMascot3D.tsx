import { useState } from 'react';
import { PERI_EXPRESSIONS, selectExpression, type ExpressionContext } from '../../lib/periExpressions';

/**
 * Plush day Peri / jelly-cloud Peri, phase- and symptom-reactive.
 * Shows one of the 12 Jelly Cloud expressions, selected from today's
 * symptoms, mood, flow, sleep, streak, and phase, with the full set
 * visible as a gallery strip underneath so every state is discoverable.
 * Tap / pet triggers a bounce and a short haptic pulse.
 */
export default function PeriMascot3D({ style, speech, context }: {
  style: 'plush' | 'jelly';
  speech: string;
  context: ExpressionContext;
}) {
  const [bouncing, setBouncing] = useState(false);
  const [petCount, setPetCount] = useState(0);
  const expression = selectExpression(context);
  const pet = () => {
    setBouncing(true);
    setPetCount((n) => n + 1);
    try { navigator.vibrate?.(15); } catch { /* no haptics */ }
    setTimeout(() => setBouncing(false), 400);
  };
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="bubble">{speech}</div>
      <button
        type="button"
        aria-label={`Peri mascot, currently ${expression.label}, tap to pet`}
        onClick={pet}
        className="mascot"
        style={{
          transform: bouncing ? 'scale(1.12)' : undefined,
          background: style === 'jelly'
            ? 'radial-gradient(circle at 35% 30%, rgba(255,255,255,.9), rgba(196,181,253,.7) 60%, rgba(139,92,246,.5))'
            : undefined,
          backdropFilter: style === 'jelly' ? 'blur(12px)' : undefined,
        }}
      >
        {expression.face}
      </button>
      <p className="status">Peri is feeling: <b>{expression.label}</b>{petCount > 0 ? ` · Pets today: ${petCount}` : ''}</p>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 0' }} aria-label="All 12 Peri expressions">
        {PERI_EXPRESSIONS.map((e) => (
          <span key={e.id} title={`${e.label}: ${e.trigger}`} style={{
            flex: '0 0 auto', fontSize: 22, padding: 6, borderRadius: 12,
            background: e.id === expression.id ? '#EDE9FE' : '#fff',
            border: e.id === expression.id ? '2px solid #8B5CF6' : '1px solid #eee',
          }}>{e.face}</span>
        ))}
      </div>
      <p className="status">All 12 expressions, current one highlighted. Log a symptom, mood, or 8+ hours sleep to change Peri's mood.</p>
    </div>
  );
}
