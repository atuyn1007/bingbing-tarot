import { Gift, X } from 'lucide-react';

function RedeemCodeModal({
  redeemCodeValue,
  setRedeemCodeValue,
  onSubmit,
  onClose,
  isRedeemingCode,
  t,
}) {
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="fortune-modal redeem-modal" onClick={(event) => event.stopPropagation()}>
        <div className="calendar-modal-head redeem-modal-head">
          <div>
            <p className="eyebrow">{t('home.redeemEyebrow')}</p>
            <h2 className="fortune-modal-title redeem-modal-title">{t('home.redeemTitle')}</h2>
          </div>
          <button type="button" onClick={onClose} className="icon-button" aria-label={t('common.close')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="fortune-modal-note redeem-modal-copy">{t('home.redeemCopy')}</p>

        <label className="field-shell redeem-modal-input-shell">
          <Gift className="field-icon" />
          <input
            type="text"
            value={redeemCodeValue}
            onChange={(event) => setRedeemCodeValue(event.target.value.toUpperCase())}
            placeholder={t('home.redeemPlaceholder')}
            className="field-input"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void onSubmit();
              }
            }}
          />
        </label>

        <div className="redeem-modal-actions">
          <button type="button" onClick={onClose} className="secondary-button">
            {t('common.cancel')}
          </button>
          <button type="button" onClick={onSubmit} className="primary-button" disabled={isRedeemingCode}>
            {isRedeemingCode ? t('common.loading') : t('home.redeemAction')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RedeemCodeModal;
