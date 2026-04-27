/**
 * FarScore Scoring Engine
 *
 * Score breakdown (max 1000):
 * - Followers (max 250): logarithmic scale
 * - Engagement (max 200): likes, recasts on your casts
 * - Activity (max 150): cast frequency, replies
 * - Social (max 150): mutual follows, reply interactions
 * - Account Age (max 100): how old the account is
 * - Influence (max 150): popular casts, channel participation
 */

const TIERS = [
  { name: 'Legend', key: 'legend', min: 850, emoji: '👑', description: 'Top of the protocol', gradient: 'from-amber-400 via-yellow-300 to-orange-500' },
  { name: 'OG', key: 'og', min: 700, emoji: '💎', description: 'Early adopter & power user', gradient: 'from-pink-400 via-rose-400 to-fuchsia-500' },
  { name: 'Builder', key: 'builder', min: 550, emoji: '🔨', description: 'Active contributor', gradient: 'from-violet-500 via-purple-500 to-indigo-500' },
  { name: 'Rising Star', key: 'rising', min: 400, emoji: '⭐', description: 'Growing influence', gradient: 'from-emerald-400 via-green-400 to-teal-500' },
  { name: 'Explorer', key: 'explorer', min: 200, emoji: '🧭', description: 'Learning the ropes', gradient: 'from-blue-400 via-sky-400 to-cyan-500' },
  { name: 'Newcomer', key: 'newcomer', min: 0, emoji: '🌱', description: 'Just getting started', gradient: 'from-gray-400 via-slate-400 to-zinc-500' },
];

function logScale(value, max, cap) {
  if (value <= 0) return 0;
  return Math.min(max, (Math.log10(value + 1) / Math.log10(cap + 1)) * max);
}

function linearScale(value, max, cap) {
  return Math.min(max, (value / cap) * max);
}

export function calculateScore(data) {
  const { user, casts, followers, following, reactions, channels, popularCasts } = data;
  if (!user) return { total: 0, breakdown: {}, tier: TIERS[5] };

  // 1. Followers Score (max 250)
  const followerCount = user.follower_count || 0;
  const followingCount = user.following_count || 0;
  const followerScore = logScale(followerCount, 250, 50000);

  // 2. Engagement Score (max 200)
  let totalLikes = 0;
  let totalRecasts = 0;
  let totalReplies = 0;
  casts.forEach((cast) => {
    totalLikes += cast.reactions?.likes_count || 0;
    totalRecasts += cast.reactions?.recasts_count || 0;
    totalReplies += cast.replies?.count || 0;
  });
  const avgLikes = casts.length > 0 ? totalLikes / casts.length : 0;
  const avgRecasts = casts.length > 0 ? totalRecasts / casts.length : 0;
  const engagementScore =
    logScale(avgLikes, 100, 50) +
    logScale(avgRecasts, 50, 20) +
    logScale(totalReplies, 50, 200);

  // 3. Activity Score (max 150)
  const castCount = casts.length;
  const replyCasts = casts.filter((c) => c.parent_hash).length;
  const activityScore =
    linearScale(castCount, 75, 50) +
    linearScale(replyCasts, 75, 25);

  // 4. Social Score (max 150)
  const followersList = followers?.users || [];
  const followingList = following?.users || [];
  const followingFids = new Set(followingList.map((u) => u.fid));
  const mutualFollows = followersList.filter((u) => followingFids.has(u.fid)).length;
  const socialScore =
    logScale(mutualFollows, 100, 200) +
    linearScale(replyCasts, 50, 20);

  // 5. Account Age Score (max 100)
  const createdAt = user.active_status === 'active' ? new Date(user.timestamp || user.registered_at || '2022-01-01') : new Date('2024-01-01');
  const now = new Date();
  const accountAgeDays = Math.max(0, (now - createdAt) / (1000 * 60 * 60 * 24));
  const ageScore = linearScale(accountAgeDays, 100, 730); // 2 years = max

  // 6. Influence Score (max 150)
  const channelCount = channels?.length || 0;
  const popularCount = popularCasts?.length || 0;
  const followerRatio = followingCount > 0 ? followerCount / followingCount : 0;
  const influenceScore =
    linearScale(channelCount, 50, 20) +
    linearScale(popularCount, 50, 10) +
    logScale(followerRatio, 50, 10);

  const total = Math.round(
    followerScore + engagementScore + activityScore + socialScore + ageScore + influenceScore
  );

  const tier = TIERS.find((t) => total >= t.min) || TIERS[TIERS.length - 1];

  return {
    total: Math.min(1000, total),
    breakdown: {
      followers: { score: Math.round(followerScore), max: 250, label: 'Followers', icon: '👥', raw: followerCount },
      engagement: { score: Math.round(engagementScore), max: 200, label: 'Engagement', icon: '❤️', raw: totalLikes },
      activity: { score: Math.round(activityScore), max: 150, label: 'Activity', icon: '📝', raw: castCount },
      social: { score: Math.round(socialScore), max: 150, label: 'Social', icon: '🤝', raw: mutualFollows },
      age: { score: Math.round(ageScore), max: 100, label: 'Account Age', icon: '⏳', raw: Math.round(accountAgeDays) },
      influence: { score: Math.round(influenceScore), max: 150, label: 'Influence', icon: '🏆', raw: channelCount },
    },
    tier,
    stats: {
      followerCount,
      followingCount,
      castCount,
      totalLikes,
      totalRecasts,
      totalReplies,
      mutualFollows,
      channelCount,
      accountAgeDays: Math.round(accountAgeDays),
    },
  };
}

export function getTiers() {
  return TIERS;
}

export function getPercentile(score) {
  // Approximate percentile based on typical distribution
  if (score >= 850) return 99;
  if (score >= 700) return 95;
  if (score >= 550) return 85;
  if (score >= 400) return 70;
  if (score >= 200) return 40;
  return 15;
}
