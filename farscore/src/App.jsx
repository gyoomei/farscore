import { useEffect, useState, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { fetchAllUserData, getUserByFid } from './lib/neynar';
import { calculateScore, getPercentile } from './lib/scoring';
import ScoreRing from './components/ScoreRing';
import TierBadge from './components/TierBadge';
import BreakdownCard from './components/BreakdownCard';
import StatsGrid from './components/StatsGrid';
import TierList from './components/TierList';
import ShareButton from './components/ShareButton';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  const [state, setState] = useState('loading'); // loading | ready | error
  const [user, setUser] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState('Initializing...');
  const [activeTab, setActiveTab] = useState('score');
  const [lookupFid, setLookupFid] = useState('');
  const [lookingUp, setLookingUp] = useState(false);

  const loadScore = useCallback(async (fid) => {
    try {
      setLoadingMsg('Fetching your Farcaster data...');
      const data = await fetchAllUserData(fid);

      if (!data.user) {
        setState('error');
        return;
      }

      setUser(data.user);
      setLoadingMsg('Calculating your score...');

      // Small delay for effect
      await new Promise((r) => setTimeout(r, 600));

      const score = calculateScore(data);
      setScoreData(score);
      setState('ready');
    } catch (err) {
      console.error('Failed to load score:', err);
      setState('error');
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        // Try to get context from Farcaster SDK
        if (sdk?.context?.user?.fid) {
          await sdk.actions.ready();
          window.farcasterSdk = sdk;
          await loadScore(sdk.context.user.fid);
        } else {
          // Wait a moment, then check if SDK is loaded
          await new Promise((r) => setTimeout(r, 500));
          if (sdk?.context?.user?.fid) {
            await sdk.actions.ready();
            window.farcasterSdk = sdk;
            await loadScore(sdk.context.user.fid);
          } else {
            // Demo mode: show FID input
            setState('demo');
          }
        }
      } catch (err) {
        console.error('SDK init error:', err);
        setState('demo');
      }
    }
    init();
  }, [loadScore]);

  const handleDemoLookup = async () => {
    const fid = parseInt(lookupFid.trim());
    if (!fid || isNaN(fid)) return;
    setLookingUp(true);
    setState('loading');
    await loadScore(fid);
    setLookingUp(false);
  };

  // DEMO MODE: FID entry
  if (state === 'demo') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--color-bg)' }}>
        {/* Background glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-10" style={{ background: 'var(--color-accent)', filter: 'blur(80px)' }} />
        </div>

        <div className="relative z-10 w-full max-w-sm text-center">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>FarScore</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--color-text-dim)' }}>
            Discover your Farcaster reputation score
          </p>

          <div className="space-y-3">
            <input
              type="text"
              value={lookupFid}
              onChange={(e) => setLookupFid(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDemoLookup()}
              placeholder="Enter your FID (e.g. 3)"
              className="w-full px-4 py-3.5 rounded-2xl text-sm text-center outline-none transition-all focus:ring-2"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-mono)',
                '--tw-ring-color': 'var(--color-accent)',
              }}
            />
            <button
              onClick={handleDemoLookup}
              disabled={!lookupFid.trim() || lookingUp}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent), #5b21b6)',
                color: '#fff',
                boxShadow: '0 0 20px var(--color-accent-glow)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {lookingUp ? 'Loading...' : '🔍 Check Score'}
            </button>
          </div>

          <p className="text-xs mt-6" style={{ color: 'var(--color-text-dim)' }}>
            Open inside Farcaster for auto-detection
          </p>
        </div>
      </div>
    );
  }

  // LOADING
  if (state === 'loading') {
    return <LoadingScreen message={loadingMsg} />;
  }

  // ERROR
  if (state === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-xl font-bold mb-2">Couldn't load data</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-dim)' }}>
          User not found or API unavailable
        </p>
        <button
          onClick={() => { setState('demo'); setLookupFid(''); }}
          className="px-6 py-3 rounded-2xl text-sm font-semibold"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', cursor: 'pointer' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // MAIN SCORE VIEW
  if (!scoreData || !user) return null;

  const percentile = getPercentile(scoreData.total);
  const breakdownItems = Object.values(scoreData.breakdown);

  return (
    <div className="min-h-screen pb-8" style={{ background: 'var(--color-bg)' }}>
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]" style={{ background: 'var(--color-accent)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-[0.05]" style={{ background: '#f472b6', filter: 'blur(100px)' }} />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4">
        {/* Header */}
        <div className="pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className="text-sm font-bold tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>FarScore</span>
          </div>
          <button
            onClick={() => { setState('demo'); setLookupFid(''); }}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-dim)', cursor: 'pointer' }}
          >
            🔍 Lookup
          </button>
        </div>

        {/* Profile section */}
        <div className="text-center pt-2 pb-6">
          {user.pfp_url && (
            <div className="relative inline-block mb-3">
              <img
                src={user.pfp_url}
                alt={user.display_name || user.username}
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: '2px solid var(--color-border)' }}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                style={{ background: 'var(--color-accent)', boxShadow: '0 0 8px var(--color-accent-glow)' }}>
                ✓
              </div>
            </div>
          )}
          <h2 className="text-lg font-bold">{user.display_name || user.username}</h2>
          <p className="text-xs" style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)' }}>
            @{user.username} · FID #{user.fid}
          </p>
        </div>

        {/* Score Ring */}
        <div className="flex flex-col items-center mb-6">
          <ScoreRing score={scoreData.total} tier={scoreData.tier} />
          <div className="mt-4">
            <TierBadge tier={scoreData.tier} className="text-center" />
          </div>
          <div className="mt-3 px-4 py-1.5 rounded-full text-xs" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-dim)' }}>Top </span>
            <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
              {100 - percentile}%
            </span>
            <span style={{ color: 'var(--color-text-dim)' }}> of Farcaster users</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'var(--color-surface)' }}>
          {[
            { key: 'score', label: 'Breakdown' },
            { key: 'stats', label: 'Stats' },
            { key: 'tiers', label: 'Tiers' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: activeTab === key ? 'var(--color-accent)' : 'transparent',
                color: activeTab === key ? '#fff' : 'var(--color-text-dim)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-3 mb-6">
          {activeTab === 'score' && (
            <div className="space-y-2">
              {breakdownItems.map((item, i) => (
                <BreakdownCard key={item.label} item={item} delay={i * 100} />
              ))}
            </div>
          )}

          {activeTab === 'stats' && <StatsGrid stats={scoreData.stats} />}

          {activeTab === 'tiers' && <TierList currentTier={scoreData.tier} />}
        </div>

        {/* Share */}
        <ShareButton score={scoreData.total} tier={scoreData.tier} username={user.username} />

        {/* Footer */}
        <p className="text-center text-[10px] mt-6 pb-4" style={{ color: 'var(--color-text-dim)' }}>
          Powered by Neynar API · Built on Farcaster
        </p>
      </div>
    </div>
  );
}
