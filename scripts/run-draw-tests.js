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
import * as readingEngine from '../src/readingEngine.js';
import zhCN from '../src/i18n/locales/zh-CN.ts';
import en from '../src/i18n/locales/en.ts';
import it from '../src/i18n/locales/it.ts';

const { buildStructuredReading } = readingEngine;

function createTranslator(locale = 'en') {
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
    'reading.integratedTitle': 'Integrated Reading',
    'reading.integratedCardTrace': '{position} / {card} / {orientation} / {keywords}: {meaning}',
    'reading.integratedRelationEcho': 'RELATION_ECHO {sharedKeywords}',
    'reading.integratedRelationRevision': 'RELATION_REVISION {sharedKeywords}',
    'reading.integratedRelationTension': 'RELATION_TENSION {fromOrientation} {toOrientation}',
    'reading.integratedRelationProgression': 'RELATION_PROGRESSION {fromOrientation} {toOrientation}',
    'reading.integratedThreeSummary': 'THREE_SUMMARY {question}: {firstPosition}/{firstCard}, {middlePosition}/{middleCard}, {lastPosition}/{lastCard}.',
    'reading.integratedThreeLink': 'THREE_LINK {fromPosition}/{fromCard}/{fromOrientation}/{fromKeywords}: {fromMeaning}; {toPosition}/{toCard}/{toOrientation}/{toKeywords}: {toMeaning}; {relation}',
    'reading.integratedThreePractical': 'THREE_PRACTICAL {question}: verify {middleKeywords} at {middlePosition}, then use {lastKeywords} at {lastPosition}.',
    'reading.integratedTriangleSummary': 'TRIANGLE_SUMMARY {question}: {perceptionPosition}/{perceptionCard}, {realityPosition}/{realityCard}, {guidancePosition}/{guidanceCard}.',
    'reading.integratedTriangleReality': 'TRIANGLE_REALITY {perceptionMeaning}; {realityMeaning}; {relation}',
    'reading.integratedTriangleExit': 'TRIANGLE_EXIT {guidancePosition}/{guidanceCard}: {guidanceMeaning}; {perceptionKeywords}; {realityKeywords}.',
    'reading.integratedTrianglePractical': 'TRIANGLE_PRACTICAL {question}: compare {perceptionKeywords} with {realityKeywords}, then test {guidanceKeywords}.',
    'reading.integratedChoiceSummary': 'CHOICE_SUMMARY {question}: {optionA} uses {aCurrentCard}/{aDevelopmentCard}; {optionB} uses {bCurrentCard}/{bDevelopmentCard}; self is {selfCard}.',
    'reading.integratedChoicePath': 'CHOICE_PATH {label}: {currentPosition}/{currentCard}/{currentOrientation}/{currentKeywords}/{currentMeaning}; {developmentPosition}/{developmentCard}/{developmentOrientation}/{developmentKeywords}/{developmentMeaning}; {relation}',
    'reading.integratedChoiceCondition': '{position}/{card}/{orientation}/{keywords}',
    'reading.integratedChoiceTradeoff': 'CHOICE_TRADEOFF {question}: {selfPosition}/{selfCard}/{selfOrientation}/{selfKeywords}/{selfMeaning}; {optionA} requires {optionACondition} ({optionASelfRelation}); {optionB} requires {optionBCondition} ({optionBSelfRelation}).',
    'reading.disclaimer': 'Reflection only.',
    'reading.choiceAdvantage': '{label} may connect {currentTheme} with {developmentTheme}.',
    'reading.choiceRisk': '{label} must weigh {currentTheme} against {developmentTheme}.',
    'reading.choiceConcern': 'At {position}, your concern centers on {theme}: {meaningLead}',
    'drawing.choiceOptionAFallback': 'Option A',
    'drawing.choiceOptionBFallback': 'Option B',
    'drawing.spreadLabelFallback': 'Card {index}',
  };

  return (key, values = {}) => {
    const rendered = (templates[key] || key)
      .replace(/\{(\w+)\}/g, (_, token) => String(values[token] ?? `{${token}}`));
    return locale === 'en' || key === 'common.listSeparator' ? rendered : `[${locale}] ${rendered}`;
  };
}

