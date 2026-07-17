import { LazyMotion, domAnimation, m } from 'framer-motion';
import { X } from 'lucide-react';

const ARCHIVE_NUMBERS = ['I', 'II', 'III'];

const DIAGRAM_PATHS = {
  three: 'M34 74 H266',
  triangle: 'M72 54 L228 54 L150 162 Z',
  choice: 'M150 172 V138 M150 138 L84 94 M150 138 L216 94 M84 94 L84 48 M216 94 L216 48',
};

function SpreadDiagram({ spread }) {
  return (
    <div className={`spread-option-preview spread-option-preview-${spread.key}`}>
      <svg className="spread-option-constellation" viewBox="0 0 300 200" aria-hidden="true">
        <path d={DIAGRAM_PATHS[spread.key]} />
        <circle cx="22" cy="28" r="2.5" />
        <circle cx="272" cy="33" r="1.8" />
        <circle cx="250" cy="174" r="2.2" />
        <path className="spread-option-orbit" d="M18 108 C62 8 238 8 282 108 C238 192 62 192 18 108 Z" />
      </svg>
      <span className="spread-option-celestial spread-option-celestial-sun" aria-hidden="true">☉</span>
      <span className="spread-option-celestial spread-option-celestial-moon" aria-hidden="true">☾</span>
      {spread.preview.map((label, index) => (
        <span key={`${spread.key}-${index}`} className={`spread-option-chip spread-option-chip-${spread.key}-${index + 1}`}>
          <span className="spread-option-chip-roman">{ARCHIVE_NUMBERS[index] || 'V'}</span>
          <span className="spread-option-chip-star" aria-hidden="true">✦</span>
          <span className="spread-option-chip-label">{label}</span>
        </span>
      ))}
    </div>
  );
}

function SpreadModal({ spreadOptions, onClose, onSelect, t }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div className="modal-mask spread-modal-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <m.div
          className="spread-modal"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="spread-modal-head">
            <div className="spread-modal-heading">
              <p className="spread-archive-label">
                <span>{t('spreads.archiveLabel')}</span>
                <span aria-hidden="true">✦</span>
                <span>DIVINATION CATALOGUE</span>
              </p>
              <h3 className="spread-modal-title">{t('spreads.chooseTitle')}</h3>
              <p className="spread-modal-subtitle">{t('spreads.chooseSubtitle')}</p>
              <div className="spread-manuscript-divider" aria-hidden="true">
                <span>☾</span>
                <i />
                <span>✦</span>
                <i />
                <span>☉</span>
              </div>
              <p className="spread-modal-description">
                <span>{t('spreads.chooseDescription')}</span>
                <span>{t('spreads.chooseDescriptionSecondary')}</span>
              </p>
            </div>
            <button type="button" onClick={onClose} className="spread-modal-close" aria-label={t('common.close')}>
              <span className="spread-modal-close-ring" aria-hidden="true" />
              <X className="w-4 h-4" />
              <span className="spread-modal-close-label" aria-hidden="true">CLOSE</span>
            </button>
          </div>

          <div className="spread-option-grid">
            {spreadOptions.map((spread, index) => (
              <button key={spread.key} type="button" className="spread-option-card" onClick={() => onSelect(spread.key)}>
                <div className="spread-option-archive-head">
                  <span className="spread-option-archive-number">ARC. 03—{ARCHIVE_NUMBERS[index]}</span>
                  <span className="spread-option-archive-mark" aria-hidden="true">✦</span>
                </div>
                <SpreadDiagram spread={spread} />
                <div className="spread-option-heading">
                  <strong className="spread-option-title">{spread.name}</strong>
                  <span className="spread-option-title-en">{spread.englishTitle}</span>
                </div>
                <p className="spread-option-copy">{spread.description}</p>
                <dl className="spread-option-metadata">
                  <div>
                    <dt>{t('spreads.metaTime')}</dt>
                    <dd>{spread.readingTime}</dd>
                  </div>
                  <div>
                    <dt>{t('spreads.metaCards')}</dt>
                    <dd>{spread.cardCount}</dd>
                  </div>
                </dl>
                <p className="spread-option-recommended">
                  <span>{t('spreads.metaRecommended')}</span>
                  {spread.recommended}
                </p>
                <span className="spread-option-select-mark" aria-hidden="true">↗</span>
                <span className="spread-option-hover-star" aria-hidden="true">✦</span>
              </button>
            ))}
          </div>
        </m.div>
      </m.div>
    </LazyMotion>
  );
}

export default SpreadModal;
