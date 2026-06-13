import { allTarotCards } from './data';
import { getCardArtwork } from './cardArtwork';

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

function createPlaceholderMeaning(card) {
  const arcana = inferArcana(card.id);

  return {
    id: slugifyEnglishName(card.englishName) || `card-${card.id}`,
    number: inferNumber(card.id, arcana, card.englishName),
    name_cn: normalizeChineseName(card.name),
    name_en: card.englishName,
    arcana,
    suit: inferSuit(card.englishName, arcana),
    image: getCardArtwork({ name: normalizeChineseName(card.name) }) || '',
    keywords: [],
    daily_upright: '',
    daily_reversed: '',
    reading_upright: '',
    reading_reversed: '',
    detail: '',
    translations: {},
  };
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
      daily_upright:
        'Today is good for starting a new chapter and moving forward, but major decisions still need a clear head.',
      daily_reversed:
        'Today asks you to watch for risk: do not rush ahead blindly, but do not freeze just because risk exists.',
    },
    it: {
      name: 'Il Matto',
      keywords: ['Inizio', 'Libertà', 'Avventura', 'Innocenza', 'Ignoto', 'Ripartenza'],
      detail:
        'Il Matto è la carta numero 0 degli Arcani Maggiori. Lo zero rappresenta un inizio ancora non definito, ma anche una possibilità senza limite. È come una pagina bianca non ancora scritta: con innocenza, libertà, curiosità e coraggio giovanile, si trova sulla soglia di un nuovo viaggio nella vita.\n\nQuando Il Matto appare diritto, il mondo si sta aprendo lentamente sotto i tuoi piedi. Potresti stare entrando in una nuova fase, iniziando una relazione, un progetto, una scelta o una nuova direzione di vita. In questo momento non devi essere completamente vincolata o vincolato dall’esperienza passata. Puoi mantenere uno spirito limpido, quasi infantile, e credere che il futuro abbia ancora spazio, respiro e nuove possibilità, e che tu abbia ancora la capacità di ricominciare.\n\nIl Matto diritto non promette un cammino privo di rischi, ma incoraggia con forza il primo passo. Ricorda che alcune risposte compaiono solo dopo che hai davvero iniziato. Invece di restare bloccata o bloccato nei pensieri, prova a muoverti con cuore aperto e ad accogliere la nuova occasione che il destino ti mette davanti.\n\nQuando Il Matto appare rovesciato, invita a guardare il precipizio sotto i piedi. Potresti agire in modo troppo impulsivo o ingenuo, vedendo solo la libertà lontana e trascurando i rischi concreti. Il piccolo cane nella carta sembra voler richiamare la tua attenzione, per non lasciarti assorbire del tutto dall’entusiasmo e dalla fantasia. In questo momento ascoltare altri punti di vista, ricontrollare il piano e capire bene la tua situazione è più importante che lanciarti avanti senza misura.\n\nIl messaggio centrale del Matto è questo: partire è importante, ma lo è anche restare lucida o lucido. Conserva il cuore di chi comincia, ma guarda con chiarezza la strada sotto i tuoi piedi.',
      daily_upright:
        'Oggi è il momento giusto per iniziare qualcosa di nuovo, ma nelle decisioni importanti serve comunque lucidità.',
      daily_reversed:
        'Oggi fai attenzione al rischio: non andare avanti alla cieca, ma non restare ferma o fermo solo per paura.',
    },
  },
};

