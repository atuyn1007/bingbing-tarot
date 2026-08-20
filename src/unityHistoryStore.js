export const UNITY_HISTORY_VERSION = '1.0.0';

const UNITY_HISTORY_PREFIX = 'tarot_unity_history_';

function resolveStorage(storage) {
  return storage || globalThis.localStorage || null;
}

function normalizeNamespace(nickname) {
  return String(nickname || '').trim() || 'guest';
}

function createUuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => {
    const value = Math.floor(Math.random() * 16);
    const nibble = token === 'x' ? value : (value & 0x3) | 0x8;
    return nibble.toString(16);
  });
}

function isHistoryEntry(entry) {
  return Boolean(
    entry
    && typeof entry.id === 'string'
    && entry.version === UNITY_HISTORY_VERSION
    && typeof entry.createdAt === 'string'
    && !Number.isNaN(Date.parse(entry.createdAt))
    && typeof entry.question === 'string'
    && Number.isInteger(entry.primaryHexagramNumber)
    && (entry.changedHexagramNumber === null || Number.isInteger(entry.changedHexagramNumber))
    && Number.isInteger(entry.movingLineCount)
    && entry.result?.calculation?.status === 'completed'
    && entry.result?.knowledgeByLocale
  );
}

function writeEntries(storage, key, entries) {
  try {
    storage.setItem(key, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

export function getUnityHistoryKey(nickname) {
  return `${UNITY_HISTORY_PREFIX}${normalizeNamespace(nickname)}`;
}

export function createUnityHistoryEntry(archive, now = new Date().toISOString()) {
  const calculation = archive?.calculation;
  if (
    !calculation
    || calculation.status !== 'completed'
    || !archive.knowledgeByLocale
    || !Number.isInteger(calculation.primaryHexagram?.number)
    || !Array.isArray(calculation.movingLineIndexes)
  ) throw new Error('Unity history requires a completed result archive.');

  const createdAt = new Date(now).toISOString();
  const hasMovingLines = calculation.movingLineIndexes.length > 0;
  return Object.freeze({
    id: createUuid(),
    version: UNITY_HISTORY_VERSION,
    createdAt,
    question: calculation.question,
    primaryHexagramNumber: calculation.primaryHexagram.number,
    changedHexagramNumber: hasMovingLines ? calculation.changedHexagram.number : null,
    movingLineCount: calculation.movingLineIndexes.length,
    result: archive,
  });
}

export function readUnityHistory(nickname, storage) {
  const target = resolveStorage(storage);
  if (!target) return [];
  try {
    const source = target.getItem(getUnityHistoryKey(nickname));
    if (!source) return [];
    const entries = JSON.parse(source);
    if (!Array.isArray(entries)) return [];
    return entries
      .filter(isHistoryEntry)
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  } catch {
    return [];
  }
}

export function appendUnityHistory(archive, nickname, storage, now) {
  const target = resolveStorage(storage);
  const entry = createUnityHistoryEntry(archive, now);
  const current = readUnityHistory(nickname, target);
  const next = [entry, ...current].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  if (!target || !writeEntries(target, getUnityHistoryKey(nickname), next)) return current;
  return next;
}

export function removeUnityHistoryEntry(id, nickname, storage) {
  const target = resolveStorage(storage);
  const current = readUnityHistory(nickname, target);
  const next = current.filter((entry) => entry.id !== id);
  if (!target || !writeEntries(target, getUnityHistoryKey(nickname), next)) return current;
  return next;
}

export function clearUnityHistory(nickname, storage) {
  const target = resolveStorage(storage);
  if (!target) return [];
  try {
    target.removeItem(getUnityHistoryKey(nickname));
  } catch {
    return readUnityHistory(nickname, target);
  }
  return [];
}

export function filterUnityHistory(entries, query, locale = 'zh-CN') {
  const normalizedQuery = String(query || '').trim().toLocaleLowerCase(locale);
  if (!normalizedQuery) return entries;
  return entries.filter((entry) => {
    const localizedDate = new Date(entry.createdAt).toLocaleString(locale);
    const searchable = [
      entry.question,
      entry.primaryHexagramNumber,
      entry.changedHexagramNumber,
      entry.createdAt,
      localizedDate,
    ].filter((value) => value !== null && value !== undefined).join(' ').toLocaleLowerCase(locale);
    return searchable.includes(normalizedQuery);
  });
}
