const createCard = (id, name, englishName, uprightKeywords, reversedKeywords, upright, reversed) => ({
  id,
  name,
  englishName,
  keywords: uprightKeywords.join(' / '),
  uprightKeywords,
  reversedKeywords,
  upright,
  reversed,
});

const majorArcanaData = [
  createCard(0, '愚者', 'The Fool', ['启程', '信任', '轻装', '可能性'], ['草率', '分心', '逃避', '失序'], '愚者正位代表新的开始。现在适合带着好奇和勇气出发，但也别忘了让热情和判断同行。', '愚者逆位提醒你别把自由变成逃避。先看清风险，再决定要不要继续往前走。'),
  createCard(1, '魔术师', 'The Magician', ['资源', '主动', '表达', '掌控'], ['失焦', '操弄', '空转', '犹疑'], '魔术师正位说明你已经具备行动所需的工具和资源。把想法说清楚，事情就能真正开始。', '魔术师逆位提醒你留意分心或虚张声势。少一点包装，多一点实做，局面会更稳。'),
  createCard(2, '女祭司', 'The High Priestess', ['直觉', '沉静', '洞察', '内在知识'], ['压抑', '迟疑', '封闭', '回避'], '女祭司正位强调安静下来后才会出现的答案。先听听自己的感受，再做判断。', '女祭司逆位表示你可能忽略了已经出现的直觉信号。别急着解释一切，先回到内心。'),
  createCard(3, '女皇', 'The Empress', ['丰盛', '滋养', '创造', '生长'], ['透支', '依赖', '停滞', '失衡'], '女皇正位象征丰饶、照料与持续生长。现在适合让关系、创意或计划慢慢开花。', '女皇逆位提醒你别只顾着付出。先把自己照顾好，丰盛才会真正回来。'),
  createCard(4, '皇帝', 'The Emperor', ['结构', '边界', '秩序', '担当'], ['僵硬', '控制', '压迫', '不安'], '皇帝正位强调规则、边界和稳健推进。建立秩序之后，事情才更容易落地。', '皇帝逆位提示你可能太想掌控一切。真正可靠的力量，不需要时时证明。'),
  createCard(5, '教皇', 'The Hierophant', ['传统', '学习', '指引', '价值观'], ['教条', '盲从', '抗拒', '卡住'], '教皇正位代表成熟经验和可被传承的方法。向可靠的知识和经验靠近，会更有帮助。', '教皇逆位提醒你辨认哪些规则真的适合现在的你。别为了反抗而反抗。'),
  createCard(6, '恋人', 'The Lovers', ['契合', '选择', '真心', '一致'], ['失配', '摇摆', '诱惑', '错位'], '恋人正位不只关乎关系，也关乎价值是否一致。现在的关键是真心做出一致的选择。', '恋人逆位表示关系或决定里存在摇摆和错位。先厘清自己真正重视的是什么。'),
  createCard(7, '战车', 'The Chariot', ['推进', '定力', '方向', '胜出'], ['失控', '冲过头', '散乱', '勉强'], '战车正位象征坚定的意志和推进力。只要方向清楚，你就能把分散的力量重新收束。', '战车逆位提醒你别把冲劲误当成掌控。若方向不清，再快也只会偏离。'),
  createCard(8, '力量', 'Strength', ['勇气', '温柔', '自持', '安抚'], ['怀疑', '压抑', '失衡', '疲惫'], '力量正位代表温柔而稳定的控制力。真正的强大，是把情绪和本能安顿好。', '力量逆位提示你正在怀疑自己的承受力。允许自己慢一点，不代表软弱。'),
  createCard(9, '隐者', 'The Hermit', ['独处', '内省', '寻灯', '沉淀'], ['封闭', '疏离', '钻牛角尖', '拒绝求助'], '隐者正位鼓励你暂时离开喧闹，回到真正重要的问题里。答案会在安静中靠近。', '隐者逆位提醒你别让独处变成封闭。需要时向外求助，并不会削弱你的清醒。'),
  createCard(10, '命运之轮', 'Wheel of Fortune', ['转机', '循环', '变化', '时机'], ['反复', '错位', '拖延', '抗拒变化'], '命运之轮正位表示局势进入新的循环。顺势而为，往往比抓着旧局更有效。', '命运之轮逆位意味着你可能正在和变化拔河。先接受节奏正在变，新的转机会更容易出现。'),
  createCard(11, '正义', 'Justice', ['公平', '真相', '平衡', '后果'], ['偏见', '失衡', '逃避', '失准'], '正义正位强调诚实、衡量与承担后果。回到事实，判断才会更清楚。', '正义逆位提醒你留意偏见和失衡。只有真正面对后果，事情才会重新回稳。'),
  createCard(12, '倒吊人', 'The Hanged Man', ['暂停', '换位', '放手', '理解'], ['僵住', '拖延', '徒劳', '执念'], '倒吊人正位并非停滞，而是主动暂停。换个角度看事，答案才会慢慢清晰。', '倒吊人逆位意味着你被卡在不愿放手的位置上。真正要放下的，也许是执念。'),
  createCard(13, '死神', 'Death', ['结束', '更新', '脱壳', '转化'], ['恋旧', '拖延告别', '受阻', '停在旧循环'], '死神正位象征一个阶段的结束与新的开启。结束虽然不轻松，却常常是真正更新的起点。', '死神逆位提醒你留意对旧局的眷恋。若一直不肯放手，消耗的会是正在到来的未来。'),
  createCard(14, '节制', 'Temperance', ['调和', '节奏', '流动', '分寸'], ['过量', '失衡', '急躁', '失调'], '节制正位强调把不同部分慢慢调到合适的位置。此刻最重要的是节奏和分寸。', '节制逆位表示某个面向已经过量或过急。把节奏收回来，事情才会重新顺起来。'),
  createCard(15, '恶魔', 'The Devil', ['欲望', '束缚', '沉迷', '困住'], ['松绑', '看见执念', '戒断', '挣脱'], '恶魔正位让你看见那些看似满足、实则消耗的连接。很多束缚来自已经习惯的模式。', '恶魔逆位意味着你开始看见问题所在，并有机会慢慢把自己松开。'),
  createCard(16, '高塔', 'The Tower', ['崩解', '揭露', '突变', '重建前夜'], ['暗裂', '拖着不改', '余震', '勉强维持'], '高塔正位象征旧结构突然崩塌。虽然刺痛，但它也会逼出真正的重建。', '高塔逆位提示某些裂缝其实早已存在。越拖着不处理，后面越容易被动承受。'),
  createCard(17, '星星', 'The Star', ['希望', '疗愈', '信任未来', '清澈'], ['泄气', '失望', '断联', '怀疑希望'], '星星正位带来修复后的安定感与对未来的温柔信任。慢慢恢复就好，不必急着证明自己。', '星星逆位提醒你留意低落和失望。先照顾眼前这一步，光会一点点回来。'),
  createCard(18, '月亮', 'The Moon', ['迷雾', '潜意识', '直觉波动', '未明之事'], ['看清', '雾散', '揭开假象', '回稳'], '月亮正位意味着一切还不够清楚。此刻更适合观察，而不是仓促定论。', '月亮逆位表示迷雾正在散去。虽然真相未必轻松，但你终于能看见轮廓。'),
  createCard(19, '太阳', 'The Sun', ['明朗', '活力', '喜悦', '照见'], ['疲惫', '延迟满足', '光被遮住', '热度下降'], '太阳正位象征清晰、喜悦与生命力。很多答案正在变得简单而直接。', '太阳逆位提示你并非没有好事，只是暂时缺少感受它的余裕。先休息，光会重新照回来。'),
  createCard(20, '审判', 'Judgement', ['召唤', '醒来', '回应内心', '回看过往'], ['迟疑', '否认', '旧账未清', '拖着不翻页'], '审判正位意味着你听见了更真实的召唤。现在适合回看过往，并做出新的回应。', '审判逆位提醒你别继续假装没听见内心的声音。拖延回应，只会让同样的课题再回来。'),
  createCard(21, '世界', 'The World', ['完成', '整合', '圆满', '抵达'], ['未收尾', '未闭环', '临门一脚', '待整合'], '世界正位代表一个周期真正完成。此刻适合整合经验，也适合庆祝抵达。', '世界逆位意味着事情并非失败，只是还有最后一点没有收束好。把结尾做好，新的旅程才会轻松开始。'),
];