const magicianMeaning = {
  id: 'the-magician',
  number: 1,
  name_cn: '魔术师',
  name_en: 'The Magician',
  arcana: 'major',
  suit: '',
  image: '/cards/waite-cn/01魔术师.jpg',
  keywords: ['创造', '行动', '意志', '显化', '资源', '掌控', '开始实践'],
  daily_upright:
    '今天适合把想法落到行动上。你手中已有可用的资源，关键是主动调动它们，整合资源，你也有能力去沟通和开启新篇章，而不是继续等待时机。',
  daily_reversed:
    '今天要小心空想、拖延或说得太多做得太少。注意在自己擅长的部分翻车，也要留意有人用漂亮话包装真实意图。',
  reading_upright:
    '魔术师正位代表创造力、行动力、意志与显化。它说明你并非毫无准备，所需要的工具、资源或能力已经在你身边，只是需要你主动整合并使用它们。\n\n在牌阵中出现时，魔术师提醒你把想法转化为具体行动。它不是单纯的幻想之牌，而是“让事情发生”的牌。你可以通过清晰的目标、专注的意志和实际操作，把原本停留在脑中的可能性变成现实。',
  reading_reversed:
    '魔术师逆位代表资源误用、行动力不足、操控、欺骗，或有想法却无法真正落地。你可能拥有某些条件，却没有正确使用；也可能过度依赖技巧和话术，而忽略了真实能力与实际行动。\n\n在牌阵中出现时，它提醒你检查自己是否正在逃避执行，或是否被某种表面的自信迷惑。魔术师逆位也可能表示信息不对称、承诺过度、动机不纯。此时需要看清事实，不要只听漂亮的表达，也不要用空想代替真正的推进。',
  detail:
    '魔术师是大阿尔卡那的第 1 张牌。与愚人的纯真出发不同，魔术师已经站到了行动的起点。他面前摆放着权杖、圣杯、宝剑与星币，象征火、水、风、土四种元素，也象征人可以调动的意志、情感、思想与现实资源。\n\n这张牌象征创造、实践、意志与显化。魔术师不是等待命运降临的人，而是把资源聚集起来、让事情真正发生的人。他一只手指向天空，一只手指向大地，像是在连接灵感与现实：上方的想法、愿望和可能性，必须通过具体行动落到地面，才会成为可以触摸的结果。\n\n当魔术师正位出现时，它通常意味着你已经拥有开始所需的条件。也许你还有不确定感，但并不代表你毫无准备。你手中可能已经有知识、经验、人脉、工具或机会，只是它们还没有被整理成一个清晰的方向。魔术师提醒你，与其继续等待完美时机，不如开始动手，把分散的资源转化为真正的成果。\n\n这张牌也强调专注。魔术师的力量不是漫无目的地尝试，而是把注意力集中在一个明确的目标上。它鼓励你主动表达、主动争取、主动设计自己的路径。此时，你的语言、计划和行动都会带来影响力，所以更需要清楚自己想创造什么。\n\n当魔术师逆位出现时，它提醒你留意资源被浪费、能力被误用，或行动与表达之间的落差。你可能说得很多，却没有真正推进；也可能拥有条件，却因为犹豫、分心或缺乏计划而无法发挥。它也可能指向操控、欺骗、话术包装，提醒你不要被表面的自信和漂亮承诺迷惑。空有能力和资源，但是无法开启，无法真正的发挥出来；也可能是有人表现的很好，但实则是一种欺骗和表演。\n\n魔术师的核心信息是：可能性已经出现，但它不会自动变成现实。你需要伸出手，整理工具，确认目标，然后让自己的意志真正进入世界。',
};

const highPriestessMeaning = {
  id: 'the-high-priestess',
  number: 2,
  name_cn: '女祭司',
  name_en: 'The High Priestess',
  arcana: 'major',
  suit: '',
  image: '/cards/waite-cn/02女祭祀.jpg',
  keywords: ['直觉', '秘密', '潜意识', '静默', '洞察', '等待', '内在智慧'],
  daily_upright:
    '今天适合放慢脚步，听听自己的直觉。你拥有解决问题的智慧，答案未必在外界的声音里，也许早已藏在你的心底。',
  daily_reversed:
    '今天要小心被情绪、猜测或隐瞒的信息影响判断。别急着下结论，先确认你看见的是事实还是想象。',
  reading_upright:
    '女祭司正位代表直觉、潜意识、秘密与内在智慧。它说明事情的真相可能还没有完全显现，表面信息并不足以解释全部状况。此时，比起立刻行动，更重要的是观察、感受和等待。\n\n在牌阵中出现时，女祭司提醒你相信自己的内在感知。你可能已经察觉到某些细微的变化，只是还没有找到明确证据。它不鼓励冲动追问或强行推进，而是提示你保持安静，留意梦境、预感、沉默中的信号，以及那些没有被说出口的部分。',
  reading_reversed:
    '女祭司逆位代表直觉受阻、秘密暴露、信息不透明，或过度沉溺在自己的猜测中。你可能感觉哪里不对，却分不清这是清醒的直觉，还是不安带来的投射。\n\n在牌阵中出现时，它提醒你不要完全依赖模糊的感觉。此时需要重新整理信息，确认事实，避免被隐瞒、误解或自我欺骗牵着走。女祭司逆位也可能表示，有些被压抑的声音正在浮出水面，你需要诚实面对自己真正知道、真正感受到的东西。',
  detail:
    '女祭司是大阿尔卡那的第 2 张牌。她坐在黑白两根柱子之间，像守在可见世界与隐秘世界交界处的看门人。她不急着给出答案，也不主动走向外界，而是安静地坐在那里，守护着尚未被揭开的真相。\n\n这张牌象征直觉、潜意识、秘密、沉默与内在智慧。和愚人的天真出发不同，女祭司的力量来自静止。她提醒你，有些答案不能靠追赶得到，只能在足够安静的时候浮现。你需要听见那些微弱的信号：一种说不上来的预感，一个反复出现的梦，一段关系里没有被说出口的话，或一个事件背后隐藏的动机。\n\n当女祭司正位出现时，它通常意味着事情还没有到完全揭晓的时候。你也许已经感觉到真相的一部分，但仍需要耐心等待更多线索。此时不适合鲁莽行动，也不适合被外界的声音推着走。女祭司邀请你回到自己的内在，辨认什么是真正的直觉，什么只是短暂的情绪。\n\n当女祭司逆位出现时，它提醒你留意混乱的信息与被压抑的真相。你可能正在忽略自己的直觉，也可能过度相信直觉而脱离现实。它也可能表示某个秘密正在浮出水面，或你正在被不完整的信息影响判断。此时，与其在猜测里打转，不如停下来确认事实，看清自己究竟知道什么，又害怕知道什么。\n\n女祭司的核心信息是：不是所有答案都适合立刻追问。沉默并不代表空白，有时它是一扇门。你需要做的，是在门前安静下来，等自己听见真正的声音。',
};

