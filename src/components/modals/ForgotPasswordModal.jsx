import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Mail, X } from 'lucide-react';

function ForgotPasswordModal({ email, setEmail, onClose, onSubmit, t }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div className="modal-mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <m.div
          className="calendar-modal forgot-password-modal"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="calendar-modal-head">
            <div>
              <p className="eyebrow">{t('auth.forgotPasswordEyebrow')}</p>
              <h3 className="fortune-modal-title">{t('auth.forgotPasswordTitle')}</h3>
            </div>
            <button type="button" onClick={onClose} className="icon-button">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="human-request-copy">{t('auth.forgotPasswordCopy')}</p>
          <label className="field-shell">
            <Mail className="field-icon" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              className="field-input"
            />
          </label>

          <div className="human-request-actions">
            <button type="button" onClick={onClose} className="secondary-button">
              {t('common.cancel')}
            </button>
            <button type="button" onClick={onSubmit} className="primary-button">
              {t('auth.sendResetEmail')}
            </button>
          </div>
        </m.div>
      </m.div>
    </LazyMotion>
  );
}

export default ForgotPasswordModal;