const rankLabels = ['王牌', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍者', '骑士', '皇后', '国王'];
const rankEnglishLabels = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];

const suitConfigs = [
  {
    key: 'wands',
    suitName: '权杖',
    englishSuit: 'Wands',
    domain: '行动、热情与创造力',
    positive: ['热情', '行动', '点燃', '推进'],
    negative: ['冲动', '消耗', '拖延', '急躁'],
  },
  {
    key: 'cups',
    suitName: '圣杯',
    englishSuit: 'Cups',
    domain: '情绪、关系与感受',
    positive: ['感受', '连接', '温柔', '流动'],
    negative: ['敏感', '失落', '逃避', '摇摆'],
  },
  {
    key: 'swords',
    suitName: '宝剑',
    englishSuit: 'Swords',
    domain: '思考、判断与沟通',
    positive: ['判断', '清晰', '辨认', '表达'],
    negative: ['焦虑', '拉扯', '误解', '过载'],
  },
  {
    key: 'pentacles',
    suitName: '星币',
    englishSuit: 'Pentacles',
    domain: '现实、资源与落地',
    positive: ['落地', '资源', '积累', '稳定'],
    negative: ['停滞', '匮乏', '失衡', '顾虑'],
  },
];

const rankMeanings = [
  {
    uprightKeywords: ['开端', '机会', '种子', '第一步'],
    reversedKeywords: ['迟滞', '错失', '犹疑', '未成形'],
    uprightSummary: '代表新的起点与刚刚出现的机会',
    reversedSummary: '提醒你留意迟疑、拖延或尚未成形的状态',
    advice: '先把最小的一步真正做出来',
    reverseAdvice: '别只是想象，先确认自己是否真的准备好了',
  },
  {
    uprightKeywords: ['平衡', '选择', '调度', '拿捏'],
    reversedKeywords: ['失衡', '摇摆', '顾此失彼', '忙乱'],
    uprightSummary: '强调两股力量之间的平衡与协调',
    reversedSummary: '提示你已经有些顾此失彼',
    advice: '先决定什么最重要，再调整顺序',
    reverseAdvice: '少做一点，也比把一切都勉强抓住更稳',
  },
  {
    uprightKeywords: ['拓展', '回应', '延伸', '生长'],
    reversedKeywords: ['延迟', '卡住', '分散', '受阻'],
    uprightSummary: '表示事情开始向外延展，回应慢慢出现',
    reversedSummary: '意味着推进节奏被拖慢，结果尚未如期显现',
    advice: '把目光放远一点，给事情一点展开空间',
    reverseAdvice: '先回头检查细节，再决定怎么继续',
  },
  {
    uprightKeywords: ['稳定', '落地', '安顿', '基础'],
    reversedKeywords: ['不稳', '表面热闹', '悬着', '难落定'],
    uprightSummary: '强调稳定、落地与阶段性的安顿',
    reversedSummary: '提醒你表面平稳不代表基础扎实',
    advice: '先把基础打稳，再谈下一步',
    reverseAdvice: '别急着庆祝，先把现实安排理顺',
  },
  {
    uprightKeywords: ['摩擦', '竞争', '碰撞', '辨出优先级'],
    reversedKeywords: ['缓和', '退让', '暗流', '未说开'],
    uprightSummary: '代表摩擦、碰撞与局势中的拉扯',
    reversedSummary: '说明表面缓和了，但真正的问题未必说开',
    advice: '看清冲突背后真正要争的是什么',
    reverseAdvice: '如果想求和，就别假装问题不存在',
  },
  {
    uprightKeywords: ['流动', '回应', '回响', '分享'],
    reversedKeywords: ['失衡', '压力升高', '不对等', '怕失去'],
    uprightSummary: '象征资源或情绪开始流动，努力获得回应',
    reversedSummary: '提醒你留意交换中的不对等与压力',
    advice: '接住回应，也别忘记自己的边界',
    reverseAdvice: '先厘清谁在付出、谁在消耗',
  },
  {
    uprightKeywords: ['坚持', '立场', '防守', '守住'],
    reversedKeywords: ['疲惫', '松动', '招架不住', '想退'],
    uprightSummary: '说明你需要守住自己的位置与立场',
    reversedSummary: '表示你已经有些疲于招架',
    advice: '守住真正重要的东西就够了',
    reverseAdvice: '适度后退，不代表失败',
  },
  {
    uprightKeywords: ['速度', '推进', '消息', '加快'],
    reversedKeywords: ['失序', '打结', '拖慢', '慌乱'],
    uprightSummary: '代表消息、行动与节奏明显加快',
    reversedSummary: '表示快并不等于顺，局面可能有些失序',
    advice: '抓住节奏，趁势推进',
    reverseAdvice: '先排优先级，再处理涌来的事情',
  },
  {
    uprightKeywords: ['韧性', '警觉', '尾声坚持', '守线'],
    reversedKeywords: ['心累', '防线松动', '快撑不住', '疲于防备'],
    uprightSummary: '象征历经消耗后的坚持与警觉',
    reversedSummary: '提醒你已经接近疲惫边缘',
    advice: '把最后一点耐心留给自己',
    reverseAdvice: '承认累了，反而能走得更远',
  },
  {
    uprightKeywords: ['负担', '责任', '收尾', '重量'],
    reversedKeywords: ['卸载', '分摊', '放下', '松绑'],
    uprightSummary: '表示你背着很多责任继续前进',
    reversedSummary: '提醒你没有必要把一切都独自扛着',
    advice: '重新分配重量，才能继续推进',
    reverseAdvice: '学会求助和放下，会更接近真正完成',
  },
  {
    uprightKeywords: ['学习', '好奇', '新消息', '尝试'],
    reversedKeywords: ['稚嫩', '三分钟热度', '不稳定', '想太多'],
    uprightSummary: '带来新的信息、学习欲和探索冲动',
    reversedSummary: '表示热情来得快也去得快，或信息还不稳定',
    advice: '先从最感兴趣的部分开始摸索',
    reverseAdvice: '别急着下结论，先继续观察',
  },
  {
    uprightKeywords: ['出发', '推进', '果断', '行动力'],
    reversedKeywords: ['鲁莽', '急躁', '偏离', '冲过头'],
    uprightSummary: '象征很强的推进力与执行欲',
    reversedSummary: '提醒你速度可能已经超过判断',
    advice: '带着方向感往前冲，效果最好',
    reverseAdvice: '慢一点，不会削弱你的力量',
  },
  {
    uprightKeywords: ['温柔', '自信', '滋养', '感染力'],
    reversedKeywords: ['敏感过头', '失衡', '控制欲', '自我怀疑'],
    uprightSummary: '代表温柔、自信与持续照料的能力',
    reversedSummary: '表示情绪起伏、过度操心或自我怀疑',
    advice: '稳稳发光，不必用力证明',
    reverseAdvice: '先照顾自己，再去照顾别人',
  },
  {
    uprightKeywords: ['成熟', '掌舵', '格局', '可靠'],
    reversedKeywords: ['专断', '僵硬', '过度控制', '固执'],
    uprightSummary: '强调成熟的掌控力与更高层次的判断',
    reversedSummary: '提醒你别让力量变成压迫',
    advice: '看清全局后再做决定，会更稳',
    reverseAdvice: '真正的掌控，不靠硬压实现',
  },
];

