export default function TierBadge({ tier, className = '' }) {
  const tierClass = `tier-${tier.key}`;

  return (
    <div className={`${tierClass} ${className}`}>
      <div
        className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full border"
        style={{
          background: 'var(--tier-glow)',
          borderColor: 'var(--tier-color)',
          boxShadow: '0 0 20px var(--tier-glow)',
        }}
      >
        <span className="text-xl">{tier.emoji}</span>
        <span
          className="font-bold text-sm tracking-wider uppercase"
          style={{ color: 'var(--tier-color)', fontFamily: 'var(--font-display)' }}
        >
          {tier.name}
        </span>
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--color-text-dim)' }}>
        {tier.description}
      </p>
    </div>
  );
}
