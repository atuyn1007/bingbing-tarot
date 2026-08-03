import assert from 'node:assert/strict';

import {
  confirmBackSelection,
  createDrawPersistenceCoordinator,
  createDrawSession,
  getConfirmedDrawForPersistence,
  revealAllSelectedCards,
  revealSelectedCard,
  toggleBackSelection,
} from '../src/cardDrawFlow.js';
import { getChoiceGroupSlots } from '../src/choiceSpreadUtils.js';
import { buildStructuredReading } from '../src/readingEngine.js';
import zhCN from '../src/i18n/locales/zh-CN.ts';
import en from '../src/i18n/locales/en.ts';
import it from '../src/i18n/locales/it.ts';

function createTranslator() {
  const templates = {
    'reading.fallbackQuestion': 'your question',
    'reading.positionResponsibility': '{position} examines {subtitle}.',
    'reading.positionResponsibilityNoSubtitle': '{position} has a defined role.',
    'reading.orientationUpright': 'Upright {card}: {keywords}.',
    'reading.orientationReversed': 'Reversed {card}: {keywords}.',
    'reading.contextualMeaning': 'For {question}, read {position}.',
    'reading.attention': 'Notice {keywords}.',
    'reading.boundary': 'Not a fixed prediction.',
    'reading.overview': '{question}: {firstTheme} and {lastTheme}.',
    'reading.overviewReversedOne': 'One reversed card needs adjustment.',
    'reading.overviewReversed': '{count} reversed cards need adjustment.',
    'reading.overviewUpright': 'All cards are upright.',
    'reading.relationshipRepeated': '{theme} repeats at {positions}.',
    'reading.relationshipMixed': 'The spread holds more than one direction.',
    'reading.relationshipUpright': 'Upright themes are more visible.',
    'reading.relationshipReversed': 'Internal adjustment matters.',
    'reading.relationshipFlow': '{firstPosition} develops toward {lastPosition}.',
    'reading.adviceVerify': 'Verify {theme} at {position}.',
    'reading.adviceBoundary': 'Set a boundary around {theme}.',
    'reading.adviceStep': 'Take one step around {theme} at {position}.',
    'reading.reflectionMixed': 'What concern sits behind {theme}?',
    'reading.reflectionRepeated': 'Why does {theme} repeat?',
    'reading.disclaimer': 'Reflection only.',
    'reading.choiceAdvantage': '{label} may offer {theme}.',
    'reading.choiceRisk': '{label} may cost {theme}.',
    'reading.choiceConcern': 'Your concern centers on {theme}.',
    'drawing.choiceOptionAFallback': 'Option A',
    'drawing.choiceOptionBFallback': 'Option B',
    'drawing.spreadLabelFallback': 'Card {index}',
  };

  return (key, values = {}) => (templates[key] || key)
    .replace(/\{(\w+)\}/g, (_, token) => String(values[token] ?? `{${token}}`));
}

const meaningArchive = {
  findTarotMeaningCard(card) {
    return { catalogId: card.id };
  },
  getLocalizedMeaningCard(card) {
    return {
      displayReadingUpright: `upright archive ${card.catalogId}`,
      displayReadingReversed: `reversed archive ${card.catalogId}`,
    };
  },
};

function readingOptions(spread, cards, question = 'What should I do next?') {
  return {
    cards,
    question,
    spread,
    language: 'en',
    t: createTranslator(),
    meaningArchive,
    getFallbackReading: (card) => `fallback ${card.id}`,
    getKeywords: (card) => (card.isReversed ? ['delay', 'priority'] : ['clarity', 'priority']),
  };
}