const createMinorArcana = (baseId, suitConfig) =>
  rankLabels.map((rankLabel, index) => {
    const rank = rankMeanings[index];
    const name = `${suitConfig.suitName}${rankLabel}`;
    const englishName = `${rankEnglishLabels[index]} of ${suitConfig.englishSuit}`;
    const uprightKeywords = [...rank.uprightKeywords.slice(0, 2), ...suitConfig.positive.slice(0, 2)];
    const reversedKeywords = [...rank.reversedKeywords.slice(0, 2), ...suitConfig.negative.slice(0, 2)];
    const upright = `${name}正位${rank.uprightSummary}，并把${suitConfig.domain}带回更清楚的位置。现在适合${rank.advice}。`;
    const reversed = `${name}逆位${rank.reversedSummary}，尤其会影响${suitConfig.domain}。此刻更适合${rank.reverseAdvice}。`;

    return createCard(baseId + index, name, englishName, uprightKeywords, reversedKeywords, upright, reversed);
  });

const cardCatalog = [
  ...majorArcanaData,
  ...createMinorArcana(22, suitConfigs[0]),
  ...createMinorArcana(36, suitConfigs[1]),
  ...createMinorArcana(50, suitConfigs[2]),
  ...createMinorArcana(64, suitConfigs[3]),
];

