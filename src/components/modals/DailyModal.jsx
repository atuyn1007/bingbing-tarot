import { LazyMotion, domAnimation, m } from 'framer-motion';
import TarotCard from '../../TarotCard';
import { useState } from 'react';
import { getLocalDateKey } from '../../dateUtils';
import { getDailyShareData } from '../../dailyTarotShare';
import DailyShareModal from './DailyShareModal';

function DailyModal({ card, dateKey = getLocalDateKey(new Date()), displayName, intlLocale, keywords, summary, onClose, t, getCardDisplayNames }) {
  const [shareData, setShareData] = useState(null);
  if (!card) return null;

  return (
    <LazyMotion features={domAnimation}>
      <m.div className="modal-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <m.div
          className="fortune-modal daily-archive-modal"
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="daily-archive-stage">
            <span className="daily-archive-orbit daily-archive-orbit-one" />
            <span className="daily-archive-orbit daily-archive-orbit-two" />
            <span className="daily-archive-sun" />
            <div className="fortune-modal-tarot">
              <TarotCard
                card={card}
                isRevealed
                size="normal"
                showOrientation={false}
                rotateReversed
              />
            </div>
            <small className="daily-archive-coordinate">LUNA · DAILY ARCANA</small>
          </div>

          <div className="daily-archive-content">
            <p className="eyebrow">{new Intl.DateTimeFormat(intlLocale, { month: 'numeric', day: 'numeric' }).format(new Date(`${dateKey}T12:00:00`))} {t('daily.modalSuffix')}</p>
            <div className="fortune-modal-card">
              <span>{card.name}{card.isReversed ? `${t('common.dateSeparator')}${t('common.orientationReversed')}` : `${t('common.dateSeparator')}${t('common.orientationUpright')}`}</span>
              <small>{getCardDisplayNames(card).englishName}</small>
            </div>
            <section className="daily-paper-sheet daily-keyword-sheet">
              <span className="daily-sheet-mark">✦</span>
              <p className="fortune-modal-keywords">{t('daily.keywords', { keywords: keywords.join(' / ') })}</p>
            </section>
            <section className="daily-paper-sheet daily-guidance-sheet">
              <span className="daily-sheet-mark">☉</span>
              <p className="fortune-modal-note">{summary}</p>
            </section>
            <button type="button" onClick={onClose} className="primary-button">
              {t('daily.acknowledge')}
            </button>
            <button type="button" className="secondary-button" onClick={() => setShareData(getDailyShareData({ card, dateKey, name: displayName || (intlLocale.startsWith('zh') ? getCardDisplayNames(card).chineseName : getCardDisplayNames(card).englishName), summary, keywords }))}>{t('archive.shareDaily')}</button>
          </div>
        </m.div>
      </m.div>
      {shareData && <DailyShareModal data={shareData} t={t} onClose={() => setShareData(null)} />}
    </LazyMotion>
  );
}

export default DailyModal;
