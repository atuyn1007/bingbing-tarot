import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Bell, Coins, Lock, Mail, MessageCircle, Send, Sparkles, User, X } from 'lucide-react';
import TarotCard from './TarotCard';
import { allTarotCards, drawThreeCards, getCardData, getCardDisplayNames, getCardReading } from './data';
import LanguageSwitcher from './components/LanguageSwitcher';
import { getIntlLocale, useI18n } from './i18n';
import {
  appendRequestMessage,
  createPendingMailboxMessage,
  createRequest,
  ensureProfile,
  getAuthenticatedUser,
  getAuthSession,
  getLocalDateKey,
  completeMailboxFeedback,
  completeMailboxFollowUpReply,
  claimSystemNotification,
  listMailboxMessagesForAdmin,
  listMailboxMessagesForUser,
  listSystemNotificationsForUser,
  getProfileById,
  getRequestById,
  listRequestsByUser,
  loginWithEmail,
  logoutFromSupabase,
  OFFICIAL_READER_ID,
  OFFICIAL_READER_NICKNAME,
  markMailboxMessageRead,
  refreshAuthSession,
  rejectMailboxMessage,
  replyMailboxMessage,
  requestPasswordReset,
  registerWithEmail,
  submitMailboxFollowUp,
  updatePassword,
  updateCoinBalance,
  updateDailyProfile,
} from './supabaseApp';
import { supabase } from './supabaseClient';
import { saveSpreadHistoryRecord, saveTarotHistory } from './supabaseTarot';
import { isSessionExpiredAt } from './sessionUtils';

const OFFICIAL_READER = {
  nickname: OFFICIAL_READER_NICKNAME,
  englishLabel: 'ask bb!',
};

function getRecentReadingsKey(nickname) {
  return `tarot_recent_readings_${nickname || 'guest'}`;
}

function getDailyLine(lines = []) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { text: '', source: '' };
  }

  const today = new Date();
  const dayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const hash = Array.from(dayKey).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return lines[hash % lines.length];
}

function formatDailyFortuneDate(locale) {
  return new Intl.DateTimeFormat(locale, {
    month: 'numeric',
    day: 'numeric',
  }).format(new Date());
}

function resolveCardData(card) {
  if (!card) return getCardData(undefined);

  if (typeof card.id === 'number') {
    return getCardData(card.id);
  }

  const matchedCard = allTarotCards.find((item) => item.name === card.name);
  return matchedCard ? getCardData(matchedCard.id) : getCardData(undefined);
}

function stripLeadSentence(text) {
  const normalized = String(text || '').trim();
  const firstStop = normalized.indexOf('?');

  if (firstStop === -1) {
    return normalized;
  }

  return normalized.slice(firstStop + 1).trim();
}

function getMonthLabel(locale, date = new Date()) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  }).format(date);
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hasRecoveryParams() {
  if (typeof window === 'undefined') return false;
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return search.get('mode') === 'recovery' || search.get('type') === 'recovery' || hash.get('type') === 'recovery';
}