const allCardData = Object.fromEntries(cardCatalog.map((card) => [card.id, card]));

export const allTarotCards = cardCatalog.map(({ id, name, englishName }) => ({
  id,
  name,
  englishName,
  image: '',
}));

export const majorArcana = allTarotCards.slice(0, 22);
export const wands = allTarotCards.slice(22, 36);
export const cups = allTarotCards.slice(36, 50);
export const swords = allTarotCards.slice(50, 64);
export const pentacles = allTarotCards.slice(64, 78);

export const getCardData = (id) =>
  allCardData[id] || {
    name: '未知牌面',
    englishName: 'Unknown Card',
    keywords: '',
    uprightKeywords: [],
    reversedKeywords: [],
    upright: '这张牌的牌义暂时还没有被记录。',
    reversed: '这张牌的逆位牌义暂时还没有被记录。',
  };

export const getCardTitle = (card) => {
  if (!card) return '未知牌面 / Unknown Card';

  const matched = typeof card.id === 'number' ? getCardData(card.id) : allTarotCards.find((item) => item.name === card.name);
  const chineseName = card.name || matched?.name || '未知牌面';
  const englishName = matched?.englishName || 'Unknown Card';

  return `${chineseName} / ${englishName}`;
};

export const getCardDisplayNames = (card) => {
  if (!card) {
    return { chineseName: '未知牌面', englishName: 'Unknown Card' };
  }

  const matched = typeof card.id === 'number' ? getCardData(card.id) : allTarotCards.find((item) => item.name === card.name);
  return {
    chineseName: card.name || matched?.name || '未知牌面',
    englishName: matched?.englishName || 'Unknown Card',
  };
};

