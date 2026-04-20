import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Bell, Coins, Lock, Mail, MessageCircle, Send, Sparkles, User, X } from 'lucide-react';
import TarotCard from './TarotCard';
import { allTarotCards, drawThreeCards, generateReading, getCardData, getCardDisplayNames, getCardReading } from './data';
import {
  appendRequestMessage,
  createRequest,
  ensureProfile,
  getAuthSession,
  getDisplaySignInDate,
  getLocalDateKey,
  getProfileById,
  getRequestById,
  listRequestsByUser,
  loginWithEmail,
  logoutFromSupabase,
  OFFICIAL_READER_NICKNAME,
  requestPasswordReset,
  registerWithEmail,
  updatePassword,
  updateCoinBalance,
  updateDailyProfile,
} from './supabaseApp';
import { supabase } from './supabaseClient';
import { saveTarotHistory } from './supabaseTarot';

const OFFICIAL_READER = {
  nickname: OFFICIAL_READER_NICKNAME,
  englishLabel: 'ask bb！',
  intro: '立刻马上联系饼饼为你解读！消耗10饼币。',
};

const DAILY_LINES = [
  { text: '且将新火试新茶，诗酒趁年华。', source: '苏轼《望江南》' },
  { text: '人闲桂花落，夜静春山空。', source: '王维《鸟鸣涧》' },
  { text: '吹灭读书灯，一身都是月。', source: '孙玉石《吹灭读书灯》' },
  { text: 'The readiness is all.', source: 'William Shakespeare' },
  { text: 'Hope is the thing with feathers.', source: 'Emily Dickinson' },
  { text: '凡是过往，皆为序章。', source: '《暴风雨》常见译句' },
  { text: '已识乾坤大，犹怜草木青。', source: '马一浮《旷怡亭口占》' },
  { text: '海内存知己，天涯若比邻。', source: '王勃《送杜少府之任蜀州》' },
  { text: 'The woods are lovely, dark and deep.', source: 'Robert Frost' },
  { text: '有情芍药含春泪，无力蔷薇卧晓枝。', source: '秦观《春日》' },
  { text: 'To thine own self be true.', source: 'William Shakespeare' },
  { text: '山中何事？松花酿酒，春水煎茶。', source: '张可久《人月圆》' },
];

function getDailyLine() {
  const today = new Date();
  const dayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const hash = Array.from(dayKey).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return DAILY_LINES[hash % DAILY_LINES.length];
}

function getRecentReadingsKey(nickname) {
  return `tarot_recent_readings_${nickname || 'guest'}`;
}

