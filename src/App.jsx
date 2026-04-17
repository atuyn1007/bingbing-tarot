import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Bell, Coins, Lock, MessageCircle, Send, Sparkles, User, X } from 'lucide-react';
import TarotCard from './TarotCard';
import { allTarotCards, drawThreeCards, generateReading, getCardData, getCardDisplayNames, getCardReading } from './data';
import { saveTarotHistory } from './supabaseTarot';

const API_URL = 'http://localhost:3001';

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

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('tarot_theme') || 'aurora');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
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
  const [recentReadings, setRecentReadings] = useState([]);

  const typingRef = useRef(null);
  const activeNickname = user?.nickname || nickname;
  const dailyLine = getDailyLine();
  const activeDailyCard = savedDailyTarot || dailyCard;
  const calendarDate = new Date();
  const calendarDays = buildCalendarDays(calendarDate);

  useEffect(() => {
    localStorage.setItem('tarot_theme', theme);
  }, [theme]);

  const clearSession = () => {
    localStorage.removeItem('tarot_user');
    setUser(null);
    setNickname('');
    setPassword('');
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
    setRecentReadings([]);
  };

  const resetReadingState = () => {
    setDrawnCards([]);
    setIsRevealing(false);
    setReadingComplete(false);
    setAiReading('');
    setDisplayedText('');
    setUserQuestion('');
  };

  const fetchUserProfile = async (nick) => {
    try {
      const response = await fetch(`${API_URL}/api/user/${encodeURIComponent(nick)}/daily`);
      if (!response.ok) {
        if (response.status === 404) {
          clearSession();
          alert('登录信息已失效，请重新登录。');
        }
        return;
      }

      const data = await response.json();
      setCoinBalance(data.coinBalance || 0);
      setLastSignInDate(data.lastSignInDate || null);
      setIsSignedIn(Boolean(data.isSignedInToday));
      setSavedDailyTarot(data.isSignedInToday ? data.todayCard || null : null);
      setDailyHistory(data.dailyHistory || {});
    } catch (error) {
      console.error(error);
    }
  };

  const saveRecentReading = (question, cards) => {
    const entry = {
      id: `${Date.now()}`,
      question,
      cards: cards.map((card) => card.name + (card.isReversed ? '（逆位）' : '')),
    };

    setRecentReadings((current) => {
      const next = [entry, ...current].slice(0, 3);
      localStorage.setItem(getRecentReadingsKey(activeNickname), JSON.stringify(next));
      return next;
    });
  };

  const deleteRecentReading = (entryId) => {
    setRecentReadings((current) => {
      const next = current.filter((entry) => entry.id !== entryId);
      localStorage.setItem(getRecentReadingsKey(activeNickname), JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('tarot_user');
    if (!savedUser) return;

    try {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setNickname(userData.nickname);
      fetchUserProfile(userData.nickname);
    } catch (error) {
      clearSession();
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(getRecentReadingsKey(activeNickname));

    if (!stored) {
      setRecentReadings([]);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setRecentReadings(Array.isArray(parsed) ? parsed.slice(0, 3) : []);
    } catch {
      setRecentReadings([]);
    }
  }, [activeNickname]);

  const handleRegister = async () => {
    if (!nickname.trim() || !password.trim()) {
      alert('请输入昵称和密码');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim(), password }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || '注册失败');
        return;
      }

      alert('注册成功，请登录');
      setIsLogin(true);
      setPassword('');
    } catch (error) {
      alert('网络错误，请稍后重试');
    }
  };

  const handleLogin = async () => {
    if (!nickname.trim() || !password.trim()) {
      alert('请输入昵称和密码');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim(), password }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || '登录失败');
        return;
      }

      const nextUser = { nickname: data.nickname };
      setUser(nextUser);
      setNickname(data.nickname);
      setCoinBalance(data.coinBalance || 0);
      setLastSignInDate(data.lastSignInDate || null);
      localStorage.setItem('tarot_user', JSON.stringify(nextUser));
      setPassword('');
      await fetchUserProfile(data.nickname);
    } catch (error) {
      alert('网络错误，请稍后重试');
    }
  };

  const handleLogout = () => {
    clearSession();
  };

  const handleDailySignIn = async () => {
    if (!activeNickname) {
      alert('登录状态异常，请重新登录后再试。');
      clearSession();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/user/${encodeURIComponent(activeNickname)}/signin`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 404) {
          clearSession();
          alert('当前账号在后端不存在，请重新登录。');
          return;
        }

        alert(errorData.error || '今日运势获取失败，请稍后再试');
        return;
      }

      const data = await response.json();
      if (!data.success) {
        alert(data.error || '今日运势获取失败，请稍后再试');
        return;
      }

      setIsSignedIn(true);
      setCoinBalance(data.coinBalance || coinBalance);
      setLastSignInDate(data.lastSignInDate || new Date().toDateString());
      setDailyHistory(data.dailyHistory || {});
      if (data.todayCard) {
        try {
          await saveTarotHistory(data.todayCard.name, !data.todayCard.isReversed);
        } catch (syncError) {
          console.warn('Failed to sync daily tarot to Supabase:', syncError);
        }

        setSavedDailyTarot(data.todayCard);
        setDailyCard(data.todayCard);
        setShowDailyResult(true);
      }
    } catch (error) {
      console.error(error);
      alert('未能连接到占卜服务，请确认后端已启动。');
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

    return card.isReversed
      ? `濠电偛顕慨鎾晝閵堝桅濠㈣埖鍔曢崡鎶芥煙缂併垹鏋撻柛瀣崌瀹曟帒顫濋鐐╁亾閵堝鐓涢柍褜鍓熼幃娆擃敆閳ь剙顕ｉ灏栨闁圭虎鍨版禍楣冩⒑缂佹ê濮夋繛鍛灮濡叉劕鈹戠€ｎ偄浠煎┑鐐叉閸旀洘绔?{keywords.join(' / ')}闂佸搫顦弲婊堟偡閵堝洩濮抽柣鎴烆焽閳瑰秹鏌嶉妷銉ユ毐濠电偛娲弻?{conciseReading}`
      : `濠电偛顕慨鎾晝閵堝桅濠㈣埖鍔曢惌妤併亜閺嶃劎鎳佺紒銊︽緲椤啴濡堕崼鐕佷哗濠?{keywords.join(' / ')}闂備礁鎲￠…鍫ヮ敋瑜旈幆鍫濐吋閸滀礁娈ㄩ梺閫炲苯澧伴柟顔藉娴狅箓鎸婃竟顓燁殜閺?{conciseReading}`;
  };

  const dailyFortuneKeywords = activeDailyCard ? getDailyFortuneKeywords(activeDailyCard) : [];

  const readingTextParts = displayedText.split('\n\n');
  const readingLead = readingTextParts[0] || '';
  const readingBody = readingTextParts.slice(1).join('\n\n');

  const handleStartFreeReading = () => {
    setIsHumanMode(false);
    resetReadingState();
    setCurrentPage('drawing-input');
  };

  const handleStartHumanReading = () => {
    if (coinBalance < 10) {
      alert('饼币不足，先签到拿饼币吧。');
      return;
    }

    setIsHumanMode(true);
    resetReadingState();
    setCurrentPage('drawing-input');
  };

  const handleConfirmQuestion = () => {
    const trimmedQuestion = userQuestion.trim();

    if (!trimmedQuestion) return;

    setCurrentPage('drawing');

    setTimeout(() => {
      const cards = drawThreeCards();
      setDrawnCards(cards);
      saveRecentReading(trimmedQuestion, cards);

      setTimeout(() => {
        setIsRevealing(true);

        setTimeout(() => {
          setReadingComplete(true);
          setAiReading(generateReading(cards, trimmedQuestion));
        }, 1100);
      }, 260);
    }, 420);
  };

  const startPollingReply = (chatId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/request/${chatId}`);
        if (!response.ok) return;

        const data = await response.json();
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

  const handleSubmitHumanRequest = async () => {
    if (!activeNickname || !userQuestion.trim() || drawnCards.length === 0) return;

    const nextBalance = coinBalance - 10;
    setCoinBalance(nextBalance);

    try {
      await fetch(`${API_URL}/api/user/${encodeURIComponent(activeNickname)}/coins`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinBalance: nextBalance }),
      });

      const response = await fetch(`${API_URL}/api/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeNickname,
          userNickname: activeNickname,
          question: userQuestion,
          cards: drawnCards,
        }),
      });

      const data = await response.json();
      setCurrentChatId(data.id);
      setMessages([]);
      setIsWaitingForReply(true);
      setCurrentPage('chat');
      startPollingReply(data.id);
    } catch (error) {
      alert('网络错误，请稍后重试');
    }
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
      await fetch(`${API_URL}/api/request/${currentChatId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });
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
    if (!user?.nickname) return undefined;

    const fetchPendingRequests = async () => {
      try {
        const response = await fetch(`${API_URL}/api/requests/user/${encodeURIComponent(user.nickname)}`);
        if (!response.ok) return;

        const data = await response.json();
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

  if (!user) {
    return (
      <div className={`screen-shell auth-screen theme-${theme}`}>
        <div className="orb orb-left" />
        <div className="orb orb-right" />
        <motion.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {renderThemeToggle('auth-theme-toggle')}
          <h1 className="hero-title">bingbing&apos;s tarot</h1>
          <p className="hero-subtitle">{isLogin ? '对发生的一切保持思考' : '先领一张属于你的塔罗邀请函。'}</p>


          <div className="auth-form">
            <label className="field-shell">
              <User className="field-icon" />
              <input type="text" value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="昵称" className="field-input" />
            </label>

            <label className="field-shell">
              <Lock className="field-icon" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="密码"
                className="field-input"
                onKeyDown={(event) => event.key === 'Enter' && (isLogin ? handleLogin() : handleRegister())}
              />
            </label>

            <button type="button" onClick={isLogin ? handleLogin : handleRegister} className="primary-button">
              {isLogin ? '与宇宙链接' : '创建账号'}
            </button>

            <p className="switch-text">
              {isLogin ? '还没有账号？' : '已经有账号？'}
              <span
                onClick={() => {
                  setIsLogin((current) => !current);
                  setPassword('');
                }}
                className="switch-link"
              >
                {isLogin ? '去注册' : '去登录'}
              </span>
            </p>
          </div>
        </motion.div>
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
                    <article key={entry.id} className="history-item">
                      <div className="history-item-head">
                        <p className="history-question">“{entry.question}”</p>
                        <button type="button" onClick={() => deleteRecentReading(entry.id)} className="history-delete-button" aria-label="删除这条抽牌记录">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="history-cards">{entry.cards.join(' · ')}</p>
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
                <strong className="feature-title">免费抽牌</strong>
                <p className="feature-copy">抽取三张牌，立即获得本地生成的塔罗解读。</p>
              </button>

              <button type="button" onClick={handleStartHumanReading} className="feature-card feature-card-dark">
                <span className="feature-eyebrow">Human Reading</span>
                <strong className="feature-title">真人解读</strong>
                <p className="feature-copy">消耗 10 饼币，把问题发送给真人老师继续追问。</p>
              </button>
            </div>

          </motion.section>
        </main>

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
          {renderThemeToggle()}
        </header>

        <main className="page-content">
          <div className="question-panel">
            <p className="eyebrow">{isHumanMode ? 'Human Reading' : 'Three Card Reading'}</p>
            <h2 className="question-title">把问题说得更具体，牌面会更清晰。</h2>
            <p className="question-note">{isHumanMode ? '提交后会带着你的三张牌进入真人对话。' : '系统会为你抽取三张牌，并生成一段综合解读。'}</p>
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
          {renderThemeToggle()}
        </header>

        <main className="page-content reading-page-content">
          <div className="reading-layout">
          <section className="reading-question-card">
            <p className="eyebrow">Your Question</p>
            <p className="reading-question-text">“{userQuestion}”</p>
          </section>

          <section className="reading-cards-row">
            {drawnCards.map((card, index) => (
              <TarotCard key={`${card.id}-${index}`} card={card} isRevealed={isRevealing} />
            ))}
          </section>

          {readingComplete && (
            <motion.section className="reading-result-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="reading-result-lead">{readingLead}</p>
              <p className="reading-result-text">
                {readingBody}
                <span className="reading-cursor">|</span>
              </p>

              <div className="reading-actions">
                {isHumanMode ? (
                  <button type="button" onClick={handleSubmitHumanRequest} className="primary-button">
                    <MessageCircle className="w-5 h-5" />
                    发送给真人解读
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      if (coinBalance < 10) {
                        alert('饼币不足，先签到拿饼币吧。');
                        return;
                      }

                      const nextBalance = coinBalance - 10;
                      setCoinBalance(nextBalance);

                      try {
                        await fetch(`${API_URL}/api/user/${encodeURIComponent(activeNickname)}/coins`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ coinBalance: nextBalance }),
                        });
                      } catch (error) {
                        console.error(error);
                      }

                      setIsHumanMode(true);
                      handleSubmitHumanRequest();
                    }}
                    className="primary-button"
                  >
                    <MessageCircle className="w-5 h-5" />
                    联系真人解读（10 饼币）
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
          {renderThemeToggle()}
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
          {renderThemeToggle()}
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