const tests = [
  {
    name: 'draw session preserves the original fifty-percent orientation threshold',
    run() {
      const reversed = createDrawSession([{ id: 1 }], 1, () => 0.49);
      const upright = createDrawSession([{ id: 1 }], 1, () => 0.5);
      assert.equal(reversed.deck[0].isReversed, true);
      assert.equal(upright.deck[0].isReversed, false);
    },
  },
  {
    name: 'three-card selection can be cancelled and confirmed without duplicates',
    run() {
      const cards = Array.from({ length: 78 }, (_, id) => ({ id, name: `Card ${id}` }));
      let session = { ...createDrawSession(cards, 3, () => 0.25), phase: 'selecting' };
      session = toggleBackSelection(session, 2);
      session = toggleBackSelection(session, 5);
      session = toggleBackSelection(session, 2);
      [7, 9].forEach((index) => { session = toggleBackSelection(session, index); });
      session = confirmBackSelection(session);
      assert.deepEqual(session.selectedBacks, [5, 7, 9]);
      assert.equal(new Set(session.drawnCards.map((card) => card.id)).size, 3);
    },
  },
  {
    name: 'five-card choice selection maps card backs in selection order',
    run() {
      const cards = Array.from({ length: 78 }, (_, id) => ({ id, name: `Card ${id}` }));
      let session = { ...createDrawSession(cards, 5, () => 0.75), phase: 'selecting' };
      [8, 1, 10, 4, 6].forEach((index) => { session = toggleBackSelection(session, index); });
      session = confirmBackSelection(session);
      assert.deepEqual(session.drawnCards, session.selectedBacks.map((index) => session.deck[index]));
      assert.equal(new Set(session.drawnCards.map((card) => card.id)).size, 5);
    },
  },
  {
    name: 'single-card reveal is idempotent and reveal-all completes the spread',
    run() {
      const cards = Array.from({ length: 6 }, (_, id) => ({ id }));
      let session = { ...createDrawSession(cards, 3, () => 0.4), phase: 'selecting' };
      [0, 1, 2].forEach((index) => { session = toggleBackSelection(session, index); });
      session = confirmBackSelection(session);
      session = revealSelectedCard(session, 1);
      session = revealSelectedCard(session, 1);
      assert.deepEqual(session.revealedCards, [1]);
      assert.equal(revealAllSelectedCards(session).allRevealed, true);
    },
  },
  {
    name: 'confirmed draw persistence is claimed once per selected card array',
    run() {
      const cards = Array.from({ length: 4 }, (_, id) => ({ id }));
      let session = { ...createDrawSession(cards, 3, () => 0.3), phase: 'selecting' };
      [0, 1, 2].forEach((index) => { session = toggleBackSelection(session, index); });
      session = confirmBackSelection(session);
      assert.equal(getConfirmedDrawForPersistence(session, null), session.drawnCards);
      assert.equal(getConfirmedDrawForPersistence(session, session.drawnCards), null);
    },
  },
  {
    name: 'history synchronization reuses one in-flight request per reading',
    async run() {
      const coordinator = createDrawPersistenceCoordinator();
      let resolveFirst;
      let calls = 0;
      const first = coordinator.run('reading-1', () => {
        calls += 1;
        return new Promise((resolve) => { resolveFirst = resolve; });
      });
      const second = coordinator.run('reading-1', () => Promise.resolve('duplicate'));
      assert.equal(first, second);
      assert.equal(calls, 1);
      resolveFirst('synced');
      assert.equal(await second, 'synced');
    },
  },
  {
    name: 'three-card structured reading returns complete position-bound fields',
    run() {
      const spread = {
        key: 'three',
        positions: [
          { title: 'Signal', subtitle: 'Visible' },
          { title: 'Tension', subtitle: 'Test' },
          { title: 'Action', subtitle: 'Move' },
        ],
      };
      const cards = [
        { id: 1, name: 'One', isReversed: false },
        { id: 2, name: 'Two', isReversed: true },
        { id: 3, name: 'Three', isReversed: false },
      ];
      const result = buildStructuredReading(readingOptions(spread, cards, '  Should I move?  '));
      assert.equal(result.normalizedQuestion, 'Should I move?');
      assert.deepEqual(result.cards.map((card) => card.positionTitle), ['Signal', 'Tension', 'Action']);
      assert.deepEqual(result.cards.map((card) => card.orientation), ['upright', 'reversed', 'upright']);
      assert.equal(result.cards[1].baseMeaning, 'reversed archive 2');
      assert.equal(result.advice.length, 3);
      ['overview', 'relationship', 'reflectionQuestion', 'disclaimer'].forEach((key) => assert.ok(result[key]));
    },
  },
  {
    name: 'triangle reading preserves its supplied perception reality and advice positions',
    run() {
      const spread = {
        key: 'triangle',
        positions: [{ title: 'Perception' }, { title: 'Reality' }, { title: 'Advice' }],
      };
      const cards = [1, 2, 3].map((id) => ({ id, name: `Card ${id}`, isReversed: id !== 2 }));
      const result = buildStructuredReading(readingOptions(spread, cards));
      assert.deepEqual(result.cards.map((card) => card.positionTitle), ['Perception', 'Reality', 'Advice']);
    },
  },
  {
    name: 'choice reading maps A B development and self without choosing a winner',
    run() {
      const positions = [
        { title: 'A now' }, { title: 'B now' }, { title: 'A later' },
        { title: 'B later' }, { title: 'Self' },
      ];
      const spread = { key: 'choice', positions };
      const cards = [0, 1, 2, 3, 4].map((id) => ({ id, name: `Card ${id}`, isReversed: id % 2 === 1 }));
      const result = buildStructuredReading({
        ...readingOptions(spread, cards),
        choiceOptions: { choiceA: 'Stay', choiceB: 'Move' },
      });
      assert.equal(result.choiceComparison.optionA.current.cardId, 0);
      assert.equal(result.choiceComparison.optionA.development.cardId, 2);
      assert.equal(result.choiceComparison.optionB.current.cardId, 1);
      assert.equal(result.choiceComparison.optionB.development.cardId, 3);
      assert.equal(result.choiceComparison.self.cardId, 4);
      assert.equal('winner' in result.choiceComparison, false);
      assert.deepEqual(getChoiceGroupSlots(cards, positions, [2, 0]).map((slot) => slot.position.title), ['A later', 'A now']);
    },
  },
  {
    name: 'structured reading normalizes multiline and blank questions',
    run() {
      const spread = { key: 'three', positions: [{ title: 'One' }, { title: 'Two' }, { title: 'Three' }] };
      const cards = [0, 1, 2].map((id) => ({ id, name: `Card ${id}`, isReversed: false }));
      assert.equal(buildStructuredReading(readingOptions(spread, cards, '  How do I\n move? ')).normalizedQuestion, 'How do I move?');
      assert.equal(buildStructuredReading(readingOptions(spread, cards, ' \n ')).normalizedQuestion, '');
    },
  },
  {
    name: 'participatory draw and structured reading copy exists in every locale',
    run() {
      const drawingKeys = [
        'questionGuidance', 'questionInputLabel', 'questionExamples', 'positionsTitle',
        'startShuffle', 'shuffleTitle', 'skipShuffle', 'selectionTitle', 'selectionProgress',
        'cardBackAria', 'confirmSelectedCards', 'revealTitle', 'revealAll', 'viewFullReading', 'redraw',
      ];
      const readingKeys = Object.keys(zhCN.reading).sort();
      for (const locale of [zhCN, en, it]) {
        drawingKeys.forEach((key) => assert.ok(locale.drawing[key], `missing drawing.${key}`));
        assert.deepEqual(Object.keys(locale.reading).sort(), readingKeys);
      }
    },
  },
];

let failed = 0;
for (const test of tests) {
  try {
    await test.run();
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${test.name}`);
    console.error(error);
  }
}

if (failed > 0) {
  process.exitCode = 1;
} else {
  console.log(`All ${tests.length} draw-flow tests passed.`);
}
