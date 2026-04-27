const NEYNAR_API_KEY = 'NEYNAR_FROG_FM'; // Free public demo key
const BASE_URL = 'https://api.neynar.com/v2/farcaster';

const headers = {
  accept: 'application/json',
  'x-api-key': NEYNAR_API_KEY,
};

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Neynar API error: ${res.status}`);
  return res.json();
}

export async function getUserByFid(fid) {
  const data = await fetchJson(`${BASE_URL}/user/bulk?fids=${fid}`);
  return data.users?.[0] || null;
}

export async function getUserCasts(fid, limit = 25) {
  const data = await fetchJson(`${BASE_URL}/feed/user/casts?fid=${fid}&limit=${limit}&include_replies=true`);
  return data.casts || [];
}

export async function getUserFollowers(fid, limit = 100) {
  const data = await fetchJson(`${BASE_URL}/followers?fid=${fid}&limit=${limit}`);
  return data;
}

export async function getUserFollowing(fid, limit = 100) {
  const data = await fetchJson(`${BASE_URL}/following?fid=${fid}&limit=${limit}`);
  return data;
}

export async function getUserReactions(fid, type = 'likes', limit = 25) {
  const data = await fetchJson(`${BASE_URL}/reactions/user?fid=${fid}&type=${type}&limit=${limit}`);
  return data;
}

export async function getUserChannels(fid) {
  const data = await fetchJson(`${BASE_URL}/user/channels?fid=${fid}&limit=50`);
  return data.channels || [];
}

export async function getPopularCasts(fid) {
  try {
    const data = await fetchJson(`${BASE_URL}/feed/user/popular?fid=${fid}`);
    return data.casts || [];
  } catch {
    return [];
  }
}

export async function fetchAllUserData(fid) {
  const [user, casts, followers, following, reactions, channels, popularCasts] =
    await Promise.allSettled([
      getUserByFid(fid),
      getUserCasts(fid, 50),
      getUserFollowers(fid, 100),
      getUserFollowing(fid, 100),
      getUserReactions(fid, 'likes', 50),
      getUserChannels(fid),
      getPopularCasts(fid),
    ]);

  return {
    user: user.status === 'fulfilled' ? user.value : null,
    casts: casts.status === 'fulfilled' ? casts.value : [],
    followers: followers.status === 'fulfilled' ? followers.value : { users: [] },
    following: following.status === 'fulfilled' ? following.value : { users: [] },
    reactions: reactions.status === 'fulfilled' ? reactions.value : { reactions: [] },
    channels: channels.status === 'fulfilled' ? channels.value : [],
    popularCasts: popularCasts.status === 'fulfilled' ? popularCasts.value : [],
  };
}
