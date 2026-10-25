import { useRef } from 'react';

/**
 * 180-degree SVG semi-circular cycle arc, viewBox 0 0 290 185, overflow
 * visible so the stroke and glow are never clipped on narrow screens.
 * Arc path M 28 158 A 117 117 0 0 1 262 158, stroke-width 10.
 * Scrubbable with mouse and touch: touch-action none on the knob/SVG so
 * swiping on a phone scrubs days instead of scrolling the page.
 * Day 1 is left, the last cycle day is right, over the top.
 */
export default function CycleArcGauge({ day, cycleLength, color, onScrub }: {
  day: number;
  cycleLength: number;
  color: string;
  onScrub?: (day: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const frac = Math.min(1, day / cycleLength);
  const arcLen = Math.PI * 117;
  const ang = Math.PI * (1 - frac);
  const cx = 145 + 117 * Math.cos(ang);
  const cy = 158 - 117 * Math.sin(ang);

  const scrub = (e: React.PointerEvent) => {
    if (!onScrub || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 290;
    const y = ((e.clientY - rect.top) / rect.height) * 185;
    const dx = x - 145;
    const dy = y - 158;
    const a = Math.atan2(-dy, dx);
    if (a < 0 || a > Math.PI) return;
    const f = 1 - a / Math.PI;
    const previewDay = Math.min(cycleLength, Math.max(1, Math.round(f * cycleLength)));
    onScrub(previewDay);
  };

  return (
    <svg
      ref={svgRef}
      className="arc"
      viewBox="0 0 290 185"
      aria-label={`Cycle progress, day ${day} of ${cycleLength}. Drag along the arc to preview another day.`}
      style={{ cursor: onScrub ? 'pointer' : undefined, touchAction: 'none', overflow: 'visible', display: 'block', width: '100%', height: 'auto' }}
      onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); scrub(e); }}
      onPointerMove={(e) => { if (e.buttons > 0) scrub(e); }}
    >
      <path d="M 28 158 A 117 117 0 0 1 262 158" fill="none" stroke="#EDE9FE" strokeWidth="10" strokeLinecap="round" />
      <path d="M 28 158 A 117 117 0 0 1 262 158" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={arcLen} strokeDashoffset={arcLen * (1 - frac)} />
      <circle cx={cx.toFixed(1)} cy={cy.toFixed(1)} r="11" fill={color} stroke="#fff" strokeWidth="3" style={{ touchAction: 'none' }} />
    </svg>
  );
}
