import { deriveUnityLine } from './unityAlgorithm.js';
import {
  UNITY_KNOWLEDGE_LOCALES,
  UNITY_KNOWLEDGE_VERSION,
  buildUnityKnowledgeSnapshot,
  buildUnityKnowledgeSnapshots,
} from './unityKnowledge.js';

const RESULT_SCHEMA_VERSION = '1.0';
const RESULT_PREFIX = 'bingbing_tarot_unity_result_v1';

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getUnityResultArchiveKey(ownerId) {
  return `${RESULT_PREFIX}:${String(ownerId || 'anonymous')}`;
}

export function createUnityResultArchive(calculation, ownerId, savedAt = new Date().toISOString()) {
  const calculationSnapshot = cloneJson(calculation);
  const archive = {
    schemaVersion: RESULT_SCHEMA_VERSION,
    ownerId: String(ownerId || 'anonymous'),
    calculation: calculationSnapshot,
    knowledgeByLocale: buildUnityKnowledgeSnapshots(calculationSnapshot),
    savedAt,
  };
  if (!validateUnityResultArchive(archive, archive.ownerId)) {
    throw new Error('Unable to create a valid Unity result archive.');
  }
  return archive;
}

function validateRound(round, index) {
  if (
    round?.roundIndex !== index + 1
    || round?.lineIndex !== index + 1
    || !Array.isArray(round?.tarotCards)
    || round.tarotCards.length !== 3
  ) return false;
  const derived = deriveUnityLine(round.tarotCards);
  if (
    derived.lineValue !== round.lineValue
    || derived.linePolarity !== round.linePolarity
    || derived.lineAge !== round.lineAge
    || derived.isMoving !== round.isMoving
    || derived.changedPolarity !== round.changedPolarity
    || !Array.isArray(round.threeCardValues)
    || round.threeCardValues.some((value, cardIndex) => value !== derived.threeCardValues[cardIndex])
  ) return false;
  return round.tarotCards.every((card, cardIndex) => (
    card?.drawIndex === cardIndex + 1
    && (card.orientation === 'upright' || card.orientation === 'reversed')
    && card.coinValue === (card.orientation === 'reversed' ? 3 : 2)
    && card.isReversed === (card.orientation === 'reversed')
    && Number.isInteger(card.cardId)
  ));
}

function validateStoredKnowledge(archive) {
  return UNITY_KNOWLEDGE_LOCALES.every((locale) => {
    const stored = archive.knowledgeByLocale?.[locale];
    if (
      !stored
      || stored.schemaVersion !== '1.0'
      || stored.knowledgeVersion !== UNITY_KNOWLEDGE_VERSION
      || stored.locale !== locale
      || stored.primary?.structure?.kingWenNumber !== archive.calculation.primaryHexagram.number
      || !Array.isArray(stored.movingLines)
      || stored.movingLines.length !== archive.calculation.movingLineIndexes.length
      || stored.movingLines.some((line, index) => line.lineIndex !== archive.calculation.movingLineIndexes[index])
    ) return false;
    const shouldHaveChanged = archive.calculation.movingLineIndexes.length > 0;
    return shouldHaveChanged
      ? stored.changed?.structure?.kingWenNumber === archive.calculation.changedHexagram.number
      : stored.changed === null;
  });
}

export function validateUnityResultArchive(archive, ownerId) {
  try {
    if (
      !archive
      || archive.schemaVersion !== RESULT_SCHEMA_VERSION
      || archive.ownerId !== String(ownerId || 'anonymous')
      || typeof archive.savedAt !== 'string'
      || archive.calculation?.schemaVersion !== '2.0'
      || archive.calculation?.status !== 'completed'
      || !Array.isArray(archive.calculation?.rounds)
      || archive.calculation.rounds.length !== 6
      || typeof archive.calculation.question !== 'string'
    ) return false;
    if (!archive.calculation.rounds.every(validateRound)) return false;
    const cardIds = archive.calculation.rounds.flatMap((round) => round.tarotCards.map((card) => card.cardId));
    if (cardIds.length !== 18 || new Set(cardIds).size !== 18) return false;

    for (const locale of UNITY_KNOWLEDGE_LOCALES) {
      buildUnityKnowledgeSnapshot(archive.calculation, locale);
    }
    return validateStoredKnowledge(archive);
  } catch {
    return false;
  }
}

export function saveUnityResultArchive(storage, archive) {
  if (!storage || !validateUnityResultArchive(archive, archive?.ownerId)) return false;
  storage.setItem(getUnityResultArchiveKey(archive.ownerId), JSON.stringify(archive));
  return true;
}

export function loadUnityResultArchive(storage, ownerId) {
  if (!storage) return null;
  const key = getUnityResultArchiveKey(ownerId);
  const source = storage.getItem(key);
  if (!source) return null;
  try {
    const archive = JSON.parse(source);
    if (!validateUnityResultArchive(archive, ownerId)) {
      storage.removeItem(key);
      return null;
    }
    return archive;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function clearUnityResultArchive(storage, ownerId) {
  if (!storage) return;
  storage.removeItem(getUnityResultArchiveKey(ownerId));
}
