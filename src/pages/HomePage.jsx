import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Bell, Coins, Gift, Sparkles, X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

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
  lastSignInDate,
  onOpenCalendar,
  recentReadings,
  onOpenHistory,
  onDeleteHistory,
  formatHistorySummary,
  isSignedIn,
  savedDailyTarot,
  getCardDisplayNames,
  onDailyAction,
  onStartFreeReading,
  onOpenHumanRequest,
}) {
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

      <main className="home-layout">
        <LazyMotion features={domAnimation}>
          <m.section className="hero-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
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

              <button type="button" onClick={onOpenCalendar} className="stat-card calendar-stat-card">
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
          </m.section>

          <m.section className="action-panel" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }}>
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

              <button type="button" onClick={onDailyAction} className="primary-button daily-button">
                <Sparkles className="w-5 h-5" />
                <span>{isSignedIn ? t('daily.openToday') : t('daily.getToday')}</span>
              </button>
            </div>

            <div className="action-grid">
              <button type="button" onClick={onStartFreeReading} className="feature-card feature-card-light">
                <span className="feature-eyebrow">{t('home.freeReadingEyebrow')}</span>
                <strong className="feature-title">{t('home.freeReadingTitle')}</strong>
                <p className="feature-copy">{t('home.freeReadingCopy')}</p>
              </button>

              <button type="button" onClick={onOpenHumanRequest} className="feature-card feature-card-dark">
                <span className="feature-eyebrow">ask bb!</span>
                <strong className="feature-title">{t('home.humanReadingTitle')}</strong>
                <p className="feature-copy">{t('home.humanReadingCopy')}</p>
              </button>
            </div>
          </m.section>
        </LazyMotion>
      </main>
    </div>
  );
}

export default HomePage;
