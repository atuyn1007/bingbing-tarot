// Reviewed career applications of existing archive entries, not new base meanings.
// Identity matters: sharing "leadership" does not make another card the Emperor.
const profiles = {
  'the-emperor': 'authority',
  'two-of-swords': 'decision',
  'queen-of-pentacles': 'resources',
};
const themeOrder = ['authority', 'decision', 'resources'];

export function isCareerQuestion(question) {
  return /工作|事业|职业|求职|简历|升职|跳槽|职场|\b(work|career|job|promotion|resume|lavoro|carriera|professione|curriculum)\b/iu.test(question);
}

export function getCareerContext(question, canonicalMeaning, t, archiveCard, isReversed = false) {
  if (!isCareerQuestion(question) || !String(canonicalMeaning || '').trim()) return null;
  const theme = profiles[archiveCard?.id];
  if (!theme) return null;
  const orientation = isReversed ? 'reversed' : 'upright';
  const prefix = `reading.career.cards.${theme}.${orientation}`;
  return {
    theme,
    orientation,
    interpretation: t(`${prefix}.interpretation`),
    outlook: t(`${prefix}.outlook`),
  };
}

export function careerLink(from, to, t, part = 'body') {
  if (!from?.careerContext || !to?.careerContext) return '';
  // Sort only the semantic lookup, never cards or spread positions.
  const [a, b] = [from, to].sort((left, right) =>
    themeOrder.indexOf(left.careerContext.theme) - themeOrder.indexOf(right.careerContext.theme));
  const first = a.careerContext, second = b.careerContext;
  if (first.theme === second.theme) return '';
  const key = `${first.theme}_${second.theme}.${first.orientation}_${second.orientation}`;
  const reference = section => t('reading.career.reference', {
    position: section.positionTitle, card: section.cardName,
    orientation: t(section.orientation === 'reversed' ? 'common.orientationReversed' : 'common.orientationUpright'),
  });
  return t(`reading.career.pairs.${key}.${part}`, {
    [first.theme]: reference(a),
    [second.theme]: reference(b),
  });
}

export function careerThreeReading(sections, question, t) {
  if (sections.length !== 3 || sections.some(section => !section.careerContext)) return null;
  const [a, b, c] = sections;
  const paragraphs = [[a, b], [b, c], [a, c]].map(([from, to]) => careerLink(from, to, t));
  if (paragraphs.some(paragraph => !paragraph)) return null;
  return {
    title: t('reading.integratedTitle'),
    summary: t('reading.career.summary', {
      question,
      tension: careerLink(a, b, t, 'summary'),
      direction: c.careerContext.outlook,
    }),
    paragraphs,
  };
}
