import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Circle, Moon } from 'lucide-react';
import { getCardArtwork } from '../cardArtwork';
import { getCalendarDayState, getLocalDateKey, getMonthCalendarDays, isSameCalendarMonth } from '../dateUtils';
import CalendarModal from './modals/CalendarModal';

function MonthlyTarotCalendar({ dailyHistory, intlLocale, language, t, getCardDisplayNames }) {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getLocalDateKey(today), [today]);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDay, setSelectedDay] = useState(null);
  const days = useMemo(() => getMonthCalendarDays(visibleMonth), [visibleMonth]);
  const isCurrentMonth = isSameCalendarMonth(visibleMonth, today);
  const monthLabel = new Intl.DateTimeFormat(intlLocale, {
    year: 'numeric',
    month: 'long',
  }).format(visibleMonth);

  const showPreviousMonth = () => {
    setSelectedDay(null);
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const showNextMonth = () => {
    if (isCurrentMonth) return;
    setSelectedDay(null);
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  return (
    <section className="monthly-tarot-calendar" aria-labelledby="monthly-tarot-calendar-title">
      <span className="monthly-calendar-coordinate monthly-calendar-coordinate-left" aria-hidden="true">
        LUNAR RECORD · 29.53 D
      </span>
      <span className="monthly-calendar-coordinate monthly-calendar-coordinate-right" aria-hidden="true">
        CELESTIAL FOLIO · 04
      </span>

      <header className="monthly-calendar-head">
        <div className="monthly-calendar-heading">
          <p className="monthly-calendar-archive-label">{t('calendar.archiveLabel')}</p>
          <h2 id="monthly-tarot-calendar-title">{t('calendar.title')}</h2>
          <p className="monthly-calendar-english-title">{t('calendar.englishTitle')}</p>
          <p className="monthly-calendar-description">{t('calendar.description')}</p>
        </div>

        <div className="monthly-calendar-switcher" aria-label={monthLabel}>
          <button type="button" onClick={showPreviousMonth} aria-label={t('calendar.previousMonth')}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <span>{monthLabel}</span>
          <button
            type="button"
            onClick={showNextMonth}
            disabled={isCurrentMonth}
            aria-label={t('calendar.nextMonth')}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="monthly-calendar-weekdays" aria-hidden="true">
        {t('calendar.weekdays').map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>

      <div className="monthly-calendar-grid" role="grid" aria-label={`${t('calendar.englishTitle')} · ${monthLabel}`}>
        {days.map((item) => {
          if (item.type === 'blank') {
            return <span key={item.key} className="monthly-calendar-blank" aria-hidden="true" />;
          }

          const card = dailyHistory?.[item.dateKey];
          const state = getCalendarDayState(item.dateKey, dailyHistory, today);
          const isToday = item.dateKey === todayKey;
          const names = card ? getCardDisplayNames(card) : null;
          const artwork = card ? getCardArtwork(card) : '';
          const dateLabel = new Intl.DateTimeFormat(intlLocale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }).format(new Date(`${item.dateKey}T12:00:00`));
          const orientation = card?.isReversed ? t('calendar.reversed') : t('calendar.upright');

          if (state === 'completed') {
            return (
              <button
                type="button"
                role="gridcell"
                key={item.key}
                className="monthly-calendar-cell"
                data-state={state}
                data-today={isToday ? 'true' : 'false'}
                aria-label={t('calendar.completedDayAria', {
                  date: dateLabel,
                  card: names?.chineseName || card.name,
                  orientation,
                })}
                onClick={() => setSelectedDay({ dateKey: item.dateKey, card })}
              >
                <span className="monthly-calendar-day-number">{item.day}</span>
                {isToday ? <span className="monthly-calendar-today">{t('calendar.today')}</span> : null}
                <span className="monthly-calendar-miniature">
                  {artwork ? (
                    <img src={artwork} alt="" className={card.isReversed ? 'is-reversed' : ''} />
                  ) : (
                    <span className="monthly-calendar-paper-back" aria-hidden="true"><Moon /></span>
                  )}
                </span>
              </button>
            );
          }

          return (
            <div
              role="gridcell"
              key={item.key}
              className="monthly-calendar-cell"
              data-state={state}
              data-today={isToday ? 'true' : 'false'}
              aria-label={t(state === 'future' ? 'calendar.futureDayAria' : 'calendar.missedDayAria', { date: dateLabel })}
            >
              <span className="monthly-calendar-day-number">{item.day}</span>
              {isToday ? <span className="monthly-calendar-today">{t('calendar.today')}</span> : null}
              <span className="monthly-calendar-miniature monthly-calendar-empty-paper" aria-hidden="true">
                {state === 'future' || state === 'today-empty' ? <Moon /> : <Circle />}
              </span>
            </div>
          );
        })}
      </div>

      {selectedDay ? (
        <CalendarModal
          selectedDay={selectedDay}
          language={language}
          intlLocale={intlLocale}
          getCardDisplayNames={getCardDisplayNames}
          onClose={() => setSelectedDay(null)}
          t={t}
        />
      ) : null}
    </section>
  );
}

export default MonthlyTarotCalendar;
