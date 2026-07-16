import { useEffect, useState } from 'react';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { BookOpen, X } from 'lucide-react';
import { getCardArtwork } from '../../cardArtwork';

function CalendarModal({ selectedDay, language, intlLocale, getCardDisplayNames, onClose, t }) {
  const [meaning, setMeaning] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    setIsExpanded(false);
    setMeaning(null);

    import('../../cardMeanings.js')
      .then(({ findTarotMeaningCard, getLocalizedMeaningCard }) => {
        const resolved = findTarotMeaningCard(selectedDay.card);
        if (!cancelled && resolved) {
          setMeaning(getLocalizedMeaningCard(resolved, language));
        }
      })
      .catch(() => {
        if (!cancelled) setMeaning(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDay, language]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  if (!selectedDay?.card) return null;

  const { card, dateKey } = selectedDay;
  const artwork = getCardArtwork(card);
  const names = getCardDisplayNames(card);
  const shortOracle = card.isReversed
    ? meaning?.displayDailyReversed
    : meaning?.displayDailyUpright;
  const fullMeaning = meaning?.displayDetail;
  const orientation = card.isReversed ? t('calendar.reversed') : t('calendar.upright');
  const dateLabel = new Intl.DateTimeFormat(intlLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00`));

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="modal-mask calendar-archive-mask"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <m.div
          className="calendar-modal calendar-archive-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-archive-title"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.97, clipPath: 'inset(7% 3% 7% 3%)' }}
          animate={{ opacity: 1, y: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ opacity: 0, y: 14, scale: 0.98 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          onClick={(event) => event.stopPropagation()}
        >
          <span className="calendar-archive-fold" aria-hidden="true" />
          <span className="calendar-archive-engraving calendar-archive-engraving-top" aria-hidden="true">✦ ── ☾ ── ✦</span>

          <button type="button" onClick={onClose} className="calendar-archive-close" aria-label={t('calendar.close')}>
            <X aria-hidden="true" />
          </button>

          <div className="calendar-archive-layout">
            <div className="calendar-archive-stage">
              <span className="calendar-archive-halo" aria-hidden="true" />
              <span className="calendar-archive-orbit" aria-hidden="true" />
              {artwork ? (
                <img
                  src={artwork}
                  alt={names.englishName || names.chineseName}
                  className={`calendar-archive-artwork ${card.isReversed ? 'is-reversed' : ''}`}
                />
              ) : (
                <span className="calendar-archive-artwork-fallback" aria-hidden="true">☾</span>
              )}
              <small>COLLECTED ARCANA · {dateKey.replaceAll('-', ' / ')}</small>
            </div>

            <div className="calendar-archive-paper">
              <header className="calendar-archive-head">
                <p className="calendar-archive-label">{t('calendar.archiveLabel')}</p>
                <time dateTime={dateKey}>{dateLabel}</time>
                <h3 id="calendar-archive-title">{names.chineseName || card.name}</h3>
                <p className="calendar-archive-english-name">{names.englishName}</p>
                <span className="calendar-archive-orientation">{orientation}</span>
              </header>

              <section className="calendar-archive-oracle">
                <span aria-hidden="true">☉</span>
                <div>
                  <p>{t('calendar.dailyOracle')}</p>
                  {shortOracle ? <blockquote>{shortOracle}</blockquote> : <span className="calendar-archive-loading">···</span>}
                </div>
              </section>

              {isExpanded && fullMeaning ? (
                <m.section
                  className="calendar-archive-meaning"
                  initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.28 }}
                >
                  {fullMeaning.split('\n').filter(Boolean).map((paragraph, index) => (
                    <p key={`${index}-${paragraph.slice(0, 18)}`}>{paragraph}</p>
                  ))}
                </m.section>
              ) : null}

              <div className="calendar-archive-actions">
                {fullMeaning ? (
                  <button type="button" className="calendar-archive-meaning-button" onClick={() => setIsExpanded((current) => !current)}>
                    <BookOpen aria-hidden="true" />
                    <span>{t(isExpanded ? 'calendar.hideFullMeaning' : 'calendar.viewFullMeaning')}</span>
                  </button>
                ) : null}
                <button type="button" className="calendar-archive-dismiss" onClick={onClose}>
                  {t('calendar.close')}
                </button>
              </div>
            </div>
          </div>

          <span className="calendar-archive-engraving calendar-archive-engraving-bottom" aria-hidden="true">IV · PERSONAL ORACLE ARCHIVE</span>
        </m.div>
      </m.div>
    </LazyMotion>
  );
}

export default CalendarModal;
