import { useState } from 'react';
import PeriSvg from '../mascot/PeriSvg';
import { askPeri } from '../../lib/askPeri';
import type { Phase } from '../../lib/cycleEngine';

const PILLS = [
  { q: 'Why am I cramping today?', badge: '#FEF3C7', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z" /></svg> },
  { q: 'Cycle-sync my workout', badge: '#DCFCE7', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></svg> },
  { q: 'Best foods for luteal phase', badge: '#FCE7F3', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21c-4-3-7-6-7-10a7 7 0 0 1 14 0c0 4-3 7-7 10z" /><path d="M12 21c0-6 1-9 4-12" /></svg> },
  { q: 'Prepare my doctor summary', badge: '#E0E7FF', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M12 8v6M9 11h6" /></svg> },
];

const MINI_CARDS = [
  { label: 'Exercise', tilt: '-12deg', icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#312E81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17l4-9h4l2 5M10 8l2 4h6" /></svg> },
  { label: 'Cycle Journal', tilt: '0deg', icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#312E81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a3 3 0 0 1 3-3h13v18H7a3 3 0 0 0-3 3z" /><path d="M4 20V5" /></svg> },
  { label: 'Nutrition', tilt: '12deg', icon: <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#312E81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21c-4-3-7-6-7-10a7 7 0 0 1 14 0c0 4-3 7-7 10z" /><path d="M12 21c0-6 1-9 4-12" /></svg> },
];

interface Msg { role: 'me' | 'peri'; text: string; source?: string }

export default function AskPeriCoach({ phase, cycleDay, mascotStyle = 'plush', logSummary = '', onOpenHealth }: {
  phase: Phase; cycleDay: number; mascotStyle?: 'plush' | 'jelly'; logSummary?: string; onOpenHealth: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    setMessages((m) => [...m, { role: 'me', text: question }]);
    setInput('');
    setBusy(true);
    const reply = await askPeri(question, phase, cycleDay);
    setMessages((m) => [...m, { role: 'peri', text: reply.text, source: reply.source }]);
    setBusy(false);
  };

  return (
    <div>
      <div className="ask-hero">
        <div className="ask-mini-cards">
          {MINI_CARDS.map((c) => (
            <div key={c.label} className="ask-mini" style={{ transform: `rotate(${c.tilt})` }}>
              {c.icon}<span>{c.label}</span>
            </div>
          ))}
        </div>
        <div className="ask-aura"><PeriSvg style={mascotStyle} phase={phase.key} small /></div>
        <h2 className="ask-title">Hello, how can<br />I help you?</h2>
        <p className="ask-sub">Your little buddy for better hormone balance and a happier you</p>
      </div>

      <div className="ask-pills">
        {PILLS.map((p) => (
          <button type="button" key={p.q} className="ask-pill" onClick={() => send(p.q)}>
            <span className="ask-badge" style={{ background: p.badge }}>{p.icon}</span>{p.q}
          </button>
        ))}
      </div>

      <div className="ask-messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg${m.role === 'me' ? ' me' : ''}`}>
            {m.text}
            {m.source && m.role === 'peri' && <div className="status">via {m.source === 'gemini' ? 'Gemini API key on this device' : 'rule-based coach'}</div>}
          </div>
        ))}
        {busy && <div className="msg">Peri is thinking…</div>}
      </div>

      <div className="composer">
        <input
          value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about your cycle or symptoms..."
          onKeyDown={(e) => { if (e.key === 'Enter') send(input); }} aria-label="Ask Peri"
        />
        <div className="composer-row">
          <div className="composer-actions">
            <button type="button" className="composer-action" aria-label="Attach today's log" title="Attach today's log"
              onClick={() => { if (logSummary) setInput((prev) => prev ? `${prev} ${logSummary}` : logSummary); }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#312E81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11l-9 9a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-7 7a2 2 0 0 1-3-3l8-8" /></svg>
            </button>
            <button type="button" className="composer-action" aria-label="Health summary" title="Health summary" onClick={onOpenHealth}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#312E81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M12 8v6M9 11h6" /></svg>
            </button>
          </div>
          <button type="button" className="composer-send" aria-label="Send" onClick={() => send(input)}>↑</button>
        </div>
      </div>
    </div>
  );
}
