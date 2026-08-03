import { LazyMotion, domAnimation, m } from 'framer-motion';
import { X } from 'lucide-react';
import SpreadCards from '../SpreadCards';
import IntegratedReadingSection from '../IntegratedReadingSection';

function HistoryModal({ reading, structuredReading, spread, onClose, t }) {
  if (!reading) return null;

  return (
    <LazyMotion features={domAnimation}>
      <m.div className="modal-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <m.div
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
            <button type="button" onClick={onClose} className="icon-button">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="history-preview-copy">
            <p className="history-preview-question">{t('history.questionLabel', { question: reading.question })}</p>
            <p className="history-preview-spread">{t('history.spreadLabel', { spread: reading.spreadName })}</p>
          </div>

          <SpreadCards
            cards={reading.cardsData}
            spread={spread}
            isRevealed
            className="history-preview-spread"
            choiceOptions={{ choiceA: reading.choiceA, choiceB: reading.choiceB }}
            t={t}
          />

          <IntegratedReadingSection
            reading={structuredReading}
            t={t}
            className="history-integrated-reading"
          />
        </m.div>
      </m.div>
    </LazyMotion>
  );
}

export default HistoryModal;
