import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Search, Trash2 } from 'lucide-react';
import { filterUnityHistory } from '../unityHistoryStore';

function formatArchiveTimestamp(value, locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale || 'zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function UnityHistoryPage({ theme, entries, intlLocale, onBack, onOpenEntry, onDeleteEntry, onClearAll }) {
  const [query, setQuery] = useState('');
  const visibleEntries = useMemo(() => filterUnityHistory(entries, query, intlLocale), [entries, intlLocale, query]);

  const confirmDelete = (entry) => {
    if (window.confirm(`删除 ${formatArchiveTimestamp(entry.createdAt, intlLocale)} 的起卦记录？`)) {
      onDeleteEntry(entry);
    }
  };

  const confirmClearAll = () => {
    if (entries.length > 0 && window.confirm('确定清空全部万象归一历史记录？此操作无法撤销。')) {
      onClearAll();
    }
  };

  return (
    <div className={`screen-shell page-shell archive-page unity-history-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={onBack} className="icon-button" aria-label="返回">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="page-title">万象归一 · 历史档案</h1>
        <div className="page-header-controls" />
      </header>

      <main className="page-content unity-history-content">
        <section className="unity-history-hero">
          <p className="eyebrow">UNITY ARCHIVE · VERSIONED SNAPSHOTS</p>
          <div className="unity-history-hero-row">
            <div>
              <h2>起卦历史</h2>
              <p>每一次起卦都以当时的完整结果封存，不随算法更新而重算。</p>
            </div>
            <span className="unity-history-count">{entries.length.toString().padStart(2, '0')} RECORDS</span>
          </div>
        </section>

        <section className="unity-history-controls" aria-label="历史记录工具">
          <label className="unity-history-search">
            <Search aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索卦号或日期" />
          </label>
          <button type="button" className="unity-history-clear" onClick={confirmClearAll} disabled={entries.length === 0}>
            <Trash2 aria-hidden="true" />清空全部
          </button>
        </section>

        <section className="unity-history-list" aria-live="polite">
          {visibleEntries.map((entry) => {
            const hasMovingLines = entry.movingLineIndexes.length > 0;
            return (
              <article key={entry.id} className="unity-history-record">
                <div className="unity-history-record-index"><span>ARCHIVE</span><strong>{entry.id.slice(0, 8).toUpperCase()}</strong></div>
                <time dateTime={entry.createdAt}>{formatArchiveTimestamp(entry.createdAt, intlLocale)}</time>
                <div className="unity-history-hexagrams">
                  <div><span>本卦</span><strong>{String(entry.primaryHexagramNumber).padStart(2, '0')}</strong></div>
                  {hasMovingLines && <div className="unity-history-change"><span>变卦</span><strong>{String(entry.changedHexagramNumber).padStart(2, '0')}</strong></div>}
                </div>
                <p className="unity-history-moving">动爻 {entry.movingLineIndexes.length}</p>
                <div className="unity-history-record-actions">
                  <button type="button" onClick={() => onOpenEntry(entry)} className="unity-history-open">查看结果 <ArrowUpRight aria-hidden="true" /></button>
                  <button type="button" onClick={() => confirmDelete(entry)} className="unity-history-delete" aria-label="删除此历史记录"><Trash2 aria-hidden="true" /></button>
                </div>
              </article>
            );
          })}
          {visibleEntries.length === 0 && (
            <div className="unity-history-empty">
              <span>✦</span>
              <h2>{entries.length === 0 ? '尚未封存起卦记录' : '未找到匹配的档案'}</h2>
              <p>{entries.length === 0 ? '完成一次万象归一起卦后，完整快照会自动保存在这里。' : '可尝试输入本卦、变卦编号或起卦日期。'}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default UnityHistoryPage;
