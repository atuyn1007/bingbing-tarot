import { supabase } from './supabaseClient';

export const OFFICIAL_READER_NICKNAME = '饼饼大人';

function normalizeNickname(nickname) {
  return String(nickname || '').trim();
}

export function nicknameToEmail(nickname) {
  const normalized = normalizeNickname(nickname);
  const encoded = Array.from(normalized)
    .map((char) => char.codePointAt(0).toString(16))
    .join('-');

  return `user-${encoded}@bingbing.local`;
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDisplaySignInDate(date = new Date()) {
  return date.toDateString();
}

export async function getAuthSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  return session;
}

export async function registerWithNickname(nickname, password) {
  const normalizedNickname = normalizeNickname(nickname);
  const email = nicknameToEmail(normalizedNickname);

  const existingProfile = await getProfileByNickname(normalizedNickname);
  if (existingProfile) {
    throw new Error('该昵称已经被注册。');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname: normalizedNickname,
      },
    },
  });

  if (error) throw error;

  const authUser = data.user;

  if (!authUser) {
    throw new Error('注册成功，但暂时没有拿到用户信息。');
  }

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: authUser.id,
      nickname: normalizedNickname,
    },
    {
      onConflict: 'id',
    },
  );

  if (profileError) throw profileError;

  return data;
}

export async function loginWithNickname(nickname, password) {
  const normalizedNickname = normalizeNickname(nickname);
  const email = nicknameToEmail(normalizedNickname);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function logoutFromSupabase() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function ensureProfile(user, fallbackNickname = '') {
  const nickname = normalizeNickname(user?.user_metadata?.nickname || fallbackNickname);
  const existing = await getProfileById(user.id);

  if (existing) {
    if (nickname && existing.nickname !== nickname) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ nickname })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    return existing;
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      nickname,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProfileById(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProfileByNickname(nickname) {
  const normalizedNickname = normalizeNickname(nickname);
  const { data, error } = await supabase.from('profiles').select('*').eq('nickname', normalizedNickname).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateCoinBalance(userId, coinBalance) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ coin_balance: coinBalance })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function signInDaily(profile) {
  const today = getDisplaySignInDate();
  const todayKey = getLocalDateKey();
  const currentHistory = profile.daily_history || {};

  if (profile.last_sign_in_date === today) {
    return {
      success: true,
      alreadySignedIn: true,
      lastSignInDate: today,
      todayCard: profile.today_card || null,
      dailyHistory: currentHistory,
      coinBalance: profile.coin_balance || 0,
    };
  }

  return null;
}

export async function updateDailyProfile(profileId, payload) {
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createRequest(payload) {
  const { data, error } = await supabase.from('requests').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function getRequestById(id) {
  const { data, error } = await supabase.from('requests').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function appendRequestMessage(requestId, message) {
  const request = await getRequestById(requestId);
  if (!request) throw new Error('请求不存在。');

  const nextMessages = [...(request.messages || []), message];
  const { data, error } = await supabase
    .from('requests')
    .update({ messages: nextMessages })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listRequestsByUser(userId) {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
