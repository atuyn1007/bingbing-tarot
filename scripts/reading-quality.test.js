import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStructuredReading } from '../src/readingEngine.js';
import { allTarotCards } from '../src/data.js';
import * as meaningArchive from '../src/cardMeanings.js';
import zh from '../src/i18n/locales/zh-CN.ts';
import en from '../src/i18n/locales/en.ts';
import it from '../src/i18n/locales/it.ts';
import { classifyMeaningEvidence } from '../src/readingEvidence.js';
const names = ['Nine of Cups', 'Queen of Pentacles', 'Ace of Wands', 'Five of Pentacles', 'Ten of Cups'];
const cards = names.map((name, index) => ({ ...allTarotCards.find(card => card.englishName === name), isReversed: [1,4].includes(index) }));
const positions = ['A current', 'B current', 'A development', 'B development', 'Self'].map(title => ({ title }));
const tFor = dictionary => (key, values = {}) => String(key.split('.').reduce((value, part) => value?.[part], dictionary) || key).replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
test('Career context uses the same evidence in every language and respects non-career questions', () => {
  const sample = ['The Emperor', 'Two of Swords', 'Queen of Pentacles'].map((name, index) => ({ ...allTarotCards.find(card => card.englishName === name), isReversed: index === 0 }));
  const before = JSON.stringify(sample);
  for (const [language, dictionary, question] of [['zh-CN', zh, '工作发展'], ['en', en, 'Career development'], ['it', it, 'Sviluppo della carriera']]) {
    const result = build(language, dictionary, { cards: sample, question, spread: { key: 'three', positions: positions.slice(0, 3) } });
    assert.deepEqual(result.cards.map(card => card.careerContext?.theme), ['authority', 'decision', 'resources']);
    assert.doesNotMatch(JSON.stringify(result), /reading\.career|\{\w+\}/);
    for (let index = 0; index < 3; index++) {
      const changed = build(language, dictionary, { cards: sample.map((card, i) => i === index ? { ...card, isReversed: !card.isReversed } : card), question, spread: { key: 'three', positions: positions.slice(0, 3) } });
      assert.notDeepEqual(changed.integratedReading.paragraphs, result.integratedReading.paragraphs);
    }
  }
  assert.equal(JSON.stringify(sample), before);
  const relationship = build('zh-CN', zh, { cards: sample, question: '我们的感情如何？', spread: { key: 'three', positions: positions.slice(0, 3) } });
  assert.ok(relationship.cards.every(card => card.careerContext === null));
});

test('Career prompts do not reuse daily advice even when a theme is not classified', () => {
  const result = build('zh-CN', zh, { cards: [{ ...allTarotCards.find(card => card.englishName === 'The Hermit'), isReversed: false }], question: '工作发展', spread: { key: 'three', positions: [{title: '观察'}] } });
  assert.doesNotMatch(result.cards[0].practice, /今天|今日/);
});
function build(language = 'zh-CN', dictionary = zh, overrides = {}) {
  return buildStructuredReading({ cards, spread: { key: 'choice', positions }, question: '继续工作还是准备简历？', choiceOptions: { choiceA: '继续工作', choiceB: '准备简历' }, language, meaningArchive, t: tFor(dictionary), ...overrides });
}
test('Career choice uses reversed evidence and never promotes scarcity into an advantage', () => {
  const result = build();
  assert.equal(result.cards[1].evidenceKind, 'caution');
  assert.equal(result.cards[3].evidenceKind, 'caution');
  assert.equal(result.choiceComparison.optionA.relationKind, 'support-support');
  assert.equal(result.choiceComparison.optionB.relationKind, 'caution-caution');
  assert.match(result.choiceComparison.optionB.advantage, /不足以确认/);
  assert.doesNotMatch(result.choiceComparison.optionB.advantage, /滋养、务实、富足/);
  assert.match(result.choiceComparison.optionB.risk, /困难与匮乏/);
  assert.match(result.overview, /家庭冲突/);
  assert.match(result.choiceComparison.optionB.path, /自我忽视/);
  assert.doesNotMatch(result.overview, /情感圆满、家庭、归属、和谐|按各自的逆位档案处理/);
  assert.match(result.integratedReading.paragraphs.join(' '), /准备.*执行/);
});
test('Changing only orientation changes the evidence, not the shared card tags', () => {
  const original = build();
  const changed = build('zh-CN', zh, { cards: cards.map((card, index) => index === 3 ? { ...card, isReversed: true } : card) });
  assert.equal(changed.cards[3].evidenceKind, 'support');
  assert.equal(changed.choiceComparison.optionB.relationKind, 'caution-support');
  assert.notEqual(original.choiceComparison.optionB.advantage, changed.choiceComparison.optionB.advantage);
  assert.deepEqual(original.cards[3].keywords, changed.cards[3].keywords);
});
test('Every locale resolves complete evidence copy without changing draw facts', () => {
  const before = JSON.stringify(cards);
  for (const [language, dictionary] of [['zh-CN', zh], ['en', en], ['it', it]]) {
    const result = build(language, dictionary);
    assert.doesNotMatch(JSON.stringify(result), /\{\w+\}|reading\.evidence/);
    assert.ok(result.choiceComparison.optionB.risk.length > 30);
    assert.notEqual(result.choiceComparison.optionA.advantage, result.choiceComparison.optionA.risk);
  }
  assert.equal(JSON.stringify(cards), before);
});

