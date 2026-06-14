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

function getMeaningImage(name) {
  return getCardArtwork({ name: normalizeChineseName(name) }) || '';
}

function createMeaningCard(config) {
  return {
    arcana: 'major',
    suit: '',
    image: getMeaningImage(config.name_cn),
    translations: {},
    ...config,
  };
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
    image: getMeaningImage(card.name),
    keywords: [],
    daily_upright: '',
    daily_reversed: '',
    reading_upright: '',
    reading_reversed: '',
    detail: '',
    translations: {},
  };
}

const meaningCards = [
  createMeaningCard({
    id: 'fool',
    number: 0,
    name_cn: '愚人',
    name_en: 'The Fool',
    keywords: ['开始', '自由', '冒险', '纯真', '未知', '重新出发'],
    daily_upright: '今天适合开启新的周目，去尝试、去出发；但重大决定最好先留一点清醒。',
    daily_reversed: '今天需要留意风险：别因看不清环境而盲目前进，也别因过度害怕风险而停在原地。',
    reading_upright:
      '愚人正位代表新的开始、自由、冒险与尚未被定义的可能性。它说明你正站在一个新阶段的入口，过去的经验不必完全限制你，未来还有许多未知的路可以展开。\n\n在牌阵中出现时，愚人提醒你可以更勇敢地迈出第一步。它不一定保证结果稳定，但强调“开始”的力量：有些答案只有真正出发之后才会出现。',
    reading_reversed:
      '愚人逆位代表冲动、准备不足、逃避现实，或对风险的判断不够清晰。你可能只看见远方的自由，却忽略了脚下的悬崖。\n\n在牌阵中出现时，它提醒你先停下来确认方向。牌面中的小狗像是在提醒你听见外界的声音：不要一味往前冲，也不要因为害怕风险而完全停住。',
    detail:
      '愚人是大阿尔卡那的第 0 张牌，0 象征尚未成形的开始，也象征无限的可能性。他像一张尚未书写的白纸，带着纯真、自由、好奇和少年般的勇气，站在人生新旅程的入口。\n\n当愚人正位出现时，世界正在你的脚下缓缓展开。你可能即将进入一个新的阶段，开始一段新的关系、计划、选择或人生方向。此时的你不必被过去的经验完全束缚，可以像孩子一样保持最清澈的心气，相信未来仍有星辰大海，也相信自己仍然拥有重新开始的能力。\n\n愚人牌的正位并不保证前路毫无风险，但它鼓励你迈出第一步。它提醒你，有些事情只有真正开始之后，答案才会出现。与其困在过度思考里，不如带着开放的心，去接住命运递来的新机会。\n\n当愚人逆位出现时，它提醒你留意脚下的悬崖。你可能过于冲动、天真，或只看见远方的自由，却忽略了现实中的风险。牌面中的小狗也许正在试图唤醒你，让你不要完全沉浸在自己的兴奋和幻想里。此时，听听不同的声音、重新检查计划、确认自己的处境，会比盲目前进更重要。\n\n愚人的核心信息是：出发很重要，但清醒也同样重要。保持少年心气，也要看清脚下的路。',
    translations: {
      en: {
        name: 'The Fool',
        keywords: ['Beginnings', 'Freedom', 'Adventure', 'Innocence', 'The Unknown', 'Starting Over'],
        daily_upright:
          'Today is good for opening a new chapter, trying, and setting out, but major decisions still need a clear mind.',
        daily_reversed:
          'Today asks you to watch for risk: do not rush ahead blindly, and do not stay frozen only because you fear what might happen.',
        reading_upright:
          'The Fool upright represents new beginnings, freedom, adventure, and possibility that has not yet been defined. You stand at the entrance to a new stage, and the future still contains many roads that have not yet opened.\n\nWhen it appears in a spread, The Fool encourages a brave first step. It does not promise certainty, but it does emphasize the power of beginning.',
        reading_reversed:
          'The Fool reversed represents impulsiveness, lack of preparation, avoidance of reality, or unclear judgment around risk. You may see only distant freedom while ignoring the cliff beneath your feet.\n\nIn a spread, it asks you to pause and confirm your direction before moving again.',
        detail:
          'The Fool is card 0 of the Major Arcana. Zero symbolizes a beginning not yet formed and also limitless possibility. He stands at the edge of a new journey with innocence, freedom, curiosity, and youthful courage.\n\nUpright, The Fool suggests a new stage is unfolding. You may be entering a new relationship, a new plan, a new decision, or a new direction in life. The card does not ask you to erase the past, but it does remind you that the past does not have to define every road ahead.\n\nThe Fool does not promise a risk-free future. Instead, it honors the first step. Some answers only appear after you truly begin. Reversed, however, it warns of recklessness, naivete, and the temptation to leap without seeing the edge. The core message is simple: beginning matters, but so does staying awake to what lies beneath your feet.',
      },
      it: {
        name: 'Il Matto',
        keywords: ['Inizio', 'Liberta', 'Avventura', 'Innocenza', 'Ignoto', 'Ripartenza'],
        daily_upright:
          'Oggi e un buon momento per aprire un nuovo capitolo, provare e partire, ma nelle decisioni importanti serve ancora lucidita.',
        daily_reversed:
          'Oggi fai attenzione al rischio: non correre avanti alla cieca, ma non restare immobile solo per paura.',
        reading_upright:
          'Il Matto diritto rappresenta nuovi inizi, liberta, avventura e possibilita ancora non definite. Sei sulla soglia di una nuova fase e molte strade devono ancora aprirsi.\n\nQuando appare in una stesa, Il Matto incoraggia il primo passo con coraggio. Non promette certezza, ma mette al centro la forza dell inizio.',
        reading_reversed:
          'Il Matto rovesciato rappresenta impulsivita, impreparazione, fuga dalla realta o giudizio poco chiaro sul rischio. Potresti vedere solo la liberta lontana e ignorare il precipizio sotto i piedi.\n\nIn una stesa, ti chiede di fermarti e confermare la direzione prima di ripartire.',
        detail:
          'Il Matto e la carta numero 0 degli Arcani Maggiori. Lo zero simboleggia un inizio non ancora formato ma anche una possibilita infinita. E sulla soglia di un nuovo viaggio con innocenza, liberta, curiosita e coraggio giovanile.\n\nDiritto, Il Matto suggerisce che una nuova fase si sta aprendo. Potresti entrare in una nuova relazione, in un nuovo progetto, in una nuova scelta o direzione di vita. Non ti chiede di cancellare il passato, ma ricorda che il passato non deve definire ogni strada futura.\n\nIl Matto non promette un cammino senza rischi. Onora invece il primo passo. Alcune risposte compaiono solo quando inizi davvero. Rovesciato, avverte di impulsivita, ingenuita e della tentazione di saltare senza vedere il bordo. Il suo messaggio centrale e semplice: partire e importante, ma lo e anche restare lucida o lucido.',
      },
    },
  }),
  createMeaningCard({
    id: 'the-magician',
    number: 1,
    name_cn: '魔术师',
    name_en: 'The Magician',
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
      '魔术师是大阿尔卡那的第 1 张牌。与愚人的纯真出发不同，魔术师已经站到了行动的起点。他面前摆放着权杖、圣杯、宝剑与星币，象征火、水、风、土四种元素，也象征人可以调动的意志、情感、思想与现实资源。\n\n这张牌象征创造、实践、意志与显化。魔术师不是等待命运降临的人，而是把资源聚集起来、让事情真正发生的人。他一只手指向天空，一只手指向大地，像是在连接灵感与现实：上方的想法、愿望和可能性，必须通过具体行动落到地面，才会成为可以触摸的结果。\n\n当魔术师正位出现时，它通常意味着你已经拥有开始所需的条件。也许你还有不确定感，但并不代表你毫无准备。你手中可能已经有知识、经验、人脉、工具或机会，只是它们还没有被整理成一个清晰的方向。魔术师提醒你，与其继续等待完美时机，不如开始动手，把分散的资源转化为真正的成果。\n\n这张牌也强调专注。魔术师的力量不是漫无目的地尝试，而是把注意力集中在一个明确的目标上。它鼓励你主动表达、主动争取、主动设计自己的路径。此时，你的语言、计划和行动都会带来影响力，所以更需要清楚自己想创造什么。\n\n当魔术师逆位出现时，它提醒你留意资源被浪费、能力被误用，或行动与表达之间的落差。你可能说得很多，却没有真正推进；也可能拥有条件，却因为犹豫、分心或缺乏计划而无法发挥。它也可能指向操控、欺骗、话术包装，提醒你不要被表面的自信和漂亮承诺迷惑。空有能力和资源，但是无法开启，无法真正地发挥出来；也可能是有人表现得很好，但实则是一种欺骗和表演。\n\n魔术师的核心信息是：可能性已经出现，但它不会自动变成现实。你需要伸出手，整理工具，确认目标，然后让自己的意志真正进入世界。',
    translations: {
      en: {
        name: 'The Magician',
        keywords: ['Creation', 'Action', 'Will', 'Manifestation', 'Resources', 'Mastery', 'Practice'],
        daily_upright:
          'Today is ideal for turning ideas into action. You already hold useful tools and resources; what matters is using them deliberately instead of waiting for perfect timing.',
        daily_reversed:
          'Today asks you to watch for fantasy, procrastination, or talking much more than you do. Also be careful of polished words that hide real motives.',
        reading_upright:
          'The Magician upright represents creativity, action, willpower, and manifestation. It shows that you are not empty-handed. What you need is already close by; it now has to be gathered and used.\n\nIn a spread, The Magician asks you to turn thought into action. It is a card of making things happen.',
        reading_reversed:
          'The Magician reversed represents misused resources, lack of execution, manipulation, deception, or ideas that never truly land. You may possess the right conditions but fail to use them well.\n\nIn a spread, it asks you to look at facts rather than performance and to stop replacing real progress with clever appearance.',
        detail:
          'The Magician is card 1 of the Major Arcana. Unlike The Fool, who begins with innocence, The Magician stands at the threshold of action. Before him are the wand, cup, sword, and pentacle, symbols of the elements and also of human will, emotion, thought, and material means.\n\nThis card is about creation, practice, will, and manifestation. The Magician does not wait for fate to descend; he gathers resources and brings possibility into form. One hand points upward and one downward, linking inspiration and reality. Ideas become tangible only when they are enacted.\n\nUpright, The Magician suggests that the needed conditions already exist: knowledge, experience, contacts, tools, or opportunity. The work now is focus. Reversed, it warns of wasted ability, empty promises, manipulation, and the gap between expression and true action. The core message is clear: possibility exists, but it will not become reality on its own.',
      },
      it: {
        name: 'Il Mago',
        keywords: ['Creazione', 'Azione', 'Volonta', 'Manifestazione', 'Risorse', 'Padronanza', 'Pratica'],
        daily_upright:
          'Oggi e il momento giusto per trasformare le idee in azione. Hai gia strumenti e risorse utili: la chiave e usarli con intenzione invece di aspettare il momento perfetto.',
        daily_reversed:
          'Oggi fai attenzione a fantasia vuota, procrastinazione o molte parole senza fatti. Osserva anche chi usa un discorso brillante per nascondere le vere intenzioni.',
        reading_upright:
          'Il Mago diritto rappresenta creativita, azione, volonta e manifestazione. Mostra che non sei senza strumenti. Cio di cui hai bisogno e gia vicino a te e ora deve essere raccolto e usato.\n\nIn una stesa, Il Mago ti chiede di trasformare il pensiero in azione concreta. E la carta del far accadere le cose.',
        reading_reversed:
          'Il Mago rovesciato rappresenta risorse usate male, mancanza di esecuzione, manipolazione, inganno o idee che non riescono davvero a incarnarsi. Potresti avere le condizioni giuste ma non usarle bene.\n\nIn una stesa, ti invita a guardare i fatti invece della sola immagine e a non sostituire il vero avanzamento con la sola apparenza.',
        detail:
          'Il Mago e la carta numero 1 degli Arcani Maggiori. Diversamente dal Matto, che parte con innocenza, il Mago e gia sulla soglia dell azione. Davanti a lui ci sono bastone, coppa, spada e denaro, simboli degli elementi e anche della volonta, dell emozione, del pensiero e dei mezzi materiali.\n\nQuesta carta parla di creazione, pratica, volonta e manifestazione. Il Mago non aspetta che il destino scenda dal cielo; raccoglie le risorse e trasforma la possibilita in forma concreta. Una mano indica il cielo e l altra la terra, collegando ispirazione e realta. Le idee diventano tangibili solo quando vengono agite.\n\nDiritto, il Mago suggerisce che le condizioni necessarie esistono gia: conoscenza, esperienza, contatti, strumenti o opportunita. Il lavoro ora e la concentrazione. Rovesciato, avverte di talento sprecato, promesse vuote, manipolazione e distanza tra espressione e vera azione. Il messaggio e chiaro: la possibilita esiste, ma da sola non diventera realta.',
      },
    },
  }),
  createMeaningCard({
    id: 'the-high-priestess',
    number: 2,
    name_cn: '女祭司',
    name_en: 'The High Priestess',
    keywords: ['直觉', '秘密', '潜意识', '静默', '洞察', '等待', '内在智慧'],
    daily_upright: '今天适合放慢脚步，听听自己的直觉。你拥有解决问题的智慧，答案未必在外界的声音里，也许早已藏在你的心底。',
    daily_reversed: '今天要小心被情绪、猜测或隐瞒的信息影响判断。别急着下结论，先确认你看见的是事实还是想象。',
    reading_upright:
      '女祭司正位代表直觉、潜意识、秘密与内在智慧。它说明事情的真相可能还没有完全显现，表面信息并不足以解释全部状况。此时，比起立刻行动，更重要的是观察、感受和等待。\n\n在牌阵中出现时，女祭司提醒你相信自己的内在感知。你可能已经察觉到某些细微的变化，只是还没有找到明确证据。它不鼓励冲动追问或强行推进，而是提示你保持安静，留意梦境、预感、沉默中的信号，以及那些没有被说出口的部分。',
    reading_reversed:
      '女祭司逆位代表直觉受阻、秘密暴露、信息不透明，或过度沉溺在自己的猜测中。你可能感觉哪里不对，却分不清这是清醒的直觉，还是不安带来的投射。\n\n在牌阵中出现时，它提醒你不要完全依赖模糊的感觉。此时需要重新整理信息，确认事实，避免被隐瞒、误解或自我欺骗牵着走。女祭司逆位也可能表示，有些被压抑的声音正在浮出水面，你需要诚实面对自己真正知道、真正感受到的东西。',
    detail:
      '女祭司是大阿尔卡那的第 2 张牌。她坐在黑白两根柱子之间，像守在可见世界与隐秘世界交界处的看门人。她不急着给出答案，也不主动走向外界，而是安静地坐在那里，守护着尚未被揭开的真相。\n\n这张牌象征直觉、潜意识、秘密、沉默与内在智慧。和愚人的天真出发不同，女祭司的力量来自静止。她提醒你，有些答案不能靠追赶得到，只能在足够安静的时候浮现。你需要听见那些微弱的信号：一种说不上来的预感，一个反复出现的梦，一段关系里没有被说出口的话，或一个事件背后隐藏的动机。\n\n当女祭司正位出现时，它通常意味着事情还没有到完全揭晓的时候。你也许已经感觉到真相的一部分，但仍需要耐心等待更多线索。此时不适合鲁莽行动，也不适合被外界的声音推着走。女祭司邀请你回到自己的内在，辨认什么是真正的直觉，什么只是短暂的情绪。\n\n当女祭司逆位出现时，它提醒你留意混乱的信息与被压抑的真相。你可能正在忽略自己的直觉，也可能过度相信直觉而脱离现实。它也可能表示某个秘密正在浮出水面，或你正在被不完整的信息影响判断。此时，与其在猜测里打转，不如停下来确认事实，看清自己究竟知道什么，又害怕知道什么。\n\n女祭司的核心信息是：不是所有答案都适合立刻追问。沉默并不代表空白，有时它是一扇门。你需要做的，是在门前安静下来，等自己听见真正的声音。',
    translations: {
      en: {
        name: 'The High Priestess',
        keywords: ['Intuition', 'Secrets', 'Subconscious', 'Silence', 'Insight', 'Waiting', 'Inner Wisdom'],
        daily_upright:
          'Today is good for slowing down and listening to intuition. The answer may already be inside you rather than out in the noise around you.',
        daily_reversed:
          'Today asks you to be careful of judgment clouded by emotion, speculation, or hidden information. Check whether you are seeing fact or projection.',
        reading_upright:
          'The High Priestess upright represents intuition, the subconscious, secrets, and inner wisdom. Surface information is not enough; waiting and listening matter more than forcing action.\n\nIn a spread, she asks you to trust subtle perception and to notice what has not yet been spoken.',
        reading_reversed:
          'The High Priestess reversed represents blocked intuition, exposed secrets, unclear information, or being lost in your own speculation.\n\nIn a spread, she asks you to sort fact from feeling and to face what you already sense but may not want to name.',
        detail:
          'The High Priestess is card 2 of the Major Arcana. She sits between black and white pillars, guarding the threshold between what is visible and what remains hidden.\n\nThis card is about intuition, the subconscious, silence, mystery, and inner wisdom. Unlike The Fool, whose power lies in innocent movement, The High Priestess draws power from stillness. Some answers cannot be chased; they emerge only when life becomes quiet enough to hear them.\n\nUpright, she suggests that truth has not yet fully revealed itself. More clues are needed, and this is not the moment for reckless movement. Reversed, she warns of confusion, repression, and incomplete information. Her core message is that silence is not emptiness. Sometimes it is the doorway through which truth arrives.',
      },
      it: {
        name: 'La Papessa',
        keywords: ['Intuizione', 'Segreti', 'Subconscio', 'Silenzio', 'Insight', 'Attesa', 'Saggezza interiore'],
        daily_upright:
          'Oggi e utile rallentare e ascoltare la tua intuizione. La risposta potrebbe essere gia dentro di te, piu che nelle voci esterne.',
        daily_reversed:
          'Oggi fai attenzione a giudizi influenzati da emozione, supposizione o informazioni nascoste. Verifica se stai vedendo fatti o proiezioni.',
        reading_upright:
          'La Papessa diritta rappresenta intuizione, subconscio, segreti e saggezza interiore. Le informazioni di superficie non bastano; contano di piu attesa, ascolto e osservazione.\n\nIn una stesa, ti invita a fidarti delle percezioni sottili e di cio che non e stato ancora detto.',
        reading_reversed:
          'La Papessa rovesciata rappresenta intuizione bloccata, segreti che emergono, informazioni confuse o perdita dentro le proprie supposizioni.\n\nIn una stesa, chiede di distinguere il fatto dall emozione e di guardare con onesta cio che gia senti ma forse non vuoi nominare.',
        detail:
          'La Papessa e la carta numero 2 degli Arcani Maggiori. Siede tra due colonne, nera e bianca, custodendo la soglia tra il visibile e il nascosto.\n\nQuesta carta parla di intuizione, subconscio, silenzio, mistero e saggezza interiore. Diversamente dal Matto, che si muove con innocenza, la Papessa trae la sua forza dalla quiete. Alcune risposte non si inseguono; emergono solo quando la vita si fa abbastanza silenziosa da lasciarle parlare.\n\nDiritta, suggerisce che la verita non si e ancora mostrata del tutto. Servono altri indizi e non e il momento di forzare il movimento. Rovesciata, avverte di confusione, repressione e informazioni incomplete. Il suo messaggio centrale e che il silenzio non e vuoto: a volte e la porta da cui arriva la verita.',
      },
    },
  }),
  createMeaningCard({
    id: 'the-empress',
    number: 3,
    name_cn: '女皇',
    name_en: 'The Empress',
    keywords: ['丰盛', '美', '滋养', '创造力', '感官', '母性', '自然', '享受'],
    daily_upright:
      '今天适合善待自己的身体与感受。去靠近美、食物、自然和真实的快乐，你值得让生活变得更丰盛一点。',
    daily_reversed:
      '今天要小心过度消耗自己，或把“照顾别人”变成对自己的亏欠。也要留意沉溺享受、懒散拖延，或对外貌与物质产生过度焦虑。',
    reading_upright:
      '女皇正位代表丰盛、滋养、创造力与物质层面的成长。它说明某件事正在进入孕育和成熟的阶段，可能与关系、创作、金钱、生活品质、身体状态，或一种更柔软、更稳定的安全感有关。\n\n在牌阵中出现时，女皇提醒你接纳自己的感受与欲望。它不是冰冷的理性判断，而是生命力本身：你可以通过照顾身体、改善环境、表达美感、经营关系，来让事情慢慢变得丰厚。女皇也常常代表强烈的吸引力与女性魅力，提示你正在拥有创造、吸引与滋养现实的能力。',
    reading_reversed:
      '女皇逆位代表匮乏感、过度依赖、创造力受阻，或对身体、外貌、物质和关系的焦虑。你可能很想得到爱与安全感，却因为过度付出、过度索取，或无法真正照顾自己，而让内在变得疲惫。\n\n在牌阵中出现时，女皇逆位提醒你重新看待“丰盛”这件事。真正的丰盛不是强行维持漂亮的外壳，也不是用物质或关系填补空洞。此时需要检查自己是否忽略了身体的需求，是否在压抑创造力，或是否把自己的价值过度寄托在他人的认可之上。',
    detail:
      '女皇是大阿尔卡那的第 3 张牌，也是一张充满金星气息的牌。她象征美、爱、感官、丰盛与创造力。她的力量不来自控制和命令，而来自一种自然流动的生命力：花会盛开，果实会成熟，身体会感知快乐，爱与美也会在被滋养的地方生长出来。\n\n牌面中的女皇通常坐在柔软而丰饶的自然之中，周围有麦穗、森林、河流与象征金星的符号。这些意象都指向物质世界的丰腴：食物、身体、土地、财富、艺术、爱情，以及一切可以被触碰、被感受、被享受的东西。她提醒人不要只活在头脑里，也要回到身体，回到生活，回到真实的触感和温度。\n\n当女皇正位出现时，它通常意味着某件事正在被孕育、照料，并逐渐走向成熟。它可能代表一段关系变得更亲密，一个创作计划开始生长，生活质量有所提升，或你正在重新找回对美和快乐的感知。女皇不是急促推进的牌，她更像一片肥沃的土地：只要你愿意持续浇灌，事物就会慢慢长出形状。\n\n这张牌也代表极强的女性气质，但这种女性气质并不只是外貌上的漂亮，而是一种更完整的生命状态：柔软、丰盛、有吸引力，懂得享受，也懂得创造。她知道美不是装饰，而是一种力量；身体不是负担，而是感知世界的入口；物质不是低俗，而是生命安稳落地之后开出的花。\n\n当女皇逆位出现时，它提醒你留意丰盛背后的失衡。你可能正在过度照顾别人，却忘记滋养自己；也可能陷入对外貌、金钱、关系或舒适生活的焦虑之中。女皇逆位有时也代表创造力被堵住，想表达却无法表达，想生长却缺少适合的土壤。\n\n它也可能提示一种“看似丰盛，实则空虚”的状态：表面拥有很多，内在却并不满足；看起来很美，却没有真正感到快乐。此时需要回到最基本的问题：你的身体需要什么？你的心真正想亲近什么？你是在滋养自己，还是只是在维持一个好看的外壳？\n\n女皇的核心信息是：美、爱与丰盛都需要被认真滋养。你可以允许自己拥有欲望，靠近快乐，创造生活的质感；但也要记得，真正的丰盛不是堆满东西，而是让生命在你这里安心地生长。',
    translations: {
      en: {
        name: 'The Empress',
        keywords: ['Abundance', 'Beauty', 'Nourishment', 'Creativity', 'Sensuality', 'Mothering', 'Nature', 'Enjoyment'],
        daily_upright:
          'Today is good for treating your body and feelings kindly. Move toward beauty, food, nature, and real pleasure; you are allowed to let life become richer.',
        daily_reversed:
          'Today asks you to watch for over-giving, draining yourself, indulgence, or anxiety around appearance and material security.',
        reading_upright:
          'The Empress upright represents abundance, nourishment, creativity, and material growth. Something is being nurtured toward maturity.\n\nIn a spread, she asks you to honor desire, care for the body, and let life become fuller through beauty, relationship, and steady tending.',
        reading_reversed:
          'The Empress reversed represents scarcity, overdependence, blocked creativity, or anxiety about body, appearance, money, or relationship.\n\nIn a spread, she asks you to examine whether you are feeding yourself or only maintaining an attractive shell.',
        detail:
          'The Empress is card 3 of the Major Arcana and carries the atmosphere of Venus. She symbolizes beauty, love, the senses, abundance, and creativity. Her strength does not come from command, but from natural life force: flowers open, fruit ripens, the body feels pleasure, and beauty grows where there is nourishment.\n\nShe asks you not to live only in thought. Return to the body, to ordinary life, to touch, warmth, and what can truly be felt. Upright, she often shows something being cultivated toward fullness: a relationship, a work of creation, a safer life, or your capacity to receive joy. Reversed, she warns of imbalance beneath abundance: overgiving, emptiness hidden beneath beauty, or a life that looks full yet does not feel alive.\n\nHer core message is that beauty, love, and abundance all need tending. Real fullness is not accumulation for its own sake, but allowing life to grow safely and richly within you.',
      },
      it: {
        name: 'L Imperatrice',
        keywords: ['Abbondanza', 'Bellezza', 'Nutrimento', 'Creativita', 'Sensualita', 'Maternita', 'Natura', 'Piacere'],
        daily_upright:
          'Oggi e utile trattare con dolcezza il corpo e le emozioni. Avvicinati a bellezza, cibo, natura e piacere autentico: puoi permettere alla vita di diventare piu ricca.',
        daily_reversed:
          'Oggi fai attenzione a consumarti troppo, a dare oltre misura, all indulgenza o all ansia legata ad aspetto e sicurezza materiale.',
        reading_upright:
          'L Imperatrice diritta rappresenta abbondanza, nutrimento, creativita e crescita concreta. Qualcosa sta maturando e venendo curato.\n\nIn una stesa, invita a onorare il desiderio, a prendersi cura del corpo e a lasciare che la vita diventi piu piena attraverso bellezza, relazione e attenzione costante.',
        reading_reversed:
          'L Imperatrice rovesciata rappresenta scarsita, dipendenza, creativita bloccata o ansia riguardo a corpo, aspetto, denaro o relazione.\n\nIn una stesa, chiede di capire se stai davvero nutrendo te stessa o te stesso, oppure solo mantenendo un guscio bello da vedere.',
        detail:
          'L Imperatrice e la carta numero 3 degli Arcani Maggiori e porta con se il clima di Venere. Simboleggia bellezza, amore, sensi, abbondanza e creativita. La sua forza non nasce dal comando, ma dalla vitalita naturale: i fiori si aprono, i frutti maturano, il corpo sente piacere, e la bellezza cresce dove esiste nutrimento.\n\nInvita a non vivere solo nella mente. Riporta al corpo, alla vita quotidiana, al contatto, al calore e a cio che puo essere davvero sentito. Diritta, mostra spesso qualcosa che viene coltivato verso la pienezza: una relazione, un opera creativa, una vita piu stabile, o la capacita di ricevere gioia. Rovesciata, avverte di squilibrio sotto la superficie dell abbondanza: dare troppo, vuoto nascosto sotto la bellezza, o una vita che sembra piena ma non si sente viva.\n\nIl suo messaggio centrale e che bellezza, amore e abbondanza richiedono cura. La vera pienezza non e accumulare soltanto, ma lasciare che la vita cresca dentro di te in modo ricco e sicuro.',
      },
    },
  }),
  createMeaningCard({
    id: 'the-emperor',
    number: 4,
    name_cn: '皇帝',
    name_en: 'The Emperor',
    keywords: ['权威', '秩序', '控制力', '稳定', '地位', '规则', '责任', '男性贵人'],
    daily_upright:
      '今天适合建立秩序、明确边界，把事情稳稳掌控在自己手里。也可能遇到有经验、有地位的男性贵人或上位者支持。',
    daily_reversed:
      '今天要小心控制欲过强、固执己见，或被权威压制。别把坚持原则变成专制，也别为了反抗规则而让局面失控。',
    reading_upright:
      '皇帝正位代表权威、秩序、责任与稳固的地位。它说明事情需要清晰的规则、明确的边界和现实层面的掌控力。此时，情绪和想象并不是最重要的，真正重要的是结构、计划、执行和承担。\n\n在牌阵中出现时，皇帝提醒你拿回对局面的主导权。你需要更坚定地设定原则，整理资源，做出决定，并对结果负责。它也可能象征一位成熟、强势、有资源或有社会地位的男性人物，他可能以导师、领导、父亲、上司或男性贵人的形式出现，为你提供保护、建议或现实帮助。',
    reading_reversed:
      '皇帝逆位代表控制失衡、专制、僵化、压迫，或权威位置的不稳定。你可能正在面对一个过于强硬的人，或某种不讲情理、只强调服从的规则。它也可能表示你自己太想掌控一切，反而让事情变得紧绷。\n\n在牌阵中出现时，皇帝逆位提醒你检查权力关系是否失衡。真正的稳定不是靠压制维持，真正的权威也不是靠恐惧建立。此时需要分辨：你是在建立秩序，还是在制造控制？你是在承担责任，还是在用强硬掩盖内在的不安？',
    detail:
      '皇帝是大阿尔卡那的第 4 张牌，象征权威、秩序、结构与现实世界中的稳固地位。如果女皇代表丰饶的土地，那么皇帝就是土地上的城墙、法律与王座。他的力量不柔软，却稳定；不一定温情，却能够支撑局面不轻易崩塌。\n\n牌面中的皇帝通常坐在坚硬的王座上，神情严肃，手中握着象征权力的权杖。他不像女皇那样通过滋养让万物生长，而是通过规则、边界和决断来建立秩序。皇帝关心的不是“我感受到什么”，而是“这件事如何被管理、被执行、被维持”。他代表现实层面的掌控力，也代表一个人对自己欲望、情绪和行动的约束能力。\n\n当皇帝正位出现时，它通常意味着你需要更强的自我控制和现实判断。也许事情已经不能再靠感觉推动，而需要计划、制度、责任和明确的决定。皇帝提醒你站稳自己的位置，不要轻易被外界扰乱。你需要知道自己的边界在哪里，资源在哪里，目标在哪里，以及什么事情必须由你来承担。\n\n这张牌也常常象征稳固的社会地位、权力结构，或一位具有现实影响力的男性人物。他可能是父亲、上司、导师、前辈，也可能是某种成熟的男性贵人。他不一定用柔和的方式帮助你，但他带来的往往是资源、规则、经验、庇护或现实层面的支持。皇帝的帮助不是情绪安慰，而是让事情落地、让局面稳定。\n\n不过，皇帝的阴影面也很明显。当他的秩序过度膨胀，就会变成专制；当他的控制力失去弹性，就会变成压迫。他可能代表一个只允许服从、不允许质疑的权威，也可能代表你自己内在过度强硬的一面：害怕失控，于是把所有东西都抓得太紧；害怕脆弱，于是用冷静和命令遮住不安。\n\n当皇帝逆位出现时，它提醒你留意权力关系中的失衡。你可能正在被某种规则、长辈、领导或男性权威压制，也可能正在用强硬的态度对待自己和他人。它也可能表示位置不稳、缺乏担当、逃避责任，或表面上想掌控一切，实际上内在秩序已经松动。\n\n皇帝的核心信息是：真正的力量不是把一切压在脚下，而是有能力建立秩序，并承担秩序带来的责任。你需要稳住自己的王座，也要记得，权威若没有清醒和边界，就会变成牢笼。',
    translations: {
      en: {
        name: 'The Emperor',
        keywords: ['Authority', 'Order', 'Control', 'Stability', 'Status', 'Rules', 'Responsibility', 'Male Ally'],
        daily_upright:
          'Today is good for building order, setting boundaries, and taking steady command of your affairs. Support from an experienced or influential man may also appear.',
        daily_reversed:
          'Today asks you to watch for excessive control, stubbornness, or pressure from authority. Do not let principle harden into tyranny, and do not let rebellion create chaos.',
        reading_upright:
          'The Emperor upright represents authority, order, responsibility, and stable position. A situation now asks for structure, planning, execution, and clear boundaries.\n\nIn a spread, The Emperor calls you to reclaim leadership and act with grounded responsibility.',
        reading_reversed:
          'The Emperor reversed represents distorted control, rigidity, oppression, or unstable authority. You may be dealing with someone too hard, or becoming too hard yourself.\n\nIn a spread, it asks whether you are creating order or merely creating control.',
        detail:
          'The Emperor is card 4 of the Major Arcana. If The Empress is fertile land, The Emperor is the wall, law, and throne built upon it. His power is not soft, but it is steady. He represents order, structure, boundaries, and the capacity to hold form in the real world.\n\nUpright, he suggests that emotion alone is not enough; a plan, a rule, a decision, and accountability are needed. He can also indicate a mature male figure, a leader, mentor, father, or powerful ally whose influence stabilizes a situation. Reversed, he warns of dominance without wisdom, rigidity without compassion, or the need to look honestly at how control is being used. His core lesson is that true authority does not crush everything beneath it. It creates structure and accepts responsibility for what that structure produces.',
      },
      it: {
        name: 'L Imperatore',
        keywords: ['Autorita', 'Ordine', 'Controllo', 'Stabilita', 'Posizione', 'Regole', 'Responsabilita', 'Alleato maschile'],
        daily_upright:
          'Oggi e utile creare ordine, definire confini e tenere saldamente le cose nelle tue mani. Potrebbe comparire anche il sostegno di un uomo esperto o influente.',
        daily_reversed:
          'Oggi fai attenzione a controllo eccessivo, rigidita o pressione da parte dell autorita. Non trasformare i principi in tirannia e non lasciare che la ribellione produca caos.',
        reading_upright:
          'L Imperatore diritto rappresenta autorita, ordine, responsabilita e posizione stabile. Una situazione richiede struttura, piano, esecuzione e confini chiari.\n\nIn una stesa, invita a riprendere la guida e ad agire con responsabilita concreta.',
        reading_reversed:
          'L Imperatore rovesciato rappresenta controllo distorto, rigidita, oppressione o autorita instabile. Potresti avere davanti qualcuno troppo duro, o diventare troppo dura o duro tu stessa o tu stesso.\n\nIn una stesa, chiede se stai creando ordine oppure soltanto controllo.',
        detail:
          'L Imperatore e la carta numero 4 degli Arcani Maggiori. Se l Imperatrice e la terra fertile, l Imperatore e il muro, la legge e il trono costruiti su di essa. Il suo potere non e morbido, ma e saldo. Rappresenta ordine, struttura, confini e la capacita di mantenere una forma stabile nel mondo reale.\n\nDiritto, suggerisce che l emozione da sola non basta; servono piano, regola, decisione e responsabilita. Può anche indicare una figura maschile matura, un leader, un mentore, un padre o un alleato influente che rende piu stabile una situazione. Rovesciato, avverte di dominio senza saggezza, rigidita senza compassione o del bisogno di guardare con onesta a come viene usato il controllo. La sua lezione centrale e che la vera autorita non schiaccia tutto sotto di se: crea struttura e si assume la responsabilita di cio che quella struttura produce.',
      },
    },
  }),
  createMeaningCard({
    id: 'the-hierophant',
    number: 5,
    name_cn: '教皇',
    name_en: 'The Hierophant',
    keywords: ['传统', '教导', '信仰', '规则', '制度', '导师', '传承', '精神秩序', '叛逆', '内心声音'],
    daily_upright:
      '今天适合向有经验的人请教，或按照成熟的方法处理问题。规则未必是束缚，也可能是帮你稳住局面的扶手。',
    daily_reversed:
      '今天可能会想挣脱某种规则、期待或传统框架。听听自己内心真正的声音，但也要分清：你是在清醒地选择自己的路，还是只是为了反抗而反抗。',
    reading_upright:
      '教皇正位代表传统、信仰、制度、学习与精神层面的指引。它说明当前的问题可能需要回到规则、经验、伦理或某种成熟体系之中，而不是完全凭个人冲动行动。\n\n在牌阵中出现时，教皇提醒你寻找可靠的指导。它可能象征老师、前辈、导师、专业人士，也可能代表学校、机构、婚姻、资格认证、宗教信仰或社会认可的关系结构。此时，遵循某种稳定的规则，反而能帮助你获得安全感与方向感。',
    reading_reversed:
      '教皇逆位代表对传统的质疑、叛逆、脱离旧框架，或开始遵从自己内心的声音。你可能不再愿意接受“大家都这么做”的答案，也不想继续被某种身份、关系、制度或道德标准定义。\n\n在牌阵中出现时，教皇逆位提醒你重新判断：眼前的规则是真的在保护你，还是只是在规训你？某个权威是真的有智慧，还是只是披着正确外衣的控制？它也可能表示你正在从传统体系中松动出来，寻找更适合自己的信念与道路。此时不必盲目服从，但也要避免为了反抗而反抗。真正的自由不是否定一切规则，而是知道哪些规则值得留下，哪些规则已经不再属于你。',
    detail:
      '教皇是大阿尔卡那的第 5 张牌。他坐在神圣而庄严的位置上，像一位连接人间与精神秩序的传递者。和皇帝的现实权力不同，教皇掌握的不是土地、军队或王座，而是信仰、知识、传统和被社会认可的规则。\n\n这张牌象征教导、传承、制度、伦理与精神秩序。它代表那些已经被长久验证的方法：老师的教诲、家族的传统、学校的体系、宗教的信念、社会承认的关系与契约。教皇并不鼓励你独自摸索一切，他更像在说：有些路，前人已经走过；有些问题，可以从经验和传统中找到答案。\n\n当教皇正位出现时，它通常意味着你需要学习、请教，或进入某种更稳定的结构之中。你可能需要一位导师、一个可靠的系统、一套清晰的方法，或者一种能够让你安心的精神支柱。此时，规则不一定是束缚，它也可以是一种保护。它让混乱的事物有了边界，让迷茫的人知道下一步该怎么走。\n\n教皇也常常与正式关系和社会认可有关。比如婚姻、契约、入学、考试、资格认证、组织归属，或一段关系进入更传统、更明确的位置。它强调的不是一时的激情，而是被承认、被命名、被放进秩序之中的稳定状态。\n\n但教皇也有阴影面。当传统变得僵硬，教导就可能变成说教；当规则被神圣化，个人的声音就可能被压下去。教皇逆位时，它提醒你留意虚伪的权威、空洞的道德、过时的观念，或一种只要求服从、不允许思考的体系。你可能正在被“正确答案”困住，却忘了真正的智慧应该让人更清醒，而不是更麻木。\n\n同时，教皇逆位也不一定是负面的。它可以代表叛逆、出走、质疑传统，以及从既定框架中醒来。你可能开始意识到，某些被传授的观念并不适合你，某些被社会认可的道路也不是你真正想走的路。此时，遵从内心的声音会变得很重要：你需要重新建立自己的信念，而不是只继承别人的答案。\n\n当教皇逆位出现时，它也可能代表你正在脱离旧有框架，开始寻找属于自己的道路。这个过程未必轻松，因为质疑传统常常意味着失去某种安全感，也可能被他人视为“不合群”或“不听话”。但它提醒你：不是所有被传下来的东西都必须继承，不是所有权威都值得相信。真正的信念，需要经过自己的选择。\n\n教皇的核心信息是：真正的传统应该传递智慧，而不是制造牢笼。你可以向前人学习，也可以重新审视规则；重要的是分辨，什么在引导你，什么在驯服你。最终，你需要找到的不只是外界认可的答案，而是自己真正愿意相信并承担的道路。',
    translations: {
      en: {
        name: 'The Hierophant',
        keywords: ['Tradition', 'Teaching', 'Belief', 'Rules', 'Institution', 'Mentor', 'Inheritance', 'Spiritual Order', 'Rebellion', 'Inner Voice'],
        daily_upright:
          'Today is good for learning from experience or using a mature method. Rules are not always a prison; sometimes they are the handrail that steadies the situation.',
        daily_reversed:
          'Today you may want to step outside a rule, expectation, or inherited framework. Listen to your true inner voice, but ask whether you are choosing clearly or resisting only for the sake of resistance.',
        reading_upright:
          'The Hierophant upright represents tradition, teaching, belief, structure, and spiritual guidance. The issue at hand may need experience, ethics, or a mature system rather than pure impulse.\n\nIn a spread, it points toward reliable guidance: a teacher, mentor, institution, contract, marriage, certification, or accepted framework that provides direction and safety.',
        reading_reversed:
          'The Hierophant reversed represents questioning tradition, rebellion, stepping out of an old framework, or listening to your own inner authority. You may no longer accept an answer simply because everyone repeats it.\n\nIn a spread, it asks whether a rule is protecting you or merely training you to obey, and whether a so-called authority is wise or merely clothed in correctness.',
        detail:
          'The Hierophant is card 5 of the Major Arcana. Unlike The Emperor, whose power is worldly, The Hierophant governs belief, knowledge, tradition, and socially recognized order. He symbolizes teaching, inheritance, institution, ethics, and spiritual structure.\n\nUpright, he suggests learning, asking, and entering a steadier system. A mentor, a body of knowledge, or a tested method may be exactly what is needed. Rules here are not necessarily chains; they can be support. He is also linked to formal relationship, contract, school, religion, social recognition, and shared structure.\n\nReversed, he warns of rigid tradition, hollow morality, false authority, and a system that demands obedience without thought. He can also represent awakening from inherited rules and beginning to form a belief of your own. His central lesson is that tradition should carry wisdom, not become a cage.',
      },
      it: {
        name: 'Il Papa',
        keywords: ['Tradizione', 'Insegnamento', 'Fede', 'Regole', 'Istituzione', 'Mentore', 'Trasmissione', 'Ordine spirituale', 'Ribellione', 'Voce interiore'],
        daily_upright:
          'Oggi e utile chiedere consiglio a chi ha esperienza o usare un metodo gia collaudato. Le regole non sono sempre una gabbia; a volte sono il sostegno che tiene stabile la situazione.',
        daily_reversed:
          'Oggi potresti voler uscire da una regola, da un aspettativa o da una cornice tradizionale. Ascolta la tua voce interiore, ma chiediti se stai scegliendo con lucidita o se stai reagendo solo per opposizione.',
        reading_upright:
          'Il Papa diritto rappresenta tradizione, insegnamento, fede, struttura e guida spirituale. La situazione richiede forse esperienza, etica o un sistema maturo piu che il solo impulso personale.\n\nIn una stesa, indica una guida affidabile: un insegnante, un mentore, un istituzione, un contratto, un matrimonio o una struttura riconosciuta che puo offrire direzione e sicurezza.',
        reading_reversed:
          'Il Papa rovesciato rappresenta il mettere in dubbio la tradizione, la ribellione, l uscita da una vecchia cornice, o l inizio dell ascolto della propria autorita interiore. Potresti non voler piu accettare una risposta solo perche tutti la ripetono.\n\nIn una stesa, chiede se una regola ti sta proteggendo o soltanto addestrando a obbedire, e se una cosiddetta autorita sia davvero saggia o solo vestita di correttezza.',
        detail:
          'Il Papa e la carta numero 5 degli Arcani Maggiori. Diversamente dall Imperatore, il cui potere e terreno, il Papa governa fede, conoscenza, tradizione e ordine riconosciuto dalla societa. Simboleggia insegnamento, trasmissione, istituzione, etica e struttura spirituale.\n\nDiritto, suggerisce apprendimento, richiesta di aiuto e ingresso in un sistema piu stabile. Un mentore, un insieme di conoscenze o un metodo gia provato possono essere proprio cio che serve. Qui le regole non sono necessariamente catene; possono essere un sostegno. E anche legato a relazioni formali, contratti, scuola, religione, riconoscimento sociale e strutture condivise.\n\nRovesciato, avverte di tradizione rigida, morale vuota, falsa autorita e sistemi che pretendono obbedienza senza pensiero. Può anche rappresentare un risveglio dalle regole ereditate e l inizio di una fede personale. Il suo insegnamento centrale e che la tradizione dovrebbe portare saggezza, non diventare una gabbia.',
      },
    },
  }),
  createMeaningCard({
    id: 'the-lovers',
    number: 6,
    name_cn: '恋人',
    name_en: 'The Lovers',
    keywords: ['爱情', '吸引', '沟通', '选择', '关系', '价值观', '觉醒', '自由意志'],
    daily_upright:
      '今天适合真诚沟通，靠近让你感到舒展的人与关系。重要的不是一时心动，而是你们是否能真正听见彼此。你拥有可以顺利沟通的表达能力。',
    daily_reversed:
      '今天要小心关系中的误解、逃避或价值观不一致。也要留意自己是否为了维持关系，而忽略了内心真正的选择。也要警惕不顺畅的沟通带来的误解。',
    reading_upright:
      '恋人正位代表爱情、吸引、亲密关系与良好的沟通。它说明人与人之间可能出现强烈的连接感，不只是情绪上的喜欢，也包括彼此理解、互相回应，以及价值观上的靠近。\n\n在牌阵中出现时，恋人也常常代表一个重要选择。这个选择未必只发生在爱情里，也可能发生在人生道路、合作关系、身份认同或内心欲望之间。它提醒你，不要只看表面的甜蜜，而要看这段关系或这个选择是否让你更接近真实的自己。真正好的关系，不会让人变小，而会让人更清醒、更完整。',
    reading_reversed:
      '恋人逆位代表沟通不畅、关系失衡、价值观冲突，或在选择面前逃避自己的真实心意。你可能正在一段关系里感到拉扯：一方面渴望连接，另一方面又隐约感到不自由、不对等，或无法真正表达自己。\n\n在牌阵中出现时，恋人逆位提醒你重新审视关系里的选择权。你是否正在为了被爱而妥协太多？是否明明可以离开，却因为害怕孤独、内疚或习惯而停留？它也可能象征一种觉醒：你开始意识到，爱不应该成为束缚，亲密也不应该要求你放弃自己的声音。',
    detail:
      '恋人是大阿尔卡那的第 6 张牌。它最常被理解为爱情之牌，但它的含义并不止于恋爱。恋人真正关心的是关系中的连接、沟通、选择与自由意志。它问的不是“有没有人爱我”，而是“我在这段关系里是否仍然是我自己”。\n\n牌面中的男女站在天使之下，像是处于一种被祝福、被照见的关系之中。他们之间有吸引，也有坦诚；有亲密，也有尚未被完全遮蔽的真实。恋人的美不只是浪漫，而是一种人与人之间可以互相看见、互相回应的状态。它代表良好的沟通，代表愿意把心打开，也代表关系中最珍贵的部分：我靠近你，但我没有失去自己。\n\n当恋人正位出现时，它通常意味着某种重要的连接正在形成。可能是一段爱情，一次真诚的对话，一个值得信任的合作对象，或一个与你价值观相合的选择。它提示你，真正有生命力的关系不只依靠激情，也依靠理解、尊重和沟通。两个人能不能说真话，能不能听见彼此，能不能在差异中仍然选择靠近，才是恋人牌更深的重点。\n\n这张牌也常常指向选择。你可能正站在两个方向之间：一个方向更安全、更符合外界期待，另一个方向更接近你的心。恋人提醒你，选择本身会塑造你。你选择谁，选择怎样的关系，选择怎样表达爱，也是在选择成为怎样的人。\n\n从更深的层面看，恋人也可以代表一种觉醒，尤其是关系中的自我觉醒。它不只是“遇见爱情”，也可能是一个人终于意识到：自己有选择的权利，有说不的能力，也有脱离不健康关系的勇气。特别是在某些情境里，恋人牌可以象征女性从被观看、被选择的位置中醒来，重新拿回自己的声音。她可以爱，也可以离开；可以靠近，也可以拒绝；可以进入关系，也可以不再把关系当作命运的唯一答案。\n\n当恋人逆位出现时，它提醒你留意关系中的不对等、误解、逃避和价值观冲突。表面上也许仍然亲密，但内在可能已经出现裂缝。你可能不敢说出真实想法，或为了维持关系而压抑自己。它也可能表示一个选择被拖延太久：你明明知道自己想要什么，却迟迟不愿承认。\n\n恋人的核心信息是：沟通的和谐与极致的理解。同时，爱不是失去自己，选择也不是交出自己。真正值得靠近的关系，会让你更自由、更清醒，也更有勇气成为完整的自己。',
    translations: {
      en: {
        name: 'The Lovers',
        keywords: ['Love', 'Attraction', 'Communication', 'Choice', 'Relationship', 'Values', 'Awakening', 'Free Will'],
        daily_upright:
          'Today is good for sincere communication and moving closer to people and connections that let you breathe more freely. What matters is not only attraction, but whether you can truly hear one another.',
        daily_reversed:
          'Today asks you to watch for misunderstanding, avoidance, or conflicting values in relationship. Be careful not to betray your real choice just to preserve connection.',
        reading_upright:
          'The Lovers upright represents love, attraction, intimacy, and good communication. It can also point to an important choice that shapes who you become.\n\nIn a spread, it asks whether a relationship or decision brings you closer to your true self rather than farther away from it.',
        reading_reversed:
          'The Lovers reversed represents poor communication, imbalance, conflict of values, or avoiding the truth of your own heart. Love may feel entangled with compromise or silence.\n\nIn a spread, it asks whether you are staying out of love, out of fear, or out of habit.',
        detail:
          'The Lovers is card 6 of the Major Arcana. It is often read as a card of romance, but it reaches far beyond romance alone. Its deeper concern is connection, communication, choice, and free will. The real question is not merely whether love exists, but whether you can remain yourself within it.\n\nUpright, The Lovers may describe a meaningful bond, a conversation that opens the heart, or a path aligned with your values. It teaches that living relationships depend not only on passion, but also on honesty, mutual hearing, and respect. It can also mark a decisive choice: one path may feel safer, while another feels truer. Reversed, it exposes imbalance, misunderstanding, silence, or a choice delayed too long. Its core message is that real love does not require you to disappear from yourself.',
      },
      it: {
        name: 'Gli Amanti',
        keywords: ['Amore', 'Attrazione', 'Comunicazione', 'Scelta', 'Relazione', 'Valori', 'Risveglio', 'Libero arbitrio'],
        daily_upright:
          'Oggi e un buon momento per comunicare con sincerita e avvicinarti alle persone e alle relazioni che ti fanno sentire piu aperta o aperto. Conta non solo l attrazione, ma la capacita di ascoltarvi davvero.',
        daily_reversed:
          'Oggi fai attenzione a incomprensioni, fuga o disallineamento di valori nella relazione. Non tradire la tua vera scelta solo per mantenere un legame.',
        reading_upright:
          'Gli Amanti diritti rappresentano amore, attrazione, intimita e buona comunicazione. Possono indicare anche una scelta importante che contribuisce a definire chi diventi.\n\nIn una stesa, chiedono se una relazione o una decisione ti stia avvicinando al tuo vero io.',
        reading_reversed:
          'Gli Amanti rovesciati rappresentano comunicazione bloccata, squilibrio, conflitto di valori o fuga dalla verita del proprio cuore. L amore può sentirsi intrecciato con compromesso o silenzio.\n\nIn una stesa, chiedono se stai restando per amore, per paura o per abitudine.',
        detail:
          'Gli Amanti sono la carta numero 6 degli Arcani Maggiori. Vengono spesso letti come carta dell amore romantico, ma il loro significato va oltre. Parlano di connessione, comunicazione, scelta e libero arbitrio. La vera domanda non e solo se l amore esista, ma se tu riesca a restare te stessa o te stesso dentro quella relazione.\n\nDiritti, Gli Amanti possono descrivere un legame importante, una conversazione che apre il cuore o un cammino allineato ai tuoi valori. Insegnano che le relazioni vive non dipendono soltanto dalla passione, ma anche da onesta, ascolto reciproco e rispetto. Possono anche segnare una scelta decisiva: un percorso appare piu sicuro, un altro piu vero. Rovesciati, mostrano squilibrio, incomprensione, silenzio o una scelta rinviata troppo a lungo. Il loro messaggio centrale e che l amore autentico non ti chiede di scomparire da te stessa o te stesso.',
      },
    },
  }),
  createMeaningCard({
    id: 'the-chariot',
    number: 7,
    name_cn: '战车',
    name_en: 'The Chariot',
    keywords: ['胜利', '意志力', '目标', '野心', '控制', '冲突', '前进', '自我掌控'],
    daily_upright: '今天适合朝目标推进。即使局面有拉扯和阻力，只要你稳住方向，就有机会靠意志力冲出一条路。',
    daily_reversed: '今天要小心失控、急躁或方向混乱。别只顾着往前冲，先确认你是在掌控局面，还是被焦虑和胜负心拖着走。',
    reading_upright:
      '战车正位代表强大的意志力、目标感、野心与前进的决心。它说明你正处在一个需要主动突破的阶段，前方并非毫无阻碍，但你有足够的力量将混乱的局面整合起来，朝终点推进。\n\n在牌阵中出现时，战车提醒你保持专注，不要被外界的拉扯分散。牌面中的黑白力量象征冲突、矛盾与不同方向的欲望，而战车的关键并不是消灭冲突，而是用更强的意志去驾驭它们。只要目标足够清晰，你就可以把压力、竞争、野心和不安转化为向前的动力。',
    reading_reversed:
      '战车逆位代表方向失控、意志动摇、冲动冒进，或被内在冲突拉扯得无法前进。你可能很想赢，很想尽快到达终点，但越急越容易偏离方向，甚至被自己的焦虑、好胜心或控制欲反过来控制。\n\n在牌阵中出现时，战车逆位提醒你重新检查目标和节奏。你是否真的知道自己要去哪里？你是在坚定前进，还是只是害怕停下来？它也可能表示外部阻力太强，或内部黑白两股力量尚未被整合。此时不适合硬冲到底，而是需要先稳住自己，重新握紧缰绳。',
    detail:
      '战车是大阿尔卡那的第 7 张牌，象征胜利、意志力、野心、自我控制与向目标推进的能力。它不是一种轻飘飘的好运，而是一种“我要到达终点”的强烈决心。战车出现时，往往意味着事情已经进入行动和突破的阶段，你不能只站在原地等待结果，而需要主动掌控方向。\n\n牌面中的战士站在战车之上，前方常有黑白两股力量并列出现。它们象征冲突、矛盾、分裂的欲望，以及现实中不同方向的阻力。战车真正困难的地方就在这里：你不是在一条平坦的路上前进，而是在一场拉扯之中前进。一边可能是理性，一边可能是情绪；一边是野心，一边是恐惧；一边想冲出去，一边又想退回安全地带。\n\n因此，战车的核心不是单纯的速度，而是控制力。它要求你用强大的意志把分裂的力量拧成一个方向。你需要知道自己要去哪里，也需要压住那些会让你偏航的冲动。战车的胜利，不是因为路上没有困难，而是因为你在困难之中仍然没有放开缰绳。\n\n当战车正位出现时，它通常意味着你拥有突破现状的力量。你可能正在面对竞争、挑战、迁移、考试、事业推进，或一段需要强大行动力的时期。此时目标感非常重要：只要你清楚终点在哪里，就可以把压力变成动力，把混乱变成路线。战车也带有野心，它不满足于原地停留，而是渴望赢、渴望抵达、渴望证明自己可以掌控命运的方向。\n\n但战车也有明显的阴影面。当意志力过度膨胀，它可能变成强迫、急躁和控制欲。你可能太执着于胜利，以至于忽略身体的疲惫、关系的张力，或内心真实的恐惧。你看似在前进，实际只是被“不可以输”的念头推着跑。\n\n当战车逆位出现时，它提醒你留意失控的状态。可能是方向不清、计划混乱，也可能是内心的黑白冲突太强，导致你无法稳定地前进。你可能一边想成功，一边又害怕承担成功后的代价；一边想冲刺，一边又被情绪和阻力拖住。此时，继续硬冲未必有效，真正需要的是重新整理方向，确认自己到底想抵达哪里。\n\n战车的核心信息是：终点不会自动向你靠近。你需要目标，需要野心，也需要能驾驭自己的控制力。真正的胜利不是一路没有阻碍，而是在黑白拉扯之间，仍然让战车驶向你选择的方向。',
    translations: {
      en: {
        name: 'The Chariot',
        keywords: ['Victory', 'Willpower', 'Goal', 'Ambition', 'Control', 'Conflict', 'Forward Motion', 'Self-Mastery'],
        daily_upright: 'Today is good for moving toward a goal. Even if there is tension and resistance, you can still carve a path by holding your direction.',
        daily_reversed: 'Today asks you to watch for loss of control, haste, or confusion of direction. Before rushing, ask whether you are steering the situation or being driven by anxiety.',
        reading_upright:
          'The Chariot upright represents strong will, focus, ambition, and determination. The road is not free of resistance, but you have the strength to gather scattered forces and move forward.\n\nIn a spread, it asks you to stay concentrated and use discipline to guide conflict rather than be pulled apart by it.',
        reading_reversed:
          'The Chariot reversed represents loss of direction, unstable will, reckless speed, or inner conflict that blocks movement. You may want victory so badly that urgency begins to steer you.\n\nIn a spread, it asks you to review your goal and rhythm before forcing progress.',
        detail:
          'The Chariot is card 7 of the Major Arcana. It symbolizes victory, willpower, ambition, self-control, and the ability to drive toward a chosen aim. It is not gentle luck; it is the determination to arrive.\n\nIts deeper lesson is not speed but mastery. Conflicting forces, desires, and fears do not disappear simply because you want to move. The task is to gather them into one direction. Upright, The Chariot shows the power to break through and move with purpose. Reversed, it warns of urgency, control obsession, and motion without clarity. Its core message is that the destination will not come to you; you must know your direction and hold the reins.',
      },
      it: {
        name: 'Il Carro',
        keywords: ['Vittoria', 'Volonta', 'Obiettivo', 'Ambizione', 'Controllo', 'Conflitto', 'Avanzamento', 'Padronanza di se'],
        daily_upright: 'Oggi e un buon momento per avanzare verso un obiettivo. Anche se ci sono tensione e resistenza, puoi aprirti un varco mantenendo salda la direzione.',
        daily_reversed: 'Oggi fai attenzione a perdita di controllo, fretta o confusione di rotta. Prima di correre, chiediti se stai guidando la situazione o se sei trascinata o trascinato dall ansia.',
        reading_upright:
          'Il Carro diritto rappresenta forte volonta, concentrazione, ambizione e determinazione. La strada non e priva di resistenza, ma hai la forza di raccogliere energie disperse e avanzare.\n\nIn una stesa, chiede disciplina e direzione: il conflitto va guidato, non lasciato guidare te.',
        reading_reversed:
          'Il Carro rovesciato rappresenta perdita di direzione, volonta instabile, velocita imprudente o conflitto interiore che blocca il movimento. Potresti desiderare la vittoria al punto da lasciare che sia l urgenza a guidarti.\n\nIn una stesa, invita a rivedere obiettivo e ritmo prima di forzare il progresso.',
        detail:
          'Il Carro e la carta numero 7 degli Arcani Maggiori. Simboleggia vittoria, volonta, ambizione, autocontrollo e capacita di dirigersi verso una meta scelta. Non e fortuna leggera; e la determinazione di arrivare.\n\nLa sua lezione piu profonda non riguarda la velocita, ma il dominio. Forze, desideri e paure in conflitto non scompaiono solo perche vuoi avanzare. Il compito e raccoglierli in una sola direzione. Diritto, Il Carro mostra la forza di rompere la stasi e muoversi con intenzione. Rovesciato, avverte di fretta, ossessione di controllo e movimento senza chiarezza. Il suo messaggio centrale e che la meta non verra da te: devi conoscere la tua rotta e tenere salde le redini.',
      },
    },
  }),
  createMeaningCard({
    id: 'strength',
    number: 8,
    name_cn: '力量',
    name_en: 'Strength',
    keywords: ['勇气', '温柔', '驯服', '耐心', '内在力量', '自控', '韧性', '以柔克刚', '同情心'],
    daily_upright: '今天适合用温柔但坚定的方式处理问题。即使处在压力和痛苦之中，你也有能力保持冷静，把局面慢慢稳住。',
    daily_reversed: '今天要小心被情绪、冲动或恐惧牵着走。别急着压抑自己，也别为了照顾别人而过度消耗自己的力量。',
    reading_upright:
      '力量正位代表勇气、耐心、内在力量与以柔克刚的智慧。它说明你正在面对某种强烈的情绪、欲望、恐惧或压力，但你并非只能用强硬的方式对抗它。\n\n在牌阵中出现时，力量提醒你用更柔软、更稳定的方法处理局面。牌面中的狮子象征激情、欲望、愤怒与本能，而女人并没有粗暴地制服它，而是以冷静、纪律、爱与同情让它安静下来。它提示你，即使生活正在经历斗争，你仍然拥有保持清醒和坚强的能力。',
    reading_reversed:
      '力量逆位代表自我怀疑、情绪失控、欲望失衡，或内在力量暂时被削弱，你感到自己是软弱的，无法面对恐惧。你可能正在被某种恐惧、愤怒、不安或冲动影响，明明想保持冷静，却很难真正稳住自己。\n\n在牌阵中出现时，力量逆位提醒你不要把脆弱误认为失败。此时如果一味压抑情绪，反而可能让它以更激烈的方式爆发。它也提醒你留意过度付出：富有同情心是珍贵的品质，但如果总是以牺牲自己为代价去照顾别人，你的力量也会被消耗。',
    detail:
      '力量是大阿尔卡那的第 8 张牌，象征勇气、耐心、温柔的控制力与内在韧性。它和战车一样都与控制有关，但两者的方式完全不同。战车依靠目标、意志和强势推进，力量则依靠理解、安抚、纪律与持续的内在稳定。\n\n牌面中，一个女人平静地握着成年狮子的下巴。狮子看起来凶猛、强壮，象征勇气、激情、欲望、愤怒与本能。这些情感本身并不是坏事，它们是人类生命力的重要部分；但如果完全失控，也可能反过来伤害我们，甚至把我们拖向毁灭。\n\n真正令人着迷的是，女人并没有用暴力压制狮子。她冷静、优雅、镇定，像是拥有一种更高层次的统治力。她的力量不是蛮力，而是自控、纪律、爱与同情。她知道如何靠近危险，也知道如何让危险不再吞噬自己。这就是力量牌最核心的智慧：以柔克刚。\n\n当力量正位出现时，它通常意味着你正在经历某种压力、痛苦或内在斗争，但你拥有撑过去的能力。也许外界环境并不轻松，也许你内心有恐惧、愤怒、不甘或强烈的欲望，但这张牌提醒你：你可以不被这些情绪拖走。你可以看见它们，承认它们，然后用温柔而坚定的方式把它们带回可控的位置。\n\n力量牌也代表逆境中的冷静。真正强大的人，不一定声音最大，也不一定姿态最硬。她可以面对危险，却不慌乱；可以承受痛苦，却不被痛苦摧毁；可以拥有激情，却不让激情烧毁自己。她的坚强不是冷酷，而是一种在动荡里仍能保持平静的能力。\n\n这张牌也带有同情心。力量正位的人往往愿意理解他人，愿意在别人困难的时候伸出手。她不是因为软弱才温柔，而是因为内在足够强大，所以仍然保有柔软。只是，这种同情心也需要边界。真正的善良不应该总是以自我牺牲为代价，真正的力量也包括知道什么时候该保护自己。\n\n当力量逆位出现时，它提醒你留意内在力量的失衡。你可能正在自我怀疑，觉得自己非常软弱，觉得自己不够强大，无法应对挑战；也可能被某种情绪、欲望或恐惧控制，失去原本的判断力。它也可能表示过度压抑：表面上看起来平静，内在却已经积累了太多没有被处理的情绪。\n\n力量逆位并不意味着你没有力量，而是说明你需要重新找回与自己相处的方法。不要只想着“忍住”或“赢过它”。有些内在的猛兽不是靠打败解决的，而是要先看见它、承认它，再慢慢驯服它。\n\n力量的核心信息是：真正的强大不是征服一切，而是在危险、痛苦和欲望面前，仍然选择冷静、温柔和坚定。你不需要杀死内在的狮子，你需要学会牵住它。',
    translations: {
      en: {
        name: 'Strength',
        keywords: ['Courage', 'Gentleness', 'Taming', 'Patience', 'Inner Strength', 'Self-Control', 'Resilience', 'Soft Power', 'Compassion'],
        daily_upright: 'Today is good for handling things with gentleness and firmness at once. Even under pressure, you can stay calm and gradually steady the situation.',
        daily_reversed: 'Today asks you to watch for being dragged by emotion, fear, or impulse. Do not over-suppress yourself, and do not drain your strength trying to carry everyone else.',
        reading_upright:
          'Strength upright represents courage, patience, inner power, and the wisdom of gentleness. You are facing pressure or powerful emotion, but force is not your only option.\n\nIn a spread, it asks you to steady the situation through calm discipline, care, and self-command.',
        reading_reversed:
          'Strength reversed represents self-doubt, emotional instability, unbalanced desire, or a temporary weakening of inner power.\n\nIn a spread, it asks you not to mistake vulnerability for failure and not to let care for others consume all of you.',
        detail:
          'Strength is card 8 of the Major Arcana. Like The Chariot, it concerns control, but by an entirely different method. The Chariot advances through force and direction. Strength works through patience, compassion, discipline, and deep inner steadiness.\n\nThe lion symbolizes passion, instinct, anger, appetite, and raw life force. The figure beside it does not crush it by violence, but calms it through composure and presence. Upright, Strength shows the ability to remain whole in the middle of pain, conflict, or desire. Reversed, it warns of inner imbalance, over-suppression, and forgetting that gentleness toward yourself is part of real power. Its core lesson is that true strength is not domination; it is the ability to meet intensity without being devoured by it.',
      },
      it: {
        name: 'La Forza',
        keywords: ['Coraggio', 'Dolcezza', 'Addomesticare', 'Pazienza', 'Forza interiore', 'Autocontrollo', 'Resilienza', 'Mitezza potente', 'Compassione'],
        daily_upright: 'Oggi e utile affrontare le cose con dolcezza ma anche con fermezza. Anche sotto pressione puoi restare calma o calmo e riportare piano piano la situazione al centro.',
        daily_reversed: 'Oggi fai attenzione a farti trascinare da emozione, paura o impulso. Non reprimerti troppo e non consumare tutta la tua energia nel portare il peso degli altri.',
        reading_upright:
          'La Forza diritta rappresenta coraggio, pazienza, potere interiore e la saggezza della mitezza. Stai affrontando pressione o emozioni intense, ma la forza bruta non e la tua unica via.\n\nIn una stesa, invita a stabilizzare la situazione tramite calma, disciplina e presenza.',
        reading_reversed:
          'La Forza rovesciata rappresenta dubbio di se, instabilita emotiva, desiderio sbilanciato o indebolimento temporaneo della forza interiore.\n\nIn una stesa, ti ricorda di non confondere la vulnerabilita con il fallimento e di non consumarti nel prenderti cura degli altri.',
        detail:
          'La Forza e la carta numero 8 degli Arcani Maggiori. Come il Carro, riguarda il controllo, ma con un metodo del tutto diverso. Il Carro avanza con spinta e direzione. La Forza lavora invece con pazienza, compassione, disciplina e stabilita interiore.\n\nIl leone simboleggia passione, istinto, rabbia, appetito e forza vitale grezza. La figura accanto a lui non lo schiaccia con la violenza, ma lo calma con compostezza e presenza. Diritta, La Forza mostra la capacita di restare integra o integro nel mezzo di dolore, conflitto o desiderio. Rovesciata, avverte di squilibrio interiore, repressione e dimenticanza del fatto che anche la dolcezza verso di sé fa parte del vero potere. Il suo insegnamento centrale e che la forza autentica non domina: incontra l intensita senza esserne divorata.',
      },
    },
  }),
  createMeaningCard({
    id: 'the-hermit',
    number: 9,
    name_cn: '隐士',
    name_en: 'The Hermit',
    keywords: ['孤独', '智慧', '内省', '寻找', '沉默', '灵魂指引', '独处', '内心声音'],
    daily_upright: '今天适合安静下来，减少外界干扰。答案不一定在人群的声音里，也许要在独处中才能被你听见。',
    daily_reversed: '今天要小心过度封闭、逃避交流，或在孤独里迷失方向。独处是为了听见自己，不是为了把自己困在黑夜里。',
    reading_upright:
      '隐士正位代表有智慧的孤独、内在探索与精神上的寻找。它说明你正在进入一个需要独处、思考和沉淀的阶段。此时，外界的建议、欲望和喧嚣未必能真正帮助你，你需要暂时与人群拉开距离，去听见更深处的声音。\n\n在牌阵中出现时，隐士提醒你不要急着向外寻找答案。你可能已经走到了某个需要自我确认的路口，真正的方向不能由别人替你决定。隐士手中的灯并不照亮整条路，只照亮脚下一小段，但这已经足够让你继续前行。它象征一种缓慢而清醒的智慧：在黑夜中行走，也仍然相信自己能够找到回家的路。',
    reading_reversed:
      '隐士逆位代表孤立、封闭、迷失，或拒绝面对内心真正的问题。你可能正在逃离人群，也可能正在逃离自己。表面上是在独处，实际上却陷入了过度思考、低落、疏离或无法求助的状态。\n\n在牌阵中出现时，隐士逆位提醒你分辨：你是在主动寻找内在智慧，还是因为失望、害怕或疲惫而把自己封起来？此时未必需要立刻回到热闹之中，但你也不必独自承受所有黑暗。真正的智慧不是永远孤身一人，而是知道什么时候该沉默，什么时候该点灯，什么时候也可以向远处的人求一点火光。',
    detail:
      '隐士是大阿尔卡那的第 9 张牌，象征孤独、智慧、内省与精神上的寻找。他不是被世界遗弃的人，而是主动离开人群的人。因为有些声音太吵，有些欲望太重，有些答案太微弱，只有在足够安静的时候才会出现。\n\n牌面中的隐士通常独自站在黑夜或雪山之上，手中提着一盏灯。他像一个孤独的流浪者，在无意识的黑夜里前行。那盏灯的光并不明亮，无法照亮整个世界，只能照见眼前一小段路。但隐士并不因此慌张，因为他寻找的不是外界的掌声、认同或热闹，而是只有长期孤独才能获得的东西：内心真正的声音。\n\n隐士的孤独不是空洞的孤独，而是有智慧的孤独。他需要暂时与人群脱节，因为人群里有太多声音会覆盖自己：别人的期待、社会的标准、短暂的欲望、关系的拉扯，以及那些看似合理却并不属于他的答案。为了听见自己，他必须离开这些噪音，走进更深的夜里。\n\n当隐士正位出现时，它通常意味着你需要独处、思考和沉淀。你可能正在经历一个不适合立刻行动的阶段，也可能正站在人生某个需要重新确认方向的路口。此时，向外求证未必能给你真正的答案。你需要安静下来，慢慢辨认：什么是别人告诉你的路，什么才是你内心真正愿意走的路。\n\n隐士也代表成熟的智慧。它不是女祭司那种神秘的直觉，也不是教皇那种传统传授的知识。隐士的智慧来自长时间的行走、沉默、失去、观察和自我消化。他知道有些路必须一个人走，有些答案不能被直接赠予，只能在漫长的独处中一点点生长出来。\n\n但隐士也有阴影面。当孤独过度，它可能变成封闭；当内省过度，它可能变成反复咀嚼痛苦。隐士逆位时，你可能不再是在寻找自己，而是在躲避世界；不再是在听见内心，而是在被黑夜困住。你可能拒绝沟通，拒绝求助，甚至把孤独当成唯一安全的地方。\n\n当隐士逆位出现时，它提醒你重新看待自己的独处。真正的独处应该让你更清醒，而不是更麻木；应该让你接近自己，而不是切断所有连接。如果黑夜太深，你不必强迫自己一个人走完。灯光可以来自自己，也可以暂时借自他人。\n\n隐士的核心信息是：有些答案只能在孤独中被听见。你走过黑夜，提着微弱的灯，不是为了远离世界，而是为了找到真正的家。那个家不是某个地点，而是你终于回到自己的内心，回到那个不再被外界声音淹没的自我。',
    translations: {
      en: {
        name: 'The Hermit',
        keywords: ['Solitude', 'Wisdom', 'Introspection', 'Seeking', 'Silence', 'Soul Guidance', 'Aloneness', 'Inner Voice'],
        daily_upright: 'Today is good for quieting down and reducing outside noise. The answer may appear only when you can finally hear yourself.',
        daily_reversed: 'Today asks you to watch for excessive isolation, avoidance of contact, or getting lost inside loneliness. Solitude is meant to reveal you, not trap you.',
        reading_upright:
          'The Hermit upright represents wise solitude, inward exploration, and spiritual searching. You are entering a phase that requires distance from noise and time alone with your own voice.\n\nIn a spread, The Hermit asks you not to rush outside yourself for answers.',
        reading_reversed:
          'The Hermit reversed represents isolation, withdrawal, getting lost, or refusing to face what is truly happening inside you.\n\nIn a spread, it asks whether you are seeking wisdom or simply hiding from pain and connection.',
        detail:
          'The Hermit is card 9 of the Major Arcana. He is not someone abandoned by the world, but someone who has stepped away from it in order to hear something quieter and truer. He carries a small lamp, not a flood of light. It does not illuminate the whole road, only the next few steps, and that is enough.\n\nUpright, The Hermit suggests solitude, reflection, and the need to confirm direction within yourself rather than through outside noise. His wisdom is not inherited from a system; it is earned through walking, silence, loss, and self-digestion. Reversed, he warns that solitude can turn into isolation, and introspection can turn into being trapped by your own darkness. His lesson is that some truths are found only alone, but aloneness should lead you back to yourself, not bury you there.',
      },
      it: {
        name: 'L Eremita',
        keywords: ['Solitudine', 'Saggezza', 'Introspezione', 'Ricerca', 'Silenzio', 'Guida dell anima', 'Stare da soli', 'Voce interiore'],
        daily_upright: 'Oggi e utile rallentare e ridurre il rumore esterno. La risposta potrebbe emergere solo quando riesci davvero ad ascoltarti.',
        daily_reversed: 'Oggi fai attenzione a isolamento eccessivo, fuga dal contatto o smarrimento dentro la solitudine. La solitudine dovrebbe rivelarti, non imprigionarti.',
        reading_upright:
          'L Eremita diritto rappresenta solitudine saggia, esplorazione interiore e ricerca spirituale. Stai entrando in una fase che richiede distanza dal rumore e tempo con la tua voce piu profonda.\n\nIn una stesa, ti chiede di non correre subito fuori da te per trovare risposte.',
        reading_reversed:
          'L Eremita rovesciato rappresenta isolamento, chiusura, smarrimento o rifiuto di guardare cio che accade davvero dentro di te.\n\nIn una stesa, chiede se stai cercando saggezza o se ti stai soltanto nascondendo dal dolore e dalla relazione.',
        detail:
          'L Eremita e la carta numero 9 degli Arcani Maggiori. Non e qualcuno abbandonato dal mondo, ma qualcuno che se ne allontana per ascoltare qualcosa di piu sottile e piu vero. Porta una piccola lanterna, non una luce che illumina tutto. Non mostra l intera strada, ma solo i prossimi passi, e questo basta.\n\nDiritto, suggerisce solitudine, riflessione e bisogno di confermare la direzione dentro di te invece che attraverso il rumore esterno. La sua saggezza non viene da un sistema gia pronto; nasce da cammino, silenzio, perdita e lenta digestione di sé. Rovesciato, avverte che la solitudine può diventare isolamento e che l introspezione può trasformarsi in prigionia interiore. La sua lezione e che alcune verita si trovano solo da soli, ma il restare da soli dovrebbe riportarti a te, non seppellirti.',
      },
    },
  }),
  createMeaningCard({
    id: 'wheel-of-fortune',
    number: 10,
    name_cn: '命运之轮',
    name_en: 'Wheel of Fortune',
    keywords: ['命运', '转折', '周期', '机会', '变化', '流动', '因果', '不可控'],
    daily_upright:
      '今天可能出现意料之外的转机。顺着变化走，留意命运递来的机会，在生活中遇到美好的时刻时，请尽情享受，反过来也是如此——当你处于糟糕的境地时，事情最终会再次变得更好。',
    daily_reversed:
      '今天运气或许并没有站在你这边，你会感觉到不幸一直在跟着你。与其执着于掌控一切，不如接受有些事情暂时不在你的控制范围之内。',
    reading_upright:
      '命运之轮正位代表转折、机会、周期变化与命运的推动。它说明某个局面正在发生变化，你可能无法完全控制事情的走向，但能感受到旧阶段正在松动，新阶段正在靠近。\n\n在牌阵中出现时，命运之轮提醒你留意时机。它可能带来好运、突然的机会、关系或事业上的转折，也可能让原本停滞的局面重新流动起来。它不是单纯的“天降好运”，而是命运把你推到新的位置，让你看见原本看不见的路。此时，重要的是顺势而动，抓住变化中出现的窗口。',
    reading_reversed:
      '命运之轮逆位代表停滞、反复、错过时机，或被困在某种循环之中。你可能感觉事情一直绕回原点，明明努力过，却总是在类似的地方受阻。\n\n在牌阵中出现时，命运之轮逆位提醒你观察重复出现的模式。也许问题不只是运气不好，而是某种旧选择、旧关系、旧恐惧或旧习惯不断把你带回同一个位置。它也可能表示时机尚未成熟，外部环境暂时不配合。此时，与其强行推动，不如先看清轮子为什么没有向前转。',
    detail:
      '命运之轮是大阿尔卡那的第 10 张牌，象征命运的转动、周期的更替、机会的到来，以及人生中那些无法完全由个人意志控制的转折。它是一张很宏大的牌，因为它提醒人：生活不是一条直线，而是一只不断旋转的轮子。你会升起，也会落下；会失去，也会重新遇见；会被推离旧位置，也会被带向新的门口。\n\n这张牌的核心不是“好”或“坏”，而是“变化”。命运之轮出现时，往往意味着某个阶段正在结束，另一个阶段正在开启。你也许还没有完全准备好，但局势已经开始流动。原本卡住的事情可能突然出现转机，原本稳定的关系或计划也可能被新的变量打乱。它像命运伸出一只手，轻轻拨动了轮盘，让你站到一个不同的位置。\n\n当命运之轮正位出现时，它通常代表机会、好运、转折和时机成熟。你可能会遇到意想不到的帮助、突然打开的道路，或某个长期停滞的问题终于开始推进。它不一定意味着一切都会立刻变得完美，但它说明能量已经改变，局面不再停在原地。此时最重要的是保持敏锐：机会不会永远停在那里，命运递来的东西也常常带着一点随机性。\n\n命运之轮也与因果和周期有关。很多事情看似突然，其实早有积累。过去的选择、努力、失败、等待和错过，都可能在某个时刻汇聚成一次转折。它像是在告诉你：没有什么会永远停在低处，也没有什么会永远保持高位。人生的轮子一直在转，真正重要的是你能不能在变化中认出自己的位置。\n\n但命运之轮也有一种残酷的诚实：人无法控制所有事情。你可以努力，可以计划，可以准备，但仍然会有一些结果来自时机、环境、他人的选择，甚至纯粹的偶然。它让人意识到，命运并不总是按照人的意志展开。可这并不意味着努力没有意义。努力让你在轮子转到某个位置时，拥有伸手抓住机会的能力。\n\n当命运之轮逆位出现时，它提醒你留意停滞和重复。你可能陷入某种循环：反复遇到相似的人，反复经历类似的失望，反复在同一个问题上摔倒。此时，逆位的命运之轮不只是说“运气不好”，而是在问你：这个循环为什么一直回来？你是否仍然用旧方法处理新问题？是否明明已经看见了模式，却还在期待不同的结果？\n\n命运之轮逆位也可能表示时机未到。你很想推动某件事，但外部条件还没有配合，或者变化正在暗处酝酿，尚未真正显现。此时，强行控制轮子的方向反而会让你更加疲惫。你需要做的，是观察、调整、等待，并在下一次转动来临之前，准备好自己。\n\n命运之轮的核心信息是：命运会转动，局面会改变，低谷不会永远是低谷，高处也不会永远稳固。你无法命令轮子停在哪里，但你可以在它转动时保持清醒。真正的智慧不是控制命运，而是在命运转向的瞬间，认出那扇刚刚打开的门。',
    translations: {
      en: {
        name: 'Wheel of Fortune',
        keywords: ['Fate', 'Turning Point', 'Cycle', 'Opportunity', 'Change', 'Flow', 'Cause and Effect', 'The Uncontrollable'],
        daily_upright:
          'Today may bring an unexpected turning point. Move with change, notice the opportunity fate offers, and remember that bad moments do not stay fixed forever.',
        daily_reversed:
          'Today luck may not seem to be on your side. Instead of trying to control everything, accept that some conditions are not fully yours to command right now.',
        reading_upright:
          'Wheel of Fortune upright represents turning points, opportunity, shifting cycles, and the push of fate. A situation is changing, whether or not you can fully control it.\n\nIn a spread, it asks you to notice timing and to move with the opening that change provides.',
        reading_reversed:
          'Wheel of Fortune reversed represents delay, repetition, missing the moment, or being caught in a cycle. Things may feel as if they keep circling back to the same place.\n\nIn a spread, it asks you to notice what pattern keeps returning and why.',
        detail:
          'Wheel of Fortune is card 10 of the Major Arcana. It symbolizes the turning of fate, changing cycles, opportunity, and those moments in life that cannot be shaped entirely by personal will. Life is not a straight line but a wheel: what rises falls, what leaves returns in another form, and old positions give way to new ones.\n\nIts core is not good or bad, but change. Upright, it often marks a turning point, an opening, or the ripening of timing. Reversed, it can describe repetition, delay, or the feeling of being trapped in an old pattern. The deeper lesson is that you cannot command the wheel, but you can stay awake enough to recognize the moment it turns.',
      },
      it: {
        name: 'Ruota della Fortuna',
        keywords: ['Destino', 'Svolta', 'Ciclo', 'Opportunita', 'Cambiamento', 'Flusso', 'Causa ed effetto', 'Incontrollabile'],
        daily_upright:
          'Oggi può arrivare una svolta inattesa. Segui il movimento del cambiamento, nota l opportunita che il destino ti porge, e ricorda che anche i momenti difficili non restano fermi per sempre.',
        daily_reversed:
          'Oggi potresti sentire che la fortuna non e dalla tua parte. Invece di voler controllare tutto, accetta che alcune condizioni per ora non dipendano del tutto da te.',
        reading_upright:
          'La Ruota della Fortuna diritta rappresenta svolte, opportunita, cicli che cambiano e la spinta del destino. Una situazione si sta muovendo, anche se non puoi controllarla fino in fondo.\n\nIn una stesa, ti invita a notare il tempo giusto e a muoverti con l apertura che il cambiamento porta.',
        reading_reversed:
          'La Ruota della Fortuna rovesciata rappresenta ritardo, ripetizione, occasione mancata o l essere intrappolata o intrappolato in un ciclo. Le cose possono sembrare tornare sempre allo stesso punto.\n\nIn una stesa, ti chiede di osservare quale schema continua a ripresentarsi e perche.',
        detail:
          'La Ruota della Fortuna e la carta numero 10 degli Arcani Maggiori. Simboleggia il girare del destino, il cambio dei cicli, le opportunita e quei momenti della vita che non possono essere modellati interamente dalla volonta personale. La vita non e una linea retta, ma una ruota: cio che sale scende, cio che finisce ritorna in un altra forma, e le vecchie posizioni cedono il passo a nuove aperture.\n\nIl suo nucleo non e buono o cattivo, ma il cambiamento. Diritta, segna spesso una svolta, un apertura o la maturazione del tempo giusto. Rovesciata, può descrivere ripetizione, ritardo o la sensazione di essere bloccati in uno schema vecchio. La lezione piu profonda e che non puoi comandare la ruota, ma puoi restare abbastanza lucida o lucido da riconoscere il momento in cui gira.',
      },
    },
  }),
  createMeaningCard({
    id: 'justice',
    number: 11,
    name_cn: '正义',
    name_en: 'Justice',
    keywords: ['公平', '真相', '因果', '裁决', '责任', '平衡', '规则', '隐藏的真实'],
    daily_upright: '今天适合理性判断，公平处理问题。不要只看表面情绪，事实、证据和责任会比一时的感受更重要。',
    daily_reversed: '今天要小心不公、偏见或被隐藏的真相。也要避免不负责任的说辞和逃避责任的倾向。别急着接受表面的说法，真正的问题可能并没有得到公正的处理。',
    reading_upright:
      '正义正位代表公平、真相、因果与理性的裁决。它说明当前的问题需要被认真衡量：谁承担了责任，谁付出了代价，谁说出了事实，谁又在回避事实。此时，情绪不能替代判断，逃避也不能取消后果。\n\n在牌阵中出现时，正义提醒你回到证据、原则和清晰的边界之中。它可能指向法律、契约、考试、审核、评估、谈判，也可能代表一段关系或事件终于需要面对真实结果。正义不是温柔地安慰人，而是把天平摆出来，让所有选择都回到它应有的重量。',
    reading_reversed:
      '正义逆位代表不公平、偏见、失衡、责任逃避，或真相被掩盖。你可能正在面对一个并不透明的局面：有人只展示对自己有利的部分，有人用规则包装私心，也有人试图让真正的问题留在阴影里。\n\n在牌阵中出现时，正义逆位提醒你不要轻易相信表面的裁决。此时需要追问：谁制定了规则？谁从规则中获益？谁的声音被听见，谁的真实被遮住？它也可能表示你正在逃避某个后果，或不愿承认自己选择带来的责任。正义逆位并不只是“别人对你不公”，也可能是在要求你重新面对自己是否真正诚实。',
    detail:
      '正义是大阿尔卡那的第 11 张牌，象征公平、真相、规则、因果与责任。她通常坐在庄严的位置上，一手持剑，一手持天平。剑代表清晰、判断与切开迷雾的能力；天平代表衡量、平衡与因果的重量。她的出现，意味着事情不能再只凭情绪、愿望或模糊的解释继续下去，必须回到事实本身。\n\n正义的力量不是命运之轮那种不可控的转动，而是一种更冷静的秩序：你做出的选择会产生结果，你逃避的责任也会以某种形式回来。它提醒人，世界也许并不总是立刻公平，但每个决定都有重量，每个真相都有被看见的时刻。\n\n牌面中正义人物常穿着长袍，这一点很有意思。长袍带来庄严，也带来遮蔽。它让正义显得像一种制度、一种仪式、一种被包装过的权威。某些情况下，这张牌不只是代表已经显现的事实，也可能代表被隐藏的真实：真相还没有完全裸露出来，它被礼仪、身份、规则、语言或沉默包裹着。你看见的是裁决的外壳，但还需要继续追问，袍子之下究竟藏着什么。\n\n当正义正位出现时，它通常意味着某件事需要被公正地处理。也许是一场考试、一次面试、一个合同、一段关系中的责任分配，或某个必须做出判断的局面。它要求你理性、诚实，不要为了短暂的舒适而扭曲事实。此时，最重要的是看清证据，看清原则，也看清自己在事件中的位置。\n\n正义也与因果有关。它不一定立刻带来惩罚或奖励，但它会让人面对“我曾经如何选择，所以现在必须如何承担”。这张牌有一种冷峻的清醒：你可以解释，可以辩护，可以逃避一段时间，但最终，天平会称出真正的重量。\n\n在关系中，正义可能代表彼此需要更公平的对待。谁一直在付出，谁一直在索取？谁承担了情绪劳动，谁把责任推给别人？它不一定表示关系结束，但它表示关系需要被重新衡量。爱不能长期建立在失衡上，亲密也不能成为逃避责任的理由。\n\n当正义逆位出现时，它提醒你留意不公、偏见、双重标准和被掩盖的真相。可能有人掌握话语权，因此让自己的版本看起来更合理；也可能某种规则表面公正，实际却偏向某一方。此时，长袍的象征会变得更明显：有些真实被遮住了，有些判断被包装成了正确，有些不平等被制度化为“本来如此”。\n\n正义逆位也可能指向自我欺骗。你也许知道某件事并不公平，却不愿承认；也许知道自己需要承担后果，却希望事情自动过去。它提醒你，真正的公平不是只在自己受伤时才被需要，也不是只要求别人诚实，而是自己也愿意接受事实的审判。\n\n正义的核心信息是：真相也许会被遮住，但不会因此失去重量。你需要用清醒的眼睛看见事实，用稳定的手扶住天平，也用足够的勇气承认：每一个选择，最终都会回到它应有的位置。',
    translations: {
      en: {
        name: 'Justice',
        keywords: ['Fairness', 'Truth', 'Cause and Effect', 'Judgment', 'Responsibility', 'Balance', 'Rules', 'Hidden Reality'],
        daily_upright: 'Today is good for rational judgment and fair handling. Facts, evidence, and responsibility matter more than passing emotion.',
        daily_reversed: 'Today asks you to watch for unfairness, bias, or truth that has been covered. Do not accept the surface version too quickly.',
        reading_upright:
          'Justice upright represents fairness, truth, consequence, and rational judgment. A matter now needs to be weighed carefully.\n\nIn a spread, Justice calls you back to evidence, principle, and clear boundary.',
        reading_reversed:
          'Justice reversed represents unfairness, bias, imbalance, avoidance of responsibility, or truth being hidden.\n\nIn a spread, it asks you to question whose voice is being heard, whose version benefits, and what remains concealed.',
        detail:
          'Justice is card 11 of the Major Arcana. She symbolizes fairness, truth, rules, consequence, and responsibility. One hand holds a sword, the other a scale. Together they speak of clarity and weight: what is true, what is hidden, and what must ultimately be answered for.\n\nUnlike the Wheel of Fortune, whose movement is not always controllable, Justice belongs to a colder order. Choices generate consequences, and responsibilities do not vanish because they are inconvenient. Upright, she asks for honesty, evidence, and clear-eyed judgment. Reversed, she warns of imbalance, disguised power, false neutrality, and the possibility that truth is still hidden under the robe of legitimacy. Her central lesson is that truth may be covered, but it does not lose its weight.',
      },
      it: {
        name: 'La Giustizia',
        keywords: ['Equita', 'Verita', 'Causa ed effetto', 'Giudizio', 'Responsabilita', 'Equilibrio', 'Regole', 'Verita nascosta'],
        daily_upright: 'Oggi e utile giudicare con razionalita e trattare le cose con equita. Fatti, prove e responsabilita contano piu dell emozione del momento.',
        daily_reversed: 'Oggi fai attenzione a ingiustizia, pregiudizio o verita nascosta. Non accettare troppo in fretta la versione piu superficiale delle cose.',
        reading_upright:
          'La Giustizia diritta rappresenta equita, verita, conseguenza e giudizio razionale. Una questione deve ora essere pesata con attenzione.\n\nIn una stesa, richiama a prova, principio e confine chiaro.',
        reading_reversed:
          'La Giustizia rovesciata rappresenta ingiustizia, pregiudizio, squilibrio, fuga dalla responsabilita o verita coperta.\n\nIn una stesa, chiede di domandarsi chi viene ascoltato, chi trae vantaggio e che cosa resta nascosto.',
        detail:
          'La Giustizia e la carta numero 11 degli Arcani Maggiori. Simboleggia equita, verita, regole, conseguenza e responsabilita. In una mano tiene la spada, nell altra la bilancia. Insieme parlano di chiarezza e peso: cio che e vero, cio che e nascosto e cio a cui, alla fine, si dovra rispondere.\n\nDiversamente dalla Ruota della Fortuna, il cui movimento non e sempre controllabile, la Giustizia appartiene a un ordine piu freddo. Le scelte producono conseguenze e le responsabilita non scompaiono solo perche sono scomode. Diritta, chiede onesta, prove e sguardo limpido. Rovesciata, avverte di squilibrio, potere travestito, falsa neutralita e della possibilita che la verita resti ancora coperta sotto il mantello della legittimita. Il suo insegnamento centrale e che la verita può essere nascosta, ma non perde il proprio peso.',
      },
    },
  }),
  createMeaningCard({
    id: 'the-hanged-man',
    number: 12,
    name_cn: '倒吊人',
    name_en: 'The Hanged Man',
    keywords: ['停滞', '等待', '换位思考', '牺牲', '放下', '暂停', '觉察', '新视角'],
    daily_upright: '今天适合先停一停，不必急着推进。换一个角度看问题，你可能会发现原本看不见的答案。',
    daily_reversed: '今天要小心无意义的拖延，或明明已经停滞却不愿改变视角。别把等待当成逃避，也别把牺牲当成唯一选择。',
    reading_upright:
      '倒吊人正位代表暂时的停滞、等待、放下控制，以及用另一个视角重新理解事物。它说明当前局面可能无法立刻推进，但这种暂停并不一定是失败，而是给你一个重新看清问题的机会。\n\n在牌阵中出现时，倒吊人提醒你不要只用原来的方式解决问题。你可能需要暂时放下执念，停止硬推，甚至接受某种短期的不自由。表面上看，你像是被悬在那里，无法行动；但从另一个层面看，你正在获得新的观察位置。只有当你愿意倒过来看世界，某些答案才会浮现。',
    reading_reversed:
      '倒吊人逆位代表抗拒停顿、无意义的拖延、自我牺牲过度，或迟迟不愿改变视角。你可能已经卡在某个局面里很久，却仍然用同一种方式思考，所以越挣扎越疲惫。\n\n在牌阵中出现时，倒吊人逆位提醒你分辨：你是真的需要等待，还是只是不敢做决定？你是在为了更高的理解而暂停，还是在用“忍耐”和“牺牲”回避行动？此时需要重新审视自己的处境，不要继续把自己悬挂在一个没有出口的位置上。',
    detail:
      '倒吊人是大阿尔卡那的第 12 张牌，象征暂停、等待、牺牲、放下控制，以及从新的角度看待世界。牌面中的人物被倒吊在树上，身体受到限制，神情却常常显得平静。他不像是在痛苦挣扎，更像是在某种停顿中获得了新的领悟。\n\n这张牌最重要的含义，是“暂时的停滞”。有些时候，事情无法继续往前走，并不是因为你做错了什么，而是因为原来的道路已经无法给出答案。你越是急着推进，越可能被同一个问题困住。倒吊人出现时，像是命运轻轻按下暂停键，让你停在半空中，重新观看眼前的一切。\n\n倒吊人的智慧来自颠倒。正常站立时，人只能看见自己习惯看见的东西；被倒挂起来时，世界的秩序突然改变了。上方变成下方，熟悉变得陌生，原本理所当然的判断也开始松动。这张牌提醒你：问题本身也许没有变，但你看待问题的位置必须改变。\n\n当倒吊人正位出现时，它通常意味着你需要放下某种控制欲。你可能很想立刻得到结果，想逼迫事情按照自己的节奏发生，但眼前的局面并不适合硬推。此时更重要的是观察、等待、转换思路。你需要问自己：如果不从得失看这件事，它还意味着什么？如果不急着证明自己，是否会看见另一条路？如果暂时不行动，真正浮现出来的感受又是什么？\n\n倒吊人也与牺牲有关。但这种牺牲不一定是悲壮的自我消耗，而可能是一种主动放下：放下旧的立场，放下过度执着的目标，放下必须马上赢、马上得到答案的焦虑。它让你明白，有些东西只有在松手之后，才会显露出真正的形状。\n\n在关系中，倒吊人可能代表一段需要冷静观察的时期。你可能暂时无法推进关系，也无法立刻得到回应。它提醒你不要只站在自己的需求里看问题，也要尝试理解对方的位置，或者看清这段关系本身是否已经进入停滞。在事业和现实事务中，它可能代表等待、延迟、计划暂缓，或需要重新评估方向。\n\n当倒吊人逆位出现时，它提醒你留意无意义的停滞。暂停本来可以带来觉察，但如果停得太久，就可能变成逃避。你可能明明知道某件事已经没有结果，却仍然把自己吊在那里；也可能因为害怕选择，而用“再等等”拖延真正的决定。\n\n倒吊人逆位也可能指向过度牺牲。你可能习惯把自己的需要放到最后，以为只要继续忍耐，事情就会变好。但如果牺牲没有带来成长，只让你越来越疲惫，那就不再是智慧，而是消耗。此时，你需要把自己从悬挂的位置上放下来，重新找回行动的能力。\n\n倒吊人的核心信息是：停下并不一定等于失败。真正的暂停，是为了让你从旧视角里脱身。世界把你倒过来，不是为了惩罚你，而是为了让你看见：原来答案一直在那里，只是你以前站的位置看不到。',
    translations: {
      en: {
        name: 'The Hanged Man',
        keywords: ['Stagnation', 'Waiting', 'Perspective Shift', 'Sacrifice', 'Letting Go', 'Pause', 'Awareness', 'New View'],
        daily_upright: 'Today is good for pausing instead of forcing progress. A different angle may reveal an answer you could not see before.',
        daily_reversed: 'Today asks you to watch for meaningless delay or resistance to changing perspective. Do not turn waiting into avoidance or sacrifice into your only identity.',
        reading_upright:
          'The Hanged Man upright represents pause, waiting, surrender of control, and seeing from another angle. The standstill may not be failure at all, but an opening for insight.\n\nIn a spread, it asks you to stop pushing with the old method and allow a new viewpoint to emerge.',
        reading_reversed:
          'The Hanged Man reversed represents resisting the pause, pointless delay, excessive self-sacrifice, or refusing to shift perspective.\n\nIn a spread, it asks whether you are truly waiting for wisdom or only hiding from the need to choose.',
        detail:
          'The Hanged Man is card 12 of the Major Arcana. It symbolizes pause, waiting, sacrifice, surrender of control, and a new way of seeing. Suspended upside down, the figure appears restrained, yet also strangely peaceful, as if insight is being born within the stillness.\n\nIts central meaning is temporary suspension. Sometimes life does not move because the old road can no longer answer the question before you. The card asks you to stop forcing and to let perspective reverse itself. Upright, this pause can become revelation. Reversed, the pause can harden into avoidance, stale sacrifice, or delay without meaning. Its lesson is that not every stop is failure; some pauses exist to free you from an old way of seeing.',
      },
      it: {
        name: 'L Appeso',
        keywords: ['Stasi', 'Attesa', 'Cambio di prospettiva', 'Sacrificio', 'Lasciare andare', 'Pausa', 'Consapevolezza', 'Nuovo sguardo'],
        daily_upright: 'Oggi e utile fermarti un momento invece di forzare il progresso. Un altra angolazione può mostrarti una risposta che prima non vedevi.',
        daily_reversed: 'Oggi fai attenzione a un ritardo senza senso o al rifiuto di cambiare prospettiva. Non trasformare l attesa in evitamento o il sacrificio nella tua unica identita.',
        reading_upright:
          'L Appeso diritto rappresenta pausa, attesa, rinuncia al controllo e la capacita di vedere da un altro angolo. La stasi non e necessariamente fallimento, ma può diventare un occasione di comprensione.\n\nIn una stesa, invita a smettere di spingere con il vecchio metodo e a lasciare emergere un nuovo sguardo.',
        reading_reversed:
          'L Appeso rovesciato rappresenta resistenza alla pausa, rinvio senza senso, sacrificio eccessivo o rifiuto di cambiare prospettiva.\n\nIn una stesa, chiede se stai davvero aspettando saggezza o se stai solo evitando di scegliere.',
        detail:
          'L Appeso e la carta numero 12 degli Arcani Maggiori. Simboleggia pausa, attesa, sacrificio, rinuncia al controllo e un nuovo modo di vedere. Sospeso a testa in giu, il personaggio appare limitato, ma anche insolitamente sereno, come se nella sospensione stesse nascendo una comprensione nuova.\n\nIl suo significato centrale e la sospensione temporanea. A volte la vita non si muove perche la vecchia strada non sa piu rispondere alla domanda che hai davanti. La carta ti invita a smettere di forzare e a lasciare che la prospettiva si capovolga. Diritta, questa pausa può diventare rivelazione. Rovesciata, può irrigidirsi in evitamento, sacrificio sterile o ritardo senza senso. La sua lezione e che non ogni fermata e fallimento; alcune pause esistono per liberarti da un vecchio modo di vedere.',
      },
    },
  }),
  createMeaningCard({
    id: 'death',
    number: 13,
    name_cn: '死神',
    name_en: 'Death',
    keywords: ['结束', '转化', '断舍离', '消亡', '放下', '清醒', '重生', '周期更替'],
    daily_upright: '今天适合和不再适合你的东西告别，进行断舍离。结束未必轻松，但有些门只有真正关上，新的路才会出现。',
    daily_reversed: '今天要小心抗拒结束，或明明知道该放下，却仍然抓着过去不肯松手。拖延告别，只会让痛苦停留得更久。',
    reading_upright:
      '死神正位代表一个周期的结束、旧事物的消亡、情感上的断舍离，以及不可避免的转化。它说明某件事已经走到尽头，即使你仍然不舍、痛苦或无可奈何，也很难再让它回到原来的样子。\n\n在牌阵中出现时，死神提醒你接受结束的规律。它不一定代表真正的死亡，而是代表关系、状态、身份、执念、旧习惯或某个阶段的终结。此时最重要的不是强行挽留，而是清醒地看见：有些东西已经完成了它的使命，继续抓住它，只会阻碍新的生命进入。',
    reading_reversed:
      '死神逆位代表拒绝结束、害怕改变、拖延放手，或被过去困住。你可能已经感觉到某件事不再适合自己，却因为不甘心、舍不得、恐惧未知，仍然停留在一个已经失去生命力的位置上。\n\n在牌阵中出现时，死神逆位提醒你：真正折磨人的，往往不是结束本身，而是明明知道结束已经发生，却仍然不愿承认。它也可能表示转化被延迟，旧模式还在反复出现。此时需要看清自己到底在留恋什么，是那件事本身，还是那个曾经寄托在其中的自己。',
    detail:
      '死神是大阿尔卡那的第 13 张牌，象征结束、转化、消亡、断舍离与周期的更替。它常常让人害怕，因为它直接指向“失去”。但在塔罗中，死神并不只是灾难的象征，它更像一种冷峻而清醒的规律：凡是有开始的东西，都会有结束；凡是已经枯萎的东西，都无法靠执念重新盛开。\n\n这张牌的力量很不温柔。它不像命运之轮那样带着转机的神秘感，也不像倒吊人那样给你一个暂停和重新观看的机会。死神更像一把镰刀，直接切断那些已经走到尽头的东西。它不问你是否准备好，也不因为你舍不得就停止前进。它代表事物消亡的规律，也代表人在规律面前不得不清醒。\n\n当死神正位出现时，它通常意味着某个周期正在结束。可能是一段关系，一个计划，一种生活方式，一个身份，一种执念，或你对某个人、某件事的期待。这个结束未必突然，也许你早就隐约感觉到了：热情慢慢冷掉，联系慢慢变少，意义慢慢消散，曾经支撑你的东西已经不再能支撑现在的你。\n\n死神也代表情感上的断舍离。它要求你承认：不是所有爱都能继续，不是所有努力都能挽回，不是所有过去都值得被反复携带。有些东西曾经真实地存在过，也真实地重要过，但它已经完成了它在你生命中的部分。继续紧握它，并不会证明它更珍贵，只会让你无法腾出双手接住新的东西。\n\n这张牌的痛苦来自无可奈何。人当然会想挽留，会想回到从前，会想问为什么偏偏是这个结果。但死神的清醒就在于：它不提供漂亮的安慰。它只是把事实放在你面前，让你看见旧世界已经开始崩塌。你可以哭，可以不舍，可以缓慢地告别，但你不能假装它还像过去一样活着。\n\n然而，死神并不是终点。它的结束是为了转化。土地上的旧叶腐烂之后，会成为新的养分；一个旧身份死去之后，人才可能长出新的自己。死神真正带来的不是空无，而是把不再有生命力的东西清理出去，让新的阶段有空间发生。它残酷，但也诚实；它带走，但也清空。\n\n当死神逆位出现时，它提醒你留意对结束的抗拒。你可能明明知道某段关系、某种状态或某个幻想已经结束，却仍然试图把它维持成原来的样子。你可能不是没有看见真相，而是不愿承认真相。于是旧痛苦反复回来，旧模式反复上演，人生像被卡在一扇早该关上的门前。\n\n死神逆位也可能表示你害怕改变。即使现在的状态已经不舒服、不健康、不再有希望，你仍然因为害怕未知而不敢离开。它提醒你：熟悉的痛苦也是痛苦，不能因为它熟悉，就把它误认为安全。\n\n死神的核心信息是：结束不是失败，而是周期完成之后必然发生的清理。你需要清醒地承认消亡，也需要有勇气完成告别。那些不再属于你的东西会离开，而你也会在失去之后，慢慢成为下一个阶段的自己。',
    translations: {
      en: {
        name: 'Death',
        keywords: ['Ending', 'Transformation', 'Release', 'Dissolution', 'Letting Go', 'Clarity', 'Rebirth', 'Cycle Shift'],
        daily_upright: 'Today is good for letting go of what no longer fits. Endings are not always gentle, but some doors must close before new roads can appear.',
        daily_reversed: 'Today asks you to watch for resisting an ending. Holding on after something is already over only extends the pain.',
        reading_upright:
          'Death upright represents the ending of a cycle, emotional release, and unavoidable transformation. Something has reached its limit and cannot return to its old form.\n\nIn a spread, it asks you to accept the law of ending rather than keep clinging to what has already completed its part.',
        reading_reversed:
          'Death reversed represents resisting change, delaying release, or remaining trapped in the past. You may already know something is over, yet still refuse to name the ending.\n\nIn a spread, it asks what you are truly holding on to and whether the attachment is to the thing itself or to the self once tied to it.',
        detail:
          'Death is card 13 of the Major Arcana. It symbolizes ending, transformation, dissolution, release, and the change of cycles. It frightens many people because it points straight toward loss, yet in tarot it is not merely a sign of disaster. It is the clear law that whatever begins must also end, and whatever has withered cannot be revived by attachment alone.\n\nDeath does not move gently. It cuts what has already reached its end. Upright, it often marks the close of a relationship, identity, plan, expectation, or emotional pattern. Its lesson is to see clearly that not every bond is meant to continue forever. Reversed, it exposes resistance to change and the suffering created when we refuse to acknowledge what is already finished. The core message is that ending is not failure. It is the clearing that makes the next life possible.',
      },
      it: {
        name: 'La Morte',
        keywords: ['Fine', 'Trasformazione', 'Lasciare andare', 'Dissoluzione', 'Distacco', 'Chiarezza', 'Rinascita', 'Cambio di ciclo'],
        daily_upright: 'Oggi e utile salutare cio che non ti appartiene piu. Le fini non sono sempre leggere, ma alcune porte devono chiudersi per lasciare spazio a una strada nuova.',
        daily_reversed: 'Oggi fai attenzione alla resistenza verso una fine. Continuare a trattenere cio che e gia finito prolunga soltanto il dolore.',
        reading_upright:
          'La Morte diritta rappresenta la fine di un ciclo, il distacco emotivo e una trasformazione inevitabile. Qualcosa ha raggiunto il proprio limite e non può tornare alla forma di prima.\n\nIn una stesa, chiede di accettare la legge della fine invece di continuare ad aggrapparsi a cio che ha gia concluso il proprio compito.',
        reading_reversed:
          'La Morte rovesciata rappresenta resistenza al cambiamento, ritardo nel lasciare andare o permanenza dentro il passato. Potresti sapere gia che qualcosa e finito, eppure rifiutarti ancora di nominarne la fine.\n\nIn una stesa, chiede che cosa stai davvero trattenendo e se il legame sia con la cosa in se o con la versione di te che un tempo vi era legata.',
        detail:
          'La Morte e la carta numero 13 degli Arcani Maggiori. Simboleggia fine, trasformazione, dissoluzione, distacco e cambio di ciclo. Spaventa molte persone perche indica direttamente la perdita, ma nel tarot non e solo un segno di catastrofe. E la legge chiara secondo cui cio che comincia deve anche finire, e cio che e ormai secco non può rifiorire soltanto grazie all attaccamento.\n\nLa Morte non si muove con dolcezza. Taglia cio che e gia arrivato alla propria conclusione. Diritta, segna spesso la fine di una relazione, di un identita, di un progetto, di un aspettativa o di un vecchio schema emotivo. La sua lezione e vedere con lucidita che non ogni legame e destinato a continuare per sempre. Rovesciata, mostra la resistenza al cambiamento e la sofferenza che nasce quando rifiutiamo di riconoscere cio che e gia finito. Il messaggio centrale e che la fine non e fallimento. E la pulizia che rende possibile la vita successiva.',
      },
    },
  }),
  createMeaningCard({
    id: 'temperance',
    number: 14,
    name_cn: '节制',
    name_en: 'Temperance',
    keywords: ['平衡', '调和', '耐心', '疗愈', '整合', '节奏', '适度', '准备启航'],
    daily_upright: '今天适合调整节奏，别急着冲向下一站。你拥有启航的能力，但此刻先把内在和现实调到更平衡的位置。',
    daily_reversed: '今天要小心失衡、急躁或过度消耗。别在还没调整好状态时强行出发，也别让情绪把节奏打乱。',
    reading_upright:
      '节制正位代表平衡、调和、耐心与整合。它说明你正在进入一个需要慢慢调整的阶段，不适合极端行动，也不适合急于得到结果。此时真正重要的，是把不同的情绪、资源、关系和选择调和到一个更稳定的位置。\n\n在牌阵中出现时，节制提醒你：你并不是没有行动能力，而是需要先找到合适的节奏。牌面中的天使一脚踏在水中，一脚站在陆地上，像是同时连接内在感受与现实世界。你拥有随时启航的可能，但此刻选择停留，是为了让自己更完整、更清醒地出发。',
    reading_reversed:
      '节制逆位代表失衡、急躁、过度、节奏混乱，或无法调和内在与外在的冲突。你可能在两个极端之间摇摆：一会儿想立刻行动，一会儿又完全停下；一会儿过度付出，一会儿彻底抽离。\n\n在牌阵中出现时，节制逆位提醒你先检查自己的状态是否已经被打乱。你可能太急着抵达结果，以至于忽略了身体、情绪和现实条件的承受能力。它也可能表示关系或计划中缺少协调，彼此无法找到合适的比例。此时需要重新调整节奏，而不是继续用失衡的方式推进。',
    detail:
      '节制是大阿尔卡那的第 14 张牌，象征平衡、调和、耐心、疗愈与整合。它出现在死神之后，因此带着一种很特别的气质：在经历结束、失去和清理之后，生命不能立刻冲向新的阶段，而需要先重新调整自己的比例。像把两种不同温度的水慢慢混合，直到它们变成可以承受的温度。\n\n牌面中的天使通常一脚站在陆地上，一脚踏入水中。陆地象征现实、身体、行动和可见的生活；水象征情绪、潜意识、感受和内在流动。天使手中把水从一个杯子倒向另一个杯子，像是在进行一种细致的炼金术：不是消灭矛盾，而是让不同的东西慢慢找到可以共存的方式。\n\n这张牌的重点不是停滞，而是调和。它并不是说你没有能力前进，也不是说你必须永远留在原地。相反，节制常常表示你已经具备启航的条件，只是此刻更重要的不是马上出发，而是确认自己是否已经准备好以稳定的状态出发。它有一种“我可以走，但我选择先稳住自己”的成熟。\n\n当节制正位出现时，它通常意味着你需要耐心、适度和节奏感。也许事情正在恢复，也许关系正在缓和，也许某个计划还需要一点时间整理。此时过度用力反而会破坏平衡。节制提醒你，不要用极端的方式处理问题：不要全有全无，不要忽冷忽热，不要因为急于证明自己就打乱内在秩序。\n\n节制也常常代表疗愈。死神带来结束，节制则负责在结束之后慢慢修复。它不像星星那样直接带来希望的光，也不像太阳那样明亮展开，它更像一段安静的恢复期。你可能还没有完全好起来，但你正在慢慢把破碎的部分接回去。杯与杯之间流动的水，像是在告诉你：生命可以重新被混合，痛苦可以被稀释，失衡可以被调回中间。\n\n在关系中，节制代表沟通、磨合与互相适应。它不是强烈的激情，而是一种能长期相处的温度。两个人需要找到合适的距离、节奏和表达方式。太近会窒息，太远会冷掉；太急会破坏，太慢会错过。节制关心的正是这个“刚刚好”。\n\n在事业或现实事务中，节制代表资源整合、计划调整和逐步推进。它提醒你把不同条件协调起来：理想与现实，速度与质量，野心与承受力，个人欲望与外部环境。它不是让你放弃目标，而是让你用更稳定的方法接近目标。\n\n当节制逆位出现时，它提醒你留意失衡。你可能在某件事上过度投入，导致身体疲惫、情绪混乱，或关系失去弹性。也可能是你太急着进入下一阶段，没有给自己足够的恢复和整理时间。此时，强行启航未必会更快抵达，反而可能因为船身还没修好就在途中漏水。\n\n节制逆位也可能表示无法整合。你的内在想要一种东西，现实要求另一种东西；你的理智告诉你该冷静，情绪却已经泛滥。它提醒你不要急着选边站，而是先看见两边各自需要什么。真正的平衡不是把一边压下去，而是找到能让两边都被安置的位置。\n\n节制的核心信息是：真正成熟的前进，不是永远向前冲，而是知道什么时候该调慢、该修复、该让不同的部分重新融合。你拥有启航的能力，但此刻的停留不是软弱，而是在为下一次出发调好风、调好水，也调好自己。',
    translations: {
      en: {
        name: 'Temperance',
        keywords: ['Balance', 'Harmony', 'Patience', 'Healing', 'Integration', 'Rhythm', 'Moderation', 'Preparing to Set Sail'],
        daily_upright: 'Today is good for adjusting your rhythm rather than rushing toward the next station. You can set out, but first bring your inner and outer world back into balance.',
        daily_reversed: 'Today asks you to watch for imbalance, haste, or overconsumption. Do not force departure before your state is ready, and do not let emotion wreck your rhythm.',
        reading_upright:
          'Temperance upright represents balance, harmony, patience, and integration. You are entering a phase that needs careful adjustment rather than extremes.\n\nIn a spread, it asks you to find the right rhythm before moving ahead.',
        reading_reversed:
          'Temperance reversed represents imbalance, haste, excess, scattered rhythm, or conflict between inner and outer life.\n\nIn a spread, it asks you to restore proportion before continuing to push forward.',
        detail:
          'Temperance is card 14 of the Major Arcana. It symbolizes balance, harmony, patience, healing, and integration. Coming after Death, it carries the sense that after a great ending, life does not immediately leap into the next phase. It first needs to regain proportion.\n\nIts essence is not stagnation but alchemy. Different elements, emotions, demands, and realities must be brought into relationship with one another. Upright, Temperance shows mature pacing, recovery, and the wisdom of not forcing what still needs blending. Reversed, it warns of imbalance, excess, and the strain that comes from pushing forward before body, emotion, and circumstance have been properly adjusted. Its central message is that true progress includes the art of healing, pacing, and mixing life back into a livable whole.',
      },
      it: {
        name: 'Temperanza',
        keywords: ['Equilibrio', 'Armonia', 'Pazienza', 'Guarigione', 'Integrazione', 'Ritmo', 'Misura', 'Prepararsi a salpare'],
        daily_upright: 'Oggi e utile regolare il ritmo invece di correre subito verso la tappa successiva. Hai la capacita di partire, ma prima riporta in equilibrio il mondo interiore e quello concreto.',
        daily_reversed: 'Oggi fai attenzione a squilibrio, fretta o eccessivo consumo di energie. Non partire a forza prima di essere pronta o pronto, e non lasciare che l emozione rompa il ritmo.',
        reading_upright:
          'Temperanza diritta rappresenta equilibrio, armonia, pazienza e integrazione. Stai entrando in una fase che richiede aggiustamento attento e non estremi.\n\nIn una stesa, invita a trovare il ritmo giusto prima di andare avanti.',
        reading_reversed:
          'Temperanza rovesciata rappresenta squilibrio, fretta, eccesso, ritmo confuso o conflitto tra mondo interiore ed esterno.\n\nIn una stesa, chiede di ristabilire la misura prima di continuare a spingere.',
        detail:
          'Temperanza e la carta numero 14 degli Arcani Maggiori. Simboleggia equilibrio, armonia, pazienza, guarigione e integrazione. Dopo la Morte, porta il senso che, dopo una grande fine, la vita non si lancia subito nella fase successiva: deve prima ritrovare proporzione.\n\nLa sua essenza non e la stagnazione ma l alchimia. Elementi, emozioni, richieste e realta diverse devono essere riportati in relazione tra loro. Diritta, Temperanza mostra ritmo maturo, recupero e la saggezza di non forzare cio che ha ancora bisogno di essere mescolato. Rovesciata, avverte di squilibrio, eccesso e fatica prodotta dal voler avanzare prima che corpo, emozione e circostanze siano davvero pronti. Il suo messaggio centrale e che il vero avanzamento comprende anche l arte di guarire, regolare il passo e rimescolare la vita fino a renderla di nuovo abitabile.',
      },
    },
  }),
  createMeaningCard({
    id: 'the-devil',
    number: 15,
    name_cn: '恶魔',
    name_en: 'The Devil',
    keywords: ['欲望', '束缚', '诱惑', '契约', '成瘾', '代价', '控制', '物质利益', '野心'],
    daily_upright: '今天要小心被欲望和利益牵着走。某个机会也许很诱人，但先看清它背后需要你付出什么代价。',
    daily_reversed: '今天适合看清束缚自己的东西，并尝试松开它。你未必真的被困住，有些锁链只是因为习惯和恐惧才一直没有解开。',
    reading_upright:
      '恶魔正位代表欲望、诱惑、束缚、成瘾与带有代价的交换。它说明你可能正在被某种强烈的欲望驱动：金钱、权力、身体欲望、成功、控制感、关系依赖，或某种明知不健康却难以摆脱的东西。\n\n在牌阵中出现时，恶魔提醒你看清眼前的“契约”。它不一定只代表坏事，也可能表示事业上的升职、业绩提升、资源获取、名利增长，甚至某种现实意义上的成功。但问题在于：你需要拿什么来换？是时间、身体、自由、睡眠、情绪，还是对自我的掌控权？恶魔的重点不是机会不存在，而是机会背后的代价必须被看见。',
    reading_reversed:
      '恶魔逆位代表脱离束缚、看清诱惑、解除不健康的依赖，或开始拒绝某种有毒的交换。你可能终于意识到，某个让你上瘾、让你沉迷、让你不断付出的东西，并没有真正让你自由。\n\n在牌阵中出现时，恶魔逆位提醒你重新拿回选择权。你也许正在从一段关系、一种工作模式、一种欲望循环，或某个“我必须这样才能得到想要的东西”的信念中醒来。它也可能表示你正在尝试打破成瘾、离开控制，或不再愿意为了短期利益继续出卖自己的长期状态。',
    detail:
      '恶魔是大阿尔卡那的第 15 张牌，象征欲望、诱惑、束缚、成瘾、控制，以及带有代价的交换。它不是简单的邪恶之牌，而是一张非常现实的牌：人会被想要的东西吸引，也会因为想要而签下一些并不完全自由的契约。\n\n牌面中，恶魔通常高坐在上方，下面有一男一女被锁链束缚。他们看起来像是被囚禁，但锁链往往并没有紧到完全无法挣脱。这是恶魔最微妙的地方：很多束缚并不是彻底不可逃离，而是人已经习惯了它，甚至从中获得了某种好处。于是离开变得困难，因为那不只是离开痛苦，也是在离开一部分欲望带来的满足。\n\n恶魔代表欲望的驱动。它可以是金钱、权力、性、名声、控制感、胜负心，也可以是关系中的占有、依赖和拉扯。欲望本身并不一定是坏的，它让人行动，让人争取，让人想要更多。但当欲望不再被人掌控，而是反过来掌控人时，恶魔就出现了。你以为自己在追求某个目标，实际上可能正在被那个目标牵着走。\n\n在事业中，恶魔常常表现得非常具体。它可能代表升职、业绩增长、高薪机会、资源交换、进入更有权力的位置。表面上看，这是现实意义上的成功：你得到更多钱、更高职位、更强影响力，也获得了被看见的机会。但恶魔会问你：这份成功的附加条款是什么？你是不是要用长期加班、熬夜、焦虑、健康损耗、私人生活崩塌，甚至价值观妥协来交换？\n\n所以恶魔并不一定说“不要签约”。它更像是在把契约摊开，让你看见小字部分。它提醒你，世界上有些东西确实能给你想要的结果，但它们不会免费。你需要清楚自己正在交换什么，也需要知道这份交换是否仍然值得。如果你清醒地选择，并且能承担代价，那是一种现实判断；如果你假装没有代价，那就是被恶魔牵着走。\n\n在关系中，恶魔可能代表强烈吸引、欲望纠缠、依赖、控制、嫉妒或无法放手的关系。它不是恋人牌里那种互相看见、互相理解的连接，而是一种更黏、更暗、更难挣脱的绑定。你可能明知这段关系让自己痛苦，却仍然无法离开，因为里面有你渴望的东西：被需要、被占有、被刺激，或被某种强烈情绪证明自己还活着。\n\n当恶魔正位出现时，它通常意味着你需要看清自己被什么驱动。你想要的东西是什么？你为了得到它愿意牺牲什么？你是真的在选择，还是已经失去了拒绝的能力？这张牌最尖锐的地方在于，它不允许人用高尚的理由掩盖欲望。它要求你诚实承认：我想要，我沉迷，我害怕失去，我正在被某种东西控制。\n\n当恶魔逆位出现时，它代表看清束缚之后的松动。你可能开始意识到，自己并非完全无路可走。那条锁链也许没有你以为的那么牢，只是你太久没有尝试摘下它。恶魔逆位常常意味着脱离成瘾、打破控制、拒绝不健康的交换，或从某种欲望循环中醒来。\n\n但恶魔逆位的解放并不总是轻松。离开一个长期依赖的东西，会带来空虚、不安，甚至短暂的失重感。你可能会怀疑：没有这份工作、这段关系、这套成功标准、这种刺激，我还剩下什么？但这也正是恶魔逆位的真正意义：当你不再靠锁链定义自己，你才会重新发现自己的自由。\n\n恶魔的核心信息是：欲望会给你力量，也会给你锁链。你可以追求成功、金钱、爱和满足，但必须看清每一份契约背后的代价。真正危险的不是欲望本身，而是你明明已经被束缚，却还以为那就是自由。',
    translations: {
      en: {
        name: 'The Devil',
        keywords: ['Desire', 'Bondage', 'Temptation', 'Contract', 'Addiction', 'Cost', 'Control', 'Material Gain', 'Ambition'],
        daily_upright:
          'Today asks you to watch how desire and gain may be pulling you. An opportunity may look highly attractive, but first understand what price it expects.',
        daily_reversed:
          'Today is good for seeing clearly what has been binding you and beginning to loosen it. Some chains remain only because habit and fear keep them in place.',
        reading_upright:
          'The Devil upright represents desire, temptation, bondage, addiction, and exchanges that come with a cost. You may be driven by money, power, success, control, dependency, or something you already know is unhealthy.\n\nIn a spread, it asks you to examine the contract in front of you and to read the price written into it.',
        reading_reversed:
          'The Devil reversed represents loosening bondage, seeing temptation clearly, and refusing a toxic exchange. You may be waking up from something that never truly made you free.\n\nIn a spread, it asks you to reclaim your power to choose.',
        detail:
          'The Devil is card 15 of the Major Arcana. It symbolizes desire, temptation, bondage, addiction, control, and bargains with a cost. It is not simply a card of evil. It is a very realistic card about what human beings are willing to trade in order to get what they want.\n\nIts chains are often not absolute. That is what makes the card so unsettling: many prisons remain powerful because people become used to them, and because they still receive something from them. Desire itself is not always wrong. It can drive ambition, intimacy, and achievement. But when desire ceases to be something you direct and becomes something that directs you, The Devil appears.\n\nIn work, it may look like promotion, high pay, influence, or success purchased at the cost of health, sleep, freedom, or values. In relationship, it may look like attraction mixed with dependency, possession, jealousy, or an inability to let go. Upright, the card demands honesty about what is driving you and what you are sacrificing. Reversed, it marks the beginning of release: the realization that the chain may not be as fixed as you believed, and that freedom begins when you stop confusing bondage with love, success, or identity.',
      },
      it: {
        name: 'Il Diavolo',
        keywords: ['Desiderio', 'Vincolo', 'Tentazione', 'Patto', 'Dipendenza', 'Prezzo', 'Controllo', 'Guadagno materiale', 'Ambizione'],
        daily_upright:
          'Oggi fai attenzione al modo in cui desiderio e vantaggio possono trascinarti. Un opportunita può sembrare molto attraente, ma prima guarda il prezzo che richiede.',
        daily_reversed:
          'Oggi e utile vedere con chiarezza cio che ti tiene legata o legato e iniziare ad allentarlo. Alcune catene restano solo per abitudine e paura.',
        reading_upright:
          'Il Diavolo diritto rappresenta desiderio, tentazione, vincolo, dipendenza e scambi che hanno un prezzo. Potresti essere spinta o spinto da denaro, potere, successo, controllo, dipendenza o da qualcosa che sai gia essere nocivo.\n\nIn una stesa, ti chiede di guardare bene il contratto che hai davanti e il costo che contiene.',
        reading_reversed:
          'Il Diavolo rovesciato rappresenta l allentarsi del vincolo, la tentazione vista con lucidita e il rifiuto di uno scambio tossico. Potresti stare uscendo da qualcosa che non ti ha mai resa o reso davvero libera o libero.\n\nIn una stesa, ti chiede di riprendere il tuo potere di scegliere.',
        detail:
          'Il Diavolo e la carta numero 15 degli Arcani Maggiori. Simboleggia desiderio, tentazione, vincolo, dipendenza, controllo e patti con un prezzo. Non e soltanto la carta del male. E una carta molto concreta che riguarda cio che gli esseri umani sono disposti a scambiare per ottenere cio che vogliono.\n\nLe sue catene spesso non sono assolute. Ed e proprio questo a renderla inquietante: molte prigioni restano forti perche le persone vi si abituano e perche continuano a ricavarne qualcosa. Il desiderio di per se non e sempre sbagliato. Può dare ambizione, intensita e movimento. Ma quando smette di essere qualcosa che guidi e diventa cio che guida te, appare il Diavolo.\n\nNel lavoro può manifestarsi come promozione, denaro, influenza o successo comprati al prezzo di salute, sonno, liberta o valori. Nelle relazioni può apparire come attrazione mescolata a dipendenza, possesso, gelosia o incapacita di lasciare andare. Diritto, chiede onesta su cio che ti muove e su cio che stai sacrificando. Rovesciato, segna l inizio del rilascio: la comprensione che la catena potrebbe non essere cosi fissa come credevi e che la liberta comincia quando smetti di scambiare il vincolo per amore, successo o identita.',
      },
    },
  }),
];

const customMeanings = new Map(meaningCards.map((card) => [card.number, card]));

export const tarotMeaningCards = allTarotCards.map((card) => customMeanings.get(card.id) || createPlaceholderMeaning(card));

export function getTarotMeaningCard(cardId) {
  return tarotMeaningCards.find((card) => card.id === cardId) || tarotMeaningCards.find((card) => card.number === cardId) || null;
}

export function findTarotMeaningCard(input) {
  if (!input) return null;

  if (typeof input === 'string') {
    const normalized = normalizeChineseName(input);
    return tarotMeaningCards.find((card) => card.id === input || card.name_cn === normalized || card.name_en === input) || null;
  }

  if (typeof input.id === 'number') {
    return tarotMeaningCards.find((card) => card.number === input.id) || null;
  }

  const normalizedName = normalizeChineseName(input.name);
  return (
    tarotMeaningCards.find(
      (card) => card.name_cn === normalizedName || card.name_en === input.englishName || card.name_en === input.name,
    ) || null
  );
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
