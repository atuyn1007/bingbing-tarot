import { allTarotCards } from './data';

const majorArcanaFileNames = [
  '愚者',
  '魔术师',
  '女祭祀',
  '皇后',
  '皇帝',
  '教皇',
  '恋人',
  '战车',
  '力量',
  '隐士',
  '命运之轮',
  '正义',
  '倒吊人',
  '死神',
  '节制',
  '恶魔',
  '高塔',
  '星星',
  '月亮',
  '太阳',
  '审判',
  '世界',
];

const suitFileNames = {
  Wands: '权杖',
  Cups: '圣杯',
  Swords: '宝剑',
  Pentacles: '星币',
};

const rankFileNames = {
  Ace: 'ACE',
  Two: '2',
  Three: '3',
  Four: '4',
  Five: '5',
  Six: '6',
  Seven: '7',
  Eight: '8',
  Nine: '9',
  Ten: '10',
  Page: '侍卫',
  Knight: '骑士',
  Queen: '王后',
  King: '国王',
};

const chineseNameOverrides = {
  死亡: '死神',
};

function slugifyEnglishName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeChineseName(name) {
  return chineseNameOverrides[name] || name;
}

function inferArcana(cardId) {
  return cardId <= 21 ? 'major' : 'minor';
}

function inferSuit(englishName, arcana) {
  if (arcana === 'major') return '';
  if (englishName.includes('Wands')) return 'wands';
  if (englishName.includes('Cups')) return 'cups';
  if (englishName.includes('Swords')) return 'swords';
  if (englishName.includes('Pentacles')) return 'pentacles';
  return '';
}

function inferNumber(cardId, arcana, englishName) {
  if (arcana === 'major') return cardId;

  const rank = String(englishName || '').split(' of ')[0];
  const rankMap = {
    Ace: 1,
    Two: 2,
    Three: 3,
    Four: 4,
    Five: 5,
    Six: 6,
    Seven: 7,
    Eight: 8,
    Nine: 9,
    Ten: 10,
    Page: 11,
    Knight: 12,
    Queen: 13,
    King: 14,
  };

  return rankMap[rank] ?? null;
}

function getMeaningArtwork(cardId, englishName) {
  if (cardId <= 21) {
    const fileStem = majorArcanaFileNames[cardId];
    if (!fileStem) return '';
    return `/cards/waite-cn/${String(cardId).padStart(2, '0')}${fileStem}.jpg`;
  }

  const [rank, suit] = String(englishName || '').split(' of ');
  const suitFile = suitFileNames[suit];
  const rankFile = rankFileNames[rank];

  if (!suitFile || !rankFile) return '';
  return `/cards/waite-cn/${suitFile}${rankFile}.jpg`;
}

