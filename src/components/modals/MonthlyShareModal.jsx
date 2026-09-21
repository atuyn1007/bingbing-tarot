import { useEffect, useRef, useState } from 'react';
import { renderMonthlyTarotShare } from '../../monthlyTarotShare';

export default function MonthlyShareModal({ month, history, locale, t, onClose }) {
  const dialog = useRef(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current.showModal();
    return () => previous?.focus();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let url;
    setResult(null); setError(false);
    renderMonthlyTarotShare({ month, history, locale, t, signal: controller.signal }).then((blob) => {
      if (controller.signal.aborted) return;
      url = URL.createObjectURL(blob);
      const name = `bingbing-tarot-${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}.png`;
      setResult({ url, file: new File([blob], name, { type: 'image/png' }) });
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [month, history, locale, t, attempt]);
  const canShare = result && navigator.canShare?.({ files: [result.file] });
  const share = async () => {
    setSharing(true);
    try { await navigator.share({ files: [result.file] }); }
    catch (err) { if (err.name !== 'AbortError') setError(true); }
    finally { setSharing(false); }
  };
  return (
    <dialog ref={dialog} className="monthly-share-dialog" onCancel={onClose} onClick={(event) => { if (event.target === dialog.current) onClose(); }}>
      <div className="monthly-share-content">
        <header><h2>{t('calendar.shareTitle')}</h2><button type="button" onClick={onClose} aria-label={t('calendar.close')}>×</button></header>
        <p>{t('calendar.shareHelp')}</p>
        {!result && !error ? <p role="status">{t('calendar.shareLoading')}</p> : null}
        {error ? <p role="alert">{t('calendar.shareError')} <button type="button" onClick={() => setAttempt((n) => n + 1)}>{t('calendar.shareRetry')}</button></p> : null}
        {result ? <>
          <img className="monthly-share-preview" src={result.url} alt={t('calendar.shareTitle')} />
          <footer>
            <a href={result.url} download={result.file.name}>{t('calendar.shareSave')}</a>
            {canShare ? <button type="button" disabled={sharing} onClick={share}>{t('calendar.shareSend')}</button> : null}
          </footer>
        </> : null}
      </div>
    </dialog>
  );
}