function formatDailyFortuneDate() {
  return new Intl.DateTimeFormat('zh-CN', {
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
  const firstStop = normalized.indexOf('。');

  if (firstStop === -1) {
    return normalized;
  }

  return normalized.slice(firstStop + 1).trim();
}

function getMonthLabel(date = new Date()) {
  return new Intl.DateTimeFormat('zh-CN', {
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

function normalizeRecentReadingEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;

  const spreadKey = entry.spreadKey || 'three';
  const spread = getSpreadConfig(spreadKey);
  const rawCards = Array.isArray(entry.cardsData)
    ? entry.cardsData
    : Array.isArray(entry.cards)
      ? entry.cards.map((card) => {
          if (typeof card === 'string') {
            const matched = card.match(/^(.*?)(（逆位）)?$/);
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
    question: entry.question || '',
    spreadKey,
    spreadName: entry.spreadName || spread.name,
    cardsData,
    cardSummary: cardsData.map((card) => formatPlainCardName(card)),
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

const SPREAD_OPTIONS = [
  {
    key: 'three',
    name: '三张牌阵',
    shortName: '三张牌阵',
    description: '没有固定位置限制，适合快速梳理当前问题的整体线索。',
    cardCount: 3,
    preview: ['1', '2', '3'],
    positions: [
      { title: '第一张', subtitle: '线索一' },
      { title: '第二张', subtitle: '线索二' },
      { title: '第三张', subtitle: '线索三' },
    ],
    summary: '这组三张牌会把问题的主要线索摊开，帮助你先看见核心，再决定下一步。',
  },
  {
    key: 'triangle',
    name: '圣三角牌阵',
    shortName: '圣三角',
    description: '适合看见自己以为的状况、真实的状况，以及当下最需要的建议。',
    cardCount: 3,
    preview: ['1', '2', '3'],
    positions: [
      { title: '我以为的状况', subtitle: '表层认知' },
      { title: '真实的状况', subtitle: '现实落点' },
      { title: '建议', subtitle: '下一步提醒' },
    ],
    summary: '圣三角会把表层判断、真实状态和建议拆开来看，适合处理“我到底有没有看清局面”这类问题。',
  },
  {
    key: 'choice',
    name: '二选一牌阵',
    shortName: '二选一',
    description: '适合面对两个方向、两个选项或两种可能性时，比较它们的状态与结果。',
    cardCount: 5,
    preview: ['A', 'B', 'A+', 'B+', '你'],
    positions: [
      { title: '选项 A 的状态', subtitle: '现在的样子' },
      { title: '选项 B 的状态', subtitle: '现在的样子' },
      { title: '选项 A 的可能结果', subtitle: '往后会怎样' },
      { title: '选项 B 的可能结果', subtitle: '往后会怎样' },
      { title: '当事人的状态', subtitle: '你真正的位置' },
    ],
    summary: '二选一牌阵会把两个选项并排展开，再把你的真实位置放进来，适合做方向判断。',
  },
];

const SESSION_STARTED_AT_KEY = 'tarot_session_started_at';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

function getSpreadConfig(spreadKey) {
  return SPREAD_OPTIONS.find((spread) => spread.key === spreadKey) || SPREAD_OPTIONS[0];
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
      displayName: isReversed ? `${card.name}（逆位）` : card.name,
    });
  }

  return cards;
}

function formatSpreadCardName(card) {
  return card.isReversed ? `${card.name}（逆位）` : card.name;
}

function formatPlainCardName(card) {
  return card?.name || '';
}

function shouldAppendFortuneReading(text, keywords) {
  const normalizedText = String(text || '').trim();
  if (!normalizedText) return false;

  const overlapCount = keywords.filter((keyword) => normalizedText.includes(keyword)).length;
  return overlapCount < 2;
}

function buildSpreadReading(cards, question, spread) {
  const lead = `本次使用：${spread.name}`;
  const cardNames = cards.map(formatSpreadCardName).join('、');
  const positionLines = cards.map((card, index) => {
    const position = spread.positions[index];
    const label = position?.title || `第 ${index + 1} 张牌`;
    return `${label}｜${formatSpreadCardName(card)}：${getCardReading(card)}`;
  });

  const closing =
    spread.key === 'triangle'
      ? `围绕“${question}”来看，这组牌更像是在帮你分辨表象与真实之间的落差。先接受现状的复杂，再按建议去推进，会更容易看见清楚的出口。`
      : spread.key === 'choice'
        ? `围绕“${question}”来看，这组牌会把两个选项的走向和你的真实状态并排摊开。别急着选一个最响亮的答案，先看哪个方向更贴近你真正能长期承受的节奏。`
        : `围绕“${question}”来看，这组三张牌共同提示你：先辨认眼前真正的重心，再决定行动的顺序。别急着求一个立刻清晰的答案，而是把牌面里的提醒带回现实，一步一步验证、调整，再继续推进。`;

  return [lead, `你抽到的牌是：${cardNames}。`, ...positionLines, closing].join('\n\n');
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('tarot_theme') || 'aurora');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0);
  const [lastSignInDate, setLastSignInDate] = useState(null);

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

  const [dailyCard, setDailyCard] = useState(null);
  const [showDailyResult, setShowDailyResult] = useState(false);
  const [savedDailyTarot, setSavedDailyTarot] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [dailyHistory, setDailyHistory] = useState({});
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showSpreadModal, setShowSpreadModal] = useState(false);
  const [recentReadings, setRecentReadings] = useState([]);
  const [selectedSpreadKey, setSelectedSpreadKey] = useState('three');
  const [cardStyle, setCardStyle] = useState(() => localStorage.getItem('tarot_card_style') || 'minimal');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryReading, setSelectedHistoryReading] = useState(null);
  const [showHumanRequestModal, setShowHumanRequestModal] = useState(false);
  const [selectedHumanReadingId, setSelectedHumanReadingId] = useState(null);

  const typingRef = useRef(null);
  const activeNickname = user?.nickname || nickname;
  const dailyLine = getDailyLine();
  const activeDailyCard = savedDailyTarot || dailyCard;
  const calendarDate = new Date();
  const calendarDays = buildCalendarDays(calendarDate);
  const activeSpread = getSpreadConfig(selectedSpreadKey);

  useEffect(() => {
    localStorage.setItem('tarot_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tarot_card_style', cardStyle);
  }, [cardStyle]);

  const markSessionStarted = () => {
    localStorage.setItem(SESSION_STARTED_AT_KEY, `${Date.now()}`);
  };

  const isSessionExpired = () => {
    const startedAt = Number(localStorage.getItem(SESSION_STARTED_AT_KEY) || 0);
    if (!startedAt) return false;
    return Date.now() - startedAt > SESSION_MAX_AGE;
  };

  const clearSession = () => {
    localStorage.removeItem('tarot_user');
    localStorage.removeItem(SESSION_STARTED_AT_KEY);
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
  };

  const resetReadingState = () => {
    setDrawnCards([]);
    setIsRevealing(false);
    setReadingComplete(false);
    setAiReading('');
    setDisplayedText('');
    setUserQuestion('');
  };

  const fetchUserProfile = async (authUser) => {
    try {
      const profile = await ensureProfile(authUser, authUser?.user_metadata?.nickname || nickname);
      const today = getDisplaySignInDate();
      const isSignedInToday = profile.last_sign_in_date === today;
      const nextUser = { id: authUser.id, nickname: profile.nickname };

      setUser(nextUser);
      setNickname(profile.nickname);
      setCoinBalance(profile.coin_balance || 0);
      setLastSignInDate(profile.last_sign_in_date || null);
      setIsSignedIn(isSignedInToday);
      setSavedDailyTarot(isSignedInToday ? profile.today_card || null : null);
      setDailyHistory(profile.daily_history || {});
      localStorage.setItem('tarot_user', JSON.stringify(nextUser));
    } catch (error) {
      console.error(error);
    }
  };

  const persistRecentReadings = (items) => {
    localStorage.setItem(getRecentReadingsKey(activeNickname), JSON.stringify(items));
  };

  const saveRecentReading = (question, cards, spreadKey) => {
    const spread = getSpreadConfig(spreadKey);
    const entry = normalizeRecentReadingEntry({
      id: `${Date.now()}`,
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
    });

    setRecentReadings((current) => {
      const next = [entry, ...current].slice(0, 3);
      persistRecentReadings(next);
      return next;
    });
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
      alert('先完成一次抽牌，再把最近的牌阵发给饼饼吧。');
      return;
    }

    setSelectedHumanReadingId(recentReadings[0]?.id || null);
    setShowHumanRequestModal(true);
  };

  useEffect(() => {
    let mounted = true;

    const bootstrapSession = async () => {
      try {
        const session = await getAuthSession();
        if (session?.user && mounted) {
          if (isSessionExpired()) {
            await logoutFromSupabase();
            clearSession();
            return;
          }

          if (!localStorage.getItem(SESSION_STARTED_AT_KEY)) {
            markSessionStarted();
          }
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error(error);
      }
    };

    bootstrapSession();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setIsLogin(true);
        setShowForgotPasswordModal(false);
        setCurrentPage('home');
        return;
      }

      if (event === 'SIGNED_OUT') {
        clearSession();
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        markSessionStarted();
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
        ? parsed.map(normalizeRecentReadingEntry).filter(Boolean).slice(0, 3)
        : [];
      setRecentReadings(normalized);
    } catch {
      setRecentReadings([]);
    }
  }, [activeNickname]);

  const handleRegister = async () => {
    if (!email.trim() || !nickname.trim() || !password.trim()) {
      alert('请输入邮箱、昵称和密码');
      return;
    }

    try {
      const result = await registerWithEmail(email.trim(), nickname.trim(), password);
      if (result.needsEmailVerification) {
        alert('注册成功，请去邮箱验证登录。验证完成后回到这里，用邮箱和密码登录。');
      } else {
        alert('注册成功，请登录');
      }

      setIsLogin(true);
      setPassword('');
    } catch (error) {
      if (error.message?.includes('email rate limit exceeded')) {
        alert('验证邮件发送太频繁了，请稍等几分钟后再试，或者先去邮箱查收刚刚的验证邮件。');
        return;
      }

      if (error.message?.includes('row-level security')) {
        alert('邮箱验证已经发出。完成验证后回到这里登录；如果刚刚已验证，请刷新页面后再试。');
        return;
      }

      alert(error.message || '注册失败');
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert('请输入邮箱和密码');
      return;
    }

    try {
      const data = await loginWithEmail(email.trim(), password);
      markSessionStarted();
      setPassword('');
      if (data.user) {
        await fetchUserProfile(data.user);
      }
    } catch (error) {
      alert(error.message || '登录失败');
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      alert('请输入注册时使用的邮箱');
      return;
    }

    try {
      await requestPasswordReset(email.trim(), window.location.origin);
      setShowForgotPasswordModal(false);
      alert('重置密码邮件已经发送，请去邮箱查看。');
    } catch (error) {
      alert(error.message || '密码重置邮件发送失败，请稍后再试');
    }
  };

  const handleCompletePasswordReset = async () => {
    if (!resetPasswordValue.trim()) {
      alert('请输入新的密码');
      return;
    }

    if (resetPasswordValue.trim().length < 6) {
      alert('新密码至少需要 6 位');
      return;
    }

    try {
      await updatePassword(resetPasswordValue.trim());
      setResetPasswordValue('');
      setIsRecoveryMode(false);
      alert('密码已经更新，请直接用邮箱和新密码登录。');
    } catch (error) {
      alert(error.message || '密码更新失败，请重新打开邮件里的链接再试。');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutFromSupabase();
    } catch (error) {
      console.error(error);
    }

    clearSession();
  };

  const handleDailySignIn = async () => {
    if (!user?.id) {
      alert('登录状态异常，请重新登录后再试。');
      clearSession();
      return;
    }

    try {
      const profile = await getProfileById(user.id);
      if (!profile) {
        clearSession();
        alert('当前账号资料不存在，请重新登录。');
        return;
      }

      const today = getDisplaySignInDate();
      const todayKey = getLocalDateKey();
      const currentHistory = profile.daily_history || {};

      if (profile.last_sign_in_date === today) {
        setIsSignedIn(true);
        setCoinBalance(profile.coin_balance || 0);
        setLastSignInDate(profile.last_sign_in_date || today);
        setDailyHistory(currentHistory);
        if (profile.today_card) {
          setSavedDailyTarot(profile.today_card);
          setDailyCard(profile.today_card);
          setShowDailyResult(true);
        }

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

      const updatedProfile = await updateDailyProfile(user.id, {
        last_sign_in_date: today,
        today_card: todayCard,
        daily_history: nextHistory,
        coin_balance: (profile.coin_balance || 0) + 1,
      });

      setIsSignedIn(true);
      setCoinBalance(updatedProfile.coin_balance || coinBalance);
      setLastSignInDate(updatedProfile.last_sign_in_date || today);
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
    } catch (error) {
      console.error(error);
      alert(error.message || '今日运势获取失败，请稍后再试');
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

    const keywords = getDailyFortuneKeywords(card).slice(0, 3);
    const data = resolveCardData(card);
    const reading = getCardReading({ ...card, id: data.id });
    const conciseReading = stripLeadSentence(reading);
    const shouldAppend = shouldAppendFortuneReading(conciseReading, keywords);
    const lead = card.isReversed ? '今天更适合放慢一点。' : '今天可以顺着感觉往前一步。';

    return shouldAppend ? `${lead}${conciseReading}` : lead;
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
      alert('饼币不足，先签到拿饼币吧。');
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
      const spread = getSpreadConfig(selectedSpreadKey);
      const cards = spread.key === 'three' && isHumanMode ? drawThreeCards() : drawCardsForSpread(spread.cardCount);
      setDrawnCards(cards);
      saveRecentReading(trimmedQuestion, cards, spread.key);

      setTimeout(() => {
        setIsRevealing(true);

        setTimeout(() => {
          setReadingComplete(true);
          setAiReading(isHumanMode ? generateReading(cards, trimmedQuestion) : buildSpreadReading(cards, trimmedQuestion, spread));
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
    if (!user?.id || !activeNickname || !readingEntry?.question || !Array.isArray(readingEntry.cardsData) || readingEntry.cardsData.length === 0) return;

    const nextBalance = coinBalance - 10;
    setCoinBalance(nextBalance);

    try {
      await updateCoinBalance(user.id, nextBalance);

      const data = await createRequest({
        user_id: user.id,
        user_nickname: activeNickname,
        teacher_nickname: OFFICIAL_READER.nickname,
        spread_key: readingEntry.spreadKey,
        spread_name: readingEntry.spreadName,
        question: readingEntry.question,
        cards: readingEntry.cardsData,
        status: 'pending',
        messages: [],
      });
      setCurrentChatId(data.id);
      setUserQuestion(readingEntry.question);
      setDrawnCards(readingEntry.cardsData);
      setMessages([]);
      setIsWaitingForReply(true);
      setShowHumanRequestModal(false);
      setCurrentPage('chat');
      startPollingReply(data.id);
    } catch (error) {
      alert('网络错误，请稍后重试');
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

    const fetchPendingRequests = async () => {
      try {
        const data = await listRequestsByUser(user.id);
        const pending = data.filter((request) =>
          request.status === 'pending' && request.messages?.some((message) => message.sender === 'teacher'),
        );
        setUnreadCount(
          pending.reduce(
            (count, request) => count + (request.messages?.filter((message) => message.sender === 'teacher').length || 0),
            0,
          ),
        );
      } catch (error) {
        // ignore
      }
    };

    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 5000);
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
    const spread = getSpreadConfig(spreadKey);
    const cardSize = spread.key === 'choice' ? 'small' : 'normal';
    const isRevealedView = options.isRevealed ?? isRevealing;
    const showOrientation = options.showOrientation ?? false;

    return (
      <section className={`reading-spread reading-spread-${spread.key} ${options.className || ''}`.trim()}>
        {cards.map((card, index) => {
          const position = spread.positions[index];

          return (
            <div key={`${spread.key}-${card.id}-${index}`} className={`reading-spread-slot reading-spread-slot-${spread.key}-${index + 1}`}>
              <TarotCard card={card} isRevealed={isRevealedView} size={cardSize} showOrientation={showOrientation} variant={cardStyle} />
              <div className="reading-spread-meta">
                <p className="reading-spread-label">{position?.title || `第 ${index + 1} 张牌`}</p>
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
        aria-label="切换到暖调主题"
        title="暖调主题"
      >
        <span className="theme-toggle-swatch theme-toggle-swatch-aurora" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('noir')}
        className={`theme-toggle-button ${theme === 'noir' ? 'theme-toggle-button-active' : ''}`}
        aria-label="切换到黑白极简主题"
        title="黑白极简主题"
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
        极简版
      </button>
      <button
        type="button"
        onClick={() => setCardStyle('artwork')}
        className={`card-style-button ${cardStyle === 'artwork' ? 'card-style-button-active' : ''}`}
      >
        原画版
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
              <p className="eyebrow">Recent Spread</p>
              <h3 className="fortune-modal-title">历史抽牌</h3>
            </div>
            <button type="button" onClick={() => setShowHistoryModal(false)} className="icon-button">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="history-preview-copy">
            <p className="history-preview-question">问题：{selectedHistoryReading.question}</p>
            <p className="history-preview-spread">牌阵：{selectedHistoryReading.spreadName}</p>
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
              <h3 className="fortune-modal-title">发送给饼饼大人</h3>
            </div>
            <button type="button" onClick={() => setShowHumanRequestModal(false)} className="icon-button">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="human-request-copy">选择一条最近的抽牌记录发给官方账号，饼饼会根据这次牌阵继续为你解读。</p>

          <div className="human-request-list">
            {recentReadings.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSelectedHumanReadingId(entry.id)}
                className={`human-request-item ${selectedHumanReadingId === entry.id ? 'human-request-item-active' : ''}`}
              >
                <p className="human-request-question">“{entry.question}”</p>
                <p className="human-request-meta">{entry.spreadName} · {entry.cardSummary.join(' · ')}</p>
              </button>
            ))}
          </div>

          <div className="human-request-actions">
            <button type="button" onClick={() => setShowHumanRequestModal(false)} className="secondary-button">
              再想想
            </button>
            <button
              type="button"
              onClick={handleSubmitHumanRequest}
              disabled={!selectedHumanReadingId || coinBalance < 10}
              className="primary-button"
            >
              <MessageCircle className="w-5 h-5" />
              {coinBalance < 10 ? '饼币不足' : '发送给饼饼（10 饼币）'}
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
              <p className="eyebrow">Password Reset</p>
              <h3 className="fortune-modal-title">找回密码</h3>
            </div>
            <button type="button" onClick={() => setShowForgotPasswordModal(false)} className="icon-button">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="human-request-copy">输入注册时使用的邮箱，我们会把重置密码链接发到你的邮箱。</p>
          <label className="field-shell">
            <Mail className="field-icon" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="邮箱"
              className="field-input"
            />
          </label>

          <div className="human-request-actions">
            <button type="button" onClick={() => setShowForgotPasswordModal(false)} className="secondary-button">
              取消
            </button>
            <button type="button" onClick={handleForgotPassword} className="primary-button">
              发送重置邮件
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
            {renderThemeToggle('auth-theme-toggle')}
          </div>
          <h1 className="hero-title">bingbing&apos;s tarot</h1>
          <p className="hero-subtitle">
            {isRecoveryMode ? '设置一个新的密码，然后回到登录页继续。' : isLogin ? '对发生的一切保持思考' : '先领一张属于你的塔罗邀请函。'}
          </p>


          <div className="auth-form">
            <label className="field-shell">
              <Mail className="field-icon" />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="邮箱" className="field-input" />
            </label>

            {!isLogin && !isRecoveryMode ? (
              <label className="field-shell">
                <User className="field-icon" />
                <input type="text" value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="昵称" className="field-input" />
              </label>
            ) : null}

            <label className="field-shell">
              <Lock className="field-icon" />
              <input
                type="password"
                value={isRecoveryMode ? resetPasswordValue : password}
                onChange={(event) => (isRecoveryMode ? setResetPasswordValue(event.target.value) : setPassword(event.target.value))}
                placeholder={isRecoveryMode ? '新的密码' : '密码'}
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
              {isRecoveryMode ? '更新密码' : isLogin ? '与宇宙链接' : '创建账号'}
            </button>

            {isLogin && !isRecoveryMode ? (
              <button type="button" onClick={() => setShowForgotPasswordModal(true)} className="text-button forgot-password-link">
                忘记密码？
              </button>
            ) : null}

            {isRecoveryMode ? (
              <p className="switch-text">
                改好密码后，
                <span
                  onClick={() => {
                    setIsRecoveryMode(false);
                    setResetPasswordValue('');
                    setPassword('');
                  }}
                  className="switch-link"
                >
                  返回登录
                </span>
              </p>
            ) : (
              <p className="switch-text">
                {isLogin ? '还没有账号？' : '已经有账号？'}
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
                  {isLogin ? '去注册' : '去登录'}
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
            <p className="eyebrow">Bingbing Tarot</p>
            <h1 className="topbar-title">bingbing tarot</h1>
          </div>
          <div className="topbar-actions">
            {renderThemeToggle('topbar-theme-toggle')}
            <button type="button" onClick={() => setCurrentPage('messages')} className="icon-button">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
            </button>
            <div className="coin-pill">
              <Coins className="w-4 h-4" />
              <span>{coinBalance} 饼币</span>
            </div>
            <button type="button" onClick={handleLogout} className="text-button">
              退出
            </button>
          </div>
        </header>

        <main className="home-layout">
          <motion.section className="hero-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="hero-copy">
              <p className="hero-kicker">Welcome!</p>
              <div className="hero-identity">
                <h2 className="hero-panel-title hero-panel-title-compact">{activeNickname}</h2>
              </div>
                <p className="hero-panel-text">
                  {dailyLine.text}
                  <span className="hero-panel-source">——{dailyLine.source}</span>
                </p>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-label">上次签到</span>
                <strong className="stat-value">{lastSignInDate || '还没有记录'}</strong>
              </div>

              <button type="button" onClick={() => setShowCalendarModal(true)} className="stat-card calendar-stat-card">
                <span className="stat-label">日运日历</span>
                <strong className="stat-value">查看本月日运</strong>
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
                        <p className="history-question">“{entry.question}”</p>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteRecentReading(entry.id);
                          }}
                          className="history-delete-button"
                          aria-label="删除这条抽牌记录"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="history-cards">{entry.spreadName} · {entry.cardSummary.join(' · ')}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="history-empty">
                  <p className="history-empty-title">暂无历史记录</p>
                  <p className="history-empty-copy">试试和宇宙交流吧⭐</p>
                </div>
              )}
            </div>
          </motion.section>

          <motion.section className="action-panel" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }}>
            <div className="daily-card">
              <div className="daily-card-head">
                <p className="eyebrow">Daily Fortune</p>
              </div>

              {isSignedIn && savedDailyTarot ? (
                <div className="daily-result">
                  <p className="daily-result-label">今日运势</p>
                  <div className="daily-result-name">
                    <span>{savedDailyTarot.name}{savedDailyTarot.isReversed ? ' · 逆位' : ' · 正位'}</span>
                    <small>{getCardDisplayNames(savedDailyTarot).englishName}</small>
                  </div>
                  <p className="daily-result-note">好运已收入囊中，今天已经获得 1 饼币。</p>
                </div>
              ) : (
                <div className="daily-result">
                  <p className="daily-result-label">每日签到</p>
                  <p className="daily-result-note">点亮今天的塔罗提示卡，领取 1 饼币和一张今日运势。</p>
                </div>
              )}

              <button
                type="button"
                onClick={isSignedIn ? openDailyFortuneModal : handleDailySignIn}
                className="primary-button daily-button"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isSignedIn ? '今日已开启' : '获取今日运势'}</span>
              </button>
            </div>

            <div className="action-grid">
              <button type="button" onClick={handleStartFreeReading} className="feature-card feature-card-light">
                <span className="feature-eyebrow">Free Reading</span>
                <strong className="feature-title">选择牌阵</strong>
                <p className="feature-copy">先选牌阵，再进入提问和抽牌流程。</p>
              </button>

              <button type="button" onClick={openHumanRequestModal} className="feature-card feature-card-dark">
                <span className="feature-eyebrow">{OFFICIAL_READER.englishLabel}</span>
                <strong className="feature-title">立刻马上联系饼饼为你解读！</strong>
                <p className="feature-copy">消耗10饼币。</p>
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
                    <p className="eyebrow">Choose a Spread</p>
                    <h3 className="fortune-modal-title">选择牌阵</h3>
                  </div>
                  <button type="button" onClick={() => setShowSpreadModal(false)} className="icon-button">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="spread-option-grid">
                  {SPREAD_OPTIONS.map((spread) => (
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
                <p className="eyebrow">{formatDailyFortuneDate()}日运</p>
                <div className="fortune-modal-card">
                  <span>{activeDailyCard.name}{activeDailyCard.isReversed ? ' · 逆位' : ' · 正位'}</span>
                  <small>{getCardDisplayNames(activeDailyCard).englishName}</small>
                </div>
                <p className="fortune-modal-keywords">关键词：{dailyFortuneKeywords.join(' / ')}</p>
                <p className="fortune-modal-note">{getDailyFortuneSummary(activeDailyCard)}</p>
                <button type="button" onClick={() => setShowDailyResult(false)} className="primary-button">
                  知道了
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
                    <p className="eyebrow">Fortune Calendar</p>
                    <h3 className="fortune-modal-title">日运日历</h3>
                  </div>
                  <button type="button" onClick={() => setShowCalendarModal(false)} className="icon-button">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="calendar-month-label">{getMonthLabel(calendarDate)}</p>
                <div className="calendar-weekdays">
                  {['一', '二', '三', '四', '五', '六', '日'].map((label) => (
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
                            {card.isReversed ? ' · 逆位' : ''}
                          </span>
                        ) : (
                          <span className="calendar-day-empty">未签到</span>
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
          <h1 className="page-title">{isHumanMode ? '真人解读' : '免费抽牌'}</h1>
          <div className="page-header-controls">
            {renderThemeToggle()}
          </div>
        </header>

        <main className="page-content">
          <div className="question-panel">
            <p className="eyebrow">{isHumanMode ? 'Human Reading' : activeSpread.name}</p>
            <h2 className="question-title">{isHumanMode ? '把问题说得更具体，牌面会更清晰。' : `你选择了${activeSpread.name}`}</h2>
            <p className="question-note">{isHumanMode ? '提交后会带着你的三张牌进入真人对话。' : activeSpread.summary}</p>
            <textarea
              value={userQuestion}
              onChange={(event) => setUserQuestion(event.target.value)}
              placeholder="例如：我最近的工作方向是否应该调整？"
              className="question-input"
              rows={5}
              autoFocus
            />
            <button type="button" onClick={handleConfirmQuestion} disabled={!userQuestion.trim()} className="primary-button">
              确定并抽牌
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
          <h1 className="page-title">抽牌结果</h1>
          <div className="page-header-controls">
            {renderCardStyleToggle()}
            {renderThemeToggle()}
          </div>
        </header>

        <main className="page-content reading-page-content">
          <div className="reading-layout">
          <section className="reading-question-card">
            <p className="eyebrow">{isHumanMode ? 'Human Reading' : activeSpread.name}</p>
            <p className="reading-question-text">“{userQuestion}”</p>
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
                    发给饼饼解读
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openHumanRequestModal}
                    className="primary-button"
                  >
                    <MessageCircle className="w-5 h-5" />
                    发给饼饼解读（10 饼币）
                  </button>
                )}
                <button type="button" onClick={goHome} className="secondary-button">
                  返回首页
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
          <h1 className="page-title">与饼饼对话</h1>
          <div className="page-header-controls">
            {renderThemeToggle()}
          </div>
        </header>

        <main className="chat-layout">
          <section className="chat-summary">
            <p className="eyebrow">Question</p>
            <p className="chat-question">“{userQuestion}”</p>
                <div className="chat-cards">
                  {drawnCards.map((card, index) => (
                    <div key={index} className="chat-card-pill">
                      <span>{card.name}</span>
                      {card.isReversed && <small>逆位</small>}
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

            {isWaitingForReply && messages.length === 0 && <p className="chat-waiting">正在等待老师回复...</p>}
          </section>
        </main>

        <footer className="chat-footer">
          <input
            type="text"
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder="输入你的追问..."
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
          <h1 className="page-title">我的消息</h1>
          <div className="page-header-controls">
            {renderThemeToggle()}
          </div>
        </header>

        <main className="page-content">
          <div className="question-panel centered-panel">
            <p className="eyebrow">Inbox</p>
            {unreadCount === 0 ? (
              <>
                <h2 className="question-title">今天很安静。</h2>
                <p className="question-note">暂时没有新的回复，晚点再回来看看也可以。</p>
              </>
            ) : (
              <>
                <h2 className="question-title">你有 {unreadCount} 条未读消息。</h2>
                <p className="question-note">返回首页或继续进入对话页，查看老师的新回复。</p>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  return null;
}

export default App;
