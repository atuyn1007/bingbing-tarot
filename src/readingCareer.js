// Bounded topic mapping, not a prediction engine. Match the actual orientation's
// archived Chinese meaning so switching UI language cannot change the analysis.
const themes = [
  ['authority', /权威|专制|控制失衡|领导|秩序/],
  ['decision', /权衡|僵局|抉择|选择困难|信息不足/],
  ['resources', /资源管理|匮乏|财务|物质|务实滋养|自我忽视/],
  ['initiative', /行动力|创造力|新开始|热情|动力/],
  ['belonging', /归属|家庭|情感圆满|情感支持/],
];

export function isCareerQuestion(question) {
  return /工作|事业|职业|求职|简历|升职|跳槽|职场|\b(work|career|job|promotion|resume|lavoro|carriera|professione|curriculum)\b/iu.test(question);
}

export function getCareerContext(question, canonicalMeaning, t) {
  if (!isCareerQuestion(question)) return null;
  const lead = String(canonicalMeaning || '').split(/[。！？]/u)[0];
  const match = themes.find(([, pattern]) => pattern.test(lead));
  if (!match) return null;
  const theme = match[0];
  return { theme, focus: t(`reading.career.focus.${theme}`), check: t(`reading.career.check.${theme}`) };
}

export function careerLink(from, to, t) {
  const key = `${from.careerContext.theme}_${to.careerContext.theme}`;
  const specific = ['authority_decision', 'decision_resources'].includes(key);
  return t(specific ? `reading.career.links.${key}` : 'reading.career.link', {
    from: from.careerContext.focus, to: to.careerContext.focus,
  });
}

export function careerThreeReading(sections, question, t) {
  const [a, b, c] = sections;
  const reference = section => t('reading.career.reference', {
    position: section.positionTitle, card: section.cardName,
    orientation: t(section.orientation === 'reversed' ? 'common.orientationReversed' : 'common.orientationUpright'),
    meaning: section.meaningLead,
  });
  return {
    title: t('reading.integratedTitle'),
    summary: t('reading.career.summary', { question, a: a.careerContext.focus, b: b.careerContext.focus, c: c.careerContext.focus }),
    paragraphs: [
      `${reference(a)} ${reference(b)} ${careerLink(a, b, t)}`,
      `${reference(c)} ${careerLink(b, c, t)}`,
      t('reading.career.practical', { question, a: a.careerContext.check, b: b.careerContext.check, c: c.careerContext.check }),
    ],
  };
}
