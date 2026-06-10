import { LazyMotion, domAnimation, m } from 'framer-motion';
import { X } from 'lucide-react';

function CalendarModal({ monthLabel, calendarDays, dailyHistory, onClose, t }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div className="modal-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <m.div
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
            <button type="button" onClick={onClose} className="icon-button">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="calendar-month-label">{monthLabel}</p>
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
        </m.div>
      </m.div>
    </LazyMotion>
  );
}

export default CalendarModal;