test('All five choice positions contribute orientation-specific meaning to the integrated reading', () => {
  const baseline = build();
  for (let index = 0; index < 5; index += 1) {
    const changed = build('zh-CN', zh, { cards: cards.map((card, position) => position === index ? { ...card, isReversed: !card.isReversed } : card) });
    assert.notDeepEqual(changed.integratedReading, baseline.integratedReading, `Unused position ${index}`);
    assert.notEqual(changed.cards[index].baseMeaning, baseline.cards[index].baseMeaning);
  }
});

test('All 78 cards keep orientation-specific evidence across three spread types and locales', () => {
  for (const [language, dictionary] of [['zh-CN', zh], ['en', en], ['it', it]]) {
    for (const card of allTarotCards) {
      for (const isReversed of [false, true]) {
        for (const key of ['three', 'triangle', 'choice']) {
          const input = [card, ...allTarotCards.filter(other => other.id !== card.id).slice(0, key === 'choice' ? 4 : 2)].map(item => ({ ...item, isReversed }));
          const result = build(language, dictionary, { cards: input, spread: { key, positions: positions.slice(0, input.length) } });
          const meaning = meaningArchive.getLocalizedMeaningCard(meaningArchive.findTarotMeaningCard(card), language);
          assert.equal(result.cards[0].baseMeaning, (isReversed ? meaning.displayReadingReversed : meaning.displayReadingUpright).trim());
          assert.doesNotMatch(JSON.stringify(result), /\{\w+\}|reading\.evidence/);
          assert.ok(result.integratedReading.paragraphs.every(paragraph => typeof paragraph === 'string' && paragraph.length > 0));
        }
      }
    }
  }
});

test('Uncertain and negated evidence stays unclassified instead of becoming an advantage', () => {
  assert.equal(classifyMeaningEvidence('', 'zh-CN'), 'unknown');
  assert.equal(classifyMeaningEvidence('这不代表成功。', 'zh-CN'), 'unknown');
  assert.equal(classifyMeaningEvidence('This is not a guarantee of success.', 'en'), 'unknown');
  assert.equal(classifyMeaningEvidence('Non garantisce successo.', 'it'), 'unknown');
});

test('Work development grounds Emperor reversed, Two of Swords and Queen of Pentacles in career decisions', () => {
  const sample = ['The Emperor', 'Two of Swords', 'Queen of Pentacles'].map((name, index) => ({ ...allTarotCards.find(card => card.englishName === name), isReversed: index === 0 }));
  const result = build('zh-CN', zh, { cards: sample, question: '工作发展', spread: { key: 'three', positions: ['第一张', '第二张', '第三张'].map(title => ({ title })) } });
  assert.deepEqual(result.cards.map(card => card.careerContext?.theme), ['authority', 'decision', 'resources']);
  const text = [result.overview, result.integratedReading.summary, ...result.integratedReading.paragraphs].join('\n');
  assert.match(text, /权限|权责/);
  assert.match(text, /信息|依据/);
  assert.match(text, /时间|精力|收入/);
  assert.doesNotMatch(text, /今天|照顾身体、家庭|不足以判断两处|。、、|。、|。。|过去|未来/);
  for (const card of sample) assert.ok(result.integratedReading.paragraphs.join('').includes(card.name));
  assert.equal(result.integratedReading.paragraphs.length, 3);
});
