import test from 'node:test';
import assert from 'node:assert/strict';
import * as flow from '../src/cardDrawFlow.js';
import { allTarotCards } from '../src/data.js';
import { getSpreadConfig } from '../src/spreadOptions.js';
import { buildStructuredReading } from '../src/readingEngine.js';
import * as meaningArchive from '../src/cardMeanings.js';
import zh from '../src/i18n/locales/zh-CN.ts';
import en from '../src/i18n/locales/en.ts';
import it from '../src/i18n/locales/it.ts';

const tFor = dictionary => (key, values = {}) => {
  const value = key.split('.').reduce((value, part) => value?.[part], dictionary);
  return typeof value === 'string' ? value.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`) : value ?? key;
};

test('Seasonal draw locks one card per suit in the user-specified order without rerandomizing selections', () => {
  assert.equal(typeof flow.createSeasonalDrawSession, 'function');
  let calls = 0;
  const original = JSON.stringify(allTarotCards);
  let session = flow.createSeasonalDrawSession(allTarotCards, () => { calls++; return 0.49; });
  const initialCalls = calls;
  const selected = [];
  const ranges = [[0, 21], [50, 63], [22, 35], [36, 49], [64, 77]];
  for (let group = 0; group < 5; group++) {
    assert.equal(session.phase, 'shuffling');
    session = flow.completeShuffle(session);
    assert.equal(session.visibleBacks.length, group === 0 ? 22 : 14);
    assert.ok(session.visibleBacks.every(index => session.deck[index].id >= ranges[group][0] && session.deck[index].id <= ranges[group][1]));
    const empty = session;
    assert.equal(flow.confirmBackSelection(session), empty);
    const invalidIndex = session.deck.findIndex(card => card.id < ranges[group][0] || card.id > ranges[group][1]);
    assert.equal(flow.toggleBackSelection(session, invalidIndex), session);
    const index = session.visibleBacks.at(-1);
    session = flow.toggleBackSelection(session, index);
    session = flow.toggleBackSelection(session, index);
    assert.deepEqual(session.selectedBacks, []);
    session = flow.toggleBackSelection(session, index);
    assert.equal(flow.toggleBackSelection(session, session.visibleBacks[0]), session);
    selected.push(session.deck[index]);
    session = flow.confirmBackSelection(session);
    assert.equal(flow.confirmBackSelection(session), session);
    if (group < 4) assert.equal(flow.getConfirmedDrawForPersistence(session, null), null);
  }
  assert.equal(session.phase, 'revealing');
  assert.deepEqual(session.drawnCards, selected);
  assert.equal(new Set(session.drawnCards.map(card => card.id)).size, 5);
  assert.equal(calls, initialCalls);
  assert.equal(JSON.stringify(allTarotCards), original);
  assert.ok(session.drawnCards.every(card => card.isReversed));
  assert.equal(flow.getConfirmedDrawForPersistence(session, session.drawnCards), null);
  assert.equal(flow.openStructuredReading(session), session);
  session = flow.revealSelectedCard(session, 0);
  assert.equal(flow.revealSelectedCard(session, 0), session);
  session = flow.revealAllSelectedCards(session);
  assert.equal(flow.openStructuredReading(session).phase, 'reading');
});

test('Seasonal draw rejects an incomplete or duplicated deck instead of silently drawing the wrong suit', () => {
  assert.equal(typeof flow.createSeasonalDrawSession, 'function');
  assert.throws(() => flow.createSeasonalDrawSession(allTarotCards.slice(0, 64)), /deck/i);
  assert.throws(() => flow.createSeasonalDrawSession([...allTarotCards.slice(0, 77), allTarotCards[0]]), /deck/i);
});

test('Seasonal catalogue and history lookup retain five positions in all languages', () => {
  for (const dictionary of [zh, en, it]) {
    const t = tFor(dictionary);
    const spread = getSpreadConfig('seasons', t);
    assert.equal(spread.key, 'seasons');
    assert.equal(spread.cardCount, 5);
    assert.equal(spread.positions.length, 5);
    assert.ok(spread.positions.every(position => position.title && position.subtitle));
    assert.equal(typeof t('seasons.availability'), 'string');
    assert.notEqual(t('seasons.availability'), 'seasons.availability');
  }
});

test('Quarterly reading pairs every minor with the central major and preserves orientation-specific evidence in every locale', () => {
  const cards = [9, 51, 22, 38, 76].map((id, index) => ({ ...allTarotCards[id], isReversed: index % 2 === 1 }));
  const before = JSON.stringify(cards);
  for (const [language, dictionary] of [['zh-CN', zh], ['en', en], ['it', it]]) {
    const t = tFor(dictionary);
    const spread = getSpreadConfig('seasons', t);
    const reading = buildStructuredReading({ cards, question: '接下来三个月的工作与生活', spread, language, t, meaningArchive });
    const synthesis = reading.integratedReading;
    assert.equal(synthesis.paragraphs.length, 5);
    assert.ok(synthesis.summary.includes(reading.cards[0].meaningLead));
    for (let index = 1; index < 5; index++) {
      const paragraph = synthesis.paragraphs[index - 1];
      assert.ok(paragraph.includes(reading.cards[0].cardName));
      assert.ok(paragraph.includes(reading.cards[index].meaningLead));
      assert.ok(paragraph.includes(spread.positions[index].title));
    }
    for (const section of reading.cards) {
      assert.ok(synthesis.paragraphs.at(-1).includes(section.meaningLead));
      assert.equal(section.careerContext, null, 'A quarterly life reading must not apply a career-only template to every position');
    }
    assert.doesNotMatch(JSON.stringify(synthesis), /\{\w+\}|seasons\.reading/);
    const reversed = buildStructuredReading({ cards: cards.map((card, index) => index === 4 ? { ...card, isReversed: !card.isReversed } : card), question: '接下来三个月的工作与生活', spread, language, t, meaningArchive });
    assert.notEqual(reversed.integratedReading.paragraphs[3], synthesis.paragraphs[3]);
    assert.equal(reversed.integratedReading.paragraphs[0], synthesis.paragraphs[0]);
  }
  assert.equal(JSON.stringify(cards), before);
});
