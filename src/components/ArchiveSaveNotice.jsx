export default function ArchiveSaveNotice({ status, t, onRetry, busy = false }) {
  if (!['saveError', 'loadError', 'syncError'].includes(status)) return null;
  return <aside className="archive-save-notice" role="alert">
    <span>{t(`archiveStorage.${status}`)}</span>
    <button type="button" disabled={busy} onClick={onRetry}>
      {t(busy ? 'common.loading' : status === 'syncError' ? 'archiveStorage.retrySync' : 'archiveStorage.retry')}
    </button>
  </aside>;
}
