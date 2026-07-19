const UNITY_HISTORY_VERSION = '1.0.0';

function cloneSnapshot(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeNickname(nickname) {
  return String(nickname || 'guest').trim() || 'guest';
}

function createUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function getStorage(storage) {
  if (storage) return storage;
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

function isValidEntry(entry) {
  return Boolean(
    entry
      && typeof entry === 'object'
      && entry.id
      && entry.version
      && entry.createdAt
      && Number.isFinite(entry.primaryHexagramNumber)
      && entry.result
      && Array.isArray(entry.result.rounds)
      && entry.result.rounds.length === 6
      && entry.result.rounds.every((round) => Array.isArray(round?.tarotCards) && round.tarotCards.length === 3),
  );
}

function sortNewestFirst(entries) {
  return [...entries].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
}

function writeUnityHistory(nickname, entries, storage) {
  const target = getStorage(storage);
  if (!target) return sortNewestFirst(entries);

  try {
    target.setItem(getUnityHistoryKey(nickname), JSON.stringify(entries));
  } catch {
    // The current casting remains usable if browser storage is unavailable.
  }

  return sortNewestFirst(entries);
}

export function getUnityHistoryKey(nickname) {
  return `tarot_unity_history_${normalizeNickname(nickname)}`;
}

export function createUnityHistoryEntry(reading, now = new Date().toISOString()) {
  if (!reading?.primaryHexagram || !Array.isArray(reading?.rounds)) {
    throw new Error('A complete Unity Spread result is required for history.');
  }

  const result = cloneSnapshot(reading);
  return {
    id: createUuid(),
    version: UNITY_HISTORY_VERSION,
    createdAt: now,
    primaryHexagramNumber: result.primaryHexagram.number,
    changedHexagramNumber: result.changedHexagram?.number ?? result.primaryHexagram.number,
    movingLineIndexes: [...(result.movingLineIndexes || [])],
    result,
  };
}

export function readUnityHistory(nickname, storage) {
  const target = getStorage(storage);
  if (!target) return [];

  try {
    const raw = target.getItem(getUnityHistoryKey(nickname));
    const entries = raw ? JSON.parse(raw) : [];
    return Array.isArray(entries) ? sortNewestFirst(entries.filter(isValidEntry)) : [];
  } catch {
    return [];
  }
}

export function appendUnityHistory(reading, nickname, storage, now) {
  const entry = createUnityHistoryEntry(reading, now);
  const entries = [entry, ...readUnityHistory(nickname, storage)];
  return writeUnityHistory(nickname, entries, storage);
}

export function removeUnityHistoryEntry(entryId, nickname, storage) {
  const entries = readUnityHistory(nickname, storage).filter((entry) => entry.id !== entryId);
  return writeUnityHistory(nickname, entries, storage);
}

export function clearUnityHistory(nickname, storage) {
  const target = getStorage(storage);
  if (target) {
    try {
      target.removeItem(getUnityHistoryKey(nickname));
    } catch {
      // Keep UI state consistent even when the browser refuses persistence.
    }
  }
  return [];
}

export function filterUnityHistory(entries, query, locale = 'zh-CN') {
  const normalizedQuery = String(query || '').trim().toLocaleLowerCase(locale);
  if (!normalizedQuery) return sortNewestFirst(entries || []);

  return sortNewestFirst(entries || []).filter((entry) => {
    const date = new Date(entry.createdAt);
    const dateText = Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
    const searchable = [
      entry.primaryHexagramNumber,
      entry.changedHexagramNumber,
      entry.primaryHexagramName,
      entry.changedHexagramName,
      entry.createdAt,
      dateText,
    ].join(' ').toLocaleLowerCase(locale);
    return searchable.includes(normalizedQuery);
  });
}

export { UNITY_HISTORY_VERSION };
