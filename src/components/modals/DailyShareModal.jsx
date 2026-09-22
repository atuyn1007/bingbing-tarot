import { useEffect, useRef, useState } from 'react';
import { renderDailyTarotShare } from '../../dailyTarotShare';

export default function DailyShareModal({ data, t, onClose }) {
  const dialog = useRef(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [sharing, setSharing] = useState(false);
  useEffect(() => {
    const previous = document.activeElement; dialog.current.showModal();
    return () => previous?.focus();
  }, []);
  useEffect(() => {
    const controller = new AbortController(); let url;
    setResult(null); setError(false);
    renderDailyTarotShare({ data, t, signal: controller.signal }).then(blob => {
      if (controller.signal.aborted) return;
      url = URL.createObjectURL(blob);
      setResult({ url, file: new File([blob], `bingbing-daily-${data.dateKey}.png`, { type: 'image/png' }) });
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [data, t, attempt]);
  const share = async () => {
    setSharing(true);
    try { await navigator.share({ files: [result.file] }); }
    catch (err) { if (err.name !== 'AbortError') setError(true); }
    finally { setSharing(false); }
  };
  return <dialog ref={dialog} className="monthly-share-dialog" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { event.stopPropagation(); if (event.target === dialog.current) onClose(); }}>
    <div className="monthly-share-content">
      <header><h2>{t('archive.shareDaily')}</h2><button type="button" onClick={onClose} aria-label={t('common.close')}>×</button></header>
      {!result && !error && <p role="status">{t('calendar.shareLoading')}</p>}
      {error && <p role="alert">{t('calendar.shareError')} <button type="button" onClick={() => setAttempt(n => n + 1)}>{t('calendar.shareRetry')}</button></p>}
      {result && <><img className="monthly-share-preview" src={result.url} alt={t('archive.shareDaily')} /><footer>
        <a href={result.url} download={result.file.name}>{t('calendar.shareSave')}</a>
        {navigator.canShare?.({ files: [result.file] }) && <button type="button" disabled={sharing} onClick={share}>{t('calendar.shareSend')}</button>}
      </footer></>}
    </div>
  </dialog>;
}
