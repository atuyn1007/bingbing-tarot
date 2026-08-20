import { validateUnityCastingSession } from './unityCastingFlow.js';

const DRAFT_PREFIX = 'bingbing_tarot_unity_casting_v2';

export function getUnityDraftKey(ownerId) {
  return `${DRAFT_PREFIX}:${String(ownerId || 'anonymous')}`;
}

export function saveUnityDraft(storage, session) {
  if (!storage || !validateUnityCastingSession(session, session?.ownerId)) return false;
  storage.setItem(getUnityDraftKey(session.ownerId), JSON.stringify(session));
  return true;
}

export function loadUnityDraft(storage, ownerId) {
  if (!storage) return null;
  const key = getUnityDraftKey(ownerId);
  const source = storage.getItem(key);
  if (!source) return null;
  try {
    const parsed = JSON.parse(source);
    if (!validateUnityCastingSession(parsed, ownerId)) {
      storage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function clearUnityDraft(storage, ownerId) {
  if (!storage) return;
  storage.removeItem(getUnityDraftKey(ownerId));
}
