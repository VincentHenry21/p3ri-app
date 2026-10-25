import { useRef } from 'react';

/**
 * 180-degree SVG semi-circular cycle arc with a glowing progress node.
 * Scrubbable: drag or tap along the arc to preview another cycle day.
 * The arc runs from day 1 (left) to the last cycle day (right) over the top.
 */
export default function CycleArcGauge({ day, cycleLength, color, onScrub }: {
  day: number;
  cycleLength: number;
  color: string;
  onScrub?: (day: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const frac = Math.min(1, day / cycleLength);
  const arcLen = 408;
  const ang = Math.PI * (1 - frac);
  const cx = 150 - 130 * Math.cos(ang);
  const cy = 110 - 130 * Math.sin(ang);

  const scrub = (e: React.PointerEvent) => {
    if (!onScrub || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    // Convert client coordinates into the 300x120 viewBox space.
    const x = ((e.clientX - rect.left) / rect.width) * 300;
    const y = ((e.clientY - rect.top) / rect.height) * 120;
    const dx = x - 150;
    const dy = y - 110;
    // Arc point: dx = -130*cos(a), dy = -130*sin(a), a in [0, pi].
    const a = Math.atan2(-dy, -dx);
    if (a < 0 || a > Math.PI) return;
    const f = 1 - a / Math.PI;
    const previewDay = Math.min(cycleLength, Math.max(1, Math.round(f * cycleLength)));
    onScrub(previewDay);
  };

  return (
    <svg
      ref={svgRef}
      className="arc"
      viewBox="0 0 300 120"
      aria-label={`Cycle progress, day ${day} of ${cycleLength}. Drag along the arc to preview another day.`}
      style={{ cursor: onScrub ? 'pointer' : undefined, touchAction: 'none' }}
      onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); scrub(e); }}
      onPointerMove={(e) => { if (e.buttons > 0) scrub(e); }}
    >
      <path d="M 20 110 A 130 130 0 0 1 280 110" fill="none" stroke="#EDE9FE" strokeWidth="14" strokeLinecap="round" />
      <path d="M 20 110 A 130 130 0 0 1 280 110" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeDasharray={arcLen} strokeDashoffset={arcLen * (1 - frac)} />
      <circle cx={cx.toFixed(1)} cy={cy.toFixed(1)} r="10" fill={color} />
    </svg>
  );
}
