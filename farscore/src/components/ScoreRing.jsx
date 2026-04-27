import { useEffect, useRef, useState } from 'react';

export default function ScoreRing({ score, tier, size = 220 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef(null);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetProgress = score / 1000;

  useEffect(() => {
    const duration = 2000;
    const start = performance.now();
    let frame;

    function animate(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4); // easeOutQuart

      setAnimatedScore(Math.round(score * ease));
      setProgress(targetProgress * ease);

      if (t < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score, targetProgress]);

  const strokeDashoffset = circumference * (1 - progress);
  const tierClass = `tier-${tier.key}`;

  return (
    <div className={`relative inline-flex items-center justify-center ${tierClass}`} style={{ width: size, height: size }}>
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-30"
        style={{ background: `var(--tier-color)` }}
      />

      {/* Outer pulse ring */}
      <div
        className="absolute inset-[-8px] rounded-full animate-pulse-ring"
        style={{ border: `1px solid var(--tier-color)` }}
      />

      {/* SVG Ring */}
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--tier-color)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'var(--tier-color)', stopOpacity: 0.4 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="6"
        />

        {/* Score ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          filter="url(#glow)"
          style={{ transition: 'stroke-dashoffset 0.1s ease' }}
        />

        {/* Dot at end of arc */}
        {progress > 0.01 && (
          <circle
            cx={size / 2 + radius * Math.cos(2 * Math.PI * progress - Math.PI / 2)}
            cy={size / 2 + radius * Math.sin(2 * Math.PI * progress - Math.PI / 2)}
            r="4"
            fill="var(--tier-color)"
            filter="url(#glow)"
          />
        )}
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--tier-color)', fontFamily: 'var(--font-mono)' }}>
          Score
        </span>
        <span className="text-5xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--tier-color)' }}>
          {animatedScore}
        </span>
        <span className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>
          / 1000
        </span>
      </div>
    </div>
  );
}
