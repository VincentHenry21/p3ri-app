import { useState } from 'react';

/**
 * Custom multi-layer 3D SVG Peri, no system emojis.
 * viewBox 0 0 160 145, radial 3D shading, specular highlights, stubby
 * arms and feet, rosy cheeks, glossy blinking eyes (blinkEye, Y 1 to 0.08
 * every 4s), gentle floatPlush idle motion, spring squish-bounce on tap.
 * Plush: violet by default, luteal orange when phase is luteal.
 * Jelly: translucent dark-violet cloud with neon pink/blue glowing core.
 */
export default function PeriSvg({ style, phase, small }: {
  style: 'plush' | 'jelly';
  phase?: string;
  small?: boolean;
}) {
  const [squish, setSquish] = useState(false);
  const tap = () => {
    setSquish(true);
    try { navigator.vibrate?.(15); } catch { /* no haptics */ }
    setTimeout(() => setSquish(false), 450);
  };
  const luteal = phase === 'luteal';
  const body1 = luteal ? '#FED7AA' : '#DDD6FE';
  const body2 = luteal ? '#EA580C' : '#7C3AED';
  const uid = small ? 's' : 'm';
  return (
    <button
      type="button" aria-label="Peri mascot, tap to pet" onClick={tap}
      className={`peri-svg-btn${squish ? ' squish' : ''}`}
      style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
    >
      <svg viewBox="0 0 160 145" className="peri-svg" role="img" aria-label="Peri mascot" style={{ overflow: 'visible', display: 'block', width: '100%', height: 'auto' }}>
        <defs>
          <radialGradient id={`peri-body-${uid}`} cx="35%" cy="28%" r="85%">
            <stop offset="0%" stopColor={style === 'jelly' ? '#4C1D95' : body1} />
            <stop offset="55%" stopColor={style === 'jelly' ? '#2E1065' : body2} />
            <stop offset="100%" stopColor={style === 'jelly' ? '#1E0A4A' : body2} />
          </radialGradient>
          <radialGradient id={`peri-core-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#38BDF8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
          <filter id={`peri-glow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {style === 'jelly' && <circle cx="80" cy="72" r="42" fill={`url(#peri-core-${uid})`} filter={`url(#peri-glow-${uid})`} />}
        {/* stubby feet */}
        <ellipse cx="52" cy="132" rx="18" ry="9" fill={style === 'jelly' ? '#2E1065' : body2} opacity="0.9" />
        <ellipse cx="108" cy="132" rx="18" ry="9" fill={style === 'jelly' ? '#2E1065' : body2} opacity="0.9" />
        {/* pear-shaped body */}
        <path d="M80 12 C52 12 34 38 34 72 C34 108 54 134 80 134 C106 134 126 108 126 72 C126 38 108 12 80 12 Z" fill={`url(#peri-body-${uid})`} opacity={style === 'jelly' ? 0.92 : 1} />
        {/* stubby arms */}
        <ellipse cx="30" cy="84" rx="14" ry="9" fill={style === 'jelly' ? '#2E1065' : body2} transform="rotate(-24 30 84)" />
        <ellipse cx="130" cy="84" rx="14" ry="9" fill={style === 'jelly' ? '#2E1065' : body2} transform="rotate(24 130 84)" />
        {/* specular highlight */}
        <ellipse cx="58" cy="38" rx="20" ry="12" fill="#fff" opacity="0.45" transform="rotate(-24 58 38)" />
        <ellipse cx="52" cy="32" rx="8" ry="5" fill="#fff" opacity="0.7" transform="rotate(-24 52 32)" />
        {/* eyes, blinking via CSS transform-origin */}
        <g className="peri-eyes">
          <ellipse cx="60" cy="68" rx="9" ry="11" fill="#fff" />
          <ellipse cx="100" cy="68" rx="9" ry="11" fill="#fff" />
          <circle cx="62" cy="70" r="5" fill="#172554" />
          <circle cx="102" cy="70" r="5" fill="#172554" />
          <circle cx="64" cy="67" r="1.8" fill="#fff" />
          <circle cx="104" cy="67" r="1.8" fill="#fff" />
        </g>
        {/* rosy cheeks */}
        <ellipse cx="44" cy="88" rx="9" ry="6" fill="#FF8FA3" opacity="0.75" />
        <ellipse cx="116" cy="88" rx="9" ry="6" fill="#FF8FA3" opacity="0.75" />
        {/* smile */}
        <path d="M72 92 Q80 100 88 92" fill="none" stroke="#312E81" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </button>
  );
}
