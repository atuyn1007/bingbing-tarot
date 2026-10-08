import { buildStructuredReading } from './readingEngine.js';
import { getSpreadConfig } from './spreadOptions.js';
import { getCardData, getCardReading } from './data.js';
import { getKeywordsFromMeaningArchive } from './readingMeanings.js';
import { getLocalizedTarotReading } from './tarotKeywordTranslations.js';
import zh from './i18n/locales/zh-CN.ts';
import en from './i18n/locales/en.ts';
import it from './i18n/locales/it.ts';
import { TAROT_READING_SNAPSHOT_VERSION } from './tarotReadingSnapshot.js';

// Loaded only for new readings; history replay must never call this builder.
export function buildTarotReadingSnapshot(entry, meaningArchive) {
  if (!meaningArchive) throw new Error('Meaning archive not ready');
  const byLanguage = {};
  const choiceOptions = { choiceA: entry.choiceA || '', choiceB: entry.choiceB || '' };
  for (const [language, dictionary] of Object.entries({ 'zh-CN': zh, en, it })) {
    const t = (key, values = {}) => {
      const value = key.split('.').reduce((result, part) => result?.[part], dictionary);
      return typeof value === 'string' ? value.replace(/\{(\w+)\}/g, (match, token) => values[token] ?? match) : value;
    };
    const spread = getSpreadConfig(entry.spreadKey, t);
    const reading = buildStructuredReading({ cards: entry.cardsData, question: entry.question, spread, language, t, meaningArchive, choiceOptions,
      getKeywords: card => getKeywordsFromMeaningArchive(card, language, meaningArchive),
      getFallbackReading: card => getLocalizedTarotReading(getCardData(card.id), card.isReversed, language, getCardReading(card)),
    });
    byLanguage[language] = { spread, reading };
  }
  // Serialize once so future catalogue or dictionary mutations cannot change history.
  return JSON.parse(JSON.stringify({ version: TAROT_READING_SNAPSHOT_VERSION,
    engineVersion: 'local-reading-2026-10-08', question: entry.question,
    cards: entry.cardsData, choiceOptions, byLanguage }));
}