export const getCardReading = (card) => {
  const data = getCardData(card.id);
  return card.isReversed ? data.reversed : data.upright;
};

export const drawRandomCard = () => {
  const randomIndex = Math.floor(Math.random() * allTarotCards.length);
  const card = allTarotCards[randomIndex];
  const isReversed = Math.random() < 0.5;

  return {
    ...card,
    isReversed,
    displayName: isReversed ? `${card.name}（逆位）` : card.name,
  };
};

export const drawThreeCards = () => {
  const cards = [];
  const usedIndices = new Set();

  while (cards.length < 3) {
    const randomIndex = Math.floor(Math.random() * allTarotCards.length);
    if (usedIndices.has(randomIndex)) continue;

    usedIndices.add(randomIndex);
    const card = allTarotCards[randomIndex];
    const isReversed = Math.random() < 0.5;

    cards.push({
      ...card,
      isReversed,
      displayName: isReversed ? `${card.name}（逆位）` : card.name,
    });
  }

  return cards;
};

export const generateReading = (cards, question) => {
  const readings = cards.map((card) => getCardReading(card));
  const cardNames = cards.map((card) => (card.isReversed ? `${card.name}（逆位）` : card.name));

  return `你抽到的三张牌是：${cardNames.join('、')}。

第一张牌 ${cardNames[0]}：${readings[0]}

第二张牌 ${cardNames[1]}：${readings[1]}

第三张牌 ${cardNames[2]}：${readings[2]}

围绕“${question}”来看，这三张牌共同提示你：先辨认眼前真正的重心，再决定行动的顺序。别急着求一个立刻清晰的答案，而是把牌面里的提醒带回现实，一步一步验证、调整，再继续推进。`;
};
