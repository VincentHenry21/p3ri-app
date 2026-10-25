import { useState } from 'react';
import { askPeri } from '../../lib/askPeri';
import type { Phase } from '../../lib/cycleEngine';

const PILLS = ['Why am I cramping today?', 'Cycle-sync my workout', 'Best foods for luteal phase', 'Prepare my doctor summary'];

interface Msg { role: 'me' | 'peri'; text: string; source?: string }

export default function AskPeriCoach({ phase, cycleDay, onOpenHealth }: { phase: Phase; cycleDay: number; onOpenHealth: () => void }) {
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
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56 }}>🌸</div>
        <b>Hello, how can I help you?</b>
        <p className="status">Your little buddy for a healthier, happier cycle</p>
        <button type="button" className="ghost" onClick={onOpenHealth}>Prepare my doctor summary</button>
      </div>
      <div>
        {PILLS.map((p) => (
          <button type="button" key={p} className="chip" onClick={() => send(p)}>{p}</button>
        ))}
      </div>
      <div className="card">
        <div>
          {messages.map((m, i) => (
            <div key={i} className={`msg${m.role === 'me' ? ' me' : ''}`}>
              {m.text}
              {m.source && m.role === 'peri' && <div className="status">via {m.source === 'gemini' ? 'Gemini API key on this device' : 'rule-based coach'}</div>}
            </div>
          ))}
          {busy && <div className="msg">Peri is thinking…</div>}
        </div>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about your cycle or symptoms..." onKeyDown={(e) => { if (e.key === 'Enter') send(input); }} />
        <button type="button" onClick={() => send(input)}>Send</button>
        <p className="status">Rule-based answers by default. If you add a Gemini API key in Settings, Peri tries that first and falls back to rule-based answers on any error.</p>
      </div>
    </div>
  );
}
