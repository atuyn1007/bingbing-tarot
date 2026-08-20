import { Eye, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { filterUnityHistory } from '../unityHistoryStore';

function UnityHistoryPage({ theme, entries, locale, onOpenEntry, onDeleteEntry, onClearAll, onBack, t }) {
  const [query, setQuery] = useState('');
  const filteredEntries = useMemo(
    () => filterUnityHistory(entries, query, locale),
    [entries, locale, query],
  );
  const hexagramNames = t('unity.hexagramNames');
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }),
    [locale],
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
          <span>{t('unityHistory.recordCount', { count: entries.length })}</span>
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
          {entries.length ? (
            <button type="button" className="unity-history-clear" onClick={confirmClear}>
              <Trash2 aria-hidden="true" />
              <span>{t('unityHistory.clearAll')}</span>
            </button>
          ) : null}
        </section>

        {!entries.length ? (
          <section className="unity-history-empty">
            <span aria-hidden="true">☉</span>
            <h3>{t('unityHistory.emptyTitle')}</h3>
            <p>{t('unityHistory.emptyDescription')}</p>
          </section>
        ) : !filteredEntries.length ? (
          <section className="unity-history-empty">
            <span aria-hidden="true">⌖</span>
            <h3>{t('unityHistory.noMatchesTitle')}</h3>
            <p>{t('unityHistory.noMatchesDescription')}</p>
          </section>
        ) : (
          <section className="unity-history-list" aria-live="polite">
            {filteredEntries.map((entry, index) => {
              const primaryName = hexagramNames[entry.primaryHexagramNumber - 1];
              const changedName = entry.changedHexagramNumber
                ? hexagramNames[entry.changedHexagramNumber - 1]
                : null;
              return (
                <article key={entry.id} className="unity-history-record">
                  <span className="unity-history-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div className="unity-history-time">
                    <time dateTime={entry.createdAt}>{dateFormatter.format(new Date(entry.createdAt))}</time>
                    <small>{t('unityHistory.versionLabel', { version: entry.version })}</small>
                  </div>
                  <div className="unity-history-question">
                    <blockquote>{entry.question}</blockquote>
                    <div className="unity-history-hexagrams">
                      <span>{t('unityHistory.primaryHexagram')}: {entry.primaryHexagramNumber} · {primaryName}</span>
                      <span>
                        {changedName
                          ? `${t('unityHistory.changedHexagram')}: ${entry.changedHexagramNumber} · ${changedName}`
                          : t('unityHistory.noChangedHexagram')}
                      </span>
                      <span>{t('unityHistory.movingLineCount', { count: entry.movingLineCount })}</span>
                    </div>
                  </div>
                  <div className="unity-history-actions">
                    <button type="button" className="unity-history-open" onClick={() => onOpenEntry(entry)}>
                      <Eye aria-hidden="true" />
                      <span>{t('unityHistory.openDetail')}</span>
                    </button>
                    <button type="button" className="unity-history-delete" onClick={() => confirmDelete(entry)} aria-label={t('unityHistory.deleteEntry')}>
                      <Trash2 aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default UnityHistoryPage;
