import { LazyMotion, domAnimation, m } from 'framer-motion';
import { X } from 'lucide-react';
import useModalFocus from './useModalFocus';
import SpreadCards from '../SpreadCards';
import IntegratedReadingSection from '../IntegratedReadingSection';
import ReadingOverview from '../ReadingOverview';
import ReadingCardSection from '../ReadingCardSection';
import { ChoiceComparison } from '../../pages/ResultPage';

function HistoryModal({ reading, replay, spread, onClose, t }) {
  const panel = useModalFocus(onClose, Boolean(reading));
  if (!reading) return null;
  const structuredReading = replay?.reading;

  return (
    <LazyMotion features={domAnimation}>
      <m.div className="modal-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <m.div
          className="calendar-modal history-preview-modal"
          ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={t('history.title')}
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
            <button type="button" onClick={onClose} className="icon-button" aria-label={t('common.close')}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="history-preview-copy">
            <p className="history-preview-question">{t('history.questionLabel', { question: replay?.question ?? reading.question })}</p>
            <p className="history-preview-spread">{t('history.spreadLabel', { spread: replay?.spread.name || reading.spreadName })}</p>
          </div>

          <SpreadCards
            cards={replay?.cards || reading.cardsData}
            spread={replay?.spread || spread}
            isRevealed
            className="history-preview-spread"
            choiceOptions={replay?.choiceOptions || { choiceA: reading.choiceA, choiceB: reading.choiceB }}
            t={t}
          />

          {structuredReading ? <>
          {structuredReading.hasContextualReading && <ReadingOverview overview={structuredReading.overview} t={t} />}
          {structuredReading.hasContextualReading && <ChoiceComparison comparison={structuredReading.choiceComparison} t={t} />}
          <div className="reading-card-files-list">
            {structuredReading.cards.map(section => <ReadingCardSection key={`${section.cardId}-${section.positionIndex}`} section={section} t={t} />)}
          </div>
          <IntegratedReadingSection
            reading={structuredReading}
            t={t}
            className="history-integrated-reading"
          />
          <p className="reading-disclaimer">{structuredReading.disclaimer}</p>
          </> : <p className="reading-disclaimer" role="status">{t('historySnapshot.unavailable')}</p>}
        </m.div>
      </m.div>
    </LazyMotion>
  );
}

export default HistoryModal;
