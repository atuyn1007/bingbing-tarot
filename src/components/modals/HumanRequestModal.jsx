import { LazyMotion, domAnimation, m } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

function HumanRequestModal({
  recentReadings,
  selectedHumanReadingId,
  setSelectedHumanReadingId,
  formatHistorySummary,
  coinBalance,
  onClose,
  onSubmit,
  t,
}) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div className="modal-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <m.div
          className="calendar-modal human-request-modal"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="calendar-modal-head">
            <div>
              <p className="eyebrow">ask bb!</p>
              <h3 className="fortune-modal-title">{t('humanRequest.title')}</h3>
            </div>
            <button type="button" onClick={onClose} className="icon-button">
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
                <p className="human-request-meta">{formatHistorySummary(entry)}</p>
              </button>
            ))}
          </div>

          <div className="human-request-actions">
            <button type="button" onClick={onClose} className="secondary-button">
              {t('humanRequest.thinkAgain')}
            </button>
            <button type="button" onClick={onSubmit} disabled={!selectedHumanReadingId || coinBalance < 10} className="primary-button">
              <MessageCircle className="w-5 h-5" />
              {coinBalance < 10 ? t('humanRequest.notEnoughCoins') : t('humanRequest.sendButton')}
            </button>
          </div>
        </m.div>
      </m.div>
    </LazyMotion>
  );
}

export default HumanRequestModal;
