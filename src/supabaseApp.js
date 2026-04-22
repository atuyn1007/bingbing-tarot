import { supabase } from './supabaseClient';
import { getDisplaySignInDate, getLocalDateKey } from './dateUtils.js';

export const OFFICIAL_READER_NICKNAME = '饼饼大人';

function normalizeNickname(nickname) {
  return String(nickname || '').trim();
}

export { getDisplaySignInDate, getLocalDateKey } from './dateUtils.js';

export async function getAuthSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  return session;
}

export async function refreshAuthSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession();

  if (error) throw error;
  return session;
}

export async function getAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}

export async function registerWithEmail(email, nickname, password) {
  const normalizedNickname = normalizeNickname(nickname);
  const normalizedEmail = String(email || '').trim().toLowerCase();

  const existingProfile = await getProfileByNickname(normalizedNickname);
  if (existingProfile) {
    throw new Error('该昵称已经被注册。');
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
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

  if (data.session) {
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
  }

  return {
    ...data,
    needsEmailVerification: !data.session,
  };
}

export async function loginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email || '').trim().toLowerCase(),
    password,
  });

  if (error) throw error;
  return data;
}

export async function requestPasswordReset(email, redirectTo) {
  const normalizedRedirect = redirectTo
    ? `${String(redirectTo).replace(/\/$/, '')}/?mode=recovery`
    : undefined;

  const { data, error } = await supabase.auth.resetPasswordForEmail(String(email || '').trim().toLowerCase(), {
    redirectTo: normalizedRedirect,
  });

  if (error) throw error;
  return data;
}

export async function updatePassword(nextPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: nextPassword,
  });

  if (error) throw error;
  return data;
}

export async function logoutFromSupabase() {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
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
