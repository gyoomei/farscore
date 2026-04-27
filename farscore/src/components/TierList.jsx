import { getTiers } from '../lib/scoring';

export default function TierList({ currentTier }) {
  const tiers = getTiers();

  return (
    <div className="space-y-2">
      {tiers.map((tier) => {
        const isCurrent = tier.key === currentTier.key;
        const tierClass = `tier-${tier.key}`;

        return (
          <div
            key={tier.key}
            className={`${tierClass} flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isCurrent ? 'scale-[1.02]' : 'opacity-50'
            }`}
            style={{
              background: isCurrent ? 'var(--tier-glow)' : 'var(--color-surface)',
              border: `1px solid ${isCurrent ? 'var(--tier-color)' : 'var(--color-border)'}`,
              boxShadow: isCurrent ? '0 0 20px var(--tier-glow)' : 'none',
            }}
          >
            <span className="text-xl w-8 text-center">{tier.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm" style={{ color: isCurrent ? 'var(--tier-color)' : 'var(--color-text-dim)' }}>
                  {tier.name}
                </span>
                <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-dim)' }}>
                  {tier.min}+
                </span>
              </div>
              <span className="text-[11px]" style={{ color: 'var(--color-text-dim)' }}>
                {tier.description}
              </span>
            </div>
            {isCurrent && (
              <div
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'var(--tier-color)', color: '#000' }}
              >
                You
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