const customMeanings = new Map([
  [0, foolMeaning],
  [1, magicianMeaning],
  [2, highPriestessMeaning],
]);

export const tarotMeaningCards = allTarotCards.map((card) => customMeanings.get(card.id) || createPlaceholderMeaning(card));

export function getTarotMeaningCard(cardId) {
  return tarotMeaningCards.find((card) => card.id === cardId) || null;
}

export function findTarotMeaningCard(input) {
  if (!input) return null;

  if (typeof input === 'string') {
    return tarotMeaningCards.find(
      (card) => card.id === input || card.name_cn === input || card.name_en === input,
    ) || null;
  }

  if (typeof input.id === 'number') {
    return tarotMeaningCards.find((card) => card.number === input.id && card.arcana === inferArcana(input.id)) || null;
  }

  const normalizedName = normalizeChineseName(input.name);
  return tarotMeaningCards.find(
    (card) => card.name_cn === normalizedName || card.name_en === input.englishName || card.name_en === input.name,
  ) || null;
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
      displayDailyUpright: card.translations?.en?.daily_upright || card.daily_upright,
      displayDailyReversed: card.translations?.en?.daily_reversed || card.daily_reversed,
      displayReadingUpright: card.translations?.en?.reading_upright || card.reading_upright,
      displayReadingReversed: card.translations?.en?.reading_reversed || card.reading_reversed,
    };
  }

  if (language === 'it') {
    return {
      ...card,
      displayName: card.translations?.it?.name || card.name_en,
      secondaryName: card.name_en,
      displayKeywords: card.translations?.it?.keywords || card.keywords,
      displayDetail: card.translations?.it?.detail || card.detail,
      displayDailyUpright: card.translations?.it?.daily_upright || card.daily_upright,
      displayDailyReversed: card.translations?.it?.daily_reversed || card.daily_reversed,
      displayReadingUpright: card.translations?.it?.reading_upright || card.reading_upright,
      displayReadingReversed: card.translations?.it?.reading_reversed || card.reading_reversed,
    };
  }

  return {
    ...card,
    displayName: card.name_cn,
    secondaryName: card.name_en,
    displayKeywords: card.keywords,
    displayDetail: card.detail,
    displayDailyUpright: card.daily_upright,
    displayDailyReversed: card.daily_reversed,
    displayReadingUpright: card.reading_upright,
    displayReadingReversed: card.reading_reversed,
  };
}

export function getLocalizedMeaningDaily(card, isReversed, language) {
  const meaningCard = getLocalizedMeaningCard(findTarotMeaningCard(card), language);
  if (!meaningCard) return '';
  return isReversed ? meaningCard.displayDailyReversed : meaningCard.displayDailyUpright;
}
