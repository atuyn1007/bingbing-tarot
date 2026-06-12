import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { allTarotCards, drawThreeCards, getCardData, getCardDisplayNames, getCardReading } from './data';
import AppLoading from './components/AppLoading';
import { getIntlLocale, useI18n } from './i18n';
import { OFFICIAL_READER_ID, OFFICIAL_READER_NICKNAME } from './constants/readers';
import { loadSupabaseAppModule, loadSupabaseClientModule, loadSupabaseTarotModule } from './services/lazySupabase';
import { getLocalizedTarotKeywords, getLocalizedTarotReading } from './tarotKeywordTranslations';
import { isSessionExpiredAt } from './sessionUtils';

const AuthPage = lazy(() => import('./pages/AuthPage.jsx'));
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const DrawingPage = lazy(() => import('./pages/DrawingPage.jsx'));
const ResultPage = lazy(() => import('./pages/ResultPage.jsx'));
const ChatPage = lazy(() => import('./pages/ChatPage.jsx'));
const MessagesPage = lazy(() => import('./pages/MessagesPage.jsx'));
const HistoryModal = lazy(() => import('./components/modals/HistoryModal.jsx'));
const DailyModal = lazy(() => import('./components/modals/DailyModal.jsx'));
const CalendarModal = lazy(() => import('./components/modals/CalendarModal.jsx'));
const HumanRequestModal = lazy(() => import('./components/modals/HumanRequestModal.jsx'));
const ForgotPasswordModal = lazy(() => import('./components/modals/ForgotPasswordModal.jsx'));
const SpreadModal = lazy(() => import('./components/modals/SpreadModal.jsx'));

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

