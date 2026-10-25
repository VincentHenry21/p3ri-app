import { useRef, useState } from 'react';

/**
 * Coach Peri swipe card: white card, colored dot + COACH PERI label,
 * body copy with a magenta "supercharge your program" highlight
 * (SVG bolt, never an emoji), and a full-width pill slider track.
 * Drag the purple thumb most of the way right and it opens the
 * Ask Peri chat; a plain tap on the thumb does nothing.
 */
function Bolt({ size = 13, color = '#EC4899' }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true" style={{ verticalAlign: 'middle' }}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
    </svg>
  );
}

export default function CoachSliderCard({ onChat }: { onChat: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [frac, setFrac] = useState(0);
  const dragging = useRef(false);

  const update = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 4;
    const usable = rect.width - pad * 2;
    const thumbW = usable * 0.45;
    const maxLeft = usable - thumbW;
    const x = Math.min(Math.max(clientX - rect.left - pad - thumbW / 2, 0), maxLeft);
    setFrac(maxLeft > 0 ? x / maxLeft : 0);
  };

  const end = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (frac >= 0.8) onChat();
    else setFrac(0);
  };

  return (
    <div className="coach-card">
      <div className="coach-head">
        <span className="coach-dot" aria-hidden="true" />
        <span className="coach-label">COACH PERI</span>
      </div>
      <p className="coach-body">
        Over the next 3 days, I'll gather your behavioral data to{' '}
        <strong style={{ color: '#C026D3' }}>supercharge your program <Bolt /></strong>{' '}
        and bring your goals within reach. Let's make it count!
      </p>
      <div
        ref={trackRef}
        className="coach-track"
        onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); update(e.clientX); }}
        onPointerMove={(e) => { if (dragging.current) update(e.clientX); }}
        onPointerUp={end}
        onPointerCancel={() => { dragging.current = false; setFrac(0); }}
        role="slider"
        aria-label="Swipe to chat with Peri"
        aria-valuenow={Math.round(frac * 100)}
      >
        <div className="coach-thumb" style={{ left: `calc(4px + ${frac * 55}%)` }}>
          <span aria-hidden="true">✓</span>
          <span aria-hidden="true">»</span>
        </div>
        <span className="coach-track-bolt" aria-hidden="true"><Bolt size={18} /></span>
      </div>
      <p className="status" style={{ textAlign: 'center', margin: '8px 0 0' }}>Swipe the purple pill right to chat with Peri</p>
    </div>
  );
}