function sanitizeHistoryText(value) {
  return String(value || '')
    .replace(/^[·•\-—–\s]+/u, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildCalendarDays(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingBlankDays = (firstDay.getDay() + 6) % 7;
  const days = [];

  for (let index = 0; index < leadingBlankDays; index += 1) {
    days.push({ type: 'blank', key: `blank-${index}` });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const currentDate = new Date(year, month, day);
    days.push({
      type: 'day',
      key: getDateKey(currentDate),
      day,
      dateKey: getDateKey(currentDate),
    });
  }

  return days;
}

const SPREAD_OPTIONS = [
  {
    key: 'three',
    localeKey: 'spreads.three',
    canonicalName: 'three-card spread',
    cardCount: 3,
    preview: ['1', '2', '3'],
  },
  {
    key: 'triangle',
    localeKey: 'spreads.triangle',
    canonicalName: 'triangle spread',
    cardCount: 3,
    preview: ['1', '2', '3'],
  },
  {
    key: 'choice',
    localeKey: 'spreads.choice',
    canonicalName: 'choice spread',
    cardCount: 5,
    preview: ['A', 'B', 'A+', 'B+', 'You'],
  },
];

function getSpreadConfig(spreadKey, t) {
  const spread = SPREAD_OPTIONS.find((item) => item.key === spreadKey) || SPREAD_OPTIONS[0];
  const translation = t ? t(spread.localeKey) : null;

  if (!translation || typeof translation !== 'object') {
    return {
      ...spread,
      name: spread.canonicalName,
      shortName: spread.canonicalName,
      description: '',
      summary: '',
      positions: [],
    };
  }

  return {
    ...spread,
    ...translation,
  };
}

const SESSION_STARTED_AT_KEY = 'tarot_session_started_at';
const PROFILE_SNAPSHOT_KEY = 'tarot_profile_snapshot';

function readStoredJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeRecentReadingEntry(entry, t) {
  if (!entry || typeof entry !== 'object') return null;

  const spreadKey = entry.spreadKey || 'three';
  const spread = getSpreadConfig(spreadKey, t);
  const rawCards = Array.isArray(entry.cardsData)
    ? entry.cardsData
    : Array.isArray(entry.cards)
      ? entry.cards.map((card) => {
          if (typeof card === 'string') {
            const matched = card.match(/^(.*?)(\uFF08\u9006\u4F4D\uFF09)?$/);
            const name = matched?.[1] || card;
            const isReversed = Boolean(matched?.[2]);
            const data = allTarotCards.find((item) => item.name === name);
            return {
              ...(data || {}),
              id: data?.id,
              name,
              englishName: data?.englishName,
              isReversed,
            };
          }

          return card;
        })
      : [];

  const cardsData = rawCards
    .map((card) => {
      const resolved = resolveCardData(card);
      return {
        id: resolved.id,
        name: resolved.name,
        englishName: resolved.englishName,
        isReversed: Boolean(card?.isReversed),
      };
    })
    .filter((card) => card.name);

  return {
    id: entry.id || `${Date.now()}`,
    recordId: entry.recordId ?? entry.record_id ?? null,
    question: sanitizeHistoryText(entry.question || ''),
    spreadKey,
    spreadName: sanitizeHistoryText(entry.spreadName || spread.name),
    cardsData,
    cardSummary: cardsData.map((card) => formatPlainCardName(card)),
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

function drawCardsForSpread(cardCount) {
  const cards = [];
  const usedIndices = new Set();

  while (cards.length < cardCount) {
    const randomIndex = Math.floor(Math.random() * allTarotCards.length);
    if (usedIndices.has(randomIndex)) continue;

    usedIndices.add(randomIndex);
    const card = allTarotCards[randomIndex];
    const isReversed = Math.random() < 0.5;

    cards.push({
      ...card,
      isReversed,
      displayName: isReversed ? `${card.name}\uFF08\u9006\u4F4D\uFF09` : card.name,
    });
  }

  return cards;
}

function formatSpreadCardName(card, t) {
  if (!card) return '';
  return card.isReversed
    ? `${card.name}\uFF08${t ? t('common.orientationReversed') : '\u9006\u4F4D'}\uFF09`
    : card.name;
}

function formatPlainCardName(card) {
  return sanitizeHistoryText(card?.name || '');
}

function formatHistorySummary(entry, t) {
  const spreadName = sanitizeHistoryText(entry?.spreadName || getSpreadConfig(entry?.spreadKey || 'three', t).name);
  const cards = Array.isArray(entry?.cardsData)
    ? entry.cardsData.map((card) => formatSpreadCardName(card, t)).filter(Boolean)
    : Array.isArray(entry?.cardSummary)
      ? entry.cardSummary.map((item) => sanitizeHistoryText(item)).filter(Boolean)
      : [];

  return [spreadName, ...cards].filter(Boolean).join(t ? t('common.historySeparator') : ' · ');
}

function buildRecordSnapshot(entry, t) {
  if (!entry) return null;

  return {
    question: sanitizeHistoryText(entry.question || ''),
    spreadKey: entry.spreadKey || 'three',
    spreadName: sanitizeHistoryText(entry.spreadName || getSpreadConfig(entry.spreadKey || 'three', t).name),
    cardsData: Array.isArray(entry.cardsData)
      ? entry.cardsData.map((card) => ({
          id: typeof card?.id === 'number' ? card.id : resolveCardData(card).id,
          name: sanitizeHistoryText(card?.name || resolveCardData(card).name),
          englishName: card?.englishName || resolveCardData(card).englishName,
          isReversed: Boolean(card?.isReversed),
        }))
      : [],
  };
}

function getMailboxStatusLabel(status, t) {
  if (!status) return t('mailbox.status.unknown');
  return t(`mailbox.status.${status}`) || status;
}

function getMailboxStatusHint(status, t) {
  if (!status) return t('mailbox.hints.default');
  return t(`mailbox.hints.${status}`) || t('mailbox.hints.default');
}

function getMailboxSenderLabel(item, t) {
  if (!item) return t('common.unknownUser');
  return item.sender_nickname || item.record_snapshot?.senderNickname || t('common.unknownUser');
}

function getSystemNotificationStatusLabel(status, t) {
  return status === 'claimed' ? t('mailbox.systemStatus.claimed') : t('mailbox.systemStatus.pending');
}

function shouldAppendFortuneReading(text, keywords) {
  const normalizedText = String(text || '').trim();
  if (!normalizedText) return false;

  const overlapCount = keywords.filter((keyword) => normalizedText.includes(keyword)).length;
  return overlapCount < 2;
}

function buildSpreadReading(cards, question, spread, t) {
  const lead = t('drawing.readingLead', { spread: spread.name });
  const cardNames = cards.map((card) => formatSpreadCardName(card, t)).join(t('common.listSeparator'));
  const positionLines = cards.map((card, index) => {
    const position = spread.positions[index];
    const label = position?.title || t('drawing.spreadLabelFallback', { index: index + 1 });
    return t('drawing.positionLine', {
      label,
      card: formatSpreadCardName(card, t),
      reading: getCardReading(card),
    });
  });

  const closing =
    spread.key === 'triangle'
      ? t('drawing.triangleClosing', { question })
      : spread.key === 'choice'
        ? t('drawing.choiceClosing', { question })
        : t('drawing.generalClosing', { question });

  return [lead, t('drawing.cardsAre', { cards: cardNames }), ...positionLines, closing].join('\n\n');
}

function buildHumanReading(cards, question, t) {
  const cardNames = cards.map((card) => formatSpreadCardName(card, t)).join(t('common.listSeparator'));
  const lines = cards.map((card, index) =>
    t('drawing.humanCardLine', {
      index: index + 1,
      card: formatSpreadCardName(card, t),
      reading: getCardReading(card),
    }),
  );

  return [t('drawing.humanFirst', { cards: cardNames }), ...lines, t('drawing.humanClosing', { question })].join('\n\n');
}

function App() {
  const { language, t } = useI18n();
  const intlLocale = getIntlLocale(language);
  const storedUser = readStoredJson('tarot_user', null);
  const storedProfile = readStoredJson(PROFILE_SNAPSHOT_KEY, {});
  const [theme, setTheme] = useState(() => localStorage.getItem('tarot_theme') || 'aurora');
  const [user, setUser] = useState(storedUser);
  const [isAuthReady, setIsAuthReady] = useState(true);
  const [isSessionSyncing, setIsSessionSyncing] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [coinBalance, setCoinBalance] = useState(storedProfile.coinBalance || 0);
  const [lastSignInDate, setLastSignInDate] = useState(storedProfile.lastSignInDate || null);

  const [currentPage, setCurrentPage] = useState('home');
  const [isHumanMode, setIsHumanMode] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [readingComplete, setReadingComplete] = useState(false);
  const [aiReading, setAiReading] = useState('');
  const [displayedText, setDisplayedText] = useState('');

  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);
  const [mailboxItems, setMailboxItems] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [selectedMailboxItem, setSelectedMailboxItem] = useState(null);
  const [adminRejectReason, setAdminRejectReason] = useState('');
  const [adminInitialReply, setAdminInitialReply] = useState('');
  const [adminFollowUpReply, setAdminFollowUpReply] = useState('');
  const [userFollowUpAsk, setUserFollowUpAsk] = useState('');

  const [dailyCard, setDailyCard] = useState(null);
  const [showDailyResult, setShowDailyResult] = useState(false);
  const [savedDailyTarot, setSavedDailyTarot] = useState(storedProfile.savedDailyTarot || null);
  const [isSignedIn, setIsSignedIn] = useState(Boolean(storedProfile.isSignedIn));
  const [dailyHistory, setDailyHistory] = useState(storedProfile.dailyHistory || {});
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showSpreadModal, setShowSpreadModal] = useState(false);
  const [recentReadings, setRecentReadings] = useState([]);
  const [selectedSpreadKey, setSelectedSpreadKey] = useState('three');
  const [cardStyle, setCardStyle] = useState(() => localStorage.getItem('tarot_card_style') || 'minimal');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryReading, setSelectedHistoryReading] = useState(null);
  const [showHumanRequestModal, setShowHumanRequestModal] = useState(false);
  const [selectedHumanReadingId, setSelectedHumanReadingId] = useState(null);
  const hasRecoveryLink = hasRecoveryParams();

  const typingRef = useRef(null);
  const authReadyTimeoutRef = useRef(null);
  const autofillSyncTimeoutRef = useRef(null);
  const authInteractionRef = useRef(false);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const activeNickname = user?.nickname || nickname;
  const dailyLine = getDailyLine(t('quotes'));
  const activeDailyCard = savedDailyTarot || dailyCard;
  const calendarDate = new Date();
  const calendarDays = buildCalendarDays(calendarDate);
  const activeSpread = getSpreadConfig(selectedSpreadKey, t);
  const spreadOptions = SPREAD_OPTIONS.map((spread) => getSpreadConfig(spread.key, t));
  const hasAuthDraft =
    Boolean((emailInputRef.current?.value || email || '').trim()) ||
    Boolean((passwordInputRef.current?.value || (isRecoveryMode ? resetPasswordValue : password) || '').trim());

  useEffect(() => {
    localStorage.setItem('tarot_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tarot_card_style', cardStyle);
  }, [cardStyle]);

  const markSessionStarted = () => {
    localStorage.setItem(SESSION_STARTED_AT_KEY, `${Date.now()}`);
  };

  const persistProfileSnapshot = (snapshot) => {
    localStorage.setItem(PROFILE_SNAPSHOT_KEY, JSON.stringify(snapshot));
  };

  const isSessionExpired = () => {
    const startedAt = Number(localStorage.getItem(SESSION_STARTED_AT_KEY) || 0);
    return isSessionExpiredAt(startedAt);
  };

  const clearSession = () => {
    authInteractionRef.current = false;
    localStorage.removeItem('tarot_user');
    localStorage.removeItem(SESSION_STARTED_AT_KEY);
    localStorage.removeItem(PROFILE_SNAPSHOT_KEY);
    setUser(null);
    setEmail('');
    setNickname('');
    setPassword('');
    setResetPasswordValue('');
    setShowForgotPasswordModal(false);
    setIsRecoveryMode(false);
    setCoinBalance(0);
    setLastSignInDate(null);
    setCurrentPage('home');
    setIsHumanMode(false);
    setUserQuestion('');
    setDrawnCards([]);
    setIsRevealing(false);
    setReadingComplete(false);
    setAiReading('');
    setDisplayedText('');
    setMessages([]);
    setUnreadCount(0);
    setCurrentChatId(null);
    setMessageText('');
    setIsWaitingForReply(false);
    setMailboxItems([]);
    setSystemNotifications([]);
    setSelectedMailboxItem(null);
    setAdminRejectReason('');
    setAdminInitialReply('');
    setAdminFollowUpReply('');
    setUserFollowUpAsk('');
    setDailyCard(null);
    setShowDailyResult(false);
    setSavedDailyTarot(null);
    setIsSignedIn(false);
    setDailyHistory({});
    setShowCalendarModal(false);
    setShowSpreadModal(false);
    setRecentReadings([]);
    setSelectedSpreadKey('three');
    setShowHistoryModal(false);
    setSelectedHistoryReading(null);
    setShowHumanRequestModal(false);
    setSelectedHumanReadingId(null);
    setIsAuthReady(true);
    setIsSessionSyncing(false);
  };

  const resetReadingState = () => {
    setDrawnCards([]);
    setIsRevealing(false);
    setReadingComplete(false);
    setAiReading('');
    setDisplayedText('');
    setUserQuestion('');
  };

  const syncAuthInputValues = () => {
    const nextEmail = emailInputRef.current?.value || '';
    const nextPassword = passwordInputRef.current?.value || '';

    if (nextEmail || nextPassword) {
      authInteractionRef.current = true;
    }

    if (nextEmail && nextEmail !== email) {
      setEmail(nextEmail);
    }

    if (isRecoveryMode) {
      if (nextPassword && nextPassword !== resetPasswordValue) {
        setResetPasswordValue(nextPassword);
      }
    } else if (nextPassword && nextPassword !== password) {
      setPassword(nextPassword);
    }
  };

  const hasPendingAuthInput = () =>
    Boolean((emailInputRef.current?.value || email || '').trim()) ||
    Boolean((passwordInputRef.current?.value || password || resetPasswordValue || '').trim());

  const fetchUserProfile = async (authUser) => {
    try {
      const profile = await ensureProfile(authUser, authUser?.user_metadata?.nickname || nickname);
      const todayKey = getLocalDateKey();
      const isSignedInToday = profile.last_sign_in_date === todayKey;
      const nextUser = { id: authUser.id, nickname: profile.nickname };

      setUser(nextUser);
      setNickname(profile.nickname);
      setCoinBalance(profile.coin_balance || 0);
      setLastSignInDate(profile.last_sign_in_date || null);
      setIsSignedIn(isSignedInToday);
      setSavedDailyTarot(isSignedInToday ? profile.today_card || null : null);
      setDailyHistory(profile.daily_history || {});
      localStorage.setItem('tarot_user', JSON.stringify(nextUser));
      persistProfileSnapshot({
        coinBalance: profile.coin_balance || 0,
        lastSignInDate: profile.last_sign_in_date || null,
        isSignedIn: isSignedInToday,
        savedDailyTarot: isSignedInToday ? profile.today_card || null : null,
        dailyHistory: profile.daily_history || {},
      });
      setIsAuthReady(true);
    } catch (error) {
      console.error(error);
      setIsAuthReady(true);
    } finally {
      if (authReadyTimeoutRef.current) {
        clearTimeout(authReadyTimeoutRef.current);
        authReadyTimeoutRef.current = null;
      }
      setIsSessionSyncing(false);
    }
  };

  const getLiveSessionUser = async () => {
    try {
      let session = await getAuthSession();
      if (!session && user?.id) {
        session = await refreshAuthSession();
      }

      let authUser = session?.user || null;
      if (!authUser) {
        authUser = await getAuthenticatedUser();
      }

      if (!authUser) {
        clearSession();
        alert(t('alerts.sessionInvalid'));
        return null;
      }

      if (isSessionExpired()) {
        await logoutFromSupabase();
        clearSession();
        alert(t('alerts.sessionExpired'));
        return null;
      }

      return authUser;
    } catch (error) {
      console.error(error);
      clearSession();
      alert(t('alerts.sessionError'));
      return null;
    }
  };

  const persistRecentReadings = (items) => {
    localStorage.setItem(getRecentReadingsKey(activeNickname), JSON.stringify(items));
  };

  const saveRecentReading = async (question, cards, spreadKey) => {
    const spread = getSpreadConfig(spreadKey, t);
    let syncedRecordId = null;

    try {
      const synced = await saveSpreadHistoryRecord(question, spread.name, cards);
      syncedRecordId = synced?.id ?? null;
    } catch (error) {
      console.warn('Failed to sync spread history to Supabase:', error);
    }

    const entry = normalizeRecentReadingEntry({
      id: `${Date.now()}`,
      recordId: syncedRecordId,
      question,
      spreadKey: spread.key,
      spreadName: spread.name,
      cardsData: cards.map((card) => ({
        id: card.id,
        name: card.name,
        englishName: card.englishName,
        isReversed: Boolean(card.isReversed),
      })),
      createdAt: new Date().toISOString(),
    }, t);

    setRecentReadings((current) => {
      const next = [entry, ...current].slice(0, 3);
      persistRecentReadings(next);
      return next;
    });

    return entry;
  };

  const syncRecentReadingRecord = async (entry) => {
    if (!entry || entry.recordId || entry.record_id) return entry;

    try {
      const synced = await saveSpreadHistoryRecord(entry.question, entry.spreadName, entry.cardsData || []);
      const nextEntry = normalizeRecentReadingEntry({
        ...entry,
        recordId: synced?.id ?? null,
      }, t);

      setRecentReadings((current) => {
        const next = current.map((item) => (item.id === entry.id ? nextEntry : item));
        persistRecentReadings(next);
        return next;
      });

      if (selectedHistoryReading?.id === entry.id) {
        setSelectedHistoryReading(nextEntry);
      }

      return nextEntry;
    } catch (error) {
      console.warn('Failed to backfill record_id for recent reading:', error);
      return entry;
    }
  };

  const deleteRecentReading = (entryId) => {
    setRecentReadings((current) => {
      const next = current.filter((entry) => entry.id !== entryId);
      persistRecentReadings(next);
      return next;
    });
  };

  const openHistoryModal = (entry) => {
    setSelectedHistoryReading(entry);
    setShowHistoryModal(true);
  };

  const openHumanRequestModal = () => {
    if (recentReadings.length === 0) {
      alert(t('alerts.historyNeedsReading'));
      return;
    }

    setSelectedHumanReadingId(recentReadings[0]?.id || null);
    setShowHumanRequestModal(true);
  };

  useEffect(() => {
    let mounted = true;

    const bootstrapSession = async () => {
      setIsSessionSyncing(Boolean(storedUser) && !hasRecoveryLink && !hasPendingAuthInput() && !authInteractionRef.current);
      authReadyTimeoutRef.current = setTimeout(() => {
        if (mounted) {
          setIsAuthReady(true);
          setIsSessionSyncing(false);
        }
      }, 4000);

      try {
        if (hasRecoveryLink && mounted) {
          setIsRecoveryMode(true);
          setIsLogin(true);
          setShowForgotPasswordModal(false);
          setIsAuthReady(true);
          setIsSessionSyncing(false);
        }

        let session = await getAuthSession();
        if (!session && storedUser) {
          session = await refreshAuthSession();
        }

        let authUser = session?.user || null;
        if (!authUser && storedUser) {
          authUser = await getAuthenticatedUser();
        }

        if (authUser && mounted) {
          if (isSessionExpired()) {
            await logoutFromSupabase();
            clearSession();
            setIsAuthReady(true);
            return;
          }

          if (!localStorage.getItem(SESSION_STARTED_AT_KEY)) {
            markSessionStarted();
          }
          await fetchUserProfile(authUser);
        } else if (mounted) {
          if (hasRecoveryLink) {
            setIsRecoveryMode(true);
            setIsLogin(true);
            setIsAuthReady(true);
            setIsSessionSyncing(false);
            return;
          }
          if (hasPendingAuthInput() || authInteractionRef.current) {
            localStorage.removeItem('tarot_user');
            setUser(null);
            setIsAuthReady(true);
            setIsSessionSyncing(false);
            return;
          }
          clearSession();
          setIsAuthReady(true);
          setIsSessionSyncing(false);
        }
      } catch (error) {
        console.error(error);
        if (mounted) {
          clearSession();
          setIsAuthReady(true);
          setIsSessionSyncing(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      mounted = false;
      if (authReadyTimeoutRef.current) {
        clearTimeout(authReadyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user) return undefined;

    const timers = [0, 300, 1000, 2500, 4000].map((delay) =>
      setTimeout(() => {
        syncAuthInputValues();
      }, delay),
    );

    const interval = setInterval(() => {
      syncAuthInputValues();
    }, 1200);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      clearInterval(interval);
      if (autofillSyncTimeoutRef.current) {
        clearTimeout(autofillSyncTimeoutRef.current);
      }
    };
  }, [user, isRecoveryMode]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          if (isSessionExpired()) {
            await logoutFromSupabase();
            clearSession();
            setIsAuthReady(true);
            return;
          }

          await fetchUserProfile(session.user);
        } else {
          if (hasPendingAuthInput() || authInteractionRef.current) {
            localStorage.removeItem('tarot_user');
            setUser(null);
            setIsAuthReady(true);
            setIsSessionSyncing(false);
          } else {
            clearSession();
            setIsAuthReady(true);
            setIsSessionSyncing(false);
          }
        }
        return;
      }

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setIsLogin(true);
        setShowForgotPasswordModal(false);
        setCurrentPage('home');
        setIsAuthReady(true);
        setIsSessionSyncing(false);
        return;
      }

      if (event === 'SIGNED_OUT') {
        clearSession();
        setIsAuthReady(true);
        return;
      }

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        markSessionStarted();
        setIsSessionSyncing(true);
        await fetchUserProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(getRecentReadingsKey(activeNickname));

    if (!stored) {
      setRecentReadings([]);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const normalized = Array.isArray(parsed)
        ? parsed.map((entry) => normalizeRecentReadingEntry(entry, t)).filter(Boolean).slice(0, 3)
        : [];
      setRecentReadings(normalized);
    } catch {
      setRecentReadings([]);
    }
  }, [activeNickname, t]);

  const handleRegister = async () => {
    if (!email.trim() || !nickname.trim() || !password.trim()) {
      alert(t('alerts.registerMissing'));
      return;
    }

    try {
      const result = await registerWithEmail(email.trim(), nickname.trim(), password);
      if (result.needsEmailVerification) {
        alert(t('alerts.registerVerifyMailSent'));
      } else {
        alert(t('alerts.registerSuccess'));
      }

      setIsLogin(true);
      setPassword('');
    } catch (error) {
      if (error.message?.includes('email rate limit exceeded')) {
        alert(t('alerts.registerRateLimited'));
        return;
      }

      if (error.message?.includes('row-level security')) {
        alert(t('alerts.registerAlreadySent'));
        return;
      }

      alert(error.message || t('alerts.registerFailed'));
    }
  };

  const handleLogin = async () => {
    syncAuthInputValues();
    authInteractionRef.current = true;

    const submittedEmail = (emailInputRef.current?.value || email || '').trim();
    const submittedPassword = passwordInputRef.current?.value || password || '';

    if (!submittedEmail || !submittedPassword.trim()) {
      alert(t('alerts.loginMissing'));
      return;
    }

    try {
      if (authReadyTimeoutRef.current) {
        clearTimeout(authReadyTimeoutRef.current);
        authReadyTimeoutRef.current = null;
      }
      setIsSessionSyncing(true);
      setEmail(submittedEmail);
      setPassword(submittedPassword);
      const data = await loginWithEmail(submittedEmail, submittedPassword);
      markSessionStarted();
      setPassword('');
      const authUser = data.user || data.session?.user || (await getAuthenticatedUser());
      if (!authUser) {
        throw new Error(t('alerts.loginUserMissing'));
      }
      await fetchUserProfile(authUser);
    } catch (error) {
      setIsSessionSyncing(false);
      alert(error.message || t('alerts.loginFailed'));
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      alert(t('alerts.forgotMissingEmail'));
      return;
    }

    try {
      await requestPasswordReset(email.trim(), window.location.origin);
      setShowForgotPasswordModal(false);
      alert(t('alerts.forgotSent'));
    } catch (error) {
      alert(error.message || t('alerts.forgotFailed'));
    }
  };

  const handleCompletePasswordReset = async () => {
    if (!resetPasswordValue.trim()) {
      alert(t('alerts.resetMissingPassword'));
      return;
    }

    if (resetPasswordValue.trim().length < 6) {
      alert(t('alerts.resetPasswordShort'));
      return;
    }

    try {
      await updatePassword(resetPasswordValue.trim());
      setResetPasswordValue('');
      setIsRecoveryMode(false);
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      alert(t('alerts.resetSuccess'));
    } catch (error) {
      alert(error.message || t('alerts.resetFailed'));
    }
  };

  const handleLogout = async () => {
    clearSession();

    try {
      await logoutFromSupabase();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDailySignIn = async () => {
    const liveUser = await getLiveSessionUser();
    if (!liveUser?.id) {
      return;
    }

    try {
      const profile = await getProfileById(liveUser.id);
      if (!profile) {
        clearSession();
        alert(t('alerts.profileMissing'));
        return;
      }

      const todayKey = getLocalDateKey();
      const currentHistory = profile.daily_history || {};

      if (profile.last_sign_in_date === todayKey) {
        setIsSignedIn(true);
        setCoinBalance(profile.coin_balance || 0);
        setLastSignInDate(profile.last_sign_in_date || todayKey);
        setDailyHistory(currentHistory);
        if (profile.today_card) {
          setSavedDailyTarot(profile.today_card);
          setDailyCard(profile.today_card);
          setShowDailyResult(true);
        }

        persistProfileSnapshot({
          coinBalance: profile.coin_balance || 0,
          lastSignInDate: profile.last_sign_in_date || todayKey,
          isSignedIn: true,
          savedDailyTarot: profile.today_card || null,
          dailyHistory: currentHistory,
        });

        return;
      }

      const todayCard = {
        name: allTarotCards[Math.floor(Math.random() * allTarotCards.length)].name,
        isReversed: Math.random() < 0.5,
      };

      const nextHistory = {
        ...currentHistory,
        [todayKey]: todayCard,
      };

      const updatedProfile = await updateDailyProfile(liveUser.id, {
        last_sign_in_date: todayKey,
        today_card: todayCard,
        daily_history: nextHistory,
        coin_balance: (profile.coin_balance || 0) + 1,
      });

      setIsSignedIn(true);
      setCoinBalance(updatedProfile.coin_balance || coinBalance);
      setLastSignInDate(updatedProfile.last_sign_in_date || todayKey);
      setDailyHistory(updatedProfile.daily_history || nextHistory);
      if (updatedProfile.today_card) {
        try {
          await saveTarotHistory(updatedProfile.today_card.name, !updatedProfile.today_card.isReversed);
        } catch (syncError) {
          console.warn('Failed to sync daily tarot to Supabase:', syncError);
        }

        setSavedDailyTarot(updatedProfile.today_card);
        setDailyCard(updatedProfile.today_card);
        setShowDailyResult(true);
      }

      persistProfileSnapshot({
        coinBalance: updatedProfile.coin_balance || coinBalance,
        lastSignInDate: updatedProfile.last_sign_in_date || todayKey,
        isSignedIn: true,
        savedDailyTarot: updatedProfile.today_card || null,
        dailyHistory: updatedProfile.daily_history || nextHistory,
      });
    } catch (error) {
      console.error(error);
      alert(error.message || t('alerts.dailyFailed'));
    }
  };

  const openDailyFortuneModal = () => {
    if (!activeDailyCard) return;
    setDailyCard(activeDailyCard);
    setShowDailyResult(true);
  };

  const getDailyFortuneKeywords = (card) => {
    const data = resolveCardData(card);
    const keywords = card?.isReversed ? data.reversedKeywords : data.uprightKeywords;

    return Array.isArray(keywords) ? keywords.slice(0, 3) : [];
  };

  const getDailyFortuneSummary = (card) => {
    if (!card) return '';

    const data = resolveCardData(card);
    return getCardReading({ ...card, id: data.id });
  };

  const dailyFortuneKeywords = activeDailyCard ? getDailyFortuneKeywords(activeDailyCard) : [];

  const readingTextParts = displayedText.split('\n\n');
  const readingLead = readingTextParts[0] || '';
  const readingBody = readingTextParts.slice(1).join('\n\n');

  const handleStartFreeReading = () => {
    setIsHumanMode(false);
    resetReadingState();
    setShowSpreadModal(true);
  };

  const handleSelectSpread = (spreadKey) => {
    setSelectedSpreadKey(spreadKey);
    setShowSpreadModal(false);
    setCurrentPage('drawing-input');
  };

  const handleStartHumanReading = () => {
    if (coinBalance < 10) {
      alert(t('alerts.coinsNotEnough'));
      return;
    }

    setIsHumanMode(true);
    setSelectedSpreadKey('three');
    resetReadingState();
    setCurrentPage('drawing-input');
  };

  const handleConfirmQuestion = () => {
    const trimmedQuestion = userQuestion.trim();

    if (!trimmedQuestion) return;

    setCurrentPage('drawing');

    setTimeout(() => {
      const spread = getSpreadConfig(selectedSpreadKey, t);
      const cards = spread.key === 'three' && isHumanMode ? drawThreeCards() : drawCardsForSpread(spread.cardCount);
      setDrawnCards(cards);
      void saveRecentReading(trimmedQuestion, cards, spread.key).catch((error) => {
        console.warn('Failed to persist recent reading:', error);
      });

      setTimeout(() => {
        setIsRevealing(true);

        setTimeout(() => {
          setReadingComplete(true);
          setAiReading(isHumanMode ? buildHumanReading(cards, trimmedQuestion, t) : buildSpreadReading(cards, trimmedQuestion, spread, t));
        }, 1100);
      }, 260);
    }, 420);
  };

  const startPollingReply = (chatId) => {
    const pollInterval = setInterval(async () => {
      try {
        const data = await getRequestById(chatId);
        if (!data) return;
        setMessages(data.messages || []);
        if ((data.messages || []).some((message) => message.sender === 'teacher')) {
          setIsWaitingForReply(false);
        }
        if (data.status === 'closed') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        // ignore
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  };

  const submitHumanReadingRequest = async (readingEntry) => {
    const liveUser = await getLiveSessionUser();
    if (!liveUser?.id || !activeNickname || !readingEntry?.question || !Array.isArray(readingEntry.cardsData) || readingEntry.cardsData.length === 0) return;

    const syncedEntry = await syncRecentReadingRecord(readingEntry);
    const selectedRecordId = syncedEntry?.recordId ?? syncedEntry?.record_id ?? null;

    if (!selectedRecordId) {
      alert(t('alerts.syncRecordFailed'));
      return;
    }

    const confirmed = window.confirm(t('alerts.confirmSendRequest'));
    if (!confirmed) return;

    try {
      const { message, coinBalance: nextBalance } = await createPendingMailboxMessage({
        senderId: liveUser.id,
        recordId: selectedRecordId,
        initialQuestion: syncedEntry.question,
        recordSnapshot: buildRecordSnapshot(syncedEntry, t),
      });

      setCoinBalance(nextBalance);
      persistProfileSnapshot({
        coinBalance: nextBalance,
        lastSignInDate,
        isSignedIn,
        savedDailyTarot,
        dailyHistory,
      });

      setCurrentChatId(message.id);
      setUserQuestion(readingEntry.question);
      setDrawnCards(readingEntry.cardsData);
      setMessages([]);
      setIsWaitingForReply(true);
      setShowHumanRequestModal(false);
      alert(t('alerts.requestSent'));
    } catch (error) {
      alert(error.message || t('alerts.requestSendFailed'));
    }
  };

  const handleSubmitHumanRequest = async () => {
    const readingEntry = recentReadings.find((entry) => entry.id === selectedHumanReadingId) || recentReadings[0];
    if (!readingEntry) return;
    await submitHumanReadingRequest(readingEntry);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentChatId) return;

    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((current) => [...current, newMessage]);
    setMessageText('');

    try {
      await appendRequestMessage(currentChatId, newMessage);
    } catch (error) {
      console.error(error);
    }
  };

  const refreshMailbox = async () => {
    if (!user?.id) return;

    if (user.id === OFFICIAL_READER_ID) {
      const adminMessages = await listMailboxMessagesForAdmin();
      setMailboxItems(adminMessages);
      setSystemNotifications([]);
      setUnreadCount(adminMessages.filter((item) => item.status === 'pending' || item.status === 'follow_up').length);
      return;
    }

    const [userMessages, userNotifications] = await Promise.all([
      listMailboxMessagesForUser(user.id),
      listSystemNotificationsForUser(user.id),
    ]);

    setMailboxItems(userMessages);
    setSystemNotifications(userNotifications);
    setUnreadCount(
      userMessages.filter((item) => item.status === 'replied').length
      + userNotifications.filter((item) => item.status !== 'claimed').length,
    );
  };

  const handleOpenMailboxItem = async (item) => {
    if (!item) return;

    let nextItem = item;
    if (user?.id === OFFICIAL_READER_ID && item.status === 'pending') {
      try {
        const updated = await markMailboxMessageRead(item.id);
        nextItem = updated || { ...item, status: 'read' };
      } catch (error) {
        console.error(error);
      }
    }

    setSelectedMailboxItem(nextItem);
    setAdminRejectReason(nextItem.reject_reason || '');
    setAdminInitialReply(nextItem.initial_reply || '');
    setAdminFollowUpReply(nextItem.follow_up_reply || '');
    setUserFollowUpAsk(nextItem.follow_up_ask || '');
    await refreshMailbox();
  };

  const handleAdminReject = async () => {
    if (!selectedMailboxItem) return;

    try {
      const result = await rejectMailboxMessage(selectedMailboxItem.id, adminRejectReason);
      setSelectedMailboxItem(result.message);
      alert(t('alerts.adminRejected'));
      await refreshMailbox();
    } catch (error) {
      alert(error.message || t('alerts.adminRejectFailed'));
    }
  };

  const handleAdminReply = async () => {
    if (!selectedMailboxItem) return;

    try {
      const updated = await replyMailboxMessage(selectedMailboxItem.id, adminInitialReply);
      setSelectedMailboxItem(updated);
      alert(t('alerts.adminReplySent'));
      await refreshMailbox();
    } catch (error) {
      alert(error.message || t('alerts.adminReplyFailed'));
    }
  };

  const handleAdminFollowUpReply = async () => {
    if (!selectedMailboxItem) return;

    try {
      const updated = await completeMailboxFollowUpReply(selectedMailboxItem.id, adminFollowUpReply);
      setSelectedMailboxItem(updated);
      alert(t('alerts.adminFollowUpSent'));
      await refreshMailbox();
    } catch (error) {
      alert(error.message || t('alerts.adminFollowUpFailed'));
    }
  };

  const handleUserFollowUp = async () => {
    if (!selectedMailboxItem || !user?.id) return;

    try {
      const updated = await submitMailboxFollowUp(selectedMailboxItem.id, userFollowUpAsk, user.id);
      setSelectedMailboxItem(updated);
      alert(t('alerts.followUpSent'));
      await refreshMailbox();
    } catch (error) {
      alert(error.message || t('alerts.followUpFailed'));
    }
  };

  const handleUserFeedback = async (feedback) => {
    if (!selectedMailboxItem || !user?.id) return;

    try {
      const updated = await completeMailboxFeedback(selectedMailboxItem.id, feedback, user.id);
      setSelectedMailboxItem(updated);
      alert(t('alerts.feedbackSent'));
      await refreshMailbox();
    } catch (error) {
      alert(error.message || t('alerts.feedbackFailed'));
    }
  };

  const handleClaimSystemNotification = async (notification) => {
    if (!notification?.id || !user?.id) return;

    try {
      const result = await claimSystemNotification(notification.id, user.id);
      setCoinBalance(result.coinBalance ?? coinBalance);
      setSystemNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                ...(result.notification || {}),
              }
            : item,
        ),
      );
      await refreshMailbox();
      alert(result.alreadyClaimed ? t('alerts.subsidyClaimed') : t('alerts.subsidyReceived'));
    } catch (error) {
      alert(error.message || t('alerts.subsidyFailed'));
    }
  };

  useEffect(() => {
    if (!aiReading || !readingComplete) return undefined;

    setDisplayedText('');
    let index = 0;
    typingRef.current = setInterval(() => {
      if (index < aiReading.length) {
        setDisplayedText(aiReading.slice(0, index + 1));
        index += 1;
      } else {
        clearInterval(typingRef.current);
      }
    }, 22);

    return () => {
      if (typingRef.current) clearInterval(typingRef.current);
    };
  }, [aiReading, readingComplete]);

  useEffect(() => {
    if (!user?.id) return undefined;

    const fetchMailbox = async () => {
      try {
        await refreshMailbox();
      } catch (error) {
        // ignore
      }
    };

    fetchMailbox();
    const interval = setInterval(fetchMailbox, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const goHome = () => {
    setCurrentPage('home');
    setIsHumanMode(false);
    setUserQuestion('');
    setDrawnCards([]);
    setIsRevealing(false);
    setReadingComplete(false);
    setAiReading('');
    setDisplayedText('');
  };

  const renderSpreadCards = (cards = drawnCards, spreadKey = isHumanMode ? 'three' : activeSpread.key, options = {}) => {
    const spread = getSpreadConfig(spreadKey, t);
    const cardSize = spread.key === 'choice' ? 'small' : 'normal';
    const isRevealedView = options.isRevealed ?? isRevealing;
    const showOrientation = options.showOrientation ?? false;

    return (
      <section className={`reading-spread reading-spread-${spread.key} ${options.className || ''}`.trim()}>
        {cards.map((card, index) => {
          const position = spread.positions[index];

          return (
            <div key={`${spread.key}-${card.id}-${index}`} className={`reading-spread-slot reading-spread-slot-${spread.key}-${index + 1}`}>
              <TarotCard
                card={card}
                isRevealed={isRevealedView}
                size={cardSize}
                showOrientation={showOrientation}
                variant={cardStyle}
                rotateReversed={options.rotateReversed ?? true}
              />
              {cardStyle === 'artwork' && isRevealedView ? (
                <p className="reading-spread-card-name">{card.name}</p>
              ) : null}
              <div className="reading-spread-meta">
                <p className="reading-spread-label">{position?.title || t('drawing.spreadLabelFallback', { index: index + 1 })}</p>
                {position?.subtitle ? <p className="reading-spread-subtitle">{position.subtitle}</p> : null}
              </div>
            </div>
          );
        })}
      </section>
    );
  };

  const renderThemeToggle = (extraClassName = '') => (
    <div className={`theme-toggle ${extraClassName}`.trim()}>
      <button
        type="button"
        onClick={() => setTheme('aurora')}
        className={`theme-toggle-button ${theme === 'aurora' ? 'theme-toggle-button-active' : ''}`}
        aria-label={t('theme.auroraAria')}
        title={t('theme.auroraTitle')}
      >
        <span className="theme-toggle-swatch theme-toggle-swatch-aurora" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('noir')}
        className={`theme-toggle-button ${theme === 'noir' ? 'theme-toggle-button-active' : ''}`}
        aria-label={t('theme.noirAria')}
        title={t('theme.noirTitle')}
      >
        <span className="theme-toggle-swatch theme-toggle-swatch-noir" aria-hidden="true" />
      </button>
    </div>
  );

  const renderCardStyleToggle = (extraClassName = '') => (
    <div className={`card-style-toggle ${extraClassName}`.trim()}>
      <button
        type="button"
        onClick={() => setCardStyle('minimal')}
        className={`card-style-button ${cardStyle === 'minimal' ? 'card-style-button-active' : ''}`}
      >
        {t('cardStyle.minimal')}
      </button>
      <button
        type="button"
        onClick={() => setCardStyle('artwork')}
        className={`card-style-button ${cardStyle === 'artwork' ? 'card-style-button-active' : ''}`}
      >
        {t('cardStyle.artwork')}
      </button>
    </div>
  );

  const renderDailyCard = (extraClassName = '') => (
    <div className={`daily-card ${extraClassName}`.trim()}>
      <div className="daily-card-head">
        <p className="eyebrow">{t('daily.eyebrow')}</p>
      </div>

      {isSignedIn && savedDailyTarot ? (
        <div className="daily-result">
          <p className="daily-result-label">{t('daily.resultLabel')}</p>
          <div className="daily-result-name">
            <span>{savedDailyTarot.name}{savedDailyTarot.isReversed ? `${t('common.dateSeparator')}${t('common.orientationReversed')}` : `${t('common.dateSeparator')}${t('common.orientationUpright')}`}</span>
            <small>{getCardDisplayNames(savedDailyTarot).englishName}</small>
          </div>
          <p className="daily-result-note">{t('daily.signedNote')}</p>
        </div>
      ) : (
        <div className="daily-result">
          <p className="daily-result-label">{t('daily.checkInLabel')}</p>
          <p className="daily-result-note">{t('daily.unsignedNote')}</p>
        </div>
      )}

      <button
        type="button"
        onClick={isSignedIn ? openDailyFortuneModal : handleDailySignIn}
        className="primary-button daily-button"
      >
        <Sparkles className="w-5 h-5" />
        <span>{isSignedIn ? t('daily.openToday') : t('daily.getToday')}</span>
      </button>
    </div>
  );
  const renderHistoryModal = () => {
    if (!showHistoryModal || !selectedHistoryReading) return null;

    return (
      <motion.div className="modal-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistoryModal(false)}>
        <motion.div
          className="calendar-modal history-preview-modal"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="calendar-modal-head">
            <div>
              <p className="eyebrow">{t('history.eyebrow')}</p>
              <h3 className="fortune-modal-title">{t('history.title')}</h3>
            </div>
            <button type="button" onClick={() => setShowHistoryModal(false)} className="icon-button">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="history-preview-copy">
            <p className="history-preview-question">{t('history.questionLabel', { question: selectedHistoryReading.question })}</p>
            <p className="history-preview-spread">{t('history.spreadLabel', { spread: selectedHistoryReading.spreadName })}</p>
          </div>

          {renderSpreadCards(selectedHistoryReading.cardsData, selectedHistoryReading.spreadKey, {
            isRevealed: true,
            className: 'history-preview-spread',
          })}
        </motion.div>
      </motion.div>
    );
  };

  const renderHumanRequestModal = () => {
    if (!showHumanRequestModal) return null;

    return (
      <motion.div className="modal-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHumanRequestModal(false)}>
        <motion.div
          className="calendar-modal human-request-modal"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="calendar-modal-head">
            <div>
              <p className="eyebrow">{OFFICIAL_READER.englishLabel}</p>
              <h3 className="fortune-modal-title">{t('humanRequest.title')}</h3>
            </div>
            <button type="button" onClick={() => setShowHumanRequestModal(false)} className="icon-button">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="human-request-copy">{t('humanRequest.copy')}</p>

          <div className="human-request-list">
            {recentReadings.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSelectedHumanReadingId(entry.id)}
                className={`human-request-item ${selectedHumanReadingId === entry.id ? 'human-request-item-active' : ''}`}
              >
                <p className="human-request-question">{`"${entry.question}"`}</p>
                <p className="human-request-meta">{formatHistorySummary(entry, t)}</p>
              </button>
            ))}
          </div>

          <div className="human-request-actions">
            <button type="button" onClick={() => setShowHumanRequestModal(false)} className="secondary-button">
              {t('humanRequest.thinkAgain')}
            </button>
            <button
              type="button"
              onClick={handleSubmitHumanRequest}
              disabled={!selectedHumanReadingId || coinBalance < 10}
              className="primary-button"
            >
              <MessageCircle className="w-5 h-5" />
              {coinBalance < 10 ? t('humanRequest.notEnoughCoins') : t('humanRequest.sendButton')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderForgotPasswordModal = () => {
    if (!showForgotPasswordModal) return null;

    return (
      <motion.div className="modal-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForgotPasswordModal(false)}>
        <motion.div
          className="calendar-modal forgot-password-modal"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="calendar-modal-head">
            <div>
              <p className="eyebrow">{t('auth.forgotPasswordEyebrow')}</p>
              <h3 className="fortune-modal-title">{t('auth.forgotPasswordTitle')}</h3>
            </div>
            <button type="button" onClick={() => setShowForgotPasswordModal(false)} className="icon-button">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="human-request-copy">{t('auth.forgotPasswordCopy')}</p>
          <label className="field-shell">
            <Mail className="field-icon" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              className="field-input"
            />
          </label>

          <div className="human-request-actions">
            <button type="button" onClick={() => setShowForgotPasswordModal(false)} className="secondary-button">
              {t('common.cancel')}
            </button>
            <button type="button" onClick={handleForgotPassword} className="primary-button">
              {t('auth.sendResetEmail')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (!user) {
    return (
      <div className={`screen-shell auth-screen theme-${theme}`}>
        <div className="orb orb-left" />
        <div className="orb orb-right" />
        <motion.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="auth-toggles">
            <LanguageSwitcher />
            {renderThemeToggle('auth-theme-toggle')}
          </div>
          <h1 className="hero-title">bingbing&apos;s tarot</h1>
          <p className="hero-subtitle">
            {isRecoveryMode
              ? t('auth.recoverySubtitle')
              : isSessionSyncing && !hasAuthDraft
                ? t('auth.syncingSubtitle')
                : isLogin
                  ? t('auth.loginSubtitle')
                  : t('auth.registerSubtitle')}
          </p>


          <div className="auth-form">
            <label className="field-shell">
              <Mail className="field-icon" />
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(event) => {
                  authInteractionRef.current = true;
                  setEmail(event.target.value);
                  if (isSessionSyncing) setIsSessionSyncing(false);
                }}
                onInput={() => {
                  if (autofillSyncTimeoutRef.current) clearTimeout(autofillSyncTimeoutRef.current);
                  if (isSessionSyncing) setIsSessionSyncing(false);
                  autofillSyncTimeoutRef.current = setTimeout(syncAuthInputValues, 0);
                }}
                onFocus={() => {
                  authInteractionRef.current = true;
                  if (isSessionSyncing) setIsSessionSyncing(false);
                }}
                placeholder={t('auth.emailPlaceholder')}
                className="field-input"
              />
            </label>

            {!isLogin && !isRecoveryMode ? (
              <label className="field-shell">
                <User className="field-icon" />
                <input type="text" value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder={t('auth.nicknamePlaceholder')} className="field-input" />
              </label>
            ) : null}

            <label className="field-shell">
              <Lock className="field-icon" />
              <input
                ref={passwordInputRef}
                type="password"
                value={isRecoveryMode ? resetPasswordValue : password}
                onChange={(event) => {
                  authInteractionRef.current = true;
                  if (isRecoveryMode) {
                    setResetPasswordValue(event.target.value);
                  } else {
                    setPassword(event.target.value);
                  }
                  if (isSessionSyncing) setIsSessionSyncing(false);
                }}
                onInput={() => {
                  if (autofillSyncTimeoutRef.current) clearTimeout(autofillSyncTimeoutRef.current);
                  if (isSessionSyncing) setIsSessionSyncing(false);
                  autofillSyncTimeoutRef.current = setTimeout(syncAuthInputValues, 0);
                }}
                onFocus={() => {
                  authInteractionRef.current = true;
                  if (isSessionSyncing) setIsSessionSyncing(false);
                }}
                placeholder={isRecoveryMode ? t('auth.newPasswordPlaceholder') : t('auth.passwordPlaceholder')}
                className="field-input"
                onKeyDown={(event) =>
                  event.key === 'Enter' &&
                  (isRecoveryMode ? handleCompletePasswordReset() : isLogin ? handleLogin() : handleRegister())
                }
              />
            </label>

            <button
              type="button"
              onClick={isRecoveryMode ? handleCompletePasswordReset : isLogin ? handleLogin : handleRegister}
              className="primary-button"
            >
              {isRecoveryMode ? t('auth.updatePasswordButton') : isLogin ? t('auth.loginButton') : t('auth.registerButton')}
            </button>

            {isLogin && !isRecoveryMode ? (
              <button type="button" onClick={() => setShowForgotPasswordModal(true)} className="text-button forgot-password-link">
                {t('auth.forgotPasswordLink')}
              </button>
            ) : null}

            {isRecoveryMode ? (
              <p className="switch-text">
                {t('auth.recoverySubtitle')}
                <span
                  onClick={() => {
                    setIsRecoveryMode(false);
                    setResetPasswordValue('');
                    setPassword('');
                  }}
                  className="switch-link"
                >
                  {t('auth.backToLogin')}
                </span>
              </p>
            ) : (
              <p className="switch-text">
                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                <span
                  onClick={() => {
                    setIsLogin((current) => !current);
                    setEmail('');
                    setNickname('');
                    setPassword('');
                    setResetPasswordValue('');
                    setShowForgotPasswordModal(false);
                  }}
                  className="switch-link"
                >
                  {isLogin ? t('auth.goRegister') : t('auth.goLogin')}
                </span>
              </p>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {showForgotPasswordModal && renderForgotPasswordModal()}
        </AnimatePresence>
      </div>
    );
  }

  if (currentPage === 'home') {
    return (
      <div className={`screen-shell home-screen theme-${theme}`}>
        <div className="orb orb-left" />
        <div className="orb orb-right" />

        <header className="topbar">
          <div>
            <p className="eyebrow">{t('home.eyebrow')}</p>
            <h1 className="topbar-title">{t('common.appName')}</h1>
          </div>
          <div className="topbar-actions">
            <LanguageSwitcher />
            {renderThemeToggle('topbar-theme-toggle')}
            <button type="button" onClick={() => setCurrentPage('messages')} className="icon-button">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
            </button>
            <div className="coin-pill">
              <Coins className="w-4 h-4" />
              <span>{coinBalance} {t('common.coins')}</span>
            </div>
            <button type="button" onClick={handleLogout} className="text-button">
              {t('home.logout')}
            </button>
          </div>
        </header>

        <main className="home-layout">
          <motion.section className="hero-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="hero-copy">
              <p className="hero-kicker">{t('home.heroKicker')}</p>
              <div className="hero-identity">
                <h2 className="hero-panel-title hero-panel-title-compact">{activeNickname}</h2>
              </div>
                <p className="hero-panel-text">
                  {dailyLine.text}
                  <span className="hero-panel-source">{` - ${dailyLine.source}`}</span>
                </p>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-label">{t('home.lastSignIn')}</span>
                <strong className="stat-value">{lastSignInDate || t('home.noLastSignIn')}</strong>
              </div>

              <button type="button" onClick={() => setShowCalendarModal(true)} className="stat-card calendar-stat-card">
                <span className="stat-label">{t('home.calendarLabel')}</span>
                <strong className="stat-value">{t('home.calendarAction')}</strong>
              </button>
            </div>
            <div className="history-card">
              {recentReadings.length > 0 ? (
                <div className="history-list">
                  {recentReadings.map((entry) => (
                    <article
                      key={entry.id}
                      className="history-item"
                      role="button"
                      tabIndex={0}
                      onClick={() => openHistoryModal(entry)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openHistoryModal(entry);
                        }
                      }}
                    >
                      <div className="history-item-head">
                        <p className="history-question">{`"${entry.question}"`}</p>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteRecentReading(entry.id);
                          }}
                          className="history-delete-button"
                          aria-label={t('home.deleteHistoryAria')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="history-cards">{formatHistorySummary(entry, t)}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="history-empty">
                  <p className="history-empty-title">{t('home.historyEmptyTitle')}</p>
                  <p className="history-empty-copy">{t('home.historyEmptyCopy')}</p>
                </div>
              )}
            </div>
          </motion.section>

          <motion.section className="action-panel" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }}>
            <div className="daily-card desktop-daily-card">
              <div className="daily-card-head">
                <p className="eyebrow">{t('daily.eyebrow')}</p>
              </div>

              {isSignedIn && savedDailyTarot ? (
                <div className="daily-result">
                  <p className="daily-result-label">{t('daily.resultLabel')}</p>
                  <div className="daily-result-name">
                    <span>{savedDailyTarot.name}{savedDailyTarot.isReversed ? `${t('common.dateSeparator')}${t('common.orientationReversed')}` : `${t('common.dateSeparator')}${t('common.orientationUpright')}`}</span>
                    <small>{getCardDisplayNames(savedDailyTarot).englishName}</small>
                  </div>
                  <p className="daily-result-note">{t('daily.signedPanelNote')}</p>
                </div>
              ) : (
                <div className="daily-result">
                  <p className="daily-result-label">{t('daily.checkInLabel')}</p>
                  <p className="daily-result-note">{t('daily.unsignedPanelNote')}</p>
                </div>
              )}

              <button
                type="button"
                onClick={isSignedIn ? openDailyFortuneModal : handleDailySignIn}
                className="primary-button daily-button"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isSignedIn ? t('daily.openToday') : t('daily.getToday')}</span>
              </button>
            </div>

            <div className="action-grid">
              <button type="button" onClick={handleStartFreeReading} className="feature-card feature-card-light">
                <span className="feature-eyebrow">{t('home.freeReadingEyebrow')}</span>
                <strong className="feature-title">{t('home.freeReadingTitle')}</strong>
                <p className="feature-copy">{t('home.freeReadingCopy')}</p>
              </button>

              <button type="button" onClick={openHumanRequestModal} className="feature-card feature-card-dark">
                <span className="feature-eyebrow">{OFFICIAL_READER.englishLabel}</span>
                <strong className="feature-title">{t('home.humanReadingTitle')}</strong>
                <p className="feature-copy">{t('home.humanReadingCopy')}</p>
              </button>
            </div>

          </motion.section>
        </main>

        <AnimatePresence>
          {showHistoryModal && renderHistoryModal()}
        </AnimatePresence>

        <AnimatePresence>
          {showHumanRequestModal && renderHumanRequestModal()}
        </AnimatePresence>

        <AnimatePresence>
          {showSpreadModal && (
            <motion.div className="modal-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSpreadModal(false)}>
              <motion.div
                className="spread-modal"
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="calendar-modal-head">
                  <div>
                    <p className="eyebrow">{t('spreads.chooseEyebrow')}</p>
                    <h3 className="fortune-modal-title">{t('spreads.chooseTitle')}</h3>
                  </div>
                  <button type="button" onClick={() => setShowSpreadModal(false)} className="icon-button">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="spread-option-grid">
                  {spreadOptions.map((spread) => (
                    <button key={spread.key} type="button" className="spread-option-card" onClick={() => handleSelectSpread(spread.key)}>
                      <div className={`spread-option-preview spread-option-preview-${spread.key}`}>
                        {spread.preview.map((label, index) => (
                          <span key={`${spread.key}-${index}`} className={`spread-option-chip spread-option-chip-${spread.key}-${index + 1}`}>
                            {label}
                          </span>
                        ))}
                      </div>
                      <strong className="spread-option-title">{spread.name}</strong>
                      <p className="spread-option-copy">{spread.description}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDailyResult && activeDailyCard && (
            <motion.div className="modal-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDailyResult(false)}>
              <motion.div
                className="fortune-modal"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                onClick={(event) => event.stopPropagation()}
              >
                <p className="eyebrow">{formatDailyFortuneDate(intlLocale)} {t('daily.modalSuffix')}</p>
                <div className="fortune-modal-tarot">
                  <TarotCard
                    card={activeDailyCard}
                    isRevealed
                    size="normal"
                    showOrientation={false}
                    variant="artwork"
                    rotateReversed
                  />
                </div>
                <div className="fortune-modal-card">
                  <span>{activeDailyCard.name}{activeDailyCard.isReversed ? `${t('common.dateSeparator')}${t('common.orientationReversed')}` : `${t('common.dateSeparator')}${t('common.orientationUpright')}`}</span>
                  <small>{getCardDisplayNames(activeDailyCard).englishName}</small>
                </div>
                <p className="fortune-modal-keywords">{t('daily.keywords', { keywords: dailyFortuneKeywords.join(' / ') })}</p>
                <p className="fortune-modal-note">{getDailyFortuneSummary(activeDailyCard)}</p>
                <button type="button" onClick={() => setShowDailyResult(false)} className="primary-button">
                  {t('daily.acknowledge')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCalendarModal && (
            <motion.div className="modal-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCalendarModal(false)}>
              <motion.div
                className="calendar-modal"
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="calendar-modal-head">
                  <div>
                    <p className="eyebrow">{t('calendar.eyebrow')}</p>
                    <h3 className="fortune-modal-title">{t('calendar.title')}</h3>
                  </div>
                  <button type="button" onClick={() => setShowCalendarModal(false)} className="icon-button">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="calendar-month-label">{getMonthLabel(intlLocale, calendarDate)}</p>
                <div className="calendar-weekdays">
                  {t('calendar.weekdays').map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>

                <div className="calendar-grid">
                  {calendarDays.map((item) => {
                    if (item.type === 'blank') {
                      return <div key={item.key} className="calendar-day calendar-day-blank" />;
                    }

                    const card = dailyHistory[item.dateKey];

                    return (
                      <div key={item.key} className={`calendar-day ${card ? 'calendar-day-signed' : ''}`.trim()}>
                        <span className="calendar-day-number">{item.day}</span>
                        {card ? (
                          <span className="calendar-day-card">
                            {card.name}
                            {card.isReversed ? `${t('common.dateSeparator')}${t('common.orientationReversed')}` : ''}
                          </span>
                        ) : (
                          <span className="calendar-day-empty">{t('calendar.unsigned')}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (currentPage === 'drawing-input') {
    return (
      <div className={`screen-shell page-shell theme-${theme}`}>
        <header className="page-header">
          <button type="button" onClick={goHome} className="icon-button">
            <X className="w-5 h-5" />
          </button>
          <h1 className="page-title">{isHumanMode ? t('drawing.humanTitle') : t('drawing.freeTitle')}</h1>
          <div className="page-header-controls">
            <LanguageSwitcher />
            {renderThemeToggle()}
          </div>
        </header>

        <main className="page-content">
          <div className="question-panel">
            <p className="eyebrow">{isHumanMode ? t('drawing.humanTitle') : activeSpread.name}</p>
            <h2 className="question-title">{isHumanMode ? t('drawing.humanQuestionTitle') : t('drawing.chooseSpreadTitle', { spread: activeSpread.name })}</h2>
            <p className="question-note">{isHumanMode ? t('drawing.humanQuestionNote') : activeSpread.summary}</p>
            <textarea
              value={userQuestion}
              onChange={(event) => setUserQuestion(event.target.value)}
              placeholder={t('drawing.questionPlaceholder')}
              className="question-input"
              rows={5}
              autoFocus
            />
            <button type="button" onClick={handleConfirmQuestion} disabled={!userQuestion.trim()} className="primary-button">
              {t('drawing.confirmAndDraw')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (currentPage === 'drawing') {
    return (
      <div className={`screen-shell page-shell theme-${theme}`}>
        <header className="page-header">
          <button type="button" onClick={goHome} className="icon-button">
            <X className="w-5 h-5" />
          </button>
          <h1 className="page-title">{t('drawing.resultTitle')}</h1>
          <div className="page-header-controls">
            <LanguageSwitcher />
            {renderCardStyleToggle()}
            {renderThemeToggle()}
          </div>
        </header>

        <main className="page-content reading-page-content">
          <div className="reading-layout">
          <section className="reading-question-card">
            <p className="eyebrow">{isHumanMode ? t('drawing.humanTitle') : activeSpread.name}</p>
            <p className="reading-question-text">{`"${userQuestion}"`}</p>
          </section>

          {renderSpreadCards()}

          {readingComplete && (
            <motion.section className="reading-result-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="reading-result-lead">{readingLead}</p>
              <p className="reading-result-text">
                {readingBody}
                <span className="reading-cursor">|</span>
              </p>

              <div className="reading-actions">
                {isHumanMode ? (
                  <button type="button" onClick={openHumanRequestModal} className="primary-button">
                    <MessageCircle className="w-5 h-5" />
                    {t('humanRequest.sendReadingButton')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openHumanRequestModal}
                    className="primary-button"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t('drawing.sendToReader')}
                  </button>
                )}
                <button type="button" onClick={goHome} className="secondary-button">
                  {t('drawing.backHome')}
                </button>
              </div>
            </motion.section>
          )}
          </div>
        </main>

        <AnimatePresence>
          {showHumanRequestModal && renderHumanRequestModal()}
        </AnimatePresence>
      </div>
    );
  }

  if (currentPage === 'chat') {
    return (
      <div className={`screen-shell page-shell theme-${theme}`}>
        <header className="page-header">
          <button
            type="button"
            onClick={() => {
              setCurrentPage('home');
              setCurrentChatId(null);
              setIsWaitingForReply(false);
            }}
            className="icon-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="page-title">{t('chat.title')}</h1>
          <div className="page-header-controls">
            <LanguageSwitcher />
            {renderThemeToggle()}
          </div>
        </header>

        <main className="chat-layout">
          <section className="chat-summary">
            <p className="eyebrow">{t('drawing.questionEyebrow')}</p>
            <p className="chat-question">{`"${userQuestion}"`}</p>
                <div className="chat-cards">
                  {drawnCards.map((card, index) => (
                    <div key={index} className="chat-card-pill">
                      <span>{card.name}</span>
                      {card.isReversed && <small>{t('common.orientationReversed')}</small>}
                    </div>
                  ))}
                </div>
          </section>

          <section className="chat-thread">
            {messages.map((message) => (
              <motion.div key={message.id} className={`message-row ${message.sender === 'user' ? 'message-row-user' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className={`message-bubble ${message.sender === 'user' ? 'message-bubble-user' : ''}`}>{message.text}</div>
              </motion.div>
            ))}

            {isWaitingForReply && messages.length === 0 && <p className="chat-waiting">{t('chat.waiting')}</p>}
          </section>
        </main>

        <footer className="chat-footer">
          <input
            type="text"
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder={t('chat.placeholder')}
            className="chat-input"
            onKeyDown={(event) => event.key === 'Enter' && handleSendMessage()}
          />
          <button type="button" onClick={handleSendMessage} className="icon-button dark-icon-button">
            <Send className="w-5 h-5" />
          </button>
        </footer>
      </div>
    );
  }

  if (currentPage === 'messages') {
    return (
      <div className={`screen-shell page-shell theme-${theme}`}>
        <header className="page-header">
          <button type="button" onClick={() => setCurrentPage('home')} className="icon-button">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="page-title">{t('mailbox.pageTitle')}</h1>
          <div className="page-header-controls">
            <LanguageSwitcher />
            {renderThemeToggle()}
          </div>
        </header>

        <main className="page-content">
          <div className="mailbox-layout">
            <section className="question-panel mailbox-list-panel">
              <p className="eyebrow">{user?.id === OFFICIAL_READER_ID ? t('mailbox.adminEyebrow') : t('mailbox.userEyebrow')}</p>
              <h2 className="question-title">{user?.id === OFFICIAL_READER_ID ? t('mailbox.adminTitle') : t('mailbox.userTitle')}</h2>
              <p className="question-note">
                {user?.id === OFFICIAL_READER_ID
                  ? t('mailbox.adminNote')
                  : unreadCount > 0
                    ? t('mailbox.userUnreadNote', { count: unreadCount })
                    : t('mailbox.userEmptyNote')}
              </p>

              {user?.id !== OFFICIAL_READER_ID && systemNotifications.length > 0 ? (
                <div className="system-notification-list">
                  {systemNotifications.map((notification) => (
                    <article key={notification.id} className="system-notification-card">
                      <div className="mailbox-item-head">
                        <strong>{notification.title || t('common.systemMessage')}</strong>
                        <span>{getSystemNotificationStatusLabel(notification.status, t)}</span>
                      </div>
                      <p className="mailbox-item-question">{notification.body}</p>
                      <div className="mailbox-action-row">
                        <span className="mailbox-item-hint">
                          {notification.status === 'claimed'
                            ? t('mailbox.systemClaimedHint', { coins: notification.reward_coins || 99 })
                            : t('mailbox.systemPendingHint', { coins: notification.reward_coins || 99 })}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleClaimSystemNotification(notification)}
                          className={notification.status === 'claimed' ? 'secondary-button' : 'primary-button'}
                        >
                          {notification.status === 'claimed' ? t('mailbox.claimedSubsidy') : t('mailbox.claimSubsidy')}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

              <div className="mailbox-item-list">
                {mailboxItems.length > 0 ? (
                  mailboxItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`mailbox-item-card ${selectedMailboxItem?.id === item.id ? 'mailbox-item-card-active' : ''}`}
                      onClick={() => handleOpenMailboxItem(item)}
                    >
                      <div className="mailbox-item-head">
                        <strong>{getMailboxStatusLabel(item.status, t)}</strong>
                        <span>{new Date(item.created_at).toLocaleString(intlLocale)}</span>
                      </div>
                      {user?.id === OFFICIAL_READER_ID ? (
                        <p className="mailbox-item-hint">{t('mailbox.fromLabel', { name: item.sender_nickname || t('common.unknownUser') })}</p>
                      ) : null}
                      <p className="mailbox-item-question">{item.initial_question || t('mailbox.noQuestion')}</p>
                      <p className="mailbox-item-hint">{getMailboxStatusHint(item.status, t)}</p>
                    </button>
                  ))
                ) : (
                  <div className="mailbox-empty">
                    <p className="mailbox-empty-title">{t('mailbox.emptyTitle')}</p>
                    <p className="mailbox-empty-copy">
                      {user?.id === OFFICIAL_READER_ID ? t('mailbox.adminEmptyCopy') : t('mailbox.userEmptyCopy')}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="question-panel mailbox-detail-panel">
              {selectedMailboxItem ? (
                <>
                  <p className="eyebrow">{user?.id === OFFICIAL_READER_ID ? t('mailbox.detailEyebrowAdmin') : t('mailbox.detailEyebrowUser')}</p>
                  <h2 className="question-title">{getMailboxStatusLabel(selectedMailboxItem.status, t)}</h2>
                  <p className="question-note">{getMailboxStatusHint(selectedMailboxItem.status, t)}</p>

                  {user?.id === OFFICIAL_READER_ID ? (
                    <div className="mailbox-detail-block">
                      <span className="mailbox-detail-label">{t('mailbox.senderLabel')}</span>
                      <p className="mailbox-detail-text">{selectedMailboxItem.sender_nickname || t('common.unknownUser')}</p>
                    </div>
                  ) : null}

                  <div className="mailbox-detail-block">
                    <span className="mailbox-detail-label">{t('mailbox.initialQuestionLabel')}</span>
                    <p className="mailbox-detail-text">{selectedMailboxItem.initial_question || t('common.emptyContent')}</p>
                  </div>

                  {selectedMailboxItem.record_snapshot?.cardsData?.length ? (
                    <div className="mailbox-detail-block">
                      <span className="mailbox-detail-label">{t('mailbox.spreadLabel')}</span>
                      <p className="mailbox-detail-text">
                        {selectedMailboxItem.record_snapshot.spreadName || getSpreadConfig(selectedMailboxItem.record_snapshot.spreadKey || 'three', t).name}
                      </p>
                      {renderSpreadCards(
                        selectedMailboxItem.record_snapshot.cardsData,
                        selectedMailboxItem.record_snapshot.spreadKey || 'three',
                        {
                          isRevealed: true,
                          className: 'history-preview-spread mailbox-detail-spread',
                        },
                      )}
                    </div>
                  ) : null}

                  {selectedMailboxItem.reject_reason ? (
                    <div className="mailbox-detail-block">
                      <span className="mailbox-detail-label">{t('mailbox.rejectReasonLabel')}</span>
                      <p className="mailbox-detail-text">{selectedMailboxItem.reject_reason}</p>
                    </div>
                  ) : null}

                  {selectedMailboxItem.initial_reply ? (
                    <div className="mailbox-detail-block">
                      <span className="mailbox-detail-label">{t('mailbox.initialReplyLabel')}</span>
                      <p className="mailbox-detail-text">{selectedMailboxItem.initial_reply}</p>
                    </div>
                  ) : null}

                  {selectedMailboxItem.follow_up_ask ? (
                    <div className="mailbox-detail-block">
                      <span className="mailbox-detail-label">{t('mailbox.followUpAskLabel')}</span>
                      <p className="mailbox-detail-text">{selectedMailboxItem.follow_up_ask}</p>
                    </div>
                  ) : null}

                  {selectedMailboxItem.follow_up_reply ? (
                    <div className="mailbox-detail-block">
                      <span className="mailbox-detail-label">{t('mailbox.followUpReplyLabel')}</span>
                      <p className="mailbox-detail-text">{selectedMailboxItem.follow_up_reply}</p>
                    </div>
                  ) : null}

                  {selectedMailboxItem.feedback ? (
                    <div className="mailbox-detail-block">
                      <span className="mailbox-detail-label">{t('mailbox.feedbackLabel')}</span>
                      <p className="mailbox-detail-text">{selectedMailboxItem.feedback === 'Heart' ? t('mailbox.heartLabel') : t('mailbox.spadeLabel')}</p>
                    </div>
                  ) : null}

                  {user?.id === OFFICIAL_READER_ID ? (
                    <div className="mailbox-admin-actions">
                      {(selectedMailboxItem.status === 'pending' || selectedMailboxItem.status === 'read') ? (
                        <>
                          <label className="mailbox-field">
                            <span className="mailbox-detail-label">{t('mailbox.rejectReasonLabel')}</span>
                            <textarea
                              value={adminRejectReason}
                              onChange={(event) => setAdminRejectReason(event.target.value)}
                              placeholder={t('mailbox.rejectReasonPlaceholder')}
                              className="chat-input mailbox-textarea"
                              rows={4}
                            />
                          </label>

                          <label className="mailbox-field">
                            <div className="mailbox-field-head">
                              <span className="mailbox-detail-label">{t('mailbox.initialReplyLabel')}</span>
                              <span className="mailbox-char-count">{adminInitialReply.length}/1000</span>
                            </div>
                            <textarea
                              value={adminInitialReply}
                              onChange={(event) => setAdminInitialReply(event.target.value.slice(0, 1000))}
                              placeholder={t('mailbox.initialReplyPlaceholder')}
                              className="chat-input mailbox-textarea"
                              rows={8}
                            />
                          </label>

                          <div className="mailbox-action-row">
                            <button type="button" onClick={handleAdminReject} className="secondary-button">
                              {t('mailbox.rejectAndRefund')}
                            </button>
                            <button type="button" onClick={handleAdminReply} className="primary-button">
                              {t('mailbox.sendInitialReply')}
                            </button>
                          </div>
                        </>
                      ) : null}

                      {selectedMailboxItem.status === 'follow_up' ? (
                        <>
                          <label className="mailbox-field">
                            <div className="mailbox-field-head">
                              <span className="mailbox-detail-label">{t('mailbox.followUpReplyLabel')}</span>
                              <span className="mailbox-char-count">{adminFollowUpReply.length}/1000</span>
                            </div>
                            <textarea
                              value={adminFollowUpReply}
                              onChange={(event) => setAdminFollowUpReply(event.target.value.slice(0, 1000))}
                              placeholder={t('mailbox.followUpReplyPlaceholder')}
                              className="chat-input mailbox-textarea"
                              rows={8}
                            />
                          </label>

                          <div className="mailbox-action-row">
                            <button type="button" onClick={handleAdminFollowUpReply} className="primary-button">
                              {t('mailbox.sendFollowUpReply')}
                            </button>
                          </div>
                        </>
                      ) : null}
                    </div>
                  ) : selectedMailboxItem.status === 'replied' ? (
                    <div className="mailbox-user-actions">
                      <label className="mailbox-field">
                        <div className="mailbox-field-head">
                          <span className="mailbox-detail-label">{t('mailbox.followUpAskLabel')}</span>
                          <span className="mailbox-char-count">{userFollowUpAsk.length}/100</span>
                        </div>
                        <p className="mailbox-detail-text">
                          {t('mailbox.followUpAskHint')}
                        </p>
                        <textarea
                          value={userFollowUpAsk}
                          onChange={(event) => setUserFollowUpAsk(event.target.value.slice(0, 100))}
                          placeholder={t('mailbox.followUpAskPlaceholder')}
                          className="chat-input mailbox-textarea mailbox-textarea-short"
                          rows={4}
                        />
                      </label>

                      <div className="mailbox-detail-block">
                        <span className="mailbox-detail-label">{t('mailbox.feedbackPrompt')}</span>
                      </div>

                      <div className="mailbox-action-row">
                        <button type="button" onClick={() => handleUserFeedback('Heart')} className="secondary-button">
                          {t('mailbox.satisfied')}
                        </button>
                        <button type="button" onClick={() => handleUserFeedback('Spade')} className="secondary-button">
                          {t('mailbox.dissatisfied')}
                        </button>
                        <button type="button" onClick={handleUserFollowUp} className="primary-button">
                          {t('mailbox.sendFollowUp')}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="mailbox-empty mailbox-empty-detail">
                  <p className="mailbox-empty-title">{t('mailbox.openFirstTitle')}</p>
                  <p className="mailbox-empty-copy">
                    {user?.id === OFFICIAL_READER_ID ? t('mailbox.pendingOpenHintAdmin') : t('mailbox.pendingOpenHintUser')}
                  </p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

export default App;

