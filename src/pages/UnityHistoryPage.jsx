import { ArrowRight, MoreHorizontal, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { filterUnityHistory } from '../unityHistoryStore';
import { groupUnityHistoryEntries } from '../unityHistoryPresentation';

function UnityHistoryPage({ theme, entries, locale, onOpenEntry, onDeleteEntry, onClearAll, onStartReading, onBack, t }) {
  const [query, setQuery] = useState('');
  const filteredEntries = useMemo(
    () => filterUnityHistory(entries, query, locale),
    [entries, locale, query],
  );
  const hexagramNames = t('unity.hexagramNames');
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: '2-digit', day: '2-digit' }),
    [locale],
  );
  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }),
    [locale],
  );
  const groupedEntries = useMemo(
    () => groupUnityHistoryEntries(filteredEntries, locale),
    [filteredEntries, locale],
  );
  const recordNumbers = useMemo(
    () => new Map(entries.map((entry, index) => [entry.id, String(entries.length - index).padStart(3, '0')])),
    [entries],
  );

  const confirmDelete = (entry) => {
    if (window.confirm(t('unityHistory.confirmDelete'))) onDeleteEntry(entry);
  };

  const confirmClear = () => {
    if (window.confirm(t('unityHistory.confirmClear'))) onClearAll();
  };

  return (
    <div className={`screen-shell page-shell archive-page unity-history-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={onBack} className="icon-button" aria-label={t('unity.backHome')}>
          <X className="w-5 h-5" />
        </button>
        <h1 className="page-title">{t('unityHistory.title')}</h1>
        <div className="page-header-controls"><LanguageSwitcher /></div>
      </header>

      <main className="unity-history-main">
        <header className="unity-history-heading">
          <p>{t('unityHistory.eyebrow')}</p>
          <h2>{t('unityHistory.title')}</h2>
          <span>{t('unityHistory.description')}</span>
          <small>{t('unityHistory.recordCount', { count: entries.length })}</small>
        </header>

        <section className="unity-history-toolbar" aria-label={t('unityHistory.searchLabel')}>
          <label className="unity-history-search">
            <Search aria-hidden="true" />
            <span className="sr-only">{t('unityHistory.searchLabel')}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('unityHistory.searchPlaceholder')}
            />
            {query ? (
              <button type="button" onClick={() => setQuery('')} aria-label={t('unityHistory.clearSearch')}>
                <X aria-hidden="true" />
              </button>
            ) : null}
          </label>
        </section>

        {!entries.length ? (
          <section className="unity-history-empty">
            <span aria-hidden="true">☉</span>
            <h3>{t('unityHistory.emptyTitle')}</h3>
            <p>{t('unityHistory.emptyDescription')}</p>
            <button type="button" className="unity-history-start" onClick={onStartReading}>
              {t('unityHistory.startReading')}
              <ArrowRight aria-hidden="true" />
            </button>
          </section>
        ) : !filteredEntries.length ? (
          <section className="unity-history-empty">
            <span aria-hidden="true">⌖</span>
            <h3>{t('unityHistory.noMatchesTitle')}</h3>
            <p>{t('unityHistory.noMatchesDescription')}</p>
          </section>
        ) : (
          <section className="unity-history-list" aria-live="polite">
            {groupedEntries.map((group) => (
              <section key={group.key} className="unity-history-month" aria-labelledby={`history-month-${group.key}`}>
                <header className="unity-history-month-heading" id={`history-month-${group.key}`}>
                  <span>{group.year}</span>
                  <i aria-hidden="true" />
                  <strong>{group.month}</strong>
                </header>
                <div className="unity-history-month-records">
                  {group.entries.map((entry) => {
                    const primaryName = hexagramNames[entry.primaryHexagramNumber - 1];
                    const changedName = entry.changedHexagramNumber
                      ? hexagramNames[entry.changedHexagramNumber - 1]
                      : null;
                    const recordNumber = recordNumbers.get(entry.id);
                    return (
                      <article key={entry.id} className="unity-history-record">
                        <span className="unity-history-node" aria-hidden="true" />
                        <div className="unity-history-time">
                          <time dateTime={entry.createdAt}>{dateFormatter.format(new Date(entry.createdAt))}</time>
                          <small>{timeFormatter.format(new Date(entry.createdAt))}</small>
                        </div>
                        <button type="button" className="unity-history-record-main" onClick={() => onOpenEntry(entry)}>
                          <span className="unity-history-record-meta">
                            <span>{t('unityHistory.spreadName')}</span>
                            <span aria-hidden="true">ARC. {entry.createdAt.slice(0, 10)} · REC. {recordNumber}</span>
                          </span>
                          <span className="unity-history-record-question">{entry.question}</span>
                          <span className="unity-history-hexagrams">
                            <span>{t('unityHistory.primaryHexagram')} · {entry.primaryHexagramNumber} {primaryName}</span>
                            {changedName ? (
                              <span className="unity-history-change" aria-label={t('unityHistory.changedHexagram')}>
                                <b aria-hidden="true">→</b>
                                {t('unityHistory.changedHexagram')} · {entry.changedHexagramNumber} {changedName}
                              </span>
                            ) : (
                              <span>{t('unityHistory.noChangedHexagram')}</span>
                            )}
                            <span>{t('unityHistory.movingLineCount', { count: entry.movingLineCount })}</span>
                          </span>
                          <span className="unity-history-view">
                            {t('unityHistory.viewRecord')} <ArrowRight aria-hidden="true" />
                          </span>
                        </button>
                        <details className="unity-history-actions">
                          <summary aria-label={t('unityHistory.moreActions')}>
                            <MoreHorizontal aria-hidden="true" />
                          </summary>
                          <div>
                            <button type="button" className="unity-history-delete" onClick={() => confirmDelete(entry)}>
                              <Trash2 aria-hidden="true" />
                              <span>{t('unityHistory.deleteEntry')}</span>
                            </button>
                          </div>
                        </details>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </section>
        )}

        {entries.length ? (
          <footer className="unity-history-footer">
            <button type="button" className="unity-history-clear" onClick={confirmClear}>
              <Trash2 aria-hidden="true" />
              <span>{t('unityHistory.clearAll')}</span>
            </button>
          </footer>
        ) : null}
      </main>
    </div>
  );
}

export default UnityHistoryPage;
