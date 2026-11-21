import { getSupabase } from './supabaseClient';

export type UserProfile = {
  displayName: string;
  title: string;
  level: number;
  totalXp: number;
};

export type ProfileStat = {
  key: string;
  level: number;
  xp: number;
  maxXp: number;
  evolves: boolean;
};

export type ProfileData = {
  profile: UserProfile;
  stats: ProfileStat[];
};

export async function loadProfile(): Promise<ProfileData> {
  const [profileResult, statsResult] = await Promise.all([
    getSupabase()
      .from('user_profiles')
      .select('display_name, title, level, total_xp')
      .maybeSingle(),
    getSupabase()
      .from('user_profile_stats')
      .select('stat_key, level, xp, max_xp, evolves')
      .order('stat_key'),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (statsResult.error) throw statsResult.error;
  if (!profileResult.data) {
    throw new Error('Profiilia ei löytynyt. Tarkista Supabasen käyttäjäprofiilin luontitriggeri.');
  }

  return {
    profile: {
      displayName: profileResult.data.display_name,
      title: profileResult.data.title,
      level: profileResult.data.level,
      totalXp: profileResult.data.total_xp,
    },
    stats: statsResult.data.map((row) => ({
      key: row.stat_key,
      level: row.level,
      xp: row.xp,
      maxXp: row.max_xp,
      evolves: row.evolves,
    })),
  };
}
