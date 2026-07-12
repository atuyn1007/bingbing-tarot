import { supabase } from './supabaseClient';
import { getDisplaySignInDate, getLocalDateKey } from './dateUtils.js';
export const SYSTEM_REWARD_NOTIFICATION_TITLE = '测试补贴';
export const SYSTEM_REWARD_NOTIFICATION_BODY = '感谢您的注册与使用！因为你对饼饼的大力支持所以才有这个网站的今天~请查收随邮件附上的99饼币~ by爱你的饼饼';
export const SYSTEM_REWARD_CUTOFF = '2026-04-24T00:00:00+08:00';
export const OFFICIAL_READER_ID = '3fe35aa6-405d-4f6e-b7fe-2fb9b5aa66d8';

export const OFFICIAL_READER_NICKNAME = '饼饼大人';

const UNKNOWN_USER_LABEL = '未知用户';

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

async function changeCoinBalance(userId, delta) {
  if (!userId || !delta) return null;

  const profile = await getProfileById(userId);
  if (!profile) {
    throw new Error('未找到对应的用户资料。');
  }

  return updateCoinBalance(userId, (profile.coin_balance || 0) + delta);
}

export async function signInDaily(profile) {
  const today = getLocalDateKey();
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

export async function claimDailyTarot(todayCard, dateKey = getLocalDateKey()) {
  const { data, error } = await supabase
    .rpc('claim_daily_tarot', {
      p_today_card: todayCard,
      p_date_key: dateKey,
    })
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

export async function createPendingMailboxMessage({
  senderId,
  recordId,
  initialQuestion,
  recordSnapshot = null,
  receiverId = OFFICIAL_READER_ID,
  coinCost = 10,
}) {
  const normalizedQuestion = String(initialQuestion || '').trim();
  const normalizedRecordId = Number(recordId);

  if (!senderId) {
    throw new Error('请先登录后再联系饼饼。');
  }

  if (!Number.isFinite(normalizedRecordId) || normalizedRecordId <= 0) {
    throw new Error('请先从最近抽牌记录里选择一条有效牌阵。');
  }

  if (!normalizedQuestion) {
    throw new Error('请先确认你要发送给饼饼的问题。');
  }

  let profile = await getProfileById(senderId);
  if (!profile) {
    const authUser = await getAuthenticatedUser();
    if (authUser?.id === senderId) {
      profile = await ensureProfile(authUser, authUser?.user_metadata?.nickname || '');
    }
  }

  if (!profile) {
    throw new Error('未找到当前用户资料。');
  }

  const currentCoins = profile.coin_balance || 0;
  if (currentCoins < coinCost) {
    throw new Error('饼币不足，先签到拿饼币吧。');
  }

  const nextCoins = currentCoins - coinCost;
  let officialReaderCredited = false;
  const enrichedRecordSnapshot = {
    ...(recordSnapshot || {}),
    senderNickname: profile.nickname || normalizeNickname(profile.email) || UNKNOWN_USER_LABEL,
  };

  const { data: updatedProfile, error: deductError } = await supabase
    .from('profiles')
    .update({ coin_balance: nextCoins })
    .eq('id', senderId)
    .eq('coin_balance', currentCoins)
    .select('coin_balance')
    .single();

  if (deductError) {
    throw deductError;
  }

  try {
    const creditResult = await changeCoinBalance(receiverId, coinCost);
    officialReaderCredited = Boolean(creditResult);
  } catch (creditError) {
    if (receiverId === OFFICIAL_READER_ID) {
      console.warn('Failed to credit official reader balance, continuing mailbox send:', creditError);
    } else {
      await updateCoinBalance(senderId, currentCoins);
      throw creditError;
    }
  }

  const baseMessagePayload = {
    sender_id: senderId,
    receiver_id: receiverId,
    record_id: normalizedRecordId,
    status: 'pending',
    initial_question: normalizedQuestion,
  };

  let message = null;
  let insertError = null;

  const firstInsertResult = await supabase
    .from('messages')
    .insert({
      ...baseMessagePayload,
      record_snapshot: enrichedRecordSnapshot,
    })
    .select()
    .single();

  message = firstInsertResult.data;
  insertError = firstInsertResult.error;

  if (insertError && /record_snapshot/i.test(insertError.message || '')) {
    const fallbackInsertResult = await supabase
      .from('messages')
      .insert(baseMessagePayload)
      .select()
      .single();

    message = fallbackInsertResult.data;
    insertError = fallbackInsertResult.error;
  }

  if (insertError) {
    await updateCoinBalance(senderId, currentCoins);
    if (officialReaderCredited) {
      await changeCoinBalance(receiverId, -coinCost);
    }
    throw insertError;
  }

  return {
    message,
    coinBalance: updatedProfile?.coin_balance ?? nextCoins,
  };
}

async function ensureSystemRewardNotification(userId) {
  if (!userId || userId === OFFICIAL_READER_ID) return;

  const profile = await getProfileById(userId);
  if (!profile?.created_at) return;

  const createdAt = new Date(profile.created_at).getTime();
  const cutoff = new Date(SYSTEM_REWARD_CUTOFF).getTime();
  if (!Number.isFinite(createdAt) || createdAt >= cutoff) return;

  const { data: existing, error: existingError } = await supabase
    .from('system_notifications')
    .select('id')
    .eq('receiver_id', userId)
    .eq('reward_coins', 99)
    .limit(1);

  if (existingError) throw existingError;
  if (existing?.length) return;

  const { error: insertError } = await supabase.from('system_notifications').insert({
    receiver_id: userId,
    title: SYSTEM_REWARD_NOTIFICATION_TITLE,
    body: SYSTEM_REWARD_NOTIFICATION_BODY,
    reward_coins: 99,
  });

  if (insertError) throw insertError;
}

function looksLikeMojibake(value) {
  const text = String(value || '').trim();
  if (!text) return true;
  return text.length < 2 || !/[测试补贴感谢注册使用饼币]/.test(text);
}

function normalizeSystemNotification(notification) {
  if (!notification) return notification;

  return {
    ...notification,
    title: looksLikeMojibake(notification.title) ? SYSTEM_REWARD_NOTIFICATION_TITLE : notification.title,
    body: looksLikeMojibake(notification.body) ? SYSTEM_REWARD_NOTIFICATION_BODY : notification.body,
  };
}

async function attachMailboxNicknames(items = []) {
  const senderIds = Array.from(new Set(items.map((item) => item.sender_id).filter(Boolean)));
  const fallbackItems = items.map((item) => ({
    ...item,
    sender_nickname:
      item.sender_nickname
      || item.record_snapshot?.senderNickname
      || (item.sender_id === OFFICIAL_READER_ID ? OFFICIAL_READER_NICKNAME : UNKNOWN_USER_LABEL),
  }));

  if (!senderIds.length) {
    return fallbackItems;
  }

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, nickname')
    .in('id', senderIds);

  if (error) {
    console.warn('Failed to enrich mailbox nicknames from profiles:', error);
    return fallbackItems;
  }

  const nicknameMap = new Map((profiles || []).map((profile) => [profile.id, profile.nickname]));
  fallbackItems.forEach((item) => {
    if (!nicknameMap.has(item.sender_id) && item.sender_nickname) {
      nicknameMap.set(item.sender_id, item.sender_nickname);
    }
  });
  return fallbackItems.map((item) => ({
    ...item,
    sender_nickname: nicknameMap.get(item.sender_id) || '未知用户',
  }));
}

export async function listMailboxMessagesForUser(userId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('sender_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return attachMailboxNicknames(data || []);
}

export async function listMailboxMessagesForAdmin(receiverId = OFFICIAL_READER_ID) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('receiver_id', receiverId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return attachMailboxNicknames(data || []);
}

export async function listSystemNotificationsForUser(userId) {
  await ensureSystemRewardNotification(userId);

  const { data, error } = await supabase
    .from('system_notifications')
    .select('*')
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeSystemNotification);
}

export async function claimSystemNotification(notificationId, userId) {
  const { data: notification, error: notificationError } = await supabase
    .from('system_notifications')
    .select('*')
    .eq('id', notificationId)
    .eq('receiver_id', userId)
    .single();

  if (notificationError) throw notificationError;
  if (!notification) {
    throw new Error('未找到这条系统消息。');
  }

  if (notification.status === 'claimed') {
    const profile = await getProfileById(userId);
    return {
      notification: normalizeSystemNotification(notification),
      coinBalance: profile?.coin_balance ?? null,
      alreadyClaimed: true,
    };
  }

  const profile = await getProfileById(userId);
  if (!profile) {
    throw new Error('未找到当前用户资料。');
  }

  const rewardCoins = Number(notification.reward_coins || 0);
  const nextCoins = (profile.coin_balance || 0) + rewardCoins;

  const { data: updatedNotification, error: updateNotificationError } = await supabase
    .from('system_notifications')
    .update({
      status: 'claimed',
      claimed_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .eq('receiver_id', userId)
    .eq('status', 'pending')
    .select()
    .maybeSingle();

  if (updateNotificationError) throw updateNotificationError;

  if (!updatedNotification) {
    const currentProfile = await getProfileById(userId);
    const currentNotification = await supabase
      .from('system_notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('receiver_id', userId)
      .single();

    return {
      notification: normalizeSystemNotification(currentNotification.data),
      coinBalance: currentProfile?.coin_balance ?? null,
      alreadyClaimed: true,
    };
  }

  const updatedProfile = await updateCoinBalance(userId, nextCoins);

  return {
    notification: normalizeSystemNotification(updatedNotification),
    coinBalance: updatedProfile.coin_balance ?? nextCoins,
    alreadyClaimed: false,
  };
}

export async function redeemCoinCode(code) {
  const normalizedCode = String(code || '').trim().toUpperCase();
  const rpcPromise = supabase.rpc('redeem_coin_code', {
    p_code: normalizedCode,
  });

  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('兑换请求超时了，请稍后重试。'));
    }, 12000);
  });

  let result;
  try {
    result = await Promise.race([rpcPromise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }

  const { data, error } = result;

  if (error) throw error;
  return Array.isArray(data) ? data[0] || null : data;
}

export async function markMailboxMessageRead(messageId, receiverId = OFFICIAL_READER_ID) {
  const { data, error } = await supabase
    .from('messages')
    .update({ status: 'read' })
    .eq('id', messageId)
    .eq('receiver_id', receiverId)
    .eq('status', 'pending')
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function rejectMailboxMessage(messageId, rejectReason, receiverId = OFFICIAL_READER_ID) {
  const normalizedReason = String(rejectReason || '').trim();
  if (!normalizedReason) {
    throw new Error('请先填写驳回原因。');
  }

  const { data, error } = await supabase.rpc('reject_message_and_refund', {
    p_message_id: messageId,
    p_reject_reason: normalizedReason,
    p_admin_id: receiverId,
  });

  if (error) throw error;

  const updatedMessage = Array.isArray(data) ? data[0] : data;
  if (!updatedMessage) {
    throw new Error('驳回请求未返回结果，请稍后再试。');
  }

  try {
    await changeCoinBalance(receiverId, -10);
  } catch (coinError) {
    console.warn('Failed to adjust official reader balance after rejection:', coinError);
  }

  const [enrichedMessage] = await attachMailboxNicknames([updatedMessage]);

  return {
    message: enrichedMessage,
  };
}

export async function replyMailboxMessage(messageId, initialReply, receiverId = OFFICIAL_READER_ID) {
  const normalizedReply = String(initialReply || '').trim();

  if (!normalizedReply) {
    throw new Error('请先填写回复内容。');
  }

  if (normalizedReply.length > 1000) {
    throw new Error('初次回复最多 1000 字。');
  }

  const { data, error } = await supabase
    .from('messages')
    .update({
      initial_reply: normalizedReply,
      status: 'replied',
    })
    .eq('id', messageId)
    .eq('receiver_id', receiverId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function submitMailboxFollowUp(messageId, followUpAsk, senderId) {
  const normalizedAsk = String(followUpAsk || '').trim();

  if (!normalizedAsk) {
    throw new Error('请先写下你的追加提问。');
  }

  if (normalizedAsk.length > 100) {
    throw new Error('追加提问最多 100 字。');
  }

  const { data, error } = await supabase
    .from('messages')
    .update({
      follow_up_ask: normalizedAsk,
      status: 'follow_up',
    })
    .eq('id', messageId)
    .eq('sender_id', senderId)
    .eq('status', 'replied')
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeMailboxFeedback(messageId, feedback, senderId) {
  if (!['Heart', 'Spade'].includes(feedback)) {
    throw new Error('请选择有效评价。');
  }

  const { data, error } = await supabase
    .from('messages')
    .update({
      feedback,
      status: 'completed',
    })
    .eq('id', messageId)
    .eq('sender_id', senderId)
    .eq('status', 'replied')
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeMailboxFollowUpReply(messageId, followUpReply, receiverId = OFFICIAL_READER_ID) {
  const normalizedReply = String(followUpReply || '').trim();

  if (!normalizedReply) {
    throw new Error('请先填写二次回复内容。');
  }

  if (normalizedReply.length > 1000) {
    throw new Error('二次回复最多 1000 字。');
  }

  const { data, error } = await supabase
    .from('messages')
    .update({
      follow_up_reply: normalizedReply,
      status: 'completed',
    })
    .eq('id', messageId)
    .eq('receiver_id', receiverId)
    .eq('status', 'follow_up')
    .select()
    .single();

  if (error) throw error;
  return data;
}