function buildSpreadReading(cards, question, spread, t, language) {
  const lead = t('drawing.readingLead', { spread: spread.name });
  const cardNames = cards.map((card) => formatSpreadCardName(card, t)).join(t('common.listSeparator'));
  const positionLines = cards.map((card, index) => {
    const position = spread.positions[index];
    const label = position?.title || t('drawing.spreadLabelFallback', { index: index + 1 });
    const data = resolveCardData(card);
    return t('drawing.positionLine', {
      label,
      card: formatSpreadCardName(card, t),
      reading: getLocalizedTarotReading(data, card?.isReversed, language, getCardReading({ ...card, id: data.id })),
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

function buildHumanReading(cards, question, t, language) {
  const cardNames = cards.map((card) => formatSpreadCardName(card, t)).join(t('common.listSeparator'));
  const lines = cards.map((card, index) => {
    const data = resolveCardData(card);
    return t('drawing.humanCardLine', {
      index: index + 1,
      card: formatSpreadCardName(card, t),
      reading: getLocalizedTarotReading(data, card?.isReversed, language, getCardReading({ ...card, id: data.id })),
    });
  });

  return [t('drawing.humanFirst', { cards: cardNames }), ...lines, t('drawing.humanClosing', { question })].join('\n\n');
}

function App() {
  const { language, t } = useI18n();
  const intlLocale = getIntlLocale(language);
  const getSupabaseApp = () => loadSupabaseAppModule();
  const getSupabaseTarot = () => loadSupabaseTarotModule();
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
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
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
  const [redeemCodeValue, setRedeemCodeValue] = useState('');
  const [isRedeemingCode, setIsRedeemingCode] = useState(false);
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
  const selectedHistorySpread = selectedHistoryReading ? getSpreadConfig(selectedHistoryReading.spreadKey, t) : null;
  const spreadForCards = getSpreadConfig(isHumanMode ? 'three' : activeSpread.key, t);
  const monthLabel = getMonthLabel(intlLocale, calendarDate);
  const suspenseFallback = <AppLoading theme={theme} />;
  const formatHistorySummaryLabel = (entry) => formatHistorySummary(entry, t);
  const mailboxStatusLabel = (status) => getMailboxStatusLabel(status, t);
  const mailboxStatusHint = (status) => getMailboxStatusHint(status, t);
  const spreadConfigByKey = (spreadKey) => getSpreadConfig(spreadKey, t);

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
    setIsSubmittingAuth(false);
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
    setRedeemCodeValue('');
    setIsRedeemingCode(false);
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
      const { ensureProfile, getLocalDateKey } = await getSupabaseApp();
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
      return profile;
    } catch (error) {
      console.error('Failed to load profile after auth:', error);
      setIsAuthReady(true);
      throw error;
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
      const { getAuthSession, refreshAuthSession, getAuthenticatedUser, logoutFromSupabase } = await getSupabaseApp();
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
      const { saveSpreadHistoryRecord } = await getSupabaseTarot();
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
      const { saveSpreadHistoryRecord } = await getSupabaseTarot();
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
        const { getAuthSession, refreshAuthSession, getAuthenticatedUser, logoutFromSupabase } = await getSupabaseApp();
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
    let unsubscribe = () => {};

    void (async () => {
      const [{ supabase }, { logoutFromSupabase }] = await Promise.all([
        loadSupabaseClientModule(),
        getSupabaseApp(),
      ]);

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

      unsubscribe = () => subscription.unsubscribe();
    })();

    return () => unsubscribe();
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
      const { registerWithEmail } = await getSupabaseApp();
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
    if (isSubmittingAuth) return;

    syncAuthInputValues();
    authInteractionRef.current = true;

    const submittedEmail = (emailInputRef.current?.value || email || '').trim();
    const submittedPassword = passwordInputRef.current?.value || password || '';

    if (!submittedEmail || !submittedPassword.trim()) {
      alert(t('alerts.loginMissing'));
      return;
    }

    try {
      setIsSubmittingAuth(true);
      const { loginWithEmail, getAuthenticatedUser } = await getSupabaseApp();
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
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      alert(t('alerts.forgotMissingEmail'));
      return;
    }

    try {
      const { requestPasswordReset } = await getSupabaseApp();
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
      const { updatePassword } = await getSupabaseApp();
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
      const { logoutFromSupabase } = await getSupabaseApp();
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
      const [{ getProfileById, getLocalDateKey, updateDailyProfile }, { saveTarotHistory }] = await Promise.all([
        getSupabaseApp(),
        getSupabaseTarot(),
      ]);
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

    return getLocalizedTarotKeywords(data.id, Boolean(card?.isReversed), language, keywords);
  };

  const getDailyFortuneSummary = (card) => {
    if (!card) return '';

    const data = resolveCardData(card);
    return getLocalizedTarotReading(data, card?.isReversed, language, getCardReading({ ...card, id: data.id }));
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
          setAiReading(isHumanMode ? buildHumanReading(cards, trimmedQuestion, t, language) : buildSpreadReading(cards, trimmedQuestion, spread, t, language));
        }, 1100);
      }, 260);
    }, 420);
  };

  const startPollingReply = (chatId) => {
    const pollInterval = setInterval(async () => {
      try {
        const { getRequestById } = await getSupabaseApp();
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
      const { createPendingMailboxMessage } = await getSupabaseApp();
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
      const { appendRequestMessage } = await getSupabaseApp();
      await appendRequestMessage(currentChatId, newMessage);
    } catch (error) {
      console.error(error);
    }
  };

  const refreshMailbox = async () => {
    if (!user?.id) return;

    const {
      listMailboxMessagesForAdmin,
      listMailboxMessagesForUser,
      listSystemNotificationsForUser,
    } = await getSupabaseApp();

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
        const { markMailboxMessageRead } = await getSupabaseApp();
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
      const { rejectMailboxMessage } = await getSupabaseApp();
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
      const { replyMailboxMessage } = await getSupabaseApp();
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
      const { completeMailboxFollowUpReply } = await getSupabaseApp();
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
      const { submitMailboxFollowUp } = await getSupabaseApp();
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
      const { completeMailboxFeedback } = await getSupabaseApp();
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
      const { claimSystemNotification } = await getSupabaseApp();
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

  const handleRedeemCode = async () => {
    const normalizedCode = redeemCodeValue.trim().toUpperCase();

    if (!normalizedCode) {
      alert(t('alerts.redeemMissing'));
      return;
    }

    try {
      setIsRedeemingCode(true);
      const { redeemCoinCode } = await getSupabaseApp();
      const result = await redeemCoinCode(normalizedCode);
      const nextBalance = result?.new_coin_balance ?? coinBalance;
      const rewardCoins = Number(result?.reward_coins || 0);

      setCoinBalance(nextBalance);
      setRedeemCodeValue('');
      persistProfileSnapshot({
        coinBalance: nextBalance,
        lastSignInDate,
        isSignedIn,
        savedDailyTarot,
        dailyHistory,
      });
      alert(t('alerts.redeemSuccess', { coins: rewardCoins }));
    } catch (error) {
      alert(error.message || t('alerts.redeemFailed'));
    } finally {
      setIsRedeemingCode(false);
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
    if (!readingComplete || drawnCards.length === 0) return;

    const nextReading = isHumanMode
      ? buildHumanReading(drawnCards, userQuestion.trim(), t, language)
      : buildSpreadReading(drawnCards, userQuestion.trim(), spreadForCards, t, language);

    if (nextReading !== aiReading) {
      setAiReading(nextReading);
    }
  }, [aiReading, drawnCards, isHumanMode, language, readingComplete, spreadForCards, t, userQuestion]);

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
  const handleBackFromChat = () => {
    setCurrentPage('home');
    setCurrentChatId(null);
    setIsWaitingForReply(false);
  };

  let currentView = null;

  if (!user) {
    currentView = (
      <AuthPage
        theme={theme}
        onThemeChange={setTheme}
        isRecoveryMode={isRecoveryMode}
        isSessionSyncing={isSessionSyncing}
        hasAuthDraft={hasAuthDraft}
        isLogin={isLogin}
        emailInputRef={emailInputRef}
        passwordInputRef={passwordInputRef}
        email={email}
        setEmail={setEmail}
        nickname={nickname}
        setNickname={setNickname}
        password={password}
        setPassword={setPassword}
        resetPasswordValue={resetPasswordValue}
        setResetPasswordValue={setResetPasswordValue}
        setIsSessionSyncing={setIsSessionSyncing}
        setShowForgotPasswordModal={setShowForgotPasswordModal}
        setIsRecoveryMode={setIsRecoveryMode}
        setIsLogin={setIsLogin}
        setShowForgotPasswordModalState={setShowForgotPasswordModal}
        syncAuthInputValues={syncAuthInputValues}
        autofillSyncTimeoutRef={autofillSyncTimeoutRef}
        authInteractionRef={authInteractionRef}
        handleCompletePasswordReset={handleCompletePasswordReset}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        isSubmittingAuth={isSubmittingAuth}
        t={t}
      />
    );
  } else if (currentPage === 'home') {
    currentView = (
      <HomePage
        theme={theme}
        onThemeChange={setTheme}
        t={t}
        activeNickname={activeNickname}
        unreadCount={unreadCount}
        coinBalance={coinBalance}
        onOpenMessages={() => setCurrentPage('messages')}
        onLogout={handleLogout}
        dailyLine={dailyLine}
        lastSignInDate={lastSignInDate}
        onOpenCalendar={() => setShowCalendarModal(true)}
        recentReadings={recentReadings}
        onOpenHistory={openHistoryModal}
        onDeleteHistory={deleteRecentReading}
        formatHistorySummary={formatHistorySummaryLabel}
        isSignedIn={isSignedIn}
        savedDailyTarot={savedDailyTarot}
        getCardDisplayNames={getCardDisplayNames}
        onDailyAction={isSignedIn ? openDailyFortuneModal : handleDailySignIn}
        onStartFreeReading={handleStartFreeReading}
        onOpenHumanRequest={openHumanRequestModal}
        redeemCodeValue={redeemCodeValue}
        setRedeemCodeValue={setRedeemCodeValue}
        onRedeemCode={handleRedeemCode}
        isRedeemingCode={isRedeemingCode}
      />
    );
  } else if (currentPage === 'drawing-input') {
    currentView = (
      <DrawingPage
        theme={theme}
        onThemeChange={setTheme}
        goHome={goHome}
        isHumanMode={isHumanMode}
        activeSpread={activeSpread}
        userQuestion={userQuestion}
        setUserQuestion={setUserQuestion}
        handleConfirmQuestion={handleConfirmQuestion}
        t={t}
      />
    );
  } else if (currentPage === 'drawing') {
    currentView = (
      <ResultPage
        theme={theme}
        onThemeChange={setTheme}
        cardStyle={cardStyle}
        setCardStyle={setCardStyle}
        goHome={goHome}
        t={t}
        isHumanMode={isHumanMode}
        activeSpread={activeSpread}
        userQuestion={userQuestion}
        drawnCards={drawnCards}
        spreadForCards={spreadForCards}
        isRevealing={isRevealing}
        readingComplete={readingComplete}
        readingLead={readingLead}
        readingBody={readingBody}
        onOpenHumanRequest={openHumanRequestModal}
      />
    );
  } else if (currentPage === 'chat') {
    currentView = (
      <ChatPage
        theme={theme}
        onThemeChange={setTheme}
        t={t}
        onBack={handleBackFromChat}
        userQuestion={userQuestion}
        drawnCards={drawnCards}
        messages={messages}
        isWaitingForReply={isWaitingForReply}
        messageText={messageText}
        setMessageText={setMessageText}
        handleSendMessage={handleSendMessage}
      />
    );
  } else if (currentPage === 'messages') {
    currentView = (
      <MessagesPage
        theme={theme}
        onThemeChange={setTheme}
        t={t}
        intlLocale={intlLocale}
        onBack={() => setCurrentPage('home')}
        user={user}
        officialReaderId={OFFICIAL_READER_ID}
        mailboxItems={mailboxItems}
        selectedMailboxItem={selectedMailboxItem}
        systemNotifications={systemNotifications}
        unreadCount={unreadCount}
        getMailboxStatusLabel={mailboxStatusLabel}
        getMailboxStatusHint={mailboxStatusHint}
        handleOpenMailboxItem={handleOpenMailboxItem}
        handleClaimSystemNotification={handleClaimSystemNotification}
        cardStyle={cardStyle}
        getSpreadConfig={spreadConfigByKey}
        adminRejectReason={adminRejectReason}
        setAdminRejectReason={setAdminRejectReason}
        adminInitialReply={adminInitialReply}
        setAdminInitialReply={setAdminInitialReply}
        adminFollowUpReply={adminFollowUpReply}
        setAdminFollowUpReply={setAdminFollowUpReply}
        userFollowUpAsk={userFollowUpAsk}
        setUserFollowUpAsk={setUserFollowUpAsk}
        handleAdminReject={handleAdminReject}
        handleAdminReply={handleAdminReply}
        handleAdminFollowUpReply={handleAdminFollowUpReply}
        handleUserFeedback={handleUserFeedback}
        handleUserFollowUp={handleUserFollowUp}
      />
    );
  }

  return (
    <Suspense fallback={suspenseFallback}>
      {currentView}

      {showForgotPasswordModal ? (
        <Suspense fallback={null}>
          <ForgotPasswordModal
            email={email}
            setEmail={setEmail}
            onClose={() => setShowForgotPasswordModal(false)}
            onSubmit={handleForgotPassword}
            t={t}
          />
        </Suspense>
      ) : null}

      {showHistoryModal && selectedHistoryReading && selectedHistorySpread ? (
        <Suspense fallback={null}>
          <HistoryModal
            reading={selectedHistoryReading}
            spread={selectedHistorySpread}
            cardStyle={cardStyle}
            onClose={() => setShowHistoryModal(false)}
            t={t}
          />
        </Suspense>
      ) : null}

      {showHumanRequestModal ? (
        <Suspense fallback={null}>
          <HumanRequestModal
            recentReadings={recentReadings}
            selectedHumanReadingId={selectedHumanReadingId}
            setSelectedHumanReadingId={setSelectedHumanReadingId}
            formatHistorySummary={formatHistorySummaryLabel}
            coinBalance={coinBalance}
            onClose={() => setShowHumanRequestModal(false)}
            onSubmit={handleSubmitHumanRequest}
            t={t}
          />
        </Suspense>
      ) : null}

      {showSpreadModal ? (
        <Suspense fallback={null}>
          <SpreadModal
            spreadOptions={spreadOptions}
            onClose={() => setShowSpreadModal(false)}
            onSelect={handleSelectSpread}
            t={t}
          />
        </Suspense>
      ) : null}

      {showDailyResult && activeDailyCard ? (
        <Suspense fallback={null}>
          <DailyModal
            card={activeDailyCard}
            intlLocale={intlLocale}
            keywords={dailyFortuneKeywords}
            summary={getDailyFortuneSummary(activeDailyCard)}
            onClose={() => setShowDailyResult(false)}
            t={t}
            getCardDisplayNames={getCardDisplayNames}
          />
        </Suspense>
      ) : null}

      {showCalendarModal ? (
        <Suspense fallback={null}>
          <CalendarModal
            monthLabel={monthLabel}
            calendarDays={calendarDays}
            dailyHistory={dailyHistory}
            onClose={() => setShowCalendarModal(false)}
            t={t}
          />
        </Suspense>
      ) : null}
    </Suspense>
  );
}

export default App;

