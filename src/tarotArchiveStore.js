// A full local archive, separate from the old three-entry recent-reading cache.
// Keep the legacy cache intact as a migration backup; a saved empty archive wins.
export function createTarotArchiveStore({ storage, nickname }) {
  const namespace = nickname || 'guest';
  const key = `tarot_full_archive_${namespace}`;
  const legacyKey = `tarot_recent_readings_${namespace}`;
  const listeners = new Set();
  let pending = [];
  let snapshot = { entries: [], status: 'ready' };
  const publish = (entries, status) => {
    snapshot = { entries, status };
    listeners.forEach(listener => listener());
  };
  const read = () => {
    const source = storage.getItem(key);
    const legacy = source === null ? storage.getItem(legacyKey) : null;
    const parsed = JSON.parse(source ?? legacy ?? '[]');
    const entries = source === null ? parsed : parsed?.version === 1 ? parsed.entries : null;
    if (!Array.isArray(entries) || entries.some(item => !item || !item.id || (!Array.isArray(item.cardsData) && !Array.isArray(item.cards)))) {
      throw new Error('Invalid archive');
    }
    return { entries, migration: source === null && legacy !== null };
  };
  const flush = () => {
    let base;
    try { base = read(); }
    catch { publish(snapshot.entries, 'loadError'); return; }
    const entries = pending.reduce((items, update) => update(items), base.entries);
    if (!pending.length && !base.migration) {
      publish(entries, snapshot.status === 'saved' ? 'saved' : 'ready'); return;
    }
    try {
      storage.setItem(key, JSON.stringify({ version: 1, entries }));
      pending = [];
      publish(entries, 'saved');
    } catch {
      publish(entries, 'saveError');
    }
  };
  // Constructing a React store is read-only; migration writes occur after mount.
  try { snapshot = { entries: read().entries, status: 'ready' }; }
  catch { snapshot = { entries: [], status: 'loadError' }; }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    update(updater) {
      const operation = typeof updater === 'function' ? updater : () => updater;
      pending.push(operation);
      // Even when storage is unavailable, keep the current result in memory.
      snapshot = { ...snapshot, entries: operation(snapshot.entries) };
      flush();
    },
    retry: flush,
  };
}
