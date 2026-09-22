// Conservative text cues, not sentiment scores or a prediction model.
// Only the orientation-specific archive sentence is inspected, never shared tags.
const cues = {
  'zh-CN': {
    caution: /匮乏|困难|冲突|失衡|忽视|焦虑|过度|受阻|不足|熄灭|落空|空虚|破裂|不一致|压抑|欺骗|损失|困境|束缚|耗竭|停滞|失去|不安|逃避/,
    support: /满足|成果|新[的]?开始|创造力|行动力苏醒|稳定|支持|援助|恢复|逐渐过去|和谐|合作|成功|清晰|机会|成长|平衡|希望|信任|丰盛|疗愈|自由/,
    negation: /不代表|不意味着|并非|不是|未必|没有|缺乏|不足/,
  },
  en: {
    caution: /scarcity|hardship|conflict|imbalance|neglect|anxiety|excess|block|lack|burnout|disappoint|emptiness|broken|incompatib|suppress|deception|loss|strain|stagnation|fear|avoidance/i,
    support: /fulfil|satisfaction|achievement|new beginning|creativ|awaken|stability|support|recovery|passing|harmony|cooperat|success|clarity|opportunit|growth|balance|hope|trust|abundance|healing|freedom/i,
    negation: /\bnot\b|\bno\b|without|lack|insufficient/i,
  },
  it: {
    caution: /scarsit|difficolt|conflitt|squilibr|trascur|ansia|eccess|blocc|mancanza|esaur|delusion|vuoto|rottur|incompat|repress|inganno|perdit|stasi|paura|evitare/i,
    support: /soddisfaz|realizzaz|risultat|nuov[oi] iniz|creativ|risvegli|stabilit|sostegno|recupero|passa|armonia|collabor|success|chiarezza|opportunit|crescita|equilibr|speranza|fiducia|abbondanza|guarigione|libert/i,
    negation: /\bnon\b|\bsenza\b|mancanza|insufficien/i,
  },
};

export function classifyMeaningEvidence(meaning, language = 'zh-CN') {
  const text = String(meaning || '').normalize('NFKC');
  const rules = cues[language] || cues['zh-CN'];
  // Ambiguity must never be promoted into an advantage.
  if (rules.negation.test(text)) return 'unknown';
  const caution = rules.caution.test(text);
  const support = rules.support.test(text) && !caution && !rules.negation.test(text);
  return support ? 'support' : caution ? 'caution' : 'unknown';
}

export function getEvidenceRelation(current, development) {
  const from = current.evidenceKind || 'unknown';
  const to = development.evidenceKind || 'unknown';
  return from === 'unknown' || to === 'unknown' ? 'unresolved' : `${from}-${to}`;
}
