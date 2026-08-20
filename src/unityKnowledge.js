import { getUnityHexagramByNumber } from './data/unity/hexagrams.js';
import { getUnityHexagramContent } from './data/unity/hexagramContent.js';
import { getUnityKeyword } from './data/unity/keywords.js';
import { getUnityLineText } from './data/unity/lineTexts.js';

export const UNITY_KNOWLEDGE_VERSION = '1.0.0';
export const UNITY_KNOWLEDGE_LOCALES = Object.freeze(['zh-CN', 'en', 'it']);

export function normalizeUnityLocale(locale) {
  if (locale === 'en' || String(locale || '').toLowerCase().startsWith('en-')) return 'en';
  if (locale === 'it' || String(locale || '').toLowerCase().startsWith('it-')) return 'it';
  return 'zh-CN';
}

function localizeKeywords(keywordIds, locale) {
  return Object.freeze(keywordIds.map((keywordId) => {
    const keyword = getUnityKeyword(keywordId);
    return Object.freeze({
      keywordId,
      label: keyword?.labels?.[locale] || keyword?.labels?.['zh-CN'] || keywordId,
    });
  }));
}

export function getUnityHexagramKnowledge(number, requestedLocale = 'zh-CN') {
  const structure = getUnityHexagramByNumber(number);
  if (!structure) return null;
  const locale = normalizeUnityLocale(requestedLocale);
  const content = getUnityHexagramContent(structure.hexagramId);
  if (!content) {
    return Object.freeze({
      structure,
      locale,
      canonical: null,
      modern: null,
      keywords: Object.freeze([]),
      contentStatus: 'unavailable',
      contentVersion: null,
    });
  }
  return Object.freeze({
    structure,
    locale,
    canonical: content.canonical,
    modern: content.modern[locale] || null,
    keywords: localizeKeywords(content.keywordIds, locale),
    contentStatus: content.contentStatus,
    contentVersion: content.contentVersion,
  });
}

export function getUnityLineKnowledge(number, lineIndex, requestedLocale = 'zh-CN') {
  const structure = getUnityHexagramByNumber(number);
  const normalizedLineIndex = Number(lineIndex);
  if (!structure || !Number.isInteger(normalizedLineIndex) || normalizedLineIndex < 1 || normalizedLineIndex > 6) return null;
  const locale = normalizeUnityLocale(requestedLocale);
  const content = getUnityLineText(structure.kingWenNumber, normalizedLineIndex);
  const base = {
    lineId: `line-${String(structure.kingWenNumber).padStart(2, '0')}-${normalizedLineIndex}`,
    hexagramId: structure.hexagramId,
    hexagramNumber: structure.kingWenNumber,
    linePosition: normalizedLineIndex,
    polarity: structure.linePatternBottomToTop[normalizedLineIndex - 1],
    locale,
  };
  if (!content) {
    return Object.freeze({
      ...base,
      canonical: null,
      modern: null,
      contentStatus: 'unavailable',
      contentVersion: null,
    });
  }
  return Object.freeze({
    ...base,
    canonical: content.canonical,
    modern: content.modern[locale] || null,
    contentStatus: content.contentStatus,
    contentVersion: content.contentVersion,
  });
}

function arraysEqual(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((item, index) => item === right[index]);
}

function validateUnityCalculation(result) {
  if (!result || !Array.isArray(result.rounds) || result.rounds.length !== 6) {
    throw new Error('Unity knowledge requires a completed six-round calculation.');
  }
  const primary = getUnityHexagramByNumber(result.primaryHexagram?.number);
  const changed = getUnityHexagramByNumber(result.changedHexagram?.number);
  if (!primary || !changed) throw new Error('Unity calculation contains an unknown hexagram.');
  if (
    !arraysEqual(primary.linePatternBottomToTop, result.primaryHexagram.linePatternBottomToTop)
    || !arraysEqual(changed.linePatternBottomToTop, result.changedHexagram.linePatternBottomToTop)
  ) throw new Error('Unity calculation does not match the structural knowledge catalogue.');

  const movingLineIndexes = [];
  result.rounds.forEach((round, index) => {
    const lineIndex = index + 1;
    if (
      round?.roundIndex !== lineIndex
      || round?.lineIndex !== lineIndex
      || round.linePolarity !== primary.linePatternBottomToTop[index]
      || round.changedPolarity !== changed.linePatternBottomToTop[index]
      || ![6, 7, 8, 9].includes(round.lineValue)
      || round.isMoving !== (round.lineValue === 6 || round.lineValue === 9)
    ) throw new Error('Unity calculation lines are inconsistent.');
    if (round.isMoving) movingLineIndexes.push(lineIndex);
  });
  if (!arraysEqual(movingLineIndexes, result.movingLineIndexes)) {
    throw new Error('Unity moving-line indexes are inconsistent.');
  }
  return { primary, changed };
}

export function buildUnityKnowledgeSnapshot(result, requestedLocale = 'zh-CN') {
  validateUnityCalculation(result);
  const locale = normalizeUnityLocale(requestedLocale);
  const movingLines = Object.freeze(result.movingLineIndexes.map((lineIndex) => {
    const round = result.rounds[lineIndex - 1];
    return Object.freeze({
      ...getUnityLineKnowledge(result.primaryHexagram.number, lineIndex, locale),
      lineIndex,
      lineValue: round.lineValue,
      lineType: round.lineType,
      lineAge: round.lineAge,
      isMoving: round.isMoving,
      changedPolarity: round.changedPolarity,
    });
  }));
  return Object.freeze({
    schemaVersion: '1.0',
    knowledgeVersion: UNITY_KNOWLEDGE_VERSION,
    locale,
    primary: getUnityHexagramKnowledge(result.primaryHexagram.number, locale),
    movingLines,
    changed: movingLines.length
      ? getUnityHexagramKnowledge(result.changedHexagram.number, locale)
      : null,
  });
}

export function buildUnityKnowledgeSnapshots(result, locales = UNITY_KNOWLEDGE_LOCALES) {
  return Object.freeze(Object.fromEntries(
    locales.map((locale) => {
      const normalizedLocale = normalizeUnityLocale(locale);
      return [normalizedLocale, buildUnityKnowledgeSnapshot(result, normalizedLocale)];
    }),
  ));
}
