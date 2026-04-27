import { useState } from 'react';

export default function ShareButton({ score, tier, username }) {
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    const text = `My FarScore is ${score}/1000 ${tier.emoji} — Tier: ${tier.name}\n\nCheck yours:`;

    // Try Farcaster SDK composeCast first
    if (window.farcasterSdk) {
      try {
        window.farcasterSdk.actions.composeCast({
          text: text,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch (e) {
        // fallback
      }
    }

    // Fallback: copy to clipboard
    navigator.clipboard?.writeText(text).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    });
  };

  return (
    <button
      onClick={handleShare}
      className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95"
      style={{
        background: shared
          ? 'linear-gradient(135deg, #34d399, #10b981)'
          : 'linear-gradient(135deg, var(--color-accent), #5b21b6)',
        color: '#fff',
        boxShadow: shared
          ? '0 0 20px rgba(52, 211, 153, 0.3)'
          : '0 0 20px var(--color-accent-glow)',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {shared ? '✓ Copied!' : '📣 Share Your Score'}
    </button>
  );
}
