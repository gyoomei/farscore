import { useEffect, useState } from 'react';

export default function BreakdownCard({ item, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const percentage = (item.score / item.max) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    const duration = 1200;
    const start = performance.now();
    let frame;

    function animate(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(item.score * ease));
      if (t < 1) frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [visible, item.score]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 animate-shimmer pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{item.label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
              {animatedScore}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
              /{item.max}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: visible ? `${percentage}%` : '0%',
              background: `linear-gradient(90deg, var(--color-accent), rgba(124, 58, 237, 0.6))`,
              boxShadow: '0 0 8px var(--color-accent-glow)',
              transitionDelay: `${delay}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
