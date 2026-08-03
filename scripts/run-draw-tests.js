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
import {
  clampRibbonOffset,
  getRibbonBounds,
  getWheelRibbonOffset,
} from '../src/cardRibbon.js';
import { getShuffleRitualTimeline } from '../src/shuffleRitual.js';
import { getChoiceGroupSlots } from '../src/choiceSpreadUtils.js';
import { buildStructuredReading } from '../src/readingEngine.js';
import zhCN from '../src/i18n/locales/zh-CN.ts';
import en from '../src/i18n/locales/en.ts';
import it from '../src/i18n/locales/it.ts';

function createTranslator() {
  const templates = {
    'common.listSeparator': ', ',
    'common.orientationUpright': 'upright',
    'common.orientationReversed': 'reversed',
    'reading.fallbackQuestion': 'your question',
    'reading.positionResponsibility': '{position} examines {subtitle}.',
    'reading.positionResponsibilityNoSubtitle': '{position} has a defined role.',
    'reading.orientationUpright': 'Upright {card} uses {keywords}.',
    'reading.orientationReversed': 'Reversed {card} uses {keywords}.',
    'reading.contextualMeaning': 'For {question}, {card} at {position} applies {keywords}.',
    'reading.attention': 'At {position}, notice {keywords}.',
    'reading.boundary': 'Not a fixed prediction.',
    'reading.positionThemeTrace': '{position}: {theme}',
    'reading.overview': '{question}: {trace}.',
    'reading.choiceOverview': '{question}: compare {optionA} and {optionB} through {trace}.',
    'reading.overviewReversedOne': 'One reversed card needs adjustment.',
    'reading.overviewReversed': '{count} reversed cards need adjustment.',
    'reading.overviewUpright': 'All cards are upright.',
    'reading.relationshipRepeated': '{theme} repeats at {positions}.',
    'reading.relationshipMixed': 'The spread shows {trace}.',
    'reading.relationshipUpright': 'Upright themes are more visible.',
    'reading.relationshipReversed': 'Internal adjustment matters.',
    'reading.relationshipFlow': 'Read the full sequence as {trace}.',
    'reading.choiceRelationship': '{optionA}: {optionATrace}; {optionB}: {optionBTrace}; {selfPosition}: {selfTheme}.',
    'reading.adviceVerify': 'Verify {theme} at {position}.',
    'reading.adviceAdjust': 'Adjust {theme} at {position}.',
    'reading.adviceStep': 'Take one observable step around {theme} at {position}.',
    'reading.reflectionMixed': 'What concern sits behind {theme}?',
    'reading.reflectionRepeated': 'Why does {theme} repeat?',
    'reading.reflectionChoice': 'Compare {optionA} and {optionB} through {theme}.',
    'reading.disclaimer': 'Reflection only.',
    'reading.choiceAdvantage': '{label} may connect {currentTheme} with {developmentTheme}.',
    'reading.choiceRisk': '{label} must weigh {currentTheme} against {developmentTheme}.',
    'reading.choiceConcern': 'At {position}, your concern centers on {theme}: {meaningLead}',
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
    getKeywords: (card) => card.keywords || (card.isReversed ? ['delay', 'priority'] : ['clarity', 'priority']),
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
    name: 'draw session exposes the complete shuffled deck as stable selectable backs',
    run() {
      const cards = Array.from({ length: 78 }, (_, id) => ({ id, name: `Card ${id}` }));
      let randomCalls = 0;
      const session = createDrawSession(cards, 3, () => {
        randomCalls += 1;
        return 0.42;
      });
      const callsAfterShuffle = randomCalls;
      const selecting = { ...session, phase: 'selecting' };
      const selected = toggleBackSelection(toggleBackSelection(selecting, 31), 67);

      assert.equal(session.visibleBacks.length, 78);
      assert.deepEqual(session.visibleBacks, Array.from({ length: 78 }, (_, index) => index));
      assert.equal(new Set(session.deck.map((card) => card.id)).size, 78);
      assert.equal(randomCalls, callsAfterShuffle);
      assert.deepEqual(selected.selectedBacks, [31, 67]);
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
      session = toggleBackSelection(session, 10);
      assert.deepEqual(session.selectedBacks, [8, 1, 4, 6]);
      session = toggleBackSelection(session, 12);
      session = confirmBackSelection(session);
      assert.deepEqual(session.drawnCards, session.selectedBacks.map((index) => session.deck[index]));
      assert.equal(new Set(session.drawnCards.map((card) => card.id)).size, 5);
    },
  },
  {
    name: 'card ribbon clamps drag and wheel movement to natural deck boundaries',
    run() {
      const bounds = getRibbonBounds(360, 2400, 24);
      assert.deepEqual(bounds, { min: -2064, max: 24 });
      assert.equal(clampRibbonOffset(-900, bounds), -900);
      assert.equal(clampRibbonOffset(80, bounds), 24);
      assert.equal(clampRibbonOffset(-3000, bounds), -2064);
      assert.equal(getWheelRibbonOffset(-500, { deltaX: 0, deltaY: 120 }, bounds), -620);
      assert.equal(getWheelRibbonOffset(-500, { deltaX: -160, deltaY: 20 }, bounds), -340);
    },
  },
  {
    name: 'shuffle ritual has visible riffle cut and gather phases before selection',
    run() {
      const standard = getShuffleRitualTimeline(false);
      const reduced = getShuffleRitualTimeline(true);

      assert.deepEqual(standard.steps.map((step) => step.phase), ['riffle', 'cut', 'gather', 'complete']);
      assert.ok(standard.totalDuration >= 2800 && standard.totalDuration <= 4000);
      assert.ok(standard.steps[1].at > standard.steps[0].at);
      assert.ok(standard.steps[2].at > standard.steps[1].at);
      assert.equal(standard.steps[3].at, standard.totalDuration);
      assert.deepEqual(reduced.steps.map((step) => step.phase), ['gather', 'complete']);
      assert.ok(reduced.totalDuration > 0 && reduced.totalDuration < standard.totalDuration);
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
    name: 'multiline archive meanings stay bound to their own card and orientation',
    run() {
      const spread = {
        key: 'three',
        positions: [{ title: 'First' }, { title: 'Second' }, { title: 'Third' }],
      };
      const cards = [
        { id: 10, name: 'Sun', isReversed: false, keywords: ['success', 'clarity'] },
        { id: 11, name: 'Moon', isReversed: true, keywords: ['uncertainty', 'disclosure'] },
        { id: 12, name: 'Star', isReversed: false, keywords: ['hope', 'repair'] },
      ];
      const multilineArchive = {
        findTarotMeaningCard(card) {
          return { catalogId: card.id };
        },
        getLocalizedMeaningCard(card) {
          return {
            displayReadingUpright: `upright lead ${card.catalogId}.\n\nfollow-up upright ${card.catalogId}.`,
            displayReadingReversed: `reversed lead ${card.catalogId}.\n\nfollow-up reversed ${card.catalogId}.`,
          };
        },
      };
      const result = buildStructuredReading({
        ...readingOptions(spread, cards),
        meaningArchive: multilineArchive,
      });

      assert.equal(result.cards[0].baseMeaning, 'upright lead 10.\n\nfollow-up upright 10.');
      assert.equal(result.cards[1].baseMeaning, 'reversed lead 11.\n\nfollow-up reversed 11.');
      assert.match(result.cards[0].contextualMeaning, /Sun.*success/);
      assert.doesNotMatch(result.cards[1].contextualMeaning, /Sun|success/);
      assert.match(result.cards[1].contextualMeaning, /Moon.*uncertainty/);
      assert.match(result.cards[1].orientationMeaning, /Moon.*uncertainty/);
    },
  },
  {
    name: 'triangle reading synthesizes every supplied position and card theme',
    run() {
      const spread = {
        key: 'triangle',
        positions: [{ title: 'Perception' }, { title: 'Reality' }, { title: 'Advice' }],
      };
      const cards = [
        { id: 1, name: 'Card 1', isReversed: true, keywords: ['perception-theme'] },
        { id: 2, name: 'Card 2', isReversed: false, keywords: ['reality-theme'] },
        { id: 3, name: 'Card 3', isReversed: true, keywords: ['advice-theme'] },
      ];
      const result = buildStructuredReading(readingOptions(spread, cards));
      assert.deepEqual(result.cards.map((card) => card.positionTitle), ['Perception', 'Reality', 'Advice']);
      ['Perception', 'Reality', 'Advice', 'perception-theme', 'reality-theme', 'advice-theme']
        .forEach((value) => assert.match(result.relationship, new RegExp(value)));
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
      const cards = [
        { id: 0, name: 'Card 0', isReversed: false, keywords: ['a-current'] },
        { id: 1, name: 'Card 1', isReversed: true, keywords: ['b-current'] },
        { id: 2, name: 'Card 2', isReversed: true, keywords: ['a-development'] },
        { id: 3, name: 'Card 3', isReversed: false, keywords: ['b-development'] },
        { id: 4, name: 'Card 4', isReversed: true, keywords: ['self-theme'] },
      ];
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
      ['a-current', 'a-development'].forEach((value) => {
        assert.match(result.choiceComparison.optionA.advantage, new RegExp(value));
        assert.match(result.choiceComparison.optionA.risk, new RegExp(value));
      });
      ['b-current', 'b-development'].forEach((value) => {
        assert.match(result.choiceComparison.optionB.advantage, new RegExp(value));
        assert.match(result.choiceComparison.optionB.risk, new RegExp(value));
      });
      ['Stay', 'Move', 'Self', 'self-theme'].forEach((value) => assert.match(result.relationship, new RegExp(value)));
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
        'shufflePhaseRiffle', 'shufflePhaseCut', 'shufflePhaseGather', 'ribbonDragHint',
        'selectedCountLabel', 'requiredCountLabel', 'remainingCountLabel',
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
