import { useMemo } from 'react';

const SPARKLE_PATH = (s) => {
  const h = s / 2, t = s * 0.18;
  return `M${h} 0 L${h+t} ${h-t} L${s} ${h} L${h+t} ${h+t} L${h} ${s} L${h-t} ${h+t} L0 ${h} L${h-t} ${h-t} Z`;
};

function SparkSVG({ size, color, opacity }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <path d={SPARKLE_PATH(size)} fill={color} fillOpacity={opacity} />
    </svg>
  );
}

// Deterministic pseudo-random to avoid hydration mismatches
function seeded(i, offset = 0) {
  return ((Math.sin(i * 9301 + offset * 49297 + 233) * 0.5 + 0.5));
}

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id:       i,
  left:     `${4 + seeded(i, 1) * 88}%`,
  top:      `${3 + seeded(i, 2) * 88}%`,
  size:     Math.round(5 + seeded(i, 3) * 12),
  duration: `${9 + seeded(i, 4) * 14}s`,
  delay:    `-${seeded(i, 5) * 18}s`,
  opacity:  0.05 + seeded(i, 6) * 0.18,
  color:    i % 5 === 0 ? '#F0B4EF' : '#DA6FD8',
}));

export default function ParticleField() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }}>
      {PARTICLES.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top:  p.top,
            animation: `floatParticle ${p.duration} ${p.delay} infinite ease-in-out`,
            willChange: 'transform',
          }}
        >
          <SparkSVG size={p.size} color={p.color} opacity={p.opacity} />
        </div>
      ))}
    </div>
  );
}
