export default function LoadingScreen({ message = 'Analyzing your Farcaster presence...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--color-bg)' }}>
      {/* Orbital animation */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full animate-spin-slow" style={{ border: '1px dashed var(--color-border)' }} />
        <div className="absolute inset-4 rounded-full" style={{ border: '1px solid var(--color-accent)', opacity: 0.3 }}>
          <div className="animate-orbit absolute top-1/2 left-1/2" style={{ width: 0, height: 0 }}>
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)', boxShadow: '0 0 12px var(--color-accent-glow)' }} />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full animate-pulse" style={{ background: 'var(--color-accent)', opacity: 0.2 }} />
          <div className="absolute w-6 h-6 rounded-full" style={{ background: 'var(--color-accent)', boxShadow: '0 0 20px var(--color-accent-glow)' }} />
        </div>
      </div>

      {/* Text */}
      <p className="text-sm font-medium" style={{ color: 'var(--color-text-dim)' }}>{message}</p>

      {/* Progress dots */}
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              background: 'var(--color-accent)',
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
