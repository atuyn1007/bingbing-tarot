import { LazyMotion, domAnimation, m } from 'framer-motion';
import { X } from 'lucide-react';

function SpreadModal({ spreadOptions, onClose, onSelect, t }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div className="modal-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <m.div
          className="spread-modal"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="calendar-modal-head">
            <div>
              <p className="eyebrow">{t('spreads.chooseEyebrow')}</p>
              <h3 className="fortune-modal-title">{t('spreads.chooseTitle')}</h3>
            </div>
            <button type="button" onClick={onClose} className="icon-button">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="spread-option-grid">
            {spreadOptions.map((spread) => (
              <button key={spread.key} type="button" className="spread-option-card" onClick={() => onSelect(spread.key)}>
                <div className={`spread-option-preview spread-option-preview-${spread.key}`}>
                  {spread.preview.map((label, index) => (
                    <span key={`${spread.key}-${index}`} className={`spread-option-chip spread-option-chip-${spread.key}-${index + 1}`}>
                      {label}
                    </span>
                  ))}
                </div>
                <strong className="spread-option-title">{spread.name}</strong>
                <p className="spread-option-copy">{spread.description}</p>
              </button>
            ))}
          </div>
        </m.div>
      </m.div>
    </LazyMotion>
  );
}

export default SpreadModal;