function createLocaleTranslator(locale) {
  return (key, values = {}) => {
    const template = key.split('.').reduce((current, segment) => current?.[segment], locale);
    return String(template || key)
      .replace(/\{(\w+)\}/g, (_, token) => String(values[token] ?? `{${token}}`));
  };
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

function getIntegratedText(result) {
  return [
    result.integratedReading.title,
    result.integratedReading.summary,
    ...result.integratedReading.paragraphs,
  ].join(' ');
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
      assert.deepEqual(Object.keys(result.integratedReading).sort(), ['paragraphs', 'summary', 'title']);
      assert.equal(result.integratedReading.title, 'Integrated Reading');
      assert.equal(result.integratedReading.paragraphs.length, 3);
      ['One', 'Two', 'Three', 'Signal', 'Tension', 'Action']
        .forEach((value) => assert.match(getIntegratedText(result), new RegExp(value)));
      ['upright archive 1', 'reversed archive 2', 'upright archive 3']
        .forEach((value) => assert.match(getIntegratedText(result), new RegExp(value)));
      assert.doesNotMatch(result.integratedReading.summary, /archive/);
      assert.match(result.integratedReading.paragraphs.join(' '), /upright archive 1/);
      assert.match(result.integratedReading.paragraphs.join(' '), /Should I move\?/);
      assert.match(result.integratedReading.paragraphs.join(' '), /THREE_LINK/);
      assert.match(result.integratedReading.paragraphs.join(' '), /THREE_PRACTICAL/);
      assert.doesNotMatch(getIntegratedText(result), /\{\w+\}/);
      ['relationship', 'advice', 'reflectionQuestion'].forEach((key) => assert.equal(key in result, false));
      ['overview', 'integratedReading', 'disclaimer'].forEach((key) => assert.ok(result[key]));
    },
  },
  {
    name: 'card relation analysis distinguishes echo revision tension and progression from evidence',
    run() {
      assert.equal(typeof readingEngine.analyzeCardRelation, 'function');
      const section = (keywords, orientation) => ({ keywords, orientation });

      assert.deepEqual(
        readingEngine.analyzeCardRelation(section(['boundary', 'pace'], 'upright'), section(['pace', 'dialogue'], 'upright')),
        { kind: 'echo', sharedKeywords: ['pace'] },
      );
      assert.deepEqual(
        readingEngine.analyzeCardRelation(section(['boundary', 'pace'], 'upright'), section(['pace', 'dialogue'], 'reversed')),
        { kind: 'revision', sharedKeywords: ['pace'] },
      );
      assert.deepEqual(
        readingEngine.analyzeCardRelation(section(['boundary'], 'upright'), section(['dialogue'], 'reversed')),
        { kind: 'tension', sharedKeywords: [] },
      );
      assert.deepEqual(
        readingEngine.analyzeCardRelation(section(['boundary'], 'upright'), section(['dialogue'], 'upright')),
        { kind: 'progression', sharedKeywords: [] },
      );
    },
  },
  {
    name: "structured reading prefers each card's archive keywords over shared catalog fallbacks",
    run() {
      const spread = {
        key: 'three',
        positions: [{ title: 'Opening' }, { title: 'Center' }, { title: 'Direction' }],
      };
      const cards = [
        { id: 0, name: 'The Fool', isReversed: false },
        { id: 13, name: 'Death', isReversed: true },
        { id: 19, name: 'The Sun', isReversed: false },
      ];
      const archiveKeywords = {
        0: ['new beginning', 'freedom', 'exploration'],
        13: ['ending', 'transformation', 'release'],
        19: ['joy', 'success', 'vitality'],
      };
      const cardArchive = {
        findTarotMeaningCard(card) {
          return { catalogId: card.id };
        },
        getLocalizedMeaningCard(card) {
          return {
            displayKeywords: archiveKeywords[card.catalogId],
            displayReadingUpright: `upright archive ${card.catalogId}`,
            displayReadingReversed: `reversed archive ${card.catalogId}`,
          };
        },
      };

      const result = buildStructuredReading({
        ...readingOptions(spread, cards),
        meaningArchive: cardArchive,
        getKeywords: () => ['generic clarity', 'generic adjustment'],
      });

      assert.deepEqual(result.cards.map((card) => card.keywords), [
        archiveKeywords[0],
        archiveKeywords[13],
        archiveKeywords[19],
      ]);
      const integratedText = getIntegratedText(result);
      Object.values(archiveKeywords).flat().forEach((keyword) => assert.match(integratedText, new RegExp(keyword)));
      assert.doesNotMatch(integratedText, /generic clarity|generic adjustment/);
    },
  },
  {
    name: 'three triangle and choice spreads expose separate integrated reading generators',
    run() {
      assert.equal(typeof readingEngine.buildThreeCardIntegratedReading, 'function');
      assert.equal(typeof readingEngine.buildTriangleIntegratedReading, 'function');
      assert.equal(typeof readingEngine.buildChoiceIntegratedReading, 'function');

      const cards = [
        { id: 21, name: 'First card', isReversed: false, keywords: ['first-one', 'first-two'] },
        { id: 22, name: 'Middle card', isReversed: true, keywords: ['middle-one', 'middle-two'] },
        { id: 23, name: 'Last card', isReversed: false, keywords: ['last-one', 'last-two'] },
      ];
      const threeSpread = {
        key: 'three',
        name: 'Three Card Spread',
        positions: [{ title: 'Opening' }, { title: 'Crossroads' }, { title: 'Direction' }],
      };
      const triangleSpread = {
        key: 'triangle',
        name: 'Holy Triangle',
        positions: [{ title: 'Perception' }, { title: 'Reality' }, { title: 'Guidance' }],
      };
      const threeResult = buildStructuredReading(readingOptions(threeSpread, cards));
      const triangleResult = buildStructuredReading(readingOptions(triangleSpread, cards));

      const directThree = readingEngine.buildThreeCardIntegratedReading({
        spread: threeSpread,
        cardSections: threeResult.cards,
        question: threeResult.normalizedQuestion,
        t: createTranslator(),
      });
      const directTriangle = readingEngine.buildTriangleIntegratedReading({
        spread: triangleSpread,
        cardSections: triangleResult.cards,
        question: triangleResult.normalizedQuestion,
        t: createTranslator(),
      });

      assert.deepEqual(threeResult.integratedReading, directThree);
      assert.deepEqual(triangleResult.integratedReading, directTriangle);
      assert.notDeepEqual(directThree, directTriangle);
      ['first-one', 'first-two', 'middle-one', 'middle-two', 'last-one', 'last-two']
        .forEach((value) => assert.match(getIntegratedText(threeResult), new RegExp(value)));
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
        .forEach((value) => assert.match(getIntegratedText(result), new RegExp(value)));
      assert.equal(result.integratedReading.paragraphs.length, 3);
      assert.match(result.integratedReading.paragraphs.join(' '), /TRIANGLE_REALITY/);
      assert.match(result.integratedReading.paragraphs.join(' '), /TRIANGLE_EXIT/);
      assert.match(result.integratedReading.paragraphs.join(' '), /TRIANGLE_PRACTICAL/);
      assert.match(result.integratedReading.paragraphs.join(' '), /What should I do next\?/);
      ['reversed archive 1', 'upright archive 2', 'reversed archive 3']
        .forEach((value) => assert.match(result.integratedReading.paragraphs.join(' '), new RegExp(value)));
      assert.doesNotMatch(getIntegratedText(result), /\{\w+\}/);
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
      const directChoice = readingEngine.buildChoiceIntegratedReading({
        spread,
        cardSections: result.cards,
        question: result.normalizedQuestion,
        choiceComparison: result.choiceComparison,
        t: createTranslator(),
      });
      assert.equal(result.choiceComparison.optionA.current.cardId, 0);
      assert.equal(result.choiceComparison.optionA.development.cardId, 2);
      assert.equal(result.choiceComparison.optionB.current.cardId, 1);
      assert.equal(result.choiceComparison.optionB.development.cardId, 3);
      assert.equal(result.choiceComparison.self.cardId, 4);
      assert.deepEqual(result.integratedReading, directChoice);
      assert.equal('winner' in result.choiceComparison, false);
      ['a-current', 'a-development'].forEach((value) => {
        assert.match(result.choiceComparison.optionA.advantage, new RegExp(value));
        assert.match(result.choiceComparison.optionA.risk, new RegExp(value));
      });
      ['b-current', 'b-development'].forEach((value) => {
        assert.match(result.choiceComparison.optionB.advantage, new RegExp(value));
        assert.match(result.choiceComparison.optionB.risk, new RegExp(value));
      });
      ['Stay', 'Move', 'A now', 'B now', 'A later', 'B later', 'Self', 'a-current', 'b-current', 'a-development', 'b-development', 'self-theme']
        .forEach((value) => assert.match(getIntegratedText(result), new RegExp(value)));
      cards.forEach((card) => {
        assert.match(getIntegratedText(result), new RegExp(`${card.isReversed ? 'reversed' : 'upright'} archive ${card.id}`));
      });
      assert.doesNotMatch(result.integratedReading.summary, /archive/);
      assert.equal(result.integratedReading.paragraphs.length, 3);
      assert.equal(result.integratedReading.paragraphs.filter((paragraph) => paragraph.includes('CHOICE_PATH')).length, 2);
      assert.match(result.integratedReading.paragraphs.join(' '), /CHOICE_TRADEOFF/);
      assert.match(result.integratedReading.paragraphs.join(' '), /What should I do next\?/);
      assert.doesNotMatch(getIntegratedText(result), /\{\w+\}/);
      ['relationship', 'advice', 'reflectionQuestion'].forEach((key) => assert.equal(key in result, false));
      assert.deepEqual(getChoiceGroupSlots(cards, positions, [2, 0]).map((slot) => slot.position.title), ['A later', 'A now']);
    },
  },
  {
    name: 'language changes rebuild prose without changing cards or orientations',
    run() {
      const spread = {
        key: 'three',
        name: 'Three Cards',
        positions: [{ title: 'Start' }, { title: 'Middle' }, { title: 'End' }],
      };
      const cards = [
        { id: 31, name: 'Alpha', isReversed: false, keywords: ['alpha-one', 'alpha-two'] },
        { id: 32, name: 'Beta', isReversed: true, keywords: ['beta-one', 'beta-two'] },
        { id: 33, name: 'Gamma', isReversed: false, keywords: ['gamma-one', 'gamma-two'] },
      ];
      const english = buildStructuredReading(readingOptions(spread, cards));
      const italian = buildStructuredReading({
        ...readingOptions(spread, cards),
        language: 'it',
        t: createTranslator('it'),
      });

      assert.deepEqual(
        italian.cards.map(({ cardId, orientation }) => ({ cardId, orientation })),
        english.cards.map(({ cardId, orientation }) => ({ cardId, orientation })),
      );
      assert.notEqual(getIntegratedText(italian), getIntegratedText(english));
    },
  },
  {
    name: 'localized integrated readings fill every relation token without generic filler',
    run() {
      const threeCards = [
        { id: 61, name: 'Boundary Card', isReversed: false, keywords: ['boundary', 'pace'] },
        { id: 62, name: 'Dialogue Card', isReversed: true, keywords: ['dialogue', 'evidence'] },
        { id: 63, name: 'Step Card', isReversed: false, keywords: ['small step', 'verification'] },
      ];
      const choiceCards = [
        ...threeCards,
        { id: 64, name: 'Resource Card', isReversed: true, keywords: ['resources', 'cost'] },
        { id: 65, name: 'Self Card', isReversed: false, keywords: ['capacity', 'boundary'] },
      ];
      const cases = [
        {
          spread: { key: 'three', name: 'Three Cards', positions: [{ title: 'Start' }, { title: 'Pivot' }, { title: 'Next' }] },
          cards: threeCards,
        },
        {
          spread: { key: 'triangle', name: 'Triangle', positions: [{ title: 'Perception' }, { title: 'Reality' }, { title: 'Exit' }] },
          cards: threeCards,
        },
        {
          spread: { key: 'choice', name: 'Choice', positions: [{ title: 'A now' }, { title: 'B now' }, { title: 'A later' }, { title: 'B later' }, { title: 'Self' }] },
          cards: choiceCards,
          choiceOptions: { choiceA: 'Stay', choiceB: 'Move' },
        },
      ];
      const localeEntries = [['zh-CN', zhCN], ['en', en], ['it', it]];
      const localizedResults = localeEntries.flatMap(([language, locale]) => cases.map((testCase) => ({
        language,
        cards: testCase.cards,
        result: buildStructuredReading({
          ...readingOptions(testCase.spread, testCase.cards, 'Should I continue?'),
          language,
          t: createLocaleTranslator(locale),
          choiceOptions: testCase.choiceOptions,
        }),
      })));

      localizedResults.forEach(({ cards, result }) => {
        assert.doesNotMatch(getIntegratedText(result), /\{\w+\}/);
        cards.forEach((card) => assert.match(getIntegratedText(result), new RegExp(card.name)));
      });
      const chineseText = localizedResults
        .filter(({ language }) => language === 'zh-CN')
        .map(({ result }) => getIntegratedText(result))
        .join(' ');
      assert.doesNotMatch(chineseText, /清晰|觉察|调整|提醒/);
      assert.doesNotMatch(chineseText, /命中注定|一定会|绝对不会/);
    },
  },
  {
    name: 'legacy reading without integratedReading resolves to a safe structured module',
    run() {
      assert.equal(typeof readingEngine.resolveIntegratedReading, 'function');
      const spread = {
        key: 'three',
        name: 'Three Cards',
        positions: [{ title: 'One' }, { title: 'Two' }, { title: 'Three' }],
      };
      const cards = [0, 1, 2].map((id) => ({
        id: id + 41,
        name: `Legacy ${id + 1}`,
        isReversed: id === 1,
        keywords: [`legacy-${id + 1}-one`, `legacy-${id + 1}-two`],
      }));
      const current = buildStructuredReading(readingOptions(spread, cards, 'Legacy question'));
      const legacy = { overview: current.overview, cards: current.cards, disclaimer: current.disclaimer };
      const resolved = readingEngine.resolveIntegratedReading(legacy, createTranslator());
      const emptyResolved = readingEngine.resolveIntegratedReading(null, createTranslator());

      assert.deepEqual(Object.keys(resolved).sort(), ['paragraphs', 'summary', 'title']);
      assert.ok(resolved.summary);
      assert.ok(resolved.paragraphs.length > 0);
      assert.ok(resolved.paragraphs.every((paragraph) => typeof paragraph === 'string' && paragraph.trim()));
      cards.forEach((card) => assert.match([resolved.summary, ...resolved.paragraphs].join(' '), new RegExp(card.name)));
      assert.deepEqual(emptyResolved, { title: 'Integrated Reading', summary: '', paragraphs: [] });
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
      assert.equal(zhCN.reading.integratedTitle, '综合解读');
      assert.equal(en.reading.integratedTitle, 'Integrated Reading');
      assert.equal(it.reading.integratedTitle, 'Lettura integrata');
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
