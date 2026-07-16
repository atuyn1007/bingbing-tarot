import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ArrowRight, Bell, BookOpen, Coins, Gift, Sparkles, X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import MonthlyTarotCalendar from '../components/MonthlyTarotCalendar';
import { getCardArtwork } from '../cardArtwork';

function HomePage({
  theme,
  t,
  activeNickname,
  unreadCount,
  coinBalance,
  onOpenMessages,
  onOpenRedeemModal,
  onLogout,
  dailyLine,
  dailyHistory,
  intlLocale,
  language,
  recentReadings,
  onOpenHistory,
  onDeleteHistory,
  formatHistorySummary,
  isSignedIn,
  savedDailyTarot,
  getCardDisplayNames,
  onDailyAction,
  onStartFreeReading,
  onOpenCardMeanings,
  onOpenHumanRequest,
}) {
  const dailyArtwork = savedDailyTarot ? getCardArtwork(savedDailyTarot) : '';
  const heroHeadline = t('home.heroHeadline');

  return (
    <div className={`screen-shell home-screen theme-${theme}`}>
      <div className="cosmic-grain" />

      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-sun" aria-hidden="true">✺</span>
          <div>
            <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1 className="topbar-title">{t('common.appName')}</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <LanguageSwitcher />
          <button type="button" onClick={onOpenMessages} className="icon-button">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
          </button>
          <button type="button" onClick={onOpenRedeemModal} className="coin-pill topbar-redeem-button">
            <Gift className="w-4 h-4" />
            <span>{t('home.redeemEyebrow')}</span>
          </button>
          <div className="coin-pill">
            <Coins className="w-4 h-4" />
            <span>{coinBalance} {t('common.coins')}</span>
          </div>
          <button type="button" onClick={onLogout} className="text-button">
            {t('home.logout')}
          </button>
        </div>
      </header>

      <main className="home-stage">
        <LazyMotion features={domAnimation}>
          <m.section className="home-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="hero-celestial-rail" aria-hidden="true">
              <span className="hero-rail-eye"><i /></span>
              <span className="hero-rail-word">intuition</span>
              <span className="hero-rail-word">reflection</span>
              <span className="hero-rail-word">spirit</span>
              <span className="hero-rail-moon"><i /></span>
            </div>

            <div className="home-hero-copy">
              <div className="hero-edition-note" aria-hidden="true">
                <span>ARCANA · XIX</span>
                <span>CELESTIAL ARCHIVE / 太阳典藏</span>
              </div>
              <p className="hero-kicker">{t('home.heroKicker')} · {activeNickname}</p>
              <h2 className="home-hero-title">
                {heroHeadline === '对发生的一切保持思考' ? (
                  <>
                    <span className="home-hero-title-line">对发生的一切</span>
                    <span className="home-hero-title-line home-hero-title-line-mobile-break">保持思考</span>
                  </>
                ) : heroHeadline}
              </h2>
              <p className="home-hero-quote">
                <span className="hero-quote-star" aria-hidden="true" />
                {dailyLine.text}
                <span className="hero-panel-source">{` - ${dailyLine.source}`}</span>
              </p>
              <button type="button" onClick={onStartFreeReading} className="hero-outline-button">
                <span>{t('home.freeReadingTitle')}</span>
                <ArrowRight aria-hidden="true" />
              </button>
            </div>

            <button type="button" className="daily-orbit" onClick={onDailyAction} aria-label={isSignedIn ? t('daily.openToday') : t('daily.getToday')}>
              <span className="orbit-coordinate orbit-coordinate-top" aria-hidden="true">RA 19h 03m<br />DEC −20° 36′</span>
              <span className="orbit-coordinate orbit-coordinate-bottom" aria-hidden="true">ECLIPTIC<br />113° 24′</span>
              <span className="daily-orbit-axis daily-orbit-axis-horizontal" aria-hidden="true" />
              <span className="daily-orbit-axis daily-orbit-axis-vertical" aria-hidden="true" />
              <span className="daily-orbit-ring daily-orbit-ring-one" />
              <span className="daily-orbit-ring daily-orbit-ring-two" />
              <span className="daily-orbit-glow" />
              <span className="daily-orbit-star daily-orbit-star-left" aria-hidden="true" />
              <span className="daily-orbit-star daily-orbit-star-right" aria-hidden="true" />
              <span className="daily-orbit-label">{t('daily.eyebrow')}</span>
              {dailyArtwork ? (
                <img
                  src={dailyArtwork}
                  alt={getCardDisplayNames(savedDailyTarot).englishName}
                  className={`daily-orbit-card ${savedDailyTarot.isReversed ? 'is-reversed' : ''}`}
                />
              ) : (
                <span className="mystery-card hero-mystery-card" aria-hidden="true"><b>?</b></span>
              )}
              <span className="daily-orbit-copy">
                <strong>{isSignedIn && savedDailyTarot ? getCardDisplayNames(savedDailyTarot).englishName : t('daily.getToday')}</strong>
                <small>{isSignedIn ? t('daily.openToday') : t('daily.unsignedNote')}</small>
              </span>
            </button>
          </m.section>

          <div className="home-marquee" aria-hidden="true">
            <span>LISTEN TO YOUR HEART</span><b>✦</b><span>TRUST THE UNKNOWN</span><b>✦</b><span>EVERY CARD TELLS A STORY</span><b>✦</b><span>LISTEN TO YOUR HEART</span>
          </div>

          <m.section className="home-dashboard" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}>
            <div className="dashboard-edition" aria-hidden="true">
              <span>VOL. Ⅰ · PERSONAL ORACLE</span>
              <i />
              <span>THE CELESTIAL MANUSCRIPT</span>
            </div>
            <article className="paper-feature daily-entry-card">
              <span className="paper-corner-ornament" aria-hidden="true">✦</span>
              <header className="paper-feature-head">
                <span>01</span>
                <div><p>{t('daily.eyebrow')}</p><small>DAILY ORACLE · 日签档案</small></div>
              </header>
              <div className="daily-entry-body">
                {dailyArtwork ? (
                  <img
                    src={dailyArtwork}
                    alt=""
                    className={`daily-entry-artwork ${savedDailyTarot.isReversed ? 'is-reversed' : ''}`}
                  />
                ) : (
                  <span className="mystery-card entry-mystery-card" aria-hidden="true"><b>?</b></span>
                )}
                <div className="daily-entry-copy">
                  <span className="editorial-caption">MESSAGE OF THE DAY / 今日启示</span>
                  <strong>{isSignedIn && savedDailyTarot ? getCardDisplayNames(savedDailyTarot).chineseName : t('daily.getToday')}</strong>
                  <p>{isSignedIn && savedDailyTarot ? t('daily.signedNote') : t('daily.unsignedPanelNote')}</p>
                  <button type="button" onClick={onDailyAction} className="sun-button">
                    <Sparkles aria-hidden="true" />
                    <span>{isSignedIn ? t('daily.openToday') : t('daily.getToday')}</span>
                  </button>
                </div>
              </div>
              <span className="antique-seal daily-paper-seal" aria-hidden="true"><b>☉</b><small>ORACLE<br />ARCHIVE</small></span>
              <span className="paper-folio" aria-hidden="true">FOLIO 01 — BBT</span>
            </article>

            <button type="button" onClick={onStartFreeReading} className="paper-feature ink-feature">
              <span className="engraved-corner engraved-corner-top" aria-hidden="true" />
              <span className="engraved-corner engraved-corner-bottom" aria-hidden="true" />
              <header className="paper-feature-head"><span>02</span><div><p>{t('home.freeReadingEyebrow')}</p><small>THE RITUAL OF DRAWING</small></div></header>
              <div className="feature-symbol-card" aria-hidden="true">
                <span className="etched-card etched-card-left">✦</span>
                <span className="etched-card etched-card-center"><i>☉</i><b>✧</b></span>
                <span className="etched-card etched-card-right">✦</span>
              </div>
              <span className="ink-coordinate" aria-hidden="true">N 35° 41′<br />E 139° 41′</span>
              <strong className="feature-title">{t('home.freeReadingTitle')}</strong>
              <p className="feature-copy">{t('home.freeReadingCopy')}</p>
              <span className="feature-arrow"><ArrowRight /></span>
            </button>

            <button type="button" onClick={onOpenCardMeanings} className="paper-feature dictionary-feature">
              <header className="paper-feature-head"><span>03</span><div><p>{t('home.cardMeaningsEyebrow')}</p><small>ARCANA INDEX · 牌意图鉴</small></div></header>
              <div className="dictionary-illustration" aria-hidden="true">
                <BookOpen className="dictionary-feature-icon" />
                <span className="dictionary-moon">☾</span>
                <svg viewBox="0 0 180 120" role="presentation">
                  <path d="M18 92c28-2 38-17 52-35 10-13 22-20 31-15 7 4 3 13-4 18-9 7-19 11-24 22-4 8 2 18 12 17 17-2 24-23 42-30 12-5 24 1 35 12" />
                  <path d="M22 101c24-8 35-4 50 2M87 100c19-5 35-4 55 5M52 74l-16-13m27 2L51 45m57 20 11-18m2 30 22-9" />
                </svg>
              </div>
              <strong className="feature-title">{t('home.cardMeaningsTitle')}</strong>
              <p className="feature-copy">{t('home.cardMeaningsCopy')}</p>
              <span className="dictionary-index" aria-hidden="true">78<br /><small>CARDS</small></span>
              <span className="feature-arrow"><ArrowRight /></span>
            </button>

            <MonthlyTarotCalendar
              dailyHistory={dailyHistory}
              intlLocale={intlLocale}
              language={language}
              t={t}
              getCardDisplayNames={getCardDisplayNames}
            />

            <aside className="home-utility-rail">
              <div className="utility-caption" aria-hidden="true"><span>RECENT READINGS</span><small>最近抽牌 · ARCHIVE LOG</small></div>
              <div className="history-card">
                <div className="history-card-head">
                  <div><p className="eyebrow">History</p><strong>{t('history.title')}</strong></div>
                  <span className="history-card-count">{recentReadings.length}</span>
                </div>
              {recentReadings.length > 0 ? (
                <div className="history-list">
                  {recentReadings.map((entry) => (
                    <article
                      key={entry.id}
                      className="history-item"
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenHistory(entry)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onOpenHistory(entry);
                        }
                      }}
                    >
                      <div className="history-item-head">
                        <p className="history-question">{`"${entry.question}"`}</p>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteHistory(entry.id);
                          }}
                          className="history-delete-button"
                          aria-label={t('home.deleteHistoryAria')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="history-cards">{formatHistorySummary(entry)}</p>
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
              <button type="button" onClick={onOpenHumanRequest} className="reader-link">
                <span>{t('home.humanReadingTitle')}</span><ArrowRight />
              </button>
            </aside>
          </m.section>
        </LazyMotion>
      </main>
    </div>
  );
}

export default HomePage;
