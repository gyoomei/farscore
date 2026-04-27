function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

const statItems = [
  { key: 'followerCount', label: 'Followers', icon: '👥' },
  { key: 'followingCount', label: 'Following', icon: '👤' },
  { key: 'castCount', label: 'Casts', icon: '📢' },
  { key: 'totalLikes', label: 'Likes Received', icon: '❤️' },
  { key: 'mutualFollows', label: 'Mutuals', icon: '🤝' },
  { key: 'channelCount', label: 'Channels', icon: '📡' },
];

export default function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {statItems.map(({ key, label, icon }) => (
        <div
          key={key}
          className="flex flex-col items-center p-3 rounded-xl"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <span className="text-base mb-1">{icon}</span>
          <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
            {formatNumber(stats[key] || 0)}
          </span>
          <span className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