const foolMeaning = {
  id: 'fool',
  number: 0,
  name_cn: '愚人',
  name_en: 'The Fool',
  arcana: 'major',
  suit: '',
  image: '/cards/waite-cn/00愚者.jpg',
  keywords: ['开始', '自由', '冒险', '纯真', '未知', '重新出发'],
  daily_upright:
    '今天适合开启新的周目，去尝试、去出发；但重大决定最好先留一点清醒。',
  daily_reversed:
    '今天需要留意风险：别因看不清环境而盲目前进，也别因过度害怕风险而停在原地。',
  reading_upright:
    '愚人正位代表新的开始、自由、冒险与尚未被定义的可能性。它说明你正站在一个新阶段的入口，过去的经验不必完全限制你，未来还有许多未知的路可以展开。\n\n在牌阵中出现时，愚人提醒你可以更勇敢地迈出第一步。它不一定保证结果稳定，但强调“开始”的力量：有些答案只有真正出发之后才会出现。',
  reading_reversed:
    '愚人逆位代表冲动、准备不足、逃避现实，或对风险的判断不够清晰。你可能只看见远方的自由，却忽略了脚下的悬崖。\n\n在牌阵中出现时，它提醒你先停下来确认方向。牌面中的小狗像是在提醒你听见外界的声音：不要一味往前冲，也不要因为害怕风险而完全停住。',
  detail:
    '愚人是大阿尔卡那的第 0 张牌，0 象征尚未成形的开始，也象征无限的可能性。他像一张尚未书写的白纸，带着纯真、自由、好奇和少年般的勇气，站在人生新旅程的入口。\n\n当愚人正位出现时，世界正在你的脚下缓缓展开。你可能即将进入一个新的阶段，开始一段新的关系、计划、选择或人生方向。此时的你不必被过去的经验完全束缚，可以像孩子一样保持最清澈的心气，相信未来仍有星辰大海，也相信自己仍然拥有重新开始的能力。\n\n愚人牌的正位并不保证前路毫无风险，但它鼓励你迈出第一步。它提醒你，有些事情只有真正开始之后，答案才会出现。与其困在过度思考里，不如带着开放的心，去接住命运递来的新机会。\n\n当愚人逆位出现时，它提醒你留意脚下的悬崖。你可能过于冲动、天真，或只看见远方的自由，却忽略了现实中的风险。牌面中的小狗也许正在试图唤醒你，让你不要完全沉浸在自己的兴奋和幻想里。此时，听听不同的声音、重新检查计划、确认自己的处境，会比盲目前进更重要。\n\n愚人的核心信息是：出发很重要，但清醒也同样重要。保持少年心气，也要看清脚下的路。',
  translations: {
    en: {
      name: 'The Fool',
      keywords: ['Beginnings', 'Freedom', 'Adventure', 'Innocence', 'The unknown', 'Starting over'],
      detail:
        'The Fool is card 0 of the Major Arcana. Zero represents a beginning that has not yet taken shape, and also limitless possibility. He is like a blank page not yet written on, standing at the threshold of a new life journey with innocence, freedom, curiosity, and youthful courage.\n\nWhen The Fool appears upright, the world is slowly opening beneath your feet. You may be entering a new phase, beginning a relationship, a plan, a choice, or a new direction in life. At this moment, you do not need to be completely bound by past experience. You are allowed to keep a clear, childlike spirit and trust that the future still holds an open horizon and that you still have the power to begin again.\n\nThe upright Fool does not promise a road without risk, but it strongly encourages the first step. It reminds you that some answers only reveal themselves after you truly begin. Rather than staying trapped in overthinking, carry an open heart and receive the new opportunity that life is placing in front of you.\n\nWhen The Fool appears reversed, it asks you to notice the cliff beneath your feet. You may be acting too impulsively or naively, seeing only distant freedom while overlooking real-world risk. The small dog in the image may be trying to wake you up, asking you not to lose yourself entirely in excitement and fantasy. At this stage, listening to other voices, checking your plan again, and understanding your real situation matter more than rushing ahead blindly.\n\nThe core message of The Fool is this: setting out matters, but staying clear-minded matters too. Keep the heart of a beginner, while still seeing the road beneath your feet.',
    },
    it: {
      name: 'Il Matto',
      keywords: ['Inizio', 'Libertà', 'Avventura', 'Innocenza', 'Ignoto', 'Ripartenza'],
      detail:
        'Il Matto è la carta numero 0 degli Arcani Maggiori. Lo zero rappresenta un inizio ancora non definito, ma anche una possibilità senza limite. È come una pagina bianca non ancora scritta: con innocenza, libertà, curiosità e coraggio giovanile, si trova sulla soglia di un nuovo viaggio nella vita.\n\nQuando Il Matto appare diritto, il mondo si sta aprendo lentamente sotto i tuoi piedi. Potresti stare entrando in una nuova fase, iniziando una relazione, un progetto, una scelta o una nuova direzione di vita. In questo momento non devi essere completamente vincolata o vincolato dall’esperienza passata. Puoi mantenere uno spirito limpido, quasi infantile, e credere che il futuro abbia ancora spazio, respiro e nuove possibilità, e che tu abbia ancora la capacità di ricominciare.\n\nIl Matto diritto non promette un cammino privo di rischi, ma incoraggia con forza il primo passo. Ricorda che alcune risposte compaiono solo dopo che hai davvero iniziato. Invece di restare bloccata o bloccato nei pensieri, prova a muoverti con cuore aperto e ad accogliere la nuova occasione che il destino ti mette davanti.\n\nQuando Il Matto appare rovesciato, invita a guardare il precipizio sotto i piedi. Potresti agire in modo troppo impulsivo o ingenuo, vedendo solo la libertà lontana e trascurando i rischi concreti. Il piccolo cane nella carta sembra voler richiamare la tua attenzione, per non lasciarti assorbire del tutto dall’entusiasmo e dalla fantasia. In questo momento ascoltare altri punti di vista, ricontrollare il piano e capire bene la tua situazione è più importante che lanciarti avanti senza misura.\n\nIl messaggio centrale del Matto è questo: partire è importante, ma lo è anche restare lucida o lucido. Conserva il cuore di chi comincia, ma guarda con chiarezza la strada sotto i tuoi piedi.',
    },
  },
};

export const tarotMeaningCards = allTarotCards.map((card) => {
  if (card.id === 0) {
    return foolMeaning;
  }

  const arcana = inferArcana(card.id);

  return {
    id: slugifyEnglishName(card.englishName) || `card-${card.id}`,
    number: inferNumber(card.id, arcana, card.englishName),
    name_cn: normalizeChineseName(card.name),
    name_en: card.englishName,
    arcana,
    suit: inferSuit(card.englishName, arcana),
    image: getMeaningArtwork(card.id, card.englishName),
    keywords: [],
    daily_upright: '',
    daily_reversed: '',
    reading_upright: '',
    reading_reversed: '',
    detail: '',
  };
});

export function getTarotMeaningCard(cardId) {
  return tarotMeaningCards.find((card) => card.id === cardId) || null;
}

export function getLocalizedMeaningCard(card, language) {
  if (!card) return null;

  if (language === 'en') {
    return {
      ...card,
      displayName: card.translations?.en?.name || card.name_en,
      secondaryName: card.name_cn,
      displayKeywords: card.translations?.en?.keywords || card.keywords,
      displayDetail: card.translations?.en?.detail || card.detail,
    };
  }

  if (language === 'it') {
    return {
      ...card,
      displayName: card.translations?.it?.name || card.name_en,
      secondaryName: card.name_en,
      displayKeywords: card.translations?.it?.keywords || card.keywords,
      displayDetail: card.translations?.it?.detail || card.detail,
    };
  }

  return {
    ...card,
    displayName: card.name_cn,
    secondaryName: card.name_en,
    displayKeywords: card.keywords,
    displayDetail: card.detail,
  };
}
