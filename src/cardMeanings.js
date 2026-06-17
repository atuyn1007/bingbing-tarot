import { allTarotCards } from './data';
import { getCardArtwork } from './cardArtwork';

const chineseNameOverrides = {
  死亡: '死神',
};

function normalizeChineseName(name) {
  return chineseNameOverrides[name] || name;
}

function slugifyEnglishName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

function getMeaningImage(cardLike) {
  if (!cardLike) return '';

  if (typeof cardLike === 'string') {
    return getCardArtwork({ name: normalizeChineseName(cardLike) }) || '';
  }

  return (
    getCardArtwork({
      id: cardLike.number,
      name: normalizeChineseName(cardLike.name_cn),
      englishName: cardLike.name_en,
    }) || ''
  );
}

function createMeaningCard(config) {
  return {
    arcana: 'major',
    suit: '',
    image: getMeaningImage(config),
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
    image: getMeaningImage({
      number: inferNumber(card.id, arcana, card.englishName),
      name_cn: card.name,
      name_en: card.englishName,
    }),
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
    reading_upright: `愚人正位代表新的开始、自由、冒险与尚未被定义的可能性。它说明你正站在一个新阶段的入口，过去的经验不必完全限制你，未来还有许多未知的路可以展开。

在牌阵中出现时，愚人提醒你可以更勇敢地迈出第一步。它不一定保证结果稳定，但强调“开始”的力量：有些答案只有真正出发之后才会出现。`,
    reading_reversed: `愚人逆位代表冲动、准备不足、逃避现实，或对风险的判断不够清晰。你可能只看见远方的自由，却忽略了脚下的悬崖。

在牌阵中出现时，它提醒你先停下来确认方向。牌面中的小狗像是在提醒你听见外界的声音：不要一味往前冲，也不要因为害怕风险而完全停住。`,
    detail: `愚人是大阿尔卡那的第 0 张牌，0 象征尚未成形的开始，也象征无限的可能性。他像一张尚未书写的白纸，带着纯真、自由、好奇和少年般的勇气，站在人生新旅程的入口。

当愚人正位出现时，世界正在你的脚下缓缓展开。你可能即将进入一个新的阶段，开始一段新的关系、计划、选择或人生方向。此时的你不必被过去的经验完全束缚，可以像孩子一样保持最清澈的心气，相信未来仍有星辰大海，也相信自己仍然拥有重新开始的能力。

愚人牌的正位并不保证前路毫无风险，但它鼓励你迈出第一步。它提醒你，有些事情只有真正开始之后，答案才会出现。与其困在过度思考里，不如带着开放的心，去接住命运递来的新机会。

当愚人逆位出现时，它提醒你留意脚下的悬崖。你可能过于冲动、天真，或只看见远方的自由，却忽略了现实中的风险。牌面中的小狗也许正在试图唤醒你，让你不要完全沉浸在自己的兴奋和幻想里。此时，听听不同的声音、重新检查计划、确认自己的处境，会比盲目前进更重要。

愚人的核心信息是：出发很重要，但清醒也同样重要。保持少年心气，也要看清脚下的路。`,
    translations: {
      en: {
        name: 'The Fool',
        keywords: ['Beginning', 'Freedom', 'Adventure', 'Innocence', 'Unknown', 'Starting Over'],
        daily_upright:
          'Today is good for opening a new chapter and setting out, but major decisions still need a clear mind.',
        daily_reversed:
          'Today asks you to watch for risk. Do not move blindly, and do not freeze only because you fear what may happen.',
        reading_upright: `The Fool upright represents new beginnings, freedom, adventure, and possibility not yet defined. You are standing at the entrance to a new stage, and the future still holds roads that have not yet opened.

In a spread, The Fool encourages a brave first step. It does not promise certainty, but it honors the power of beginning.`,
        reading_reversed: `The Fool reversed represents impulsiveness, lack of preparation, avoidance of reality, or poor judgment about risk. You may see only distant freedom while ignoring the cliff beneath your feet.

In a spread, it asks you to pause and confirm your direction before moving again.`,
        detail: `The Fool is card 0 of the Major Arcana. Zero symbolizes a beginning not yet formed and also endless possibility. He stands at the entrance to a new journey with innocence, freedom, curiosity, and youthful courage.

When The Fool appears upright, the world begins to unfold beneath your feet. You may be entering a new phase, starting a new relationship, plan, decision, or life direction. The card does not ask you to erase the past, but it reminds you that the past does not have to define every road ahead.

The Fool does not promise a risk-free future. Instead, it encourages the first step. Some answers appear only after you truly begin. Reversed, it warns of recklessness, naivete, and the temptation to leap without seeing the edge.

The Fool's core message is simple: setting out matters, but so does staying awake to what lies beneath your feet.`,
      },
      it: {
        name: 'Il Matto',
        keywords: ['Inizio', 'Liberta', 'Avventura', 'Innocenza', 'Ignoto', 'Ripartenza'],
        daily_upright:
          'Oggi e un buon momento per aprire un nuovo capitolo e partire, ma le decisioni importanti richiedono ancora lucidita.',
        daily_reversed:
          'Oggi fai attenzione al rischio. Non correre avanti alla cieca e non restare immobile solo per paura.',
        reading_upright: `Il Matto diritto rappresenta nuovi inizi, liberta, avventura e possibilita ancora non definite. Sei sulla soglia di una nuova fase e molte strade devono ancora aprirsi.

In una stesa, Il Matto incoraggia il primo passo con coraggio. Non promette certezza, ma mette al centro la forza dell'inizio.`,
        reading_reversed: `Il Matto rovesciato rappresenta impulsivita, impreparazione, fuga dalla realta o giudizio poco chiaro sul rischio. Potresti vedere solo la liberta lontana e ignorare il precipizio sotto i piedi.

In una stesa, ti chiede di fermarti e confermare la direzione prima di ripartire.`,
        detail: `Il Matto e la carta numero 0 degli Arcani Maggiori. Lo zero simboleggia un inizio non ancora formato ma anche una possibilita infinita. Si trova sulla soglia di un nuovo viaggio con innocenza, liberta, curiosita e coraggio giovanile.

Quando appare diritto, il mondo comincia ad aprirsi sotto i tuoi piedi. Potresti entrare in una nuova fase, iniziare una nuova relazione, un nuovo progetto, una nuova scelta o direzione di vita. Il Matto non chiede di cancellare il passato, ma ricorda che il passato non deve definire ogni strada futura.

Il Matto non promette un cammino senza rischi. Invita invece a compiere il primo passo. Alcune risposte compaiono solo quando inizi davvero. Rovesciato, avverte di impulsivita, ingenuita e della tentazione di saltare senza vedere il bordo.

Il suo messaggio centrale e semplice: partire e importante, ma lo e anche restare lucida o lucido.`,
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
    reading_upright: `魔术师正位代表创造力、行动力、意志与显化。它说明你并非毫无准备，所需要的工具、资源或能力已经在你身边，只是需要你主动整合并使用它们。

在牌阵中出现时，魔术师提醒你把想法转化为具体行动。它不是单纯的幻想之牌，而是“让事情发生”的牌。你可以通过清晰的目标、专注的意志和实际操作，把原本停留在脑中的可能性变成现实。`,
    reading_reversed: `魔术师逆位代表资源误用、行动力不足、操控、欺骗，或有想法却无法真正落地。你可能拥有某些条件，却没有正确使用；也可能过度依赖技巧和话术，而忽略了真实能力与实际行动。

在牌阵中出现时，它提醒你检查自己是否正在逃避执行，或是否被某种表面的自信迷惑。魔术师逆位也可能表示信息不对称、承诺过度、动机不纯。此时需要看清事实，不要只听漂亮的表达，也不要用空想代替真正的推进。`,
    detail: `魔术师是大阿尔卡那的第 1 张牌。与愚人的纯真出发不同，魔术师已经站到了行动的起点。他面前摆放着权杖、圣杯、宝剑与星币，象征火、水、风、土四种元素，也象征人可以调动的意志、情感、思想与现实资源。

这张牌象征创造、实践、意志与显化。魔术师不是等待命运降临的人，而是把资源聚集起来、让事情真正发生的人。他一只手指向天空，一只手指向大地，像是在连接灵感与现实：上方的想法、愿望和可能性，必须通过具体行动落到地面，才会成为可以触摸的结果。

当魔术师正位出现时，它通常意味着你已经拥有开始所需的条件。也许你还有不确定感，但并不代表你毫无准备。你手中可能已经有知识、经验、人脉、工具或机会，只是它们还没有被整理成一个清晰的方向。魔术师提醒你，与其继续等待完美时机，不如开始动手，把分散的资源转化为真正的成果。

这张牌也强调专注。魔术师的力量不是漫无目的地尝试，而是把注意力集中在一个明确的目标上。它鼓励你主动表达、主动争取、主动设计自己的路径。此时，你的语言、计划和行动都会带来影响力，所以更需要清楚自己想创造什么。

当魔术师逆位出现时，它提醒你留意资源被浪费、能力被误用，或行动与表达之间的落差。你可能说得很多，却没有真正推进；也可能拥有条件，却因为犹豫、分心或缺乏计划而无法发挥。它也可能指向操控、欺骗、话术包装，提醒你不要被表面的自信和漂亮承诺迷惑。

魔术师的核心信息是：可能性已经出现，但它不会自动变成现实。你需要伸出手，整理工具，确认目标，然后让自己的意志真正进入世界。`,
    translations: {
      en: {
        name: 'The Magician',
        keywords: ['Creation', 'Action', 'Will', 'Manifestation', 'Resources', 'Mastery', 'Practice'],
        daily_upright:
          'Today is ideal for turning ideas into action. You already hold useful tools and resources; what matters is using them deliberately instead of waiting for perfect timing.',
        daily_reversed:
          'Today asks you to watch for fantasy, procrastination, or talking much more than you do. Also be careful of polished words that hide real motives.',
        reading_upright: `The Magician upright represents creativity, action, willpower, and manifestation. It shows that you are not empty-handed. What you need is already close by; it now has to be gathered and used.

In a spread, The Magician asks you to turn thought into action. It is a card of making things happen.`,
        reading_reversed: `The Magician reversed represents misused resources, lack of execution, manipulation, deception, or ideas that never truly land. You may possess the right conditions but fail to use them well.

In a spread, it asks you to look at facts rather than performance and to stop replacing real progress with clever appearance.`,
        detail: `The Magician is card 1 of the Major Arcana. Unlike The Fool, who begins with innocence, The Magician stands at the threshold of action. Before him are the wand, cup, sword, and pentacle, symbols of the elements and also of human will, emotion, thought, and material means.

This card is about creation, practice, will, and manifestation. The Magician does not wait for fate to descend; he gathers resources and brings possibility into form. One hand points upward and one downward, linking inspiration and reality. Ideas become tangible only when they are enacted.

Upright, The Magician suggests that the needed conditions already exist: knowledge, experience, contacts, tools, or opportunity. The work now is focus. Reversed, it warns of wasted ability, empty promises, manipulation, and the gap between expression and true action.

The core message is clear: possibility exists, but it will not become reality on its own.`,
      },
      it: {
        name: 'Il Mago',
        keywords: ['Creazione', 'Azione', 'Volonta', 'Manifestazione', 'Risorse', 'Padronanza', 'Pratica'],
        daily_upright:
          'Oggi e il momento giusto per trasformare le idee in azione. Hai gia strumenti e risorse utili: la chiave e usarli con intenzione invece di aspettare il momento perfetto.',
        daily_reversed:
          'Oggi fai attenzione a fantasia vuota, procrastinazione o molte parole senza fatti. Osserva anche chi usa un discorso brillante per nascondere le vere intenzioni.',
        reading_upright: `Il Mago diritto rappresenta creativita, azione, volonta e manifestazione. Mostra che non sei senza strumenti. Cio di cui hai bisogno e gia vicino a te e ora deve essere raccolto e usato.

In una stesa, Il Mago ti chiede di trasformare il pensiero in azione concreta. E la carta del far accadere le cose.`,
        reading_reversed: `Il Mago rovesciato rappresenta risorse usate male, mancanza di esecuzione, manipolazione, inganno o idee che non riescono davvero a incarnarsi. Potresti avere le condizioni giuste ma non usarle bene.

In una stesa, ti invita a guardare i fatti invece della sola immagine e a non sostituire il vero avanzamento con la sola apparenza.`,
        detail: `Il Mago e la carta numero 1 degli Arcani Maggiori. Diversamente dal Matto, che parte con innocenza, il Mago e gia sulla soglia dell'azione. Davanti a lui ci sono bastone, coppa, spada e denaro, simboli degli elementi e anche della volonta, dell'emozione, del pensiero e dei mezzi materiali.

Questa carta parla di creazione, pratica, volonta e manifestazione. Il Mago non aspetta che il destino scenda dal cielo; raccoglie le risorse e trasforma la possibilita in forma concreta. Una mano indica il cielo e l'altra la terra, collegando ispirazione e realta. Le idee diventano tangibili solo quando vengono agite.

Diritto, il Mago suggerisce che le condizioni necessarie esistono gia: conoscenza, esperienza, contatti, strumenti o opportunita. Il lavoro ora e la concentrazione. Rovesciato, avverte di talento sprecato, promesse vuote, manipolazione e distanza tra espressione e vera azione.

Il messaggio e chiaro: la possibilita esiste, ma da sola non diventera realta.`,
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
    reading_upright: `女祭司正位代表直觉、潜意识、秘密与内在智慧。它说明事情的真相可能还没有完全显现，表面信息并不足以解释全部状况。此时，比起立刻行动，更重要的是观察、感受和等待。

在牌阵中出现时，女祭司提醒你相信自己的内在感知。你可能已经察觉到某些细微的变化，只是还没有找到明确证据。它不鼓励冲动追问或强行推进，而是提示你保持安静，留意梦境、预感、沉默中的信号，以及那些没有被说出口的部分。`,
    reading_reversed: `女祭司逆位代表直觉受阻、秘密暴露、信息不透明，或过度沉溺在自己的猜测中。你可能感觉哪里不对，却分不清这是清醒的直觉，还是不安带来的投射。

在牌阵中出现时，它提醒你不要完全依赖模糊的感觉。此时需要重新整理信息，确认事实，避免被隐瞒、误解或自我欺骗牵着走。女祭司逆位也可能表示，有些被压抑的声音正在浮出水面，你需要诚实面对自己真正知道、真正感受到的东西。`,
    detail: `女祭司是大阿尔卡那的第 2 张牌。她坐在黑白两根柱子之间，像守在可见世界与隐秘世界交界处的看门人。她不急着给出答案，也不主动走向外界，而是安静地坐在那里，守护着尚未被揭开的真相。

这张牌象征直觉、潜意识、秘密、沉默与内在智慧。和愚人的天真出发不同，女祭司的力量来自静止。她提醒你，有些答案不能靠追赶得到，只能在足够安静的时候浮现。你需要听见那些微弱的信号：一种说不上来的预感，一个反复出现的梦，一段关系里没有被说出口的话，或一个事件背后隐藏的动机。

当女祭司正位出现时，它通常意味着事情还没有到完全揭晓的时候。你也许已经感觉到真相的一部分，但仍需要耐心等待更多线索。此时不适合鲁莽行动，也不适合被外界的声音推着走。女祭司邀请你回到自己的内在，辨认什么是真正的直觉，什么只是短暂的情绪。

当女祭司逆位出现时，它提醒你留意混乱的信息与被压抑的真相。你可能正在忽略自己的直觉，也可能过度相信直觉而脱离现实。它也可能表示某个秘密正在浮出水面，或你正在被不完整的信息影响判断。此时，与其在猜测里打转，不如停下来确认事实，看清自己究竟知道什么，又害怕知道什么。

女祭司的核心信息是：不是所有答案都适合立刻追问。沉默并不代表空白，有时它是一扇门。你需要做的，是在门前安静下来，等自己听见真正的声音。`,
    translations: {
      en: {
        name: 'The High Priestess',
        keywords: ['Intuition', 'Secrets', 'Subconscious', 'Silence', 'Insight', 'Waiting', 'Inner Wisdom'],
        daily_upright:
          'Today is good for slowing down and listening to intuition. The answer may already be inside you rather than out in the noise around you.',
        daily_reversed:
          'Today asks you to be careful of judgment clouded by emotion, speculation, or hidden information. Check whether you are seeing fact or projection.',
        reading_upright: `The High Priestess upright represents intuition, the subconscious, secrets, and inner wisdom. Surface information is not enough; waiting and listening matter more than forcing action.

In a spread, she asks you to trust subtle perception and to notice what has not yet been spoken.`,
        reading_reversed: `The High Priestess reversed represents blocked intuition, exposed secrets, unclear information, or being lost in your own speculation.

In a spread, she asks you to sort fact from feeling and to face what you already sense but may not want to name.`,
        detail: `The High Priestess is card 2 of the Major Arcana. She sits between black and white pillars, guarding the threshold between what is visible and what remains hidden.

This card is about intuition, the subconscious, silence, mystery, and inner wisdom. Unlike The Fool, whose power lies in innocent movement, The High Priestess draws power from stillness. Some answers cannot be chased; they emerge only when life becomes quiet enough to hear them.

Upright, she suggests that truth has not yet fully revealed itself. More clues are needed, and this is not the moment for reckless movement. Reversed, she warns of confusion, repression, and incomplete information.

Her core message is that silence is not emptiness. Sometimes it is the doorway through which truth arrives.`,
      },
      it: {
        name: 'La Papessa',
        keywords: ['Intuizione', 'Segreti', 'Subconscio', 'Silenzio', 'Insight', 'Attesa', 'Saggezza interiore'],
        daily_upright:
          'Oggi e utile rallentare e ascoltare la tua intuizione. La risposta potrebbe essere gia dentro di te, piu che nelle voci esterne.',
        daily_reversed:
          'Oggi fai attenzione a giudizi influenzati da emozione, supposizione o informazioni nascoste. Verifica se stai vedendo fatti o proiezioni.',
        reading_upright: `La Papessa diritta rappresenta intuizione, subconscio, segreti e saggezza interiore. Le informazioni di superficie non bastano; contano di piu attesa, ascolto e osservazione.

In una stesa, ti invita a fidarti delle percezioni sottili e di cio che non e stato ancora detto.`,
        reading_reversed: `La Papessa rovesciata rappresenta intuizione bloccata, segreti che emergono, informazioni confuse o perdita dentro le proprie supposizioni.

In una stesa, chiede di distinguere il fatto dall'emozione e di guardare con onesta cio che gia senti ma forse non vuoi nominare.`,
        detail: `La Papessa e la carta numero 2 degli Arcani Maggiori. Siede tra due colonne, nera e bianca, custodendo la soglia tra il visibile e il nascosto.

Questa carta parla di intuizione, subconscio, silenzio, mistero e saggezza interiore. Diversamente dal Matto, che si muove con innocenza, la Papessa trae la sua forza dalla quiete. Alcune risposte non si inseguono; emergono solo quando la vita si fa abbastanza silenziosa da lasciarle parlare.

Diritta, suggerisce che la verita non si e ancora mostrata del tutto. Servono altri indizi e non e il momento di forzare il movimento. Rovesciata, avverte di confusione, repressione e informazioni incomplete.

Il suo messaggio centrale e che il silenzio non e vuoto: a volte e la porta da cui arriva la verita.`,
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
    reading_upright: `女皇正位代表丰盛、滋养、创造力与物质层面的成长。它说明某件事正在进入孕育和成熟的阶段，可能与关系、创作、金钱、生活品质、身体状态，或一种更柔软、更稳定的安全感有关。

在牌阵中出现时，女皇提醒你接纳自己的感受与欲望。它不是冰冷的理性判断，而是生命力本身：你可以通过照顾身体、改善环境、表达美感、经营关系，来让事情慢慢变得丰厚。女皇也常常代表强烈的吸引力与女性魅力，提示你正在拥有创造、吸引与滋养现实的能力。`,
    reading_reversed: `女皇逆位代表匮乏感、过度依赖、创造力受阻，或对身体、外貌、物质和关系的焦虑。你可能很想得到爱与安全感，却因为过度付出、过度索取，或无法真正照顾自己，而让内在变得疲惫。

在牌阵中出现时，女皇逆位提醒你重新看待“丰盛”这件事。真正的丰盛不是强行维持漂亮的外壳，也不是用物质或关系填补空洞。此时需要检查自己是否忽略了身体的需求，是否在压抑创造力，或是否把自己的价值过度寄托在他人的认可之上。`,
    detail: `女皇是大阿尔卡那的第 3 张牌，也是一张充满金星气息的牌。她象征美、爱、感官、丰盛与创造力。她的力量不来自控制和命令，而来自一种自然流动的生命力：花会盛开，果实会成熟，身体会感知快乐，爱与美也会在被滋养的地方生长出来。

牌面中的女皇通常坐在柔软而丰饶的自然之中，周围有麦穗、森林、河流与象征金星的符号。这些意象都指向物质世界的丰腴：食物、身体、土地、财富、艺术、爱情，以及一切可以被触碰、被感受、被享受的东西。她提醒人不要只活在头脑里，也要回到身体，回到生活，回到真实的触感和温度。

当女皇正位出现时，它通常意味着某件事正在被孕育、照料，并逐渐走向成熟。它可能代表一段关系变得更亲密，一个创作计划开始生长，生活质量有所提升，或你正在重新找回对美和快乐的感知。女皇不是急促推进的牌，她更像一片肥沃的土地：只要你愿意持续浇灌，事物就会慢慢长出形状。

这张牌也代表极强的女性气质，但这种女性气质并不只是外貌上的漂亮，而是一种更完整的生命状态：柔软、丰盛、有吸引力，懂得享受，也懂得创造。她知道美不是装饰，而是一种力量；身体不是负担，而是感知世界的入口；物质不是低俗，而是生命安稳落地之后开出的花。

当女皇逆位出现时，它提醒你留意丰盛背后的失衡。你可能正在过度照顾别人，却忘记滋养自己；也可能陷入对外貌、金钱、关系或舒适生活的焦虑之中。女皇逆位有时也代表创造力被堵住，想表达却无法表达，想生长却缺少适合的土壤。

它也可能提示一种“看似丰盛，实则空虚”的状态：表面拥有很多，内在却并不满足；看起来很美，却没有真正感到快乐。此时需要回到最基本的问题：你的身体需要什么？你的心真正想亲近什么？你是在滋养自己，还是只是在维持一个好看的外壳？

女皇的核心信息是：美、爱与丰盛都需要被认真滋养。你可以允许自己拥有欲望，靠近快乐，创造生活的质感；但也要记得，真正的丰盛不是堆满东西，而是让生命在你这里安心地生长。`,
    translations: {
      en: {
        name: 'The Empress',
        keywords: ['Abundance', 'Beauty', 'Nourishment', 'Creativity', 'Sensuality', 'Mothering', 'Nature', 'Enjoyment'],
        daily_upright:
          'Today is good for treating your body and feelings kindly. Move toward beauty, food, nature, and real pleasure; you are allowed to let life become richer.',
        daily_reversed:
          'Today asks you to watch for over-giving, draining yourself, indulgence, or anxiety around appearance and material security.',
        reading_upright: `The Empress upright represents abundance, nourishment, creativity, and material growth. Something is being nurtured toward maturity.

In a spread, she asks you to honor desire, care for the body, and let life become fuller through beauty, relationship, and steady tending.`,
        reading_reversed: `The Empress reversed represents scarcity, overdependence, blocked creativity, or anxiety about body, appearance, money, or relationship.

In a spread, she asks you to examine whether you are feeding yourself or only maintaining an attractive shell.`,
        detail: `The Empress is card 3 of the Major Arcana and carries the atmosphere of Venus. She symbolizes beauty, love, the senses, abundance, and creativity. Her strength does not come from command, but from natural life force: flowers open, fruit ripens, the body feels pleasure, and beauty grows where there is nourishment.

She asks you not to live only in thought. Return to the body, to ordinary life, to touch, warmth, and what can truly be felt. Upright, she often shows something being cultivated toward fullness: a relationship, a work of creation, a safer life, or your capacity to receive joy. Reversed, she warns of imbalance beneath abundance: overgiving, emptiness hidden beneath beauty, or a life that looks full yet does not feel alive.

Her core message is that beauty, love, and abundance all need tending. Real fullness is not accumulation for its own sake, but allowing life to grow safely and richly within you.`,
      },
      it: {
        name: "L'Imperatrice",
        keywords: ['Abbondanza', 'Bellezza', 'Nutrimento', 'Creativita', 'Sensualita', 'Maternita', 'Natura', 'Piacere'],
        daily_upright:
          'Oggi e il momento giusto per trattare con gentilezza il tuo corpo e le tue sensazioni. Avvicinati alla bellezza, al cibo, alla natura e alla gioia reale.',
        daily_reversed:
          'Oggi fai attenzione a consumarti troppo per gli altri, a indulgere eccessivamente o a vivere ansia per aspetto, materia e sicurezza.',
        reading_upright: `L'Imperatrice diritta rappresenta abbondanza, nutrimento, creativita e crescita sul piano materiale. Qualcosa sta maturando e venendo curato.

In una stesa, ti invita ad accogliere desiderio e sensibilita e a rendere la vita piu piena attraverso bellezza, corpo, relazioni e cura costante.`,
        reading_reversed: `L'Imperatrice rovesciata rappresenta scarsita, dipendenza eccessiva, creativita bloccata o ansia rispetto al corpo, al denaro o ai legami.

In una stesa, ti chiede di chiederti se stai nutrendo davvero te stessa o te stesso, oppure se stai solo mantenendo un guscio bello da vedere.`,
        detail: `L'Imperatrice e la carta numero 3 degli Arcani Maggiori e porta con se l'atmosfera di Venere. Simboleggia bellezza, amore, sensi, abbondanza e creativita. La sua forza non nasce dal controllo ma da una vitalita naturale: i fiori sbocciano, i frutti maturano, il corpo prova piacere e la bellezza cresce dove c'e nutrimento.

Questa carta chiede di non vivere soltanto nella mente. Invita a tornare al corpo, alla vita concreta, al contatto e al calore. Diritta, mostra spesso qualcosa che viene coltivato verso la pienezza: una relazione, una creazione, una vita piu stabile o la capacita di tornare a sentire gioia. Rovesciata, avverte che sotto l'apparente abbondanza puo nascondersi uno squilibrio: dare troppo, sentirsi vuoti sotto la bellezza o vivere una pienezza solo apparente.

Il suo messaggio centrale e che bellezza, amore e abbondanza hanno bisogno di cura. La vera ricchezza non e accumulare cose, ma lasciare che la vita cresca in te in modo pieno e sicuro.`,
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
    reading_upright: `皇帝正位代表权威、秩序、责任与稳固的地位。它说明事情需要清晰的规则、明确的边界和现实层面的掌控力。此时，情绪和想象并不是最重要的，真正重要的是结构、计划、执行和承担。

在牌阵中出现时，皇帝提醒你拿回对局面的主导权。你需要更坚定地设定原则，整理资源，做出决定，并对结果负责。它也可能象征一位成熟、强势、有资源或有社会地位的男性人物，他可能以导师、领导、父亲、上司或男性贵人的形式出现，为你提供保护、建议或现实帮助。`,
    reading_reversed: `皇帝逆位代表控制失衡、专制、僵化、压迫，或权威位置的不稳定。你可能正在面对一个过于强硬的人，或某种不讲情理、只强调服从的规则。它也可能表示你自己太想掌控一切，反而让事情变得紧绷。

在牌阵中出现时，皇帝逆位提醒你检查权力关系是否失衡。真正的稳定不是靠压制维持，真正的权威也不是靠恐惧建立。此时需要分辨：你是在建立秩序，还是在制造控制？你是在承担责任，还是在用强硬掩盖内在的不安？`,
    detail: `皇帝是大阿尔卡那的第 4 张牌，象征权威、秩序、结构与现实世界中的稳固地位。如果女皇代表丰饶的土地，那么皇帝就是土地上的城墙、法律与王座。他的力量不柔软，却稳定；不一定温情，却能够支撑局面不轻易崩塌。

牌面中的皇帝通常坐在坚硬的王座上，神情严肃，手中握着象征权力的权杖。他不像女皇那样通过滋养让万物生长，而是通过规则、边界和决断来建立秩序。皇帝关心的不是“我感受到什么”，而是“这件事如何被管理、被执行、被维持”。他代表现实层面的掌控力，也代表一个人对自己欲望、情绪和行动的约束能力。

当皇帝正位出现时，它通常意味着你需要更强的自我控制和现实判断。也许事情已经不能再靠感觉推动，而需要计划、制度、责任和明确的决定。皇帝提醒你站稳自己的位置，不要轻易被外界扰乱。你需要知道自己的边界在哪里，资源在哪里，目标在哪里，以及什么事情必须由你来承担。

这张牌也常常象征稳固的社会地位、权力结构，或一位具有现实影响力的男性人物。他可能是父亲、上司、导师、前辈，也可能是某种成熟的男性贵人。他不一定用柔和的方式帮助你，但他带来的往往是资源、规则、经验、庇护或现实层面的支持。皇帝的帮助不是情绪安慰，而是让事情落地、让局面稳定。

不过，皇帝的阴影面也很明显。当他的秩序过度膨胀，就会变成专制；当他的控制力失去弹性，就会变成压迫。他可能代表一个只允许服从、不允许质疑的权威，也可能代表你自己内在过度强硬的一面：害怕失控，于是把所有东西都抓得太紧；害怕脆弱，于是用冷静和命令遮住不安。

当皇帝逆位出现时，它提醒你留意权力关系中的失衡。你可能正在被某种规则、长辈、领导或男性权威压制，也可能正在用强硬的态度对待自己和他人。它也可能表示位置不稳、缺乏担当、逃避责任，或表面上想掌控一切，实际上内在秩序已经松动。

皇帝的核心信息是：真正的力量不是把一切压在脚下，而是有能力建立秩序，并承担秩序带来的责任。你需要稳住自己的王座，也要记得，权威若没有清醒和边界，就会变成牢笼。`,
    translations: {
      en: {
        name: 'The Emperor',
        keywords: ['Authority', 'Order', 'Control', 'Stability', 'Position', 'Rules', 'Responsibility', 'Male Support'],
        daily_upright:
          'Today is good for setting order, defining boundaries, and taking firm control. Support may also come from an experienced or well-positioned man.',
        daily_reversed:
          'Today asks you to watch for excessive control, rigid thinking, or pressure from authority. Principles should not turn into domination.',
        reading_upright: `The Emperor upright represents authority, structure, responsibility, and stable position. The situation requires rules, boundaries, planning, and accountability more than mood or fantasy.

In a spread, he asks you to reclaim leadership, make clear decisions, and take responsibility for outcomes. He can also represent a powerful or experienced male figure who offers practical support.`,
        reading_reversed: `The Emperor reversed represents imbalance in control, rigidity, oppression, or unstable authority. You may be dealing with someone too forceful, or you may be gripping the situation so tightly that everything hardens.

In a spread, he asks whether you are building order or merely enforcing control.`,
        detail: `The Emperor is card 4 of the Major Arcana. If The Empress is fertile land, The Emperor is the wall, the law, and the throne built upon it. His power is less soft, but it is stable. He is concerned with structure, management, execution, and responsibility.

Upright, he asks for stronger self-command and clearer practical judgment. This is a time for plans, systems, and defined boundaries. He often represents position, social power, or a mature male figure whose influence stabilizes a situation.

His shadow appears when order swells into domination and authority loses flexibility. Reversed, he can point to pressure, rigidity, weak responsibility, or the need to question whether control has become fear in disguise.

His core message is that real strength is not crushing everything beneath you, but creating order and carrying the responsibility that order requires.`,
      },
      it: {
        name: "L'Imperatore",
        keywords: ['Autorita', 'Ordine', 'Controllo', 'Stabilita', 'Posizione', 'Regole', 'Responsabilita', 'Aiuto maschile'],
        daily_upright:
          'Oggi e il momento giusto per creare ordine, definire confini e prendere il controllo con stabilita. Potresti anche ricevere sostegno da un uomo esperto o autorevole.',
        daily_reversed:
          'Oggi fai attenzione a eccesso di controllo, rigidita o pressione da parte dell’autorita. I principi non dovrebbero diventare oppressione.',
        reading_upright: `L'Imperatore diritto rappresenta autorita, struttura, responsabilita e posizione stabile. La situazione richiede regole, confini, pianificazione e assunzione di responsabilita piu che emozione o immaginazione.

In una stesa, ti chiede di riprendere la guida, decidere con chiarezza e sostenere le conseguenze. Puo anche indicare una figura maschile matura o influente che offre aiuto concreto.`,
        reading_reversed: `L'Imperatore rovesciato rappresenta controllo sbilanciato, rigidita, oppressione o autorita instabile. Potresti avere davanti qualcuno di troppo duro, oppure potresti stringere la situazione cosi forte da renderla ancora piu tesa.

In una stesa, ti chiede se stai costruendo ordine o solo imponendo controllo.`,
        detail: `L'Imperatore e la carta numero 4 degli Arcani Maggiori. Se l'Imperatrice e la terra fertile, l'Imperatore e il muro, la legge e il trono costruiti sopra di essa. La sua forza e meno morbida, ma e stabile. Parla di struttura, gestione, esecuzione e responsabilita.

Diritto, chiede maggiore padronanza di te stessa o di te stesso e giudizio pratico piu chiaro. E un tempo di piani, sistemi e confini ben definiti. Spesso rappresenta posizione sociale, potere o una figura maschile matura che stabilizza il quadro.

La sua ombra appare quando l'ordine diventa dominio e l'autorita perde elasticita. Rovesciato, puo indicare pressione, rigidita, fuga dalla responsabilita o il bisogno di chiedersi se il controllo non stia nascondendo paura.

Il suo messaggio centrale e che la vera forza non consiste nel schiacciare tutto, ma nel creare ordine e assumersi la responsabilita che quell'ordine richiede.`,
      },
    },
  }),
  createMeaningCard({
    id: 'the-hierophant',
    number: 5,
    name_cn: '教皇',
    name_en: 'The Hierophant',
    keywords: ['传统', '教导', '信仰', '规则', '制度', '导师', '传承', '精神秩序', '叛逆', '内心声音'],
    daily_upright: '今天适合向有经验的人请教，或按照成熟的方法处理问题。规则未必是束缚，也可能是帮你稳住局面的扶手。',
    daily_reversed:
      '今天可能会想挣脱某种规则、期待或传统框架。听听自己内心真正的声音，但也要分清：你是在清醒地选择自己的路，还是只是为了反抗而反抗。',
    reading_upright: `教皇正位代表传统、信仰、制度、学习与精神层面的指引。它说明当前的问题可能需要回到规则、经验、伦理或某种成熟体系之中，而不是完全凭个人冲动行动。

在牌阵中出现时，教皇提醒你寻找可靠的指导。它可能象征老师、前辈、导师、专业人士，也可能代表学校、机构、婚姻、资格认证、宗教信仰或社会认可的关系结构。此时，遵循某种稳定的规则，反而能帮助你获得安全感与方向感。`,
    reading_reversed: `教皇逆位代表对传统的质疑、叛逆、脱离旧框架，或开始遵从自己内心的声音。你可能不再愿意接受“大家都这么做”的答案，也不想继续被某种身份、关系、制度或道德标准定义。

在牌阵中出现时，教皇逆位提醒你重新判断：眼前的规则是真的在保护你，还是只是在规训你？某个权威是真的有智慧，还是只是披着正确外衣的控制？它也可能表示你正在从传统体系中松动出来，寻找更适合自己的信念与道路。此时不必盲目服从，但也要避免为了反抗而反抗。真正的自由不是否定一切规则，而是知道哪些规则值得留下，哪些规则已经不再属于你。`,
    detail: `教皇是大阿尔卡那的第 5 张牌。他坐在神圣而庄严的位置上，像一位连接人间与精神秩序的传递者。和皇帝的现实权力不同，教皇掌握的不是土地、军队或王座，而是信仰、知识、传统和被社会认可的规则。

这张牌象征教导、传承、制度、伦理与精神秩序。它代表那些已经被长久验证的方法：老师的教诲、家族的传统、学校的体系、宗教的信念、社会承认的关系与契约。教皇并不鼓励你独自摸索一切，他更像在说：有些路，前人已经走过；有些问题，可以从经验和传统中找到答案。

当教皇正位出现时，它通常意味着你需要学习、请教，或进入某种更稳定的结构之中。你可能需要一位导师、一个可靠的系统、一套清晰的方法，或者一种能够让你安心的精神支柱。此时，规则不一定是束缚，它也可以是一种保护。它让混乱的事物有了边界，让迷茫的人知道下一步该怎么走。

教皇也常常与正式关系和社会认可有关。比如婚姻、契约、入学、考试、资格认证、组织归属，或一段关系进入更传统、更明确的位置。它强调的不是一时的激情，而是被承认、被命名、被放进秩序之中的稳定状态。

但教皇也有阴影面。当传统变得僵硬，教导就可能变成说教；当规则被神圣化，个人的声音就可能被压下去。教皇逆位时，它提醒你留意虚伪的权威、空洞的道德、过时的观念，或一种只要求服从、不允许思考的体系。你可能正在被“正确答案”困住，却忘了真正的智慧应该让人更清醒，而不是更麻木。

同时，教皇逆位也不一定是负面的。它可以代表叛逆、出走、质疑传统，以及从既定框架中醒来。你可能开始意识到，某些被传授的观念并不适合你，某些被社会认可的道路也不是你真正想走的路。此时，遵从内心的声音会变得很重要：你需要重新建立自己的信念，而不是只继承别人的答案。

当教皇逆位出现时，它也可能代表你正在脱离旧有框架，开始寻找属于自己的道路。这个过程未必轻松，因为质疑传统常常意味着失去某种安全感，也可能被他人视为“不合群”或“不听话”。但它提醒你：不是所有被传下来的东西都必须继承，不是所有权威都值得相信。真正的信念，需要经过自己的选择。

教皇的核心信息是：真正的传统应该传递智慧，而不是制造牢笼。你可以向前人学习，也可以重新审视规则；重要的是分辨，什么在引导你，什么在驯服你。最终，你需要找到的不只是外界认可的答案，而是自己真正愿意相信并承担的道路。`,
    translations: {
      en: {
        name: 'The Hierophant',
        keywords: ['Tradition', 'Teaching', 'Faith', 'Rules', 'Institutions', 'Mentor', 'Inheritance', 'Spiritual Order', 'Rebellion', 'Inner Voice'],
        daily_upright:
          'Today is good for learning from someone experienced or using a mature method. Rules are not always chains; sometimes they help steady the situation.',
        daily_reversed:
          'Today you may want to break away from a rule, expectation, or traditional frame. Listen to your inner voice, but make sure you are choosing clearly rather than rebelling for its own sake.',
        reading_upright: `The Hierophant upright represents tradition, faith, institutions, learning, and spiritual guidance. The situation may need rules, experience, ethics, or a mature framework rather than pure impulse.

In a spread, The Hierophant asks you to seek reliable guidance. It may point to a teacher, mentor, expert, school, institution, marriage, certification, religious belief, or a socially recognized structure.`,
        reading_reversed: `The Hierophant reversed represents questioning tradition, rebellion, leaving an old framework, or beginning to follow your own inner voice. You may no longer accept the answer that 'this is just how it is done.'

In a spread, it asks whether a rule is protecting you or merely disciplining you, and whether an authority is wise or only dressed in correctness. Real freedom is not rejecting every rule, but knowing which ones still belong to you.`,
        detail: `The Hierophant is card 5 of the Major Arcana. He sits in a sacred and formal position like a transmitter between human life and spiritual order. Unlike the Emperor's worldly authority, the Hierophant governs faith, knowledge, tradition, and socially recognized rules.

This card symbolizes teaching, inheritance, institutions, ethics, and spiritual order. It points to methods that have been tested over time: a teacher's guidance, family tradition, school systems, religious beliefs, and socially sanctioned contracts and relationships. The Hierophant does not urge you to figure everything out alone. He reminds you that some paths have already been walked and that some answers can be found through tradition and lived wisdom.

Upright, he often suggests that you need learning, consultation, or entry into a more stable structure. Rules can become a form of protection; they place boundaries around chaos and help the lost know where to step next.

He also often relates to formal relationships and social recognition: marriage, contracts, education, exams, certifications, membership, or a bond moving into a clearer, more established form.

Yet the Hierophant has a shadow. When tradition hardens, teaching can become preaching. When rules are treated as sacred, the individual voice can be pressed down. Reversed, he warns of false authority, hollow morality, outdated ideas, or systems that demand obedience without thought. You may be trapped by a 'right answer' that leaves you numb rather than wise.

But the reversed Hierophant is not only negative. He can represent rebellion, departure, questioning tradition, and awakening from inherited frameworks. You may realize that some inherited beliefs do not fit you and that some socially approved roads are not truly yours. Then following your own inner voice becomes essential.

His core message is this: true tradition should pass on wisdom, not build a cage. You may learn from what came before, but you must still discern what guides you and what merely trains you into obedience.`,
      },
      it: {
        name: 'Il Papa',
        keywords: ['Tradizione', 'Insegnamento', 'Fede', 'Regole', 'Istituzioni', 'Mentore', 'Eredita', 'Ordine spirituale', 'Ribellione', 'Voce interiore'],
        daily_upright:
          'Oggi e un buon giorno per chiedere consiglio a qualcuno di esperto o seguire un metodo collaudato. Le regole non sono sempre catene; a volte aiutano a reggere la situazione.',
        daily_reversed:
          'Oggi potresti voler uscire da una regola, da un’aspettativa o da una cornice tradizionale. Ascolta la tua voce interiore, ma distingui tra scelta lucida e ribellione fine a se stessa.',
        reading_upright: `Il Papa diritto rappresenta tradizione, fede, istituzioni, apprendimento e guida spirituale. Il problema attuale potrebbe aver bisogno di regole, esperienza, etica o di un sistema maturo, piu che di impulso personale.

In una stesa, Il Papa invita a cercare una guida affidabile. Puo indicare un insegnante, un mentore, un esperto, ma anche scuola, istituzione, matrimonio, certificazione, fede religiosa o una struttura socialmente riconosciuta.`,
        reading_reversed: `Il Papa rovesciato rappresenta il mettere in discussione la tradizione, la ribellione, l’uscita da vecchi schemi o l’inizio di un ascolto piu sincero della propria voce interiore. Potresti non voler piu accettare la risposta 'si e sempre fatto cosi.'

In una stesa, ti chiede se una regola ti stia proteggendo davvero o se stia solo addestrandoti all’obbedienza. La vera liberta non e negare ogni regola, ma riconoscere quali hanno ancora senso e quali non ti appartengono piu.`,
        detail: `Il Papa e la carta numero 5 degli Arcani Maggiori. Siede in una posizione sacra e solenne, come un tramite tra il mondo umano e l’ordine spirituale. Diversamente dal potere terreno dell’Imperatore, il Papa custodisce fede, conoscenza, tradizione e regole riconosciute dalla societa.

Questa carta simboleggia insegnamento, trasmissione, istituzioni, etica e ordine spirituale. Indica metodi verificati nel tempo: l’insegnamento dei maestri, le tradizioni di famiglia, i sistemi scolastici, la fede religiosa e le relazioni o i patti socialmente riconosciuti. Il Papa non invita a capire tutto da soli. Ricorda che alcune strade sono gia state percorse e che alcune risposte possono venire dall’esperienza e dalla tradizione.

Diritto, suggerisce spesso il bisogno di imparare, chiedere consiglio o entrare in una struttura piu stabile. Le regole possono essere una protezione; danno forma al caos e orientano chi e smarrito.

Questa carta parla spesso anche di legami formali e riconoscimento sociale: matrimonio, contratti, studio, esami, certificazioni, appartenenza o relazioni che assumono una forma piu chiara.

Ma il Papa ha anche un’ombra. Quando la tradizione si irrigidisce, l’insegnamento puo diventare moralismo. Quando le regole vengono sacralizzate, la voce individuale puo essere soffocata. Rovesciato, avverte di autorita false, moralita vuote, idee superate o sistemi che chiedono obbedienza senza pensiero. Potresti essere intrappolata o intrappolato in una 'risposta giusta' che non illumina ma addormenta.

Allo stesso tempo, il Papa rovesciato non e soltanto negativo. Può rappresentare ribellione, uscita, critica della tradizione e risveglio da cornici ereditate. Potresti accorgerti che alcune convinzioni ricevute non ti appartengono e che alcune strade approvate socialmente non sono le tue. In quel caso, seguire la tua voce interiore diventa essenziale.

Il suo messaggio centrale e questo: la vera tradizione dovrebbe trasmettere saggezza, non costruire una gabbia. Puoi imparare da chi ti ha preceduta o preceduto, ma devi comunque distinguere cio che ti guida da cio che ti addestra soltanto all’obbedienza.`,
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
    reading_upright: `恋人正位代表爱情、吸引、亲密关系与良好的沟通。它说明人与人之间可能出现强烈的连接感，不只是情绪上的喜欢，也包括彼此理解、互相回应，以及价值观上的靠近。

在牌阵中出现时，恋人也常常代表一个重要选择。这个选择未必只发生在爱情里，也可能发生在人生道路、合作关系、身份认同或内心欲望之间。它提醒你，不要只看表面的甜蜜，而要看这段关系或这个选择是否让你更接近真实的自己。真正好的关系，不会让人变小，而会让人更清醒、更完整。`,
    reading_reversed: `恋人逆位代表沟通不畅、关系失衡、价值观冲突，或在选择面前逃避自己的真实心意。你可能正在一段关系里感到拉扯：一方面渴望连接，另一方面又隐约感到不自由、不对等，或无法真正表达自己。

在牌阵中出现时，恋人逆位提醒你重新审视关系里的选择权。你是否正在为了被爱而妥协太多？是否明明可以离开，却因为害怕孤独、内疚或习惯而停留？它也可能象征一种觉醒：你开始意识到，爱不应该成为束缚，亲密也不应该要求你放弃自己的声音。`,
    detail: `恋人是大阿尔卡那的第 6 张牌。它最常被理解为爱情之牌，但它的含义并不止于恋爱。恋人真正关心的是关系中的连接、沟通、选择与自由意志。它问的不是“有没有人爱我”，而是“我在这段关系里是否仍然是我自己”。

牌面中的男女站在天使之下，像是处于一种被祝福、被照见的关系之中。他们之间有吸引，也有坦诚；有亲密，也有尚未被完全遮蔽的真实。恋人的美不只是浪漫，而是一种人与人之间可以互相看见、互相回应的状态。它代表良好的沟通，代表愿意把心打开，也代表关系中最珍贵的部分：我靠近你，但我没有失去自己。

当恋人正位出现时，它通常意味着某种重要的连接正在形成。可能是一段爱情，一次真诚的对话，一个值得信任的合作对象，或一个与你价值观相合的选择。它提示你，真正有生命力的关系不只依靠激情，也依靠理解、尊重和沟通。两个人能不能说真话，能不能听见彼此，能不能在差异中仍然选择靠近，才是恋人牌更深的重点。

这张牌也常常指向选择。你可能正站在两个方向之间：一个方向更安全、更符合外界期待，另一个方向更接近你的心。恋人提醒你，选择本身会塑造你。你选择谁，选择怎样的关系，选择怎样表达爱，也是在选择成为怎样的人。

从更深的层面看，恋人也可以代表一种觉醒，尤其是关系中的自我觉醒。它不只是“遇见爱情”，也可能是一个人终于意识到：自己有选择的权利，有说不的能力，也有脱离不健康关系的勇气。特别是在某些情境里，恋人牌可以象征女性从被观看、被选择的位置中醒来，重新拿回自己的声音。她可以爱，也可以离开；可以靠近，也可以拒绝；可以进入关系，也可以不再把关系当作命运的唯一答案。

当恋人逆位出现时，它提醒你留意关系中的不对等、误解、逃避和价值观冲突。表面上也许仍然亲密，但内在可能已经出现裂缝。你可能不敢说出真实想法，或为了维持关系而压抑自己。它也可能表示一个选择被拖延太久：你明明知道自己想要什么，却迟迟不愿承认。

恋人的核心信息是：沟通的和谐与极致的理解。同时，爱不是失去自己，选择也不是交出自己。真正值得靠近的关系，会让你更自由、更清醒，也更有勇气成为完整的自己。`,
    translations: {
      en: {
        name: 'The Lovers',
        keywords: ['Love', 'Attraction', 'Communication', 'Choice', 'Relationship', 'Values', 'Awakening', 'Free Will'],
        daily_upright:
          'Today is good for honest communication and moving closer to people and relationships that let you breathe. What matters most is not passing excitement but whether you can truly hear one another.',
        daily_reversed:
          'Today asks you to watch for misunderstanding, avoidance, or mismatched values in relationship. Do not ignore your real choice just to preserve connection.',
        reading_upright: `The Lovers upright represents love, attraction, intimacy, and good communication. A strong bond may be forming, rooted not only in feeling but also in understanding, mutual response, and shared values.

In a spread, The Lovers often points to an important choice. That choice may concern romance, but it can also involve life direction, partnership, identity, or desire. The question is whether the relationship or decision brings you closer to your real self.`,
        reading_reversed: `The Lovers reversed represents blocked communication, imbalance, conflict of values, or avoiding your true feelings when facing a choice. You may want connection while also feeling constrained, unheard, or unable to express yourself.

In a spread, it asks you to reconsider who holds choice inside a relationship and whether love is asking you to abandon your own voice.`,
        detail: `The Lovers is card 6 of the Major Arcana. It is often treated as the card of love, yet its meaning reaches far beyond romance. At its core, it speaks about connection, communication, choice, and free will. It asks not simply whether you are loved, but whether you remain yourself within what you love.

Its beauty is not only romance, but mutual seeing. It points to relationships in which honesty, listening, and response can exist side by side with attraction. Upright, it often marks a meaningful connection, a truthful conversation, or a path aligned with your values.

The Lovers also points toward choice. A choice may stand between safety and authenticity, expectation and desire. The card reminds you that whom and what you choose also shapes who you become.

Reversed, it warns of imbalance, misunderstanding, avoidance, and value conflict. A bond may still look close on the surface while inner truth is being silenced. At a deeper level, it can mark awakening: the realization that love should not require the loss of your own voice.

Its core message is this: real connection does not make you smaller. Love and choice are most alive when they make you freer, clearer, and more whole.`,
      },
      it: {
        name: 'Gli Amanti',
        keywords: ['Amore', 'Attrazione', 'Comunicazione', 'Scelta', 'Relazione', 'Valori', 'Risveglio', 'Libero arbitrio'],
        daily_upright:
          'Oggi e un buon giorno per comunicare con sincerita e avvicinarti a persone e relazioni che ti fanno sentire piu aperta o aperto. Conta meno l’emozione del momento e di piu la capacita di ascoltarvi davvero.',
        daily_reversed:
          'Oggi fai attenzione a incomprensioni, evitamento o disallineamento di valori nelle relazioni. Non ignorare la tua vera scelta solo per mantenere un legame.',
        reading_upright: `Gli Amanti diritti rappresentano amore, attrazione, intimita e buona comunicazione. Puo formarsi un legame forte, basato non solo sul sentimento ma anche su comprensione, risposta reciproca e vicinanza di valori.

In una stesa, Gli Amanti indicano spesso una scelta importante. Puo riguardare l’amore, ma anche direzione di vita, collaborazione, identita o desiderio. La domanda e se quel legame o quella scelta ti avvicinino al tuo vero io.`,
        reading_reversed: `Gli Amanti rovesciati rappresentano comunicazione difficile, squilibrio, conflitto di valori o fuga dai tuoi sentimenti reali di fronte a una scelta. Potresti desiderare connessione e allo stesso tempo sentirti poco libera o poco ascoltata.

In una stesa, invitano a riconsiderare chi ha davvero il potere di scegliere nella relazione e se l’amore ti stia chiedendo di rinunciare alla tua voce.`,
        detail: `Gli Amanti sono la carta numero 6 degli Arcani Maggiori. Vengono spesso letti come la carta dell’amore, ma il loro significato va oltre il romanticismo. Parlano di connessione, comunicazione, scelta e libero arbitrio. La vera domanda non e solo se qualcuno ti ami, ma se dentro quel legame resti ancora te stessa o te stesso.

La loro bellezza non e solo romantica, ma consiste nel vedersi e rispondersi davvero. Indicando relazioni in cui attrazione e sincerita possono coesistere, mostrano il valore di parlare con verita e di ascoltare davvero. Diritto, spesso segnano un legame importante, un dialogo sincero o una strada in linea con i tuoi valori.

Gli Amanti parlano anche di scelta. Potresti essere davanti a due direzioni: una piu sicura e una piu autentica. La carta ricorda che quello che scegli contribuisce a creare chi diventi.

Rovesciata, mette in guardia da squilibrio, incomprensione, evitamento e conflitto di valori. Un rapporto puo sembrare ancora vicino, ma la verita interiore potrebbe gia essere stata messa a tacere. A un livello piu profondo, puo segnare un risveglio: capire che l’amore non dovrebbe chiederti di perdere la tua voce.

Il messaggio centrale e questo: la vera connessione non ti rimpicciolisce. Amore e scelta sono vivi quando ti rendono piu libera o libero, piu lucida o lucido e piu integra o integro.`,
      },
    },
  }),
  createMeaningCard({
    id: 'the-chariot',
    number: 7,
    name_cn: '战车',
    name_en: 'The Chariot',
    keywords: ['胜利', '意志力', '目标', '野心', '控制', '冲突', '前进', '自我掌控'],
    daily_upright:
      '今天适合朝目标推进。即使局面有拉扯和阻力，只要你稳住方向，就有机会靠意志力冲出一条路。',
    daily_reversed:
      '今天要小心失控、急躁或方向混乱。别只顾着往前冲，先确认你是在掌控局面，还是被焦虑和胜负心拖着走。',
    reading_upright: `战车正位代表强大的意志力、目标感、野心与前进的决心。它说明你正处在一个需要主动突破的阶段，前方并非毫无阻碍，但你有足够的力量将混乱的局面整合起来，朝终点推进。

在牌阵中出现时，战车提醒你保持专注，不要被外界的拉扯分散。牌面中的黑白力量象征冲突、矛盾与不同方向的欲望，而战车的关键并不是消灭冲突，而是用更强的意志去驾驭它们。只要目标足够清晰，你就可以把压力、竞争、野心和不安转化为向前的动力。`,
    reading_reversed: `战车逆位代表方向失控、意志动摇、冲动冒进，或被内在冲突拉扯得无法前进。你可能很想赢，很想尽快到达终点，但越急越容易偏离方向，甚至被自己的焦虑、好胜心或控制欲反过来控制。

在牌阵中出现时，战车逆位提醒你重新检查目标和节奏。你是否真的知道自己要去哪里？你是在坚定前进，还是只是害怕停下来？它也可能表示外部阻力太强，或内部黑白两股力量尚未被整合。此时不适合硬冲到底，而是需要先稳住自己，重新握紧缰绳。`,
    detail: `战车是大阿尔卡那的第 7 张牌，象征胜利、意志力、野心、自我控制与向目标推进的能力。它不是一种轻飘飘的好运，而是一种“我要到达终点”的强烈决心。战车出现时，往往意味着事情已经进入行动和突破的阶段，你不能只站在原地等待结果，而需要主动掌控方向。

牌面中的战士站在战车之上，前方常有黑白两股力量并列出现。它们象征冲突、矛盾、分裂的欲望，以及现实中不同方向的阻力。战车真正困难的地方就在这里：你不是在一条平坦的路上前进，而是在一场拉扯之中前进。一边可能是理性，一边可能是情绪；一边是野心，一边是恐惧；一边想冲出去，一边又想退回安全地带。

因此，战车的核心不是单纯的速度，而是控制力。它要求你用强大的意志把分裂的力量拧成一个方向。你需要知道自己要去哪里，也需要压住那些会让你偏航的冲动。战车的胜利，不是因为路上没有困难，而是因为你在困难之中仍然没有放开缰绳。

当战车正位出现时，它通常意味着你拥有突破现状的力量。你可能正在面对竞争、挑战、迁移、考试、事业推进，或一段需要强大行动力的时期。此时目标感非常重要：只要你清楚终点在哪里，就可以把压力变成动力，把混乱变成路线。战车也带有野心，它不满足于原地停留，而是渴望赢、渴望抵达、渴望证明自己可以掌控命运的方向。

但战车也有明显的阴影面。当意志力过度膨胀，它可能变成强迫、急躁和控制欲。你可能太执着于胜利，以至于忽略身体的疲惫、关系的张力，或内心真实的恐惧。你看似在前进，实际只是被“不可以输”的念头推着跑。

当战车逆位出现时，它提醒你留意失控的状态。可能是方向不清、计划混乱，也可能是内心的黑白冲突太强，导致你无法稳定地前进。你可能一边想成功，一边又害怕承担成功后的代价；一边想冲刺，一边又被情绪和阻力拖住。此时，继续硬冲未必有效，真正需要的是重新整理方向，确认自己到底想抵达哪里。

战车的核心信息是：终点不会自动向你靠近。你需要目标，需要野心，也需要能驾驭自己的控制力。真正的胜利不是一路没有阻碍，而是在黑白拉扯之间，仍然让战车驶向你选择的方向。`,
    translations: {
      en: {
        name: 'The Chariot',
        keywords: ['Victory', 'Willpower', 'Goal', 'Ambition', 'Control', 'Conflict', 'Forward Motion', 'Self-Mastery'],
        daily_upright:
          'Today is good for advancing toward a goal. Even if there is tension and resistance, you can push through by holding your direction.',
        daily_reversed:
          'Today asks you to watch for loss of control, impatience, or mixed direction. Make sure you are steering the situation instead of being dragged by anxiety or the need to win.',
        reading_upright: `The Chariot upright represents strong will, focus, ambition, and the determination to move forward. You are in a phase that asks for active breakthrough. There may be resistance ahead, but you have the strength to gather conflicting forces and move toward the finish line.

In a spread, The Chariot asks you to stay focused. The black and white forces on the card symbolize conflict, contradiction, and competing desires. The goal is not to destroy conflict, but to direct it. Clear purpose can turn pressure, competition, and unrest into momentum.`,
        reading_reversed: `The Chariot reversed represents loss of direction, weakened will, recklessness, or being pulled apart by inner conflict. You may want to win so badly that the urgency itself throws you off course.

In a spread, it asks you to examine your goal and your pace. Are you moving with purpose, or only running because stopping feels frightening?`,
        detail: `The Chariot is card 7 of the Major Arcana. It symbolizes victory, willpower, ambition, self-control, and the power to move toward a chosen destination. It is not light luck, but a fierce decision to reach the end.

Its challenge lies in tension. The opposing forces before the chariot represent contradiction, pressure, competing desires, and different realities pulling in separate directions. The Chariot does not succeed because the road is smooth, but because the driver can hold the reins and keep moving through conflict.

This card is not really about speed. It is about command. It asks you to unite divided forces into one line of movement. Upright, it often appears during competition, challenge, travel, exams, career push, or any period that requires directed momentum. Its shadow, however, is urgency, force, and control for their own sake.

Reversed, it points to losing direction, being overrun by fear or ambition, or trying to force motion before your inner conflict has been resolved. Its core message is that the destination will not come to you. You need aim, desire, and the power to steer yourself there.`,
      },
      it: {
        name: 'Il Carro',
        keywords: ['Vittoria', 'Volonta', 'Obiettivo', 'Ambizione', 'Controllo', 'Conflitto', 'Avanzamento', 'Padronanza di se'],
        daily_upright:
          'Oggi e il momento giusto per avanzare verso un obiettivo. Anche se ci sono tensioni e resistenze, puoi aprirti una strada tenendo ferma la direzione.',
        daily_reversed:
          'Oggi fai attenzione a perdita di controllo, fretta o confusione di rotta. Verifica se stai guidando tu la situazione o se sei trascinata o trascinato da ansia e bisogno di vincere.',
        reading_upright: `Il Carro diritto rappresenta grande volonta, senso dell’obiettivo, ambizione e decisione di andare avanti. Ti trovi in una fase che richiede un vero superamento. Gli ostacoli non mancano, ma hai abbastanza forza per raccogliere il caos e dirigerlo verso una meta.

In una stesa, il Carro ti chiede di restare concentrata o concentrato. Le forze nere e bianche della carta simboleggiano conflitto, contraddizione e desideri che tirano in direzioni diverse. Non si tratta di eliminare il conflitto, ma di guidarlo.`,
        reading_reversed: `Il Carro rovesciato rappresenta perdita di direzione, volonta che vacilla, slancio impulsivo o una forte lacerazione interiore che blocca il movimento. Potresti voler vincere cosi tanto da perdere proprio la rotta.

In una stesa, ti invita a ricontrollare obiettivo e ritmo. Stai andando avanti con decisione o corri solo per paura di fermarti?`,
        detail: `Il Carro e la carta numero 7 degli Arcani Maggiori. Simboleggia vittoria, volonta, ambizione, autocontrollo e la capacita di muoversi verso una meta scelta. Non e semplice fortuna, ma la decisione intensa di arrivare fino in fondo.

La sua vera difficolta sta nella tensione. Le forze opposte davanti al carro rappresentano contraddizione, pressioni, desideri divisi e realta che tirano in direzioni differenti. Il Carro non riesce perche la strada e facile, ma perche chi lo guida tiene salde le redini e continua ad avanzare anche nel conflitto.

Questa carta non parla davvero di velocita, ma di comando. Chiede di unire forze divise in una direzione comune. Dritto, appare spesso in periodi di sfida, competizione, spostamento, esami, spinta professionale o ogni volta che serve avanzamento deciso. La sua ombra, pero, e la fretta, il controllo e la durezza.

Rovesciato, segnala perdita di direzione, paura o ambizione che prendono il sopravvento, oppure il tentativo di forzare il movimento prima che il conflitto interiore sia stato integrato. Il suo messaggio centrale e che il traguardo non verra da te: servono meta, desiderio e la capacita di guidarti da sola o da solo.`,
      },
    },
  }),
  createMeaningCard({
    id: 'strength',
    number: 8,
    name_cn: '力量',
    name_en: 'Strength',
    keywords: ['勇气', '温柔', '驯服', '耐心', '内在力量', '自控', '韧性', '以柔克刚', '同情心'],
    daily_upright:
      '今天适合用温柔但坚定的方式处理问题。即使处在压力和痛苦之中，你也有能力保持冷静，把局面慢慢稳住。',
    daily_reversed:
      '今天要小心被情绪、冲动或恐惧牵着走。别急着压抑自己，也别为了照顾别人而过度消耗自己的力量。',
    reading_upright: `力量正位代表勇气、耐心、内在力量与以柔克刚的智慧。它说明你正在面对某种强烈的情绪、欲望、恐惧或压力，但你并非只能用强硬的方式对抗它。

在牌阵中出现时，力量提醒你用更柔软、更稳定的方法处理局面。牌面中的狮子象征激情、欲望、愤怒与本能，而女人并没有粗暴地制服它，而是以冷静、纪律、爱与同情让它安静下来。它提示你，即使生活正在经历斗争，你仍然拥有保持清醒和坚强的能力。`,
    reading_reversed: `力量逆位代表自我怀疑、情绪失控、欲望失衡，或内在力量暂时被削弱，你感到自己是软弱的，无法面对恐惧。你可能正在被某种恐惧、愤怒、不安或冲动影响，明明想保持冷静，却很难真正稳住自己。

在牌阵中出现时，力量逆位提醒你不要把脆弱误认为失败。此时如果一味压抑情绪，反而可能让它以更激烈的方式爆发。它也提醒你留意过度付出：富有同情心是珍贵的品质，但如果总是以牺牲自己为代价去照顾别人，你的力量也会被消耗。`,
    detail: `力量是大阿尔卡那的第 8 张牌，象征勇气、耐心、温柔的控制力与内在韧性。它和战车一样都与控制有关，但两者的方式完全不同。战车依靠目标、意志和强势推进，力量则依靠理解、安抚、纪律与持续的内在稳定。

牌面中，一个女人平静地握着成年狮子的下巴。狮子看起来凶猛、强壮，象征勇气、激情、欲望、愤怒与本能。这些情感本身并不是坏事，它们是人类生命力的重要部分；但如果完全失控，也可能反过来伤害我们，甚至把我们拖向毁灭。

真正令人着迷的是，女人并没有用暴力压制狮子。她冷静、优雅、镇定，像是拥有一种更高层次的统治力。她的力量不是蛮力，而是自控、纪律、爱与同情。她知道如何靠近危险，也知道如何让危险不再吞噬自己。这就是力量牌最核心的智慧：以柔克刚。

当力量正位出现时，它通常意味着你正在经历某种压力、痛苦或内在斗争，但你拥有撑过去的能力。也许外界环境并不轻松，也许你内心有恐惧、愤怒、不甘或强烈的欲望，但这张牌提醒你：你可以不被这些情绪拖走。你可以看见它们，承认它们，然后用温柔而坚定的方式把它们带回可控的位置。

力量牌也代表逆境中的冷静。真正强大的人，不一定声音最大，也不一定姿态最硬。她可以面对危险，却不慌乱；可以承受痛苦，却不被痛苦摧毁；可以拥有激情，却不让激情烧毁自己。她的坚强不是冷酷，而是一种在动荡里仍能保持平静的能力。

这张牌也带有同情心。力量正位的人往往愿意理解他人，愿意在别人困难的时候伸出手。她不是因为软弱才温柔，而是因为内在足够强大，所以仍然保有柔软。只是，这种同情心也需要边界。真正的善良不应该总是以自我牺牲为代价，真正的力量也包括知道什么时候该保护自己。

当力量逆位出现时，它提醒你留意内在力量的失衡。你可能正在自我怀疑，觉得自己非常软弱，觉得自己不够强大，无法应对挑战；也可能被某种情绪、欲望或恐惧控制，失去原本的判断力。它也可能表示过度压抑：表面上看起来平静，内在却已经积累了太多没有被处理的情绪。

力量逆位并不意味着你没有力量，而是说明你需要重新找回与自己相处的方法。不要只想着“忍住”或“赢过它”。有些内在的猛兽不是靠打败解决的，而是要先看见它、承认它，再慢慢驯服它。

力量的核心信息是：真正的强大不是征服一切，而是在危险、痛苦和欲望面前，仍然选择冷静、温柔和坚定。你不需要杀死内在的狮子，你需要学会牵住它。`,
    translations: {
      en: {
        name: 'Strength',
        keywords: ['Courage', 'Gentleness', 'Taming', 'Patience', 'Inner Strength', 'Self-Control', 'Resilience', 'Soft Power', 'Compassion'],
        daily_upright:
          'Today is good for handling matters with gentleness and firmness. Even under pressure and pain, you can stay calm and steady the situation.',
        daily_reversed:
          'Today asks you to watch for emotion, impulse, or fear taking the wheel. Do not suppress yourself too quickly, and do not exhaust your strength by caring for everyone else first.',
        reading_upright: `Strength upright represents courage, patience, inner power, and the wisdom of overcoming force with softness. You may be facing strong emotion, desire, fear, or pressure, but you do not have to fight it with brute force.

In a spread, Strength asks for a softer and steadier way of meeting the situation. The lion symbolizes instinct, anger, desire, and vitality. The figure beside it does not conquer through violence, but through calm, discipline, compassion, and self-command.`,
        reading_reversed: `Strength reversed represents self-doubt, emotional overwhelm, distorted desire, or a temporary weakening of inner steadiness. You may want to stay calm and yet feel dragged by fear, anger, or impulse.

In a spread, it reminds you that vulnerability is not failure. Suppressing emotion may only make it erupt more violently. It also asks you to notice whether compassion has turned into self-erasure.`,
        detail: `Strength is card 8 of the Major Arcana. It symbolizes courage, patience, inner resilience, and a gentle kind of mastery. Like The Chariot, it concerns control, but it does so in an entirely different way. The Chariot drives through force of will; Strength calms, contains, and integrates through steadiness.

The lion on the card symbolizes instinct, passion, desire, anger, and raw life force. These things are not inherently bad, but they can consume us when uncontained. What makes the card striking is that the woman does not crush the lion. She soothes and guides it. Her strength is not brute force, but discipline, compassion, and inner calm.

Upright, Strength often appears when you are moving through pressure, pain, temptation, or inner conflict, yet still have the ability to remain conscious and composed. It asks you to acknowledge what is fierce within you and bring it into relationship rather than denial.

It also carries compassion. Real strength is not hardness for its own sake. It is the ability to remain gentle without becoming weak, and to care without sacrificing yourself completely.

Reversed, Strength points to imbalance in inner power: self-doubt, emotional flooding, repression, exhaustion, or being overtaken by fear and instinct. Its message is that your strength has not disappeared; you may simply need to relearn how to live beside your own lion instead of trying to strangle or ignore it.`,
      },
      it: {
        name: 'La Forza',
        keywords: ['Coraggio', 'Gentilezza', 'Addomesticare', 'Pazienza', 'Forza interiore', 'Autocontrollo', 'Resilienza', 'Vincere con dolcezza', 'Compassione'],
        daily_upright:
          'Oggi e utile affrontare le cose con dolcezza ma anche con fermezza. Anche sotto pressione o dolore, hai la capacita di restare calma o calmo e stabilizzare la situazione.',
        daily_reversed:
          'Oggi fai attenzione a essere trascinata o trascinato da emozione, impulso o paura. Non reprimerti troppo in fretta e non consumare tutta la tua forza per prenderti cura degli altri.',
        reading_upright: `La Forza diritta rappresenta coraggio, pazienza, forza interiore e la saggezza del vincere con dolcezza. Potresti stare affrontando emozioni forti, desiderio, paura o pressione, ma non sei obbligata o obbligato a rispondere con durezza.

In una stesa, La Forza invita a usare un modo piu morbido e stabile per affrontare la situazione. Il leone simboleggia istinto, rabbia, desiderio e vitalita. La figura sulla carta non lo domina con violenza, ma con calma, disciplina, amore e compassione.`,
        reading_reversed: `La Forza rovesciata rappresenta dubbio su di se, perdita di controllo emotivo, desiderio sbilanciato o una temporanea debolezza della forza interiore. Potresti voler restare calma o calmo ma sentirti trascinata o trascinato da paura, rabbia o impulso.

In una stesa, ricorda che la vulnerabilita non e un fallimento. Reprimere troppo le emozioni puo farle esplodere in modo ancora piu forte. Ti invita anche a vedere se la compassione e diventata auto-cancellazione.`,
        detail: `La Forza e la carta numero 8 degli Arcani Maggiori. Simboleggia coraggio, pazienza, resilienza interiore e una forma gentile di padronanza. Come il Carro, riguarda il controllo, ma in modo opposto. Il Carro avanza con volonta e spinta; la Forza calma, contiene e integra con stabilita.

Il leone sulla carta rappresenta istinto, passione, desiderio, rabbia e forza vitale. Queste cose non sono necessariamente negative, ma possono consumarci se non trovano forma. Cio che rende la carta cosi potente e che la donna non schiaccia il leone: lo placa e lo guida. La sua forza non e bruta, ma fatta di disciplina, compassione e calma interiore.

Dritta, la Forza appare spesso quando stai attraversando pressione, dolore, tentazione o conflitto interiore, eppure possiedi ancora la capacita di restare consapevole e composta o composto. Chiede di riconoscere cio che e feroce dentro di te e di portarlo in relazione, non in negazione.

Parla anche di compassione. La vera forza non e durezza fine a se stessa. E la capacita di restare morbida o morbido senza diventare debole, e di prendersi cura senza annullarsi.

Rovesciata, indica squilibrio nella forza interiore: dubbio su di se, travolgimento emotivo, repressione, esaurimento o paura che prende il sopravvento. Il suo messaggio e che la tua forza non e sparita; forse hai solo bisogno di imparare di nuovo a vivere accanto al tuo leone invece di soffocarlo o ignorarlo.`,
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
    reading_upright: `隐士正位代表有智慧的孤独、内在探索与精神上的寻找。它说明你正在进入一个需要独处、思考和沉淀的阶段。此时，外界的建议、欲望和喧嚣未必能真正帮助你，你需要暂时与人群拉开距离，去听见更深处的声音。

在牌阵中出现时，隐士提醒你不要急着向外寻找答案。你可能已经走到了某个需要自我确认的路口，真正的方向不能由别人替你决定。隐士手中的灯并不照亮整条路，只照亮脚下一小段，但这已经足够让你继续前行。它象征一种缓慢而清醒的智慧：在黑夜中行走，也仍然相信自己能够找到回家的路。`,
    reading_reversed: `隐士逆位代表孤立、封闭、迷失，或拒绝面对内心真正的问题。你可能正在逃离人群，也可能正在逃离自己。表面上是在独处，实际上却陷入了过度思考、低落、疏离或无法求助的状态。

在牌阵中出现时，隐士逆位提醒你分辨：你是在主动寻找内在智慧，还是因为失望、害怕或疲惫而把自己封起来？此时未必需要立刻回到热闹之中，但你也不必独自承受所有黑暗。真正的智慧不是永远孤身一人，而是知道什么时候该沉默，什么时候该点灯，什么时候也可以向远处的人求一点火光。`,
    detail: `隐士是大阿尔卡那的第 9 张牌，象征孤独、智慧、内省与精神上的寻找。他不是被世界遗弃的人，而是主动离开人群的人。因为有些声音太吵，有些欲望太重，有些答案太微弱，只有在足够安静的时候才会出现。

牌面中的隐士通常独自站在黑夜或雪山之上，手中提着一盏灯。他像一个孤独的流浪者，在无意识的黑夜里前行。那盏灯的光并不明亮，无法照亮整个世界，只能照见眼前一小段路。但隐士并不因此慌张，因为他寻找的不是外界的掌声、认同或热闹，而是只有长期孤独才能获得的东西：内心真正的声音。

隐士的孤独不是空洞的孤独，而是有智慧的孤独。他需要暂时与人群脱节，因为人群里有太多声音会覆盖自己：别人的期待、社会的标准、短暂的欲望、关系的拉扯，以及那些看似合理却并不属于他的答案。为了听见自己，他必须离开这些噪音，走进更深的夜里。

当隐士正位出现时，它通常意味着你需要独处、思考和沉淀。你可能正在经历一个不适合立刻行动的阶段，也可能正站在人生某个需要重新确认方向的路口。此时，向外求证未必能给你真正的答案。你需要安静下来，慢慢辨认：什么是别人告诉你的路，什么才是你内心真正愿意走的路。

隐士也代表成熟的智慧。它不是女祭司那种神秘的直觉，也不是教皇那种传统传授的知识。隐士的智慧来自长时间的行走、沉默、失去、观察和自我消化。他知道有些路必须一个人走，有些答案不能被直接赠予，只能在漫长的独处中一点点生长出来。

但隐士也有阴影面。当孤独过度，它可能变成封闭；当内省过度，它可能变成反复咀嚼痛苦。隐士逆位时，你可能不再是在寻找自己，而是在躲避世界；不再是在听见内心，而是在被黑夜困住。你可能拒绝沟通，拒绝求助，甚至把孤独当成唯一安全的地方。

当隐士逆位出现时，它提醒你重新看待自己的独处。真正的独处应该让你更清醒，而不是更麻木；应该让你接近自己，而不是切断所有连接。如果黑夜太深，你不必强迫自己一个人走完。灯光可以来自自己，也可以暂时借自他人。

隐士的核心信息是：有些答案只能在孤独中被听见。你走过黑夜，提着微弱的灯，不是为了远离世界，而是为了找到真正的家。那个家不是某个地点，而是你终于回到自己的内心，回到那个不再被外界声音淹没的自我。`,
    translations: {
      en: {
        name: 'The Hermit',
        keywords: ['Solitude', 'Wisdom', 'Introspection', 'Search', 'Silence', 'Soul Guidance', 'Being Alone', 'Inner Voice'],
        daily_upright:
          'Today is good for becoming quiet and reducing outside noise. The answer may not be in the crowd; you may only hear it in solitude.',
        daily_reversed:
          'Today asks you to watch for isolation, avoidance of contact, or losing yourself inside loneliness. Solitude should help you hear yourself, not trap you in darkness.',
        reading_upright: `The Hermit upright represents wise solitude, inner exploration, and spiritual searching. You are entering a phase that asks for distance, reflection, and quiet. Outside advice and noise may not help you as much as listening inward.

In a spread, The Hermit asks you not to rush outward for answers. The lantern does not light the whole path, only the next few steps, but that is enough.`,
        reading_reversed: `The Hermit reversed represents isolation, withdrawal, getting lost, or refusing to face what is truly happening inside. You may look as though you are simply alone, while actually sinking into overthinking, sadness, or inability to ask for help.

In a spread, it asks whether you are seeking wisdom or hiding from life.`,
        detail: `The Hermit is card 9 of the Major Arcana. He symbolizes solitude, wisdom, introspection, and spiritual seeking. He is not someone abandoned by the world, but someone who steps away from the crowd because some answers can only be heard in quiet.

The lantern he carries does not light the entire road. It lights only a small part ahead. Yet that small light is enough. The Hermit's wisdom is not dramatic. It is slow, sober, and earned through silence, walking, loss, observation, and deep digestion of experience.

Upright, he often appears when you need distance, thought, and inner confirmation. Outside voices may blur rather than clarify your direction. Reversed, he warns that solitude can harden into isolation and reflection can turn into painful repetition.

His core message is that some answers can only be heard in loneliness, but true solitude should return you to yourself rather than cut you away from all life.`,
      },
      it: {
        name: "L'Eremita",
        keywords: ['Solitudine', 'Saggezza', 'Introspezione', 'Ricerca', 'Silenzio', 'Guida dell’anima', 'Stare soli', 'Voce interiore'],
        daily_upright:
          'Oggi e il momento giusto per fare silenzio e ridurre il rumore esterno. La risposta potrebbe non essere nella folla, ma nella tua solitudine.',
        daily_reversed:
          'Oggi fai attenzione a chiusura eccessiva, fuga dal contatto o smarrimento dentro la solitudine. Stare sola o solo dovrebbe aiutarti a sentirti, non a imprigionarti nel buio.',
        reading_upright: `L'Eremita diritto rappresenta una solitudine saggia, esplorazione interiore e ricerca spirituale. Stai entrando in una fase che richiede distanza, riflessione e quiete. I consigli esterni e il rumore potrebbero aiutarti meno dell’ascolto interiore.

In una stesa, l’Eremita ti invita a non correre subito fuori in cerca di risposte. La lanterna non illumina tutta la strada, ma solo i prossimi passi, e questo basta.`,
        reading_reversed: `L'Eremita rovesciato rappresenta isolamento, chiusura, smarrimento o rifiuto di guardare cio che accade davvero dentro. Potresti sembrare soltanto sola o solo, mentre in realta stai scivolando in pensiero eccessivo, tristezza o incapacita di chiedere aiuto.

In una stesa, ti chiede se stai cercando saggezza oppure se ti stai nascondendo alla vita.`,
        detail: `L'Eremita e la carta numero 9 degli Arcani Maggiori. Simboleggia solitudine, saggezza, introspezione e ricerca spirituale. Non e qualcuno abbandonato dal mondo, ma qualcuno che si allontana volontariamente dal rumore perche alcune risposte possono essere udite solo nel silenzio.

La sua lanterna non illumina tutta la via. Illumina solo un piccolo tratto davanti a lui. Eppure basta. La saggezza dell’Eremita non e spettacolare: e lenta, sobria, guadagnata attraverso silenzio, cammino, perdite, osservazione e profonda elaborazione dell’esperienza.

Diritto, appare spesso quando hai bisogno di distanza, pensiero e conferma interiore. Le voci esterne possono confondere piu che chiarire. Rovesciato, avverte che la solitudine puo indurirsi in isolamento e che la riflessione puo trasformarsi in ripetizione dolorosa.

Il suo messaggio centrale e che alcune risposte si sentono solo nella solitudine, ma la vera solitudine dovrebbe riportarti a te stessa o a te stesso, non separarti da tutta la vita.`,
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
    reading_upright: `命运之轮正位代表转折、机会、周期变化与命运的推动。它说明某个局面正在发生变化，你可能无法完全控制事情的走向，但能感受到旧阶段正在松动，新阶段正在靠近。

在牌阵中出现时，命运之轮提醒你留意时机。它可能带来好运、突然的机会、关系或事业上的转折，也可能让原本停滞的局面重新流动起来。它不是单纯的“天降好运”，而是命运把你推到新的位置，让你看见原本看不见的路。此时，重要的是顺势而动，抓住变化中出现的窗口。`,
    reading_reversed: `命运之轮逆位代表停滞、反复、错过时机，或被困在某种循环之中。你可能感觉事情一直绕回原点，明明努力过，却总是在类似的地方受阻。

在牌阵中出现时，命运之轮逆位提醒你观察重复出现的模式。也许问题不只是运气不好，而是某种旧选择、旧关系、旧恐惧或旧习惯不断把你带回同一个位置。它也可能表示时机尚未成熟，外部环境暂时不配合。此时，与其强行推动，不如先看清轮子为什么没有向前转。`,
    detail: `命运之轮是大阿尔卡那的第 10 张牌，象征命运的转动、周期的更替、机会的到来，以及人生中那些无法完全由个人意志控制的转折。它是一张很宏大的牌，因为它提醒人：生活不是一条直线，而是一只不断旋转的轮子。你会升起，也会落下；会失去，也会重新遇见；会被推离旧位置，也会被带向新的门口。

这张牌的核心不是“好”或“坏”，而是“变化”。命运之轮出现时，往往意味着某个阶段正在结束，另一个阶段正在开启。你也许还没有完全准备好，但局势已经开始流动。原本卡住的事情可能突然出现转机，原本稳定的关系或计划也可能被新的变量打乱。它像命运伸出一只手，轻轻拨动了轮盘，让你站到一个不同的位置。

当命运之轮正位出现时，它通常代表机会、好运、转折和时机成熟。你可能会遇到意想不到的帮助、突然打开的道路，或某个长期停滞的问题终于开始推进。它不一定意味着一切都会立刻变得完美，但它说明能量已经改变，局面不再停在原地。此时最重要的是保持敏锐：机会不会永远停在那里，命运递来的东西也常常带着一点随机性。

命运之轮也与因果和周期有关。很多事情看似突然，其实早有积累。过去的选择、努力、失败、等待和错过，都可能在某个时刻汇聚成一次转折。它像是在告诉你：没有什么会永远停在低处，也没有什么会永远保持高位。人生的轮子一直在转，真正重要的是你能不能在变化中认出自己的位置。

但命运之轮也有一种残酷的诚实：人无法控制所有事情。你可以努力，可以计划，可以准备，但仍然会有一些结果来自时机、环境、他人的选择，甚至纯粹的偶然。它让人意识到，命运并不总是按照人的意志展开。可这并不意味着努力没有意义。努力让你在轮子转到某个位置时，拥有伸手抓住机会的能力。

当命运之轮逆位出现时，它提醒你留意停滞和重复。你可能陷入某种循环：反复遇到相似的人，反复经历类似的失望，反复在同一个问题上摔倒。此时，逆位的命运之轮不只是说“运气不好”，而是在问你：这个循环为什么一直回来？你是否仍然用旧方法处理新问题？是否明明已经看见了模式，却还在期待不同的结果？

命运之轮逆位也可能表示时机未到。你很想推动某件事，但外部条件还没有配合，或者变化正在暗处酝酿，尚未真正显现。此时，强行控制轮子的方向反而会让你更加疲惫。你需要做的，是观察、调整、等待，并在下一次转动来临之前，准备好自己。

命运之轮的核心信息是：命运会转动，局面会改变，低谷不会永远是低谷，高处也不会永远稳固。你无法命令轮子停在哪里，但你可以在它转动时保持清醒。真正的智慧不是控制命运，而是在命运转向的瞬间，认出那扇刚刚打开的门。`,
    translations: {
      en: {
        name: 'Wheel of Fortune',
        keywords: ['Fate', 'Turning Point', 'Cycle', 'Opportunity', 'Change', 'Flow', 'Cause and Effect', 'Uncontrollable'],
        daily_upright:
          'Today may bring an unexpected turn. Move with the change, notice the opportunities fate offers, enjoy what is good while it is here, and remember that low periods also pass.',
        daily_reversed:
          'Today luck may not feel as though it is on your side. Rather than trying to control everything, accept that some things are temporarily outside your hands.',
        reading_upright: `Wheel of Fortune upright represents turning points, opportunity, cycles, and the pressure of fate. Something is shifting. You may not be able to control the direction completely, but you can feel the old stage loosening and the new one approaching.

In a spread, it asks you to pay attention to timing. It may bring sudden chance, luck, movement in relationship or career, or a release from stagnation. It is not simple good fortune falling from the sky, but fate moving you into a position where a new road becomes visible.`,
        reading_reversed: `Wheel of Fortune reversed represents stagnation, repetition, missed timing, or being caught in a loop. You may feel that things keep circling back to the same place despite effort.

In a spread, it asks you to study the pattern. The issue may not be only bad luck, but old choices, fears, or habits carrying you back to the same point. It can also mean that the right time has not arrived yet.`,
        detail: `Wheel of Fortune is card 10 of the Major Arcana. It symbolizes the turning of fate, changing cycles, arriving opportunities, and the moments in life that cannot be ruled by personal will alone. Life is not a straight line. It turns. Things rise and fall, leave and return, and old positions give way to new ones.

Its essence is not simply good or bad, but change. When the Wheel appears, one phase is ending and another is beginning. What was blocked may suddenly move; what seemed steady may be disrupted by a new variable.

Upright, it often signals luck, opening paths, timely support, and a shift in momentum. It reminds you to stay alert because opportunity rarely remains still. It also speaks of cycles and consequence: what appears sudden often has long roots beneath it.

Yet the Wheel is honest about what cannot be controlled. Not everything bends to effort alone. Timing, circumstance, and chance still matter. Effort is meaningful because it prepares you to recognize and seize the opening when the wheel turns in your favor.

Reversed, the Wheel points toward repetition, delay, and patterns that keep returning. Sometimes it is not just that luck is poor, but that a familiar cycle remains unbroken. It can also mean the right moment has not matured. In those times, wisdom lies in observing, adjusting, and preparing rather than forcing motion.`,
      },
      it: {
        name: 'Ruota della Fortuna',
        keywords: ['Destino', 'Svolta', 'Ciclo', 'Occasione', 'Cambiamento', 'Flusso', 'Causa ed effetto', 'Fuori controllo'],
        daily_upright:
          'Oggi potrebbe arrivare una svolta inattesa. Segui il cambiamento, nota le occasioni che il destino offre, goditi i momenti belli quando arrivano e ricorda che anche i periodi difficili non durano per sempre.',
        daily_reversed:
          'Oggi potresti sentire che la fortuna non e dalla tua parte. Invece di voler controllare tutto, accetta che alcune cose siano temporaneamente fuori dal tuo raggio di azione.',
        reading_upright: `La Ruota della Fortuna diritta rappresenta svolte, occasioni, cicli e la spinta del destino. Qualcosa si sta muovendo. Forse non puoi controllare del tutto la direzione, ma senti che la fase vecchia si sta allentando e che quella nuova si sta avvicinando.

In una stesa, invita a prestare attenzione al tempo giusto. Può portare colpi di fortuna, occasioni improvvise, svolte in amore o nel lavoro, oppure far ripartire una situazione bloccata. Non e solo fortuna che cade dal cielo, ma destino che ti sposta in un punto da cui diventa visibile una strada nuova.`,
        reading_reversed: `La Ruota della Fortuna rovesciata rappresenta stasi, ripetizione, occasioni mancate o un loop da cui sembra difficile uscire. Potresti sentire che tutto torna sempre allo stesso punto nonostante gli sforzi.

In una stesa, ti chiede di osservare il modello ricorrente. Forse non si tratta solo di sfortuna, ma di vecchie scelte, paure o abitudini che ti riportano li. Puo anche significare che il momento giusto non e ancora maturo.`,
        detail: `La Ruota della Fortuna e la carta numero 10 degli Arcani Maggiori. Simboleggia il girare del destino, l’alternanza dei cicli, l’arrivo delle occasioni e quei momenti della vita che non possono essere controllati soltanto dalla volonta personale. La vita non e una linea retta: gira. Le cose salgono e scendono, si perdono e ritornano, vecchie posizioni cedono il posto a nuove.

Il suo centro non e semplicemente il bene o il male, ma il cambiamento. Quando la Ruota appare, una fase sta finendo e un’altra sta iniziando. Cio che era bloccato puo iniziare a muoversi all’improvviso; cio che pareva stabile puo essere spostato da una nuova variabile.

Dritta, segnala spesso fortuna, aperture, aiuti che arrivano al momento giusto e uno spostamento dell’energia. Ricorda di restare vigile, perche l’occasione non resta ferma. Parla anche di cicli e di conseguenze: cio che appare improvviso spesso ha radici lunghe.

Ma la Ruota e onesta anche su cio che non puo essere controllato. Non tutto si piega allo sforzo personale. Il tempo, le circostanze e il caso contano ancora. Lo sforzo ha valore perche ti prepara a riconoscere e afferrare l’apertura quando la ruota gira dalla tua parte.

Rovesciata, la Ruota indica ripetizione, ritardo e modelli che tornano. A volte non e solo questione di sfortuna, ma di un ciclo che continua a ripetersi. Puo anche significare che il momento giusto non e ancora arrivato. In quei casi, la saggezza sta nell’osservare, aggiustare e prepararsi invece di forzare il movimento.`,
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
    daily_reversed:
      '今天要小心不公、偏见或被隐藏的真相。也要避免不负责任的说辞和逃避责任的倾向。别急着接受表面的说法，真正的问题可能并没有得到公正的处理。',
    reading_upright: `正义正位代表公平、真相、因果与理性的裁决。它说明当前的问题需要被认真衡量：谁承担了责任，谁付出了代价，谁说出了事实，谁又在回避事实。此时，情绪不能替代判断，逃避也不能取消后果。

在牌阵中出现时，正义提醒你回到证据、原则和清晰的边界之中。它可能指向法律、契约、考试、审核、评估、谈判，也可能代表一段关系或事件终于需要面对真实结果。正义不是温柔地安慰人，而是把天平摆出来，让所有选择都回到它应有的重量。`,
    reading_reversed: `正义逆位代表不公平、偏见、失衡、责任逃避，或真相被掩盖。你可能正在面对一个并不透明的局面：有人只展示对自己有利的部分，有人用规则包装私心，也有人试图让真正的问题留在阴影里。

在牌阵中出现时，正义逆位提醒你不要轻易相信表面的裁决。此时需要追问：谁制定了规则？谁从规则中获益？谁的声音被听见，谁的真实被遮住？它也可能表示你正在逃避某个后果，或不愿承认自己选择带来的责任。正义逆位并不只是“别人对你不公”，也可能是在要求你重新面对自己是否真正诚实。`,
    detail: `正义是大阿尔卡那的第 11 张牌，象征公平、真相、规则、因果与责任。她通常坐在庄严的位置上，一手持剑，一手持天平。剑代表清晰、判断与切开迷雾的能力；天平代表衡量、平衡与因果的重量。她的出现，意味着事情不能再只凭情绪、愿望或模糊的解释继续下去，必须回到事实本身。

正义的力量不是命运之轮那种不可控的转动，而是一种更冷静的秩序：你做出的选择会产生结果，你逃避的责任也会以某种形式回来。它提醒人，世界也许并不总是立刻公平，但每个决定都有重量，每个真相都有被看见的时刻。

牌面中正义人物常穿着长袍，这一点很有意思。长袍带来庄严，也带来遮蔽。它让正义显得像一种制度、一种仪式、一种被包装过的权威。某些情况下，这张牌不只是代表已经显现的事实，也可能代表被隐藏的真实：真相还没有完全裸露出来，它被礼仪、身份、规则、语言或沉默包裹着。你看见的是裁决的外壳，但还需要继续追问，袍子之下究竟藏着什么。

当正义正位出现时，它通常意味着某件事需要被公正地处理。也许是一场考试、一次面试、一个合同、一段关系中的责任分配，或某个必须做出判断的局面。它要求你理性、诚实，不要为了短暂的舒适而扭曲事实。此时，最重要的是看清证据，看清原则，也看清自己在事件中的位置。

正义也与因果有关。它不一定立刻带来惩罚或奖励，但它会让人面对“我曾经如何选择，所以现在必须如何承担”。这张牌有一种冷峻的清醒：你可以解释，可以辩护，可以逃避一段时间，但最终，天平会称出真正的重量。

在关系中，正义可能代表彼此需要更公平的对待。谁一直在付出，谁一直在索取？谁承担了情绪劳动，谁把责任推给别人？它不一定表示关系结束，但它表示关系需要被重新衡量。爱不能长期建立在失衡上，亲密也不能成为逃避责任的理由。

当正义逆位出现时，它提醒你留意不公、偏见、双重标准和被掩盖的真相。可能有人掌握话语权，因此让自己的版本看起来更合理；也可能某种规则表面公正，实际却偏向某一方。此时，长袍的象征会变得更明显：有些真实被遮住了，有些判断被包装成了正确，有些不平等被制度化为“本来如此”。

正义逆位也可能指向自我欺骗。你也许知道某件事并不公平，却不愿承认；也许知道自己需要承担后果，却希望事情自动过去。它提醒你，真正的公平不是只在自己受伤时才被需要，也不是只要求别人诚实，而是自己也愿意接受事实的审判。

正义的核心信息是：真相也许会被遮住，但不会因此失去重量。你需要用清醒的眼睛看见事实，用稳定的手扶住天平，也用足够的勇气承认：每一个选择，最终都会回到它应有的位置。`,
    translations: {
      en: {
        name: 'Justice',
        keywords: ['Fairness', 'Truth', 'Cause and Effect', 'Judgment', 'Responsibility', 'Balance', 'Rules', 'Hidden Reality'],
        daily_upright:
          'Today is good for rational judgment and fair handling. Do not rely only on emotion; facts, evidence, and responsibility matter more.',
        daily_reversed:
          'Today asks you to watch for unfairness, bias, or hidden truth. Do not accept surface explanations too quickly, and avoid language that dodges responsibility.',
        reading_upright: `Justice upright represents fairness, truth, consequence, and rational judgment. The present issue asks to be weighed carefully: who carried responsibility, who paid the cost, who told the truth, and who avoided it.

In a spread, Justice brings you back to evidence, principle, and clear boundaries. It may point to law, contracts, exams, reviews, negotiations, or the real outcome a relationship or situation must finally face.`,
        reading_reversed: `Justice reversed represents unfairness, bias, imbalance, avoidance of responsibility, or truth being concealed. You may be facing a situation that is not transparent, in which someone shows only what benefits them.

In a spread, it asks who made the rule, who benefits from it, whose voice is heard, and whose truth is hidden. It can also ask whether you are avoiding the consequence of your own choices.`,
        detail: `Justice is card 11 of the Major Arcana. She symbolizes fairness, truth, rules, cause and effect, and responsibility. One hand holds the sword of clear judgment; the other holds the scales of measure and consequence. Her presence means that feeling and wish alone are no longer enough. The situation must return to fact.

Justice does not move like the Wheel of Fortune. She belongs to a cooler order: choices carry results, and avoided responsibility returns in one form or another. She reminds us that every decision has weight and every truth has a moment in which it must be seen.

Her long robe is important. It gives dignity, but it can also hide. Sometimes Justice does not only point to what is already visible. She can also point to a truth still covered by ceremony, identity, language, silence, or rules. The verdict may be visible before the deeper reality is fully exposed.

Upright, she often indicates a matter that must be handled fairly: an exam, interview, contract, allocation of responsibility, or any situation needing a clear decision. She asks for honesty and evidence instead of comforting distortion.

Justice also speaks of consequence. Reward and punishment may not appear immediately, but they still belong to what was chosen. In relationships, she can ask whether giving and receiving have become unequal and whether love has been used to avoid accountability.

Reversed, she warns of bias, double standards, and hidden truth. Someone may control the narrative. A rule may look fair while actually protecting one side. It can also point to self-deception: not just unfairness done to you, but truth you do not want to face in yourself.

Her core message is that truth may be covered, but it never loses weight. Every choice eventually returns to the place where it must be measured.`,
      },
      it: {
        name: 'La Giustizia',
        keywords: ['Equita', 'Verita', 'Causa ed effetto', 'Giudizio', 'Responsabilita', 'Equilibrio', 'Regole', 'Verita nascosta'],
        daily_upright:
          'Oggi e il momento giusto per giudicare con razionalita e trattare le cose in modo equo. Non fermarti all’emozione: fatti, prove e responsabilita contano di piu.',
        daily_reversed:
          'Oggi fai attenzione a ingiustizia, pregiudizio o verita nascoste. Non accettare troppo in fretta la versione di superficie ed evita parole che sfuggono alla responsabilita.',
        reading_upright: `La Giustizia diritta rappresenta equita, verita, causa ed effetto e giudizio razionale. La situazione chiede di essere pesata con attenzione: chi si e assunto la responsabilita, chi ha pagato il prezzo, chi ha detto il vero e chi lo ha evitato.

In una stesa, riporta a prove, principi e confini chiari. Puo indicare legge, contratti, esami, valutazioni, trattative o il risultato reale che una relazione o un evento devono finalmente affrontare.`,
        reading_reversed: `La Giustizia rovesciata rappresenta ingiustizia, pregiudizio, squilibrio, fuga dalla responsabilita o verita occultata. Potresti essere in una situazione poco trasparente, dove qualcuno mostra solo cio che gli conviene.

In una stesa, chiede chi ha scritto la regola, chi ne trae vantaggio, quale voce viene ascoltata e quale verita resta nascosta. Puo anche domandarti se stai evitando la conseguenza delle tue stesse scelte.`,
        detail: `La Giustizia e la carta numero 11 degli Arcani Maggiori. Simboleggia equita, verita, regole, causa ed effetto e responsabilita. Una mano tiene la spada del giudizio chiaro; l’altra la bilancia del peso e delle conseguenze. La sua presenza significa che desideri e sensazioni non bastano piu: bisogna tornare ai fatti.

La Giustizia non si muove come la Ruota della Fortuna. Appartiene a un ordine piu freddo: le scelte producono effetti e la responsabilita evitata ritorna in qualche forma. Ricorda che ogni decisione ha un peso e ogni verita ha un momento in cui deve essere vista.

La lunga veste e importante. Dona solennita, ma puo anche nascondere. A volte la Giustizia non parla solo di cio che e gia visibile, ma anche di una verita ancora coperta da rito, identita, linguaggio, silenzio o regole. La sentenza puo apparire prima che il nucleo della realta sia del tutto scoperto.

Dritta, indica spesso una questione che deve essere trattata in modo giusto: un esame, un colloquio, un contratto, una distribuzione di responsabilita o qualsiasi situazione che richieda una decisione chiara. Chiede onesta e prove, non consolazioni che deformano i fatti.

Parla anche di conseguenze. Premi e punizioni non compaiono sempre subito, ma appartengono comunque a cio che e stato scelto. Nelle relazioni puo chiedere se dare e ricevere siano diventati squilibrati e se l’amore sia stato usato per evitare responsabilita.

Rovesciata, avverte di pregiudizio, doppi standard e verita nascoste. Qualcuno puo controllare il racconto. Una regola puo sembrare giusta e invece proteggere solo una parte. Puo indicare anche autoinganno: non soltanto un’ingiustizia subita, ma una verita che non vuoi guardare in te.

Il suo messaggio centrale e che la verita puo essere coperta, ma non perde mai il suo peso. Ogni scelta torna, prima o poi, nel luogo in cui deve essere pesata.`,
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
    reading_upright: `倒吊人正位代表暂时的停滞、等待、放下控制，以及用另一个视角重新理解事物。它说明当前局面可能无法立刻推进，但这种暂停并不一定是失败，而是给你一个重新看清问题的机会。

在牌阵中出现时，倒吊人提醒你不要只用原来的方式解决问题。你可能需要暂时放下执念，停止硬推，甚至接受某种短期的不自由。表面上看，你像是被悬在那里，无法行动；但从另一个层面看，你正在获得新的观察位置。只有当你愿意倒过来看世界，某些答案才会浮现。`,
    reading_reversed: `倒吊人逆位代表抗拒停顿、无意义的拖延、自我牺牲过度，或迟迟不愿改变视角。你可能已经卡在某个局面里很久，却仍然用同一种方式思考，所以越挣扎越疲惫。

在牌阵中出现时，倒吊人逆位提醒你分辨：你是真的需要等待，还是只是不敢做决定？你是在为了更高的理解而暂停，还是在用“忍耐”和“牺牲”回避行动？此时需要重新审视自己的处境，不要继续把自己悬挂在一个没有出口的位置上。`,
    detail: `倒吊人是大阿尔卡那的第 12 张牌，象征暂停、等待、牺牲、放下控制，以及从新的角度看待世界。牌面中的人物被倒吊在树上，身体受到限制，神情却常常显得平静。他不像是在痛苦挣扎，更像是在某种停顿中获得了新的领悟。

这张牌最重要的含义，是“暂时的停滞”。有些时候，事情无法继续往前走，并不是因为你做错了什么，而是因为原来的道路已经无法给出答案。你越是急着推进，越可能被同一个问题困住。倒吊人出现时，像是命运轻轻按下暂停键，让你停在半空中，重新观看眼前的一切。

倒吊人的智慧来自颠倒。正常站立时，人只能看见自己习惯看见的东西；被倒挂起来时，世界的秩序突然改变了。上方变成下方，熟悉变得陌生，原本理所当然的判断也开始松动。这张牌提醒你：问题本身也许没有变，但你看待问题的位置必须改变。

当倒吊人正位出现时，它通常意味着你需要放下某种控制欲。你可能很想立刻得到结果，想逼迫事情按照自己的节奏发生，但眼前的局面并不适合硬推。此时更重要的是观察、等待、转换思路。你需要问自己：如果不从得失看这件事，它还意味着什么？如果不急着证明自己，是否会看见另一条路？如果暂时不行动，真正浮现出来的感受又是什么？

倒吊人也与牺牲有关。但这种牺牲不一定是悲壮的自我消耗，而可能是一种主动放下：放下旧的立场，放下过度执着的目标，放下必须马上赢、马上得到答案的焦虑。它让你明白，有些东西只有在松手之后，才会显露出真正的形状。

在关系中，倒吊人可能代表一段需要冷静观察的时期。你可能暂时无法推进关系，也无法立刻得到回应。它提醒你不要只站在自己的需求里看问题，也要尝试理解对方的位置，或者看清这段关系本身是否已经进入停滞。在事业和现实事务中，它可能代表等待、延迟、计划暂缓，或需要重新评估方向。

当倒吊人逆位出现时，它提醒你留意无意义的停滞。暂停本来可以带来觉察，但如果停得太久，就可能变成逃避。你可能明明知道某件事已经没有结果，却仍然把自己吊在那里；也可能因为害怕选择，而用“再等等”拖延真正的决定。

倒吊人逆位也可能指向过度牺牲。你可能习惯把自己的需要放到最后，以为只要继续忍耐，事情就会变好。但如果牺牲没有带来成长，只让你越来越疲惫，那就不再是智慧，而是消耗。此时，你需要把自己从悬挂的位置上放下来，重新找回行动的能力。

倒吊人的核心信息是：停下并不一定等于失败。真正的暂停，是为了让你从旧视角里脱身。世界把你倒过来，不是为了惩罚你，而是为了让你看见：原来答案一直在那里，只是你以前站的位置看不到。`,
    translations: {
      en: {
        name: 'The Hanged Man',
        keywords: ['Stagnation', 'Waiting', 'New Perspective', 'Sacrifice', 'Letting Go', 'Pause', 'Awareness', 'Reversal of View'],
        daily_upright:
          'Today is good for pausing instead of pushing. A different angle may reveal an answer you could not see before.',
        daily_reversed:
          'Today asks you to watch for meaningless delay, or for refusing to change perspective even though the situation is already stalled. Do not turn waiting into avoidance.',
        reading_upright: `The Hanged Man upright represents temporary pause, waiting, surrender of control, and understanding things from another angle. The situation may not move yet, but that does not mean failure. This suspension can become a chance to see clearly.

In a spread, it asks you to stop forcing the old solution. By letting go of rigid effort and accepting short-term limitation, you may gain a new position from which the truth can finally be seen.`,
        reading_reversed: `The Hanged Man reversed represents resistance to pause, empty delay, excessive self-sacrifice, or refusal to change perspective. You may have been stuck for too long while continuing to think in the same way.

In a spread, it asks whether you truly need to wait or whether you are avoiding a decision by calling it patience.`,
        detail: `The Hanged Man is card 12 of the Major Arcana. It symbolizes pause, waiting, sacrifice, surrender of control, and seeing the world from a new point of view. The figure hangs upside down, restricted in body yet often calm in expression, as though stillness itself is becoming insight.

Its essential meaning is temporary suspension. Sometimes life stops not because you failed, but because the old path cannot answer the present question. The more you force forward, the more trapped you may become in the same pattern.

Its wisdom comes through reversal. What looked obvious when standing upright can become strange when seen from below. The issue may not change, but your position toward it must.

Upright, it often asks you to release control, urgency, and the need to win immediately. Sometimes the sacrifice required is not dramatic self-destruction, but the willingness to let go of an old stance or obsession.

In relationship and work, it can signal delay, suspended progress, or a period that demands observation over action. Reversed, however, it warns that waiting can turn into avoidance and sacrifice can turn into depletion.

Its core message is that stopping is not always failure. Sometimes the world turns you upside down so that you can finally see what your old position could not reveal.`,
      },
      it: {
        name: "L'Appeso",
        keywords: ['Stallo', 'Attesa', 'Nuova prospettiva', 'Sacrificio', 'Lasciare andare', 'Pausa', 'Consapevolezza', 'Sguardo capovolto'],
        daily_upright:
          'Oggi e utile fermarti invece di spingere. Guardare il problema da un’altra angolazione puo mostrarti una risposta che prima non vedevi.',
        daily_reversed:
          'Oggi fai attenzione al rinvio senza senso o al rifiuto di cambiare prospettiva anche se la situazione e gia bloccata. Non trasformare l’attesa in evitamento.',
        reading_upright: `L'Appeso diritto rappresenta una pausa temporanea, l’attesa, il lasciare andare il controllo e il comprendere le cose da un’altra prospettiva. La situazione potrebbe non avanzare subito, ma questo non significa fallimento. La sospensione puo diventare un’occasione di chiarezza.

In una stesa, ti chiede di smettere di forzare la soluzione vecchia. Lasciando andare lo sforzo rigido e accettando un limite temporaneo, potresti ottenere una nuova posizione da cui vedere finalmente la verita.`,
        reading_reversed: `L'Appeso rovesciato rappresenta resistenza alla pausa, rinvio vuoto, eccesso di sacrificio o rifiuto di cambiare prospettiva. Potresti essere bloccata o bloccato da molto tempo, continuando pero a pensare sempre nello stesso modo.

In una stesa, ti chiede se hai davvero bisogno di aspettare o se stai semplicemente evitando una decisione chiamandola pazienza.`,
        detail: `L'Appeso e la carta numero 12 degli Arcani Maggiori. Simboleggia pausa, attesa, sacrificio, rinuncia al controllo e la capacita di guardare il mondo da un punto di vista nuovo. La figura e capovolta e limitata nel corpo, ma spesso ha un’espressione calma, come se proprio la sospensione stesse generando comprensione.

Il suo significato essenziale e lo stallo temporaneo. A volte la vita si ferma non perche tu abbia sbagliato, ma perche la vecchia strada non puo piu rispondere alla domanda presente. Più spingi, piu rischi di restare prigioniera o prigioniero dello stesso schema.

La sua saggezza nasce dal capovolgimento. Cio che sembrava ovvio in posizione normale diventa strano quando viene guardato al contrario. Il problema puo non cambiare, ma deve cambiare il tuo punto di osservazione.

Dritto, chiede spesso di lasciare andare controllo, urgenza e bisogno di vincere subito. Il sacrificio richiesto non e sempre una distruzione dolorosa, ma spesso la disponibilita a lasciare una vecchia posizione o un attaccamento.

Nelle relazioni e nel lavoro puo indicare ritardo, progresso sospeso o un tempo in cui osservare conta piu che agire. Rovesciato, pero, avverte che l’attesa puo diventare evitamento e il sacrificio puo trasformarsi in logoramento.

Il suo messaggio centrale e che fermarsi non e sempre fallire. A volte il mondo ti capovolge per permetterti di vedere cio che la tua posizione precedente non poteva rivelare.`,
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
    reading_upright: `死神正位代表一个周期的结束、旧事物的消亡、情感上的断舍离，以及不可避免的转化。它说明某件事已经走到尽头，即使你仍然不舍、痛苦或无可奈何，也很难再让它回到原来的样子。

在牌阵中出现时，死神提醒你接受结束的规律。它不一定代表真正的死亡，而是代表关系、状态、身份、执念、旧习惯或某个阶段的终结。此时最重要的不是强行挽留，而是清醒地看见：有些东西已经完成了它的使命，继续抓住它，只会阻碍新的生命进入。`,
    reading_reversed: `死神逆位代表拒绝结束、害怕改变、拖延放手，或被过去困住。你可能已经感觉到某件事不再适合自己，却因为不甘心、舍不得、恐惧未知，仍然停留在一个已经失去生命力的位置上。

在牌阵中出现时，死神逆位提醒你：真正折磨人的，往往不是结束本身，而是明明知道结束已经发生，却仍然不愿承认。它也可能表示转化被延迟，旧模式还在反复出现。此时需要看清自己到底在留恋什么，是那件事本身，还是那个曾经寄托在其中的自己。`,
    detail: `死神是大阿尔卡那的第 13 张牌，象征结束、转化、消亡、断舍离与周期的更替。它常常让人害怕，因为它直接指向“失去”。但在塔罗中，死神并不只是灾难的象征，它更像一种冷峻而清醒的规律：凡是有开始的东西，都会有结束；凡是已经枯萎的东西，都无法靠执念重新盛开。

这张牌的力量很不温柔。它不像命运之轮那样带着转机的神秘感，也不像倒吊人那样给你一个暂停和重新观看的机会。死神更像一把镰刀，直接切断那些已经走到尽头的东西。它不问你是否准备好，也不因为你舍不得就停止前进。它代表事物消亡的规律，也代表人在规律面前不得不清醒。

当死神正位出现时，它通常意味着某个周期正在结束。可能是一段关系，一个计划，一种生活方式，一个身份，一种执念，或你对某个人、某件事的期待。这个结束未必突然，也许你早就隐约感觉到了：热情慢慢冷掉，联系慢慢变少，意义慢慢消散，曾经支撑你的东西已经不再能支撑现在的你。

死神也代表情感上的断舍离。它要求你承认：不是所有爱都能继续，不是所有努力都能挽回，不是所有过去都值得被反复携带。有些东西曾经真实地存在过，也真实地重要过，但它已经完成了它在你生命中的部分。继续紧握它，并不会证明它更珍贵，只会让你无法腾出双手接住新的东西。

这张牌的痛苦来自无可奈何。人当然会想挽留，会想回到从前，会想问为什么偏偏是这个结果。但死神的清醒就在于：它不提供漂亮的安慰。它只是把事实放在你面前，让你看见旧世界已经开始崩塌。你可以哭，可以不舍，可以缓慢地告别，但你不能假装它还像过去一样活着。

然而，死神并不是终点。它的结束是为了转化。土地上的旧叶腐烂之后，会成为新的养分；一个旧身份死去之后，人才可能长出新的自己。死神真正带来的不是空无，而是把不再有生命力的东西清理出去，让新的阶段有空间发生。它残酷，但也诚实；它带走，但也清空。

当死神逆位出现时，它提醒你留意对结束的抗拒。你可能明明知道某段关系、某种状态或某个幻想已经结束，却仍然试图把它维持成原来的样子。你可能不是没有看见真相，而是不愿承认真相。于是旧痛苦反复回来，旧模式反复上演，人生像被卡在一扇早该关上的门前。

死神逆位也可能表示你害怕改变。即使现在的状态已经不舒服、不健康、不再有希望，你仍然因为害怕未知而不敢离开。它提醒你：熟悉的痛苦也是痛苦，不能因为它熟悉，就把它误认为安全。

死神的核心信息是：结束不是失败，而是周期完成之后必然发生的清理。你需要清醒地承认消亡，也需要有勇气完成告别。那些不再属于你的东西会离开，而你也会在失去之后，慢慢成为下一个阶段的自己。`,
    translations: {
      en: {
        name: 'Death',
        keywords: ['Ending', 'Transformation', 'Letting Go', 'Dissolution', 'Release', 'Clarity', 'Rebirth', 'Cycle Change'],
        daily_upright:
          'Today is good for saying goodbye to what no longer fits and clearing things away. Endings may not feel easy, but some doors must close before a new path can appear.',
        daily_reversed:
          'Today asks you to watch for resistance to endings. If you already know something must be released, holding on will only prolong the pain.',
        reading_upright: `Death upright represents the end of a cycle, the passing of an old form, emotional release, and unavoidable transformation. Something has reached its limit, and it may be impossible to return it to what it once was.

In a spread, Death asks you to accept the law of endings. It does not necessarily mean literal death, but can mark the end of a relationship, identity, state, attachment, habit, or phase. What matters is not forcing the old life to remain, but recognizing that some things have completed their work.`,
        reading_reversed: `Death reversed represents refusal to end, fear of change, delay in letting go, or being trapped by the past. You may already sense that something no longer belongs to you, yet keep holding it out of fear, grief, or reluctance.

In a spread, it reminds you that what hurts most is often not the ending itself, but knowing it is already over and refusing to admit it.`,
        detail: `Death is card 13 of the Major Arcana. It symbolizes endings, transformation, dissolution, release, and the turning of cycles. It frightens people because it points directly toward loss. Yet in Tarot, Death is not only disaster. It is a severe and lucid law: what begins must eventually end, and what has already withered cannot be restored by attachment.

This card is not gentle. It does not carry the mystery of Wheel of Fortune, nor the pause and reconsideration of The Hanged Man. Death is more like a blade cutting away what has reached its limit. It does not ask whether you feel ready.

Upright, it often signals that a cycle is ending: a relationship, a plan, a lifestyle, an identity, an attachment, or an expectation. It may not feel sudden. You may already have sensed the fading: the warmth cooling, the meaning thinning, the old support no longer holding your present self.

Death also speaks of emotional decluttering. It asks you to admit that not all love can continue, not every effort can save what is finished, and not every piece of the past should be carried forever. Holding tighter does not prove value; it only stops your hands from receiving what comes next.

Its pain lies in helplessness. Of course people want to keep what mattered. But Death does not offer decorative comfort. It simply places the fact before you: the old world is collapsing. You may grieve and say goodbye slowly, but you cannot pretend the old life is still alive.

Yet Death is not the final stop. Its ending exists to make transformation possible. What decays becomes nourishment. When an old identity dies, a new self can begin to grow. Death does not bring emptiness for its own sake. It clears what has lost life so that a new phase can begin.

Reversed, it points to resisting ending, fearing change, and repeating pain because truth has not been accepted. Familiar suffering is still suffering. The message is that ending is not failure. It is the necessary clearing that follows the completion of a cycle.`,
      },
      it: {
        name: 'La Morte',
        keywords: ['Fine', 'Trasformazione', 'Lasciare andare', 'Dissoluzione', 'Rilascio', 'Chiarezza', 'Rinascita', 'Cambio di ciclo'],
        daily_upright:
          'Oggi e il momento giusto per salutare cio che non ti appartiene piu e fare spazio. Le chiusure non sono leggere, ma alcune porte devono chiudersi prima che una strada nuova possa apparire.',
        daily_reversed:
          'Oggi fai attenzione alla resistenza verso le chiusure. Se sai gia che qualcosa deve essere lasciato andare, continuare a trattenerlo prolunghera soltanto il dolore.',
        reading_upright: `La Morte diritta rappresenta la fine di un ciclo, la scomparsa di una forma vecchia, il distacco emotivo e una trasformazione inevitabile. Qualcosa e arrivato al suo limite e difficilmente puo tornare com’era prima.

In una stesa, La Morte invita ad accettare la legge delle conclusioni. Non parla necessariamente di morte letterale, ma della fine di una relazione, di uno stato, di un’identita, di un attaccamento, di un’abitudine o di una fase. Cio che conta non e trattenere a forza la vecchia vita, ma riconoscere che alcune cose hanno gia finito il loro compito.`,
        reading_reversed: `La Morte rovesciata rappresenta il rifiuto di una fine, la paura del cambiamento, il ritardo nel lasciare andare o l’essere prigionieri del passato. Potresti gia sentire che qualcosa non ti appartiene piu, eppure continuare a trattenerla o trattenerlo per paura, dolore o nostalgia.

In una stesa, ricorda che spesso a ferire di piu non e la fine in se, ma sapere che e gia avvenuta e non volerla ammettere.`,
        detail: `La Morte e la carta numero 13 degli Arcani Maggiori. Simboleggia fine, trasformazione, dissoluzione, distacco e ricambio dei cicli. Fa paura perche punta direttamente alla perdita. Eppure nei Tarocchi non e soltanto una carta di disastro. E una legge severa e lucida: cio che ha un inizio avra una fine, e cio che si e gia seccato non puo essere fatto rifiorire con l’attaccamento.

Questa carta non e delicata. Non ha il mistero della Ruota della Fortuna, ne la sospensione dell’Appeso. La Morte assomiglia piu a una falce che recide cio che e arrivato al termine. Non chiede se ti senti pronta o pronto.

Dritta, segnala spesso la fine di un ciclo: una relazione, un progetto, uno stile di vita, un’identita, un attaccamento o un’aspettativa. Potrebbe non sembrare improvviso. Forse avvertivi gia da tempo il raffreddarsi del calore, il diradarsi del significato, la perdita di forza di cio che ti sosteneva.

La Morte parla anche di potatura emotiva. Ti chiede di riconoscere che non ogni amore puo continuare, non ogni sforzo puo salvare cio che e finito, e non ogni pezzo del passato va trasportato per sempre. Stringere di piu non rende qualcosa piu preziosa; impedisce soltanto di accogliere cio che viene dopo.

Il suo dolore nasce dall’impotenza. E naturale voler trattenere cio che e stato importante. Ma la Morte non offre consolazioni decorate. Mette davanti a te il fatto: il vecchio mondo sta crollando. Puoi piangere, salutare lentamente, soffrire, ma non puoi fingere che il passato sia ancora vivo.

Eppure la Morte non e il capolinea. La sua fine serve a rendere possibile la trasformazione. Cio che marcisce diventa nutrimento. Quando una vecchia identita muore, puo cominciare a crescere un nuovo te. La Morte non crea vuoto per il gusto del vuoto: libera spazio da cio che non ha piu vita.

Rovesciata, indica resistenza alla fine, paura del cambiamento e dolore che si ripete perche la verita non e stata accettata. Un dolore familiare resta comunque dolore. Il suo messaggio e che la fine non e un fallimento: e la pulizia necessaria che segue il compimento di un ciclo.`,
      },
    },
  }),
  createMeaningCard({
    id: 'temperance',
    number: 14,
    name_cn: '节制',
    name_en: 'Temperance',
    keywords: ['平衡', '调和', '耐心', '疗愈', '整合', '节奏', '适度', '准备启航'],
    daily_upright:
      '今天适合调整节奏，别急着冲向下一站。你拥有启航的能力，但此刻先把内在和现实调到更平衡的位置。',
    daily_reversed:
      '今天要小心失衡、急躁或过度消耗。别在还没调整好状态时强行出发，也别让情绪把节奏打乱。',
    reading_upright: `节制正位代表平衡、调和、耐心与整合。它说明你正在进入一个需要慢慢调整的阶段，不适合极端行动，也不适合急于得到结果。此时真正重要的，是把不同的情绪、资源、关系和选择调和到一个更稳定的位置。

在牌阵中出现时，节制提醒你：你并不是没有行动能力，而是需要先找到合适的节奏。牌面中的天使一脚踏在水中，一脚站在陆地上，像是同时连接内在感受与现实世界。你拥有随时启航的可能，但此刻选择停留，是为了让自己更完整、更清醒地出发。`,
    reading_reversed: `节制逆位代表失衡、急躁、过度、节奏混乱，或无法调和内在与外在的冲突。你可能在两个极端之间摇摆：一会儿想立刻行动，一会儿又完全停下；一会儿过度付出，一会儿彻底抽离。

在牌阵中出现时，节制逆位提醒你先检查自己的状态是否已经被打乱。你可能太急着抵达结果，以至于忽略了身体、情绪和现实条件的承受能力。它也可能表示关系或计划中缺少协调，彼此无法找到合适的比例。此时需要重新调整节奏，而不是继续用失衡的方式推进。`,
    detail: `节制是大阿尔卡那的第 14 张牌，象征平衡、调和、耐心、疗愈与整合。它出现在死神之后，因此带着一种很特别的气质：在经历结束、失去和清理之后，生命不能立刻冲向新的阶段，而需要先重新调整自己的比例。像把两种不同温度的水慢慢混合，直到它们变成可以承受的温度。

牌面中的天使通常一脚站在陆地上，一脚踏入水中。陆地象征现实、身体、行动和可见的生活；水象征情绪、潜意识、感受和内在流动。天使手中把水从一个杯子倒向另一个杯子，像是在进行一种细致的炼金术：不是消灭矛盾，而是让不同的东西慢慢找到可以共存的方式。

这张牌的重点不是停滞，而是调和。它并不是说你没有能力前进，也不是说你必须永远留在原地。相反，节制常常表示你已经具备启航的条件，只是此刻更重要的不是马上出发，而是确认自己是否已经准备好以稳定的状态出发。它有一种“我可以走，但我选择先稳住自己”的成熟。

当节制正位出现时，它通常意味着你需要耐心、适度和节奏感。也许事情正在恢复，也许关系正在缓和，也许某个计划还需要一点时间整理。此时过度用力反而会破坏平衡。节制提醒你，不要用极端的方式处理问题：不要全有全无，不要忽冷忽热，不要因为急于证明自己就打乱内在秩序。

节制也常常代表疗愈。死神带来结束，节制则负责在结束之后慢慢修复。它不像星星那样直接带来希望的光，也不像太阳那样明亮展开，它更像一段安静的恢复期。你可能还没有完全好起来，但你正在慢慢把破碎的部分接回去。杯与杯之间流动的水，像是在告诉你：生命可以重新被混合，痛苦可以被稀释，失衡可以被调回中间。

在关系中，节制代表沟通、磨合与互相适应。它不是强烈的激情，而是一种能长期相处的温度。两个人需要找到合适的距离、节奏和表达方式。太近会窒息，太远会冷掉；太急会破坏，太慢会错过。节制关心的正是这个“刚刚好”。

在事业或现实事务中，节制代表资源整合、计划调整和逐步推进。它提醒你把不同条件协调起来：理想与现实，速度与质量，野心与承受力，个人欲望与外部环境。它不是让你放弃目标，而是让你用更稳定的方法接近目标。

当节制逆位出现时，它提醒你留意失衡。你可能在某件事上过度投入，导致身体疲惫、情绪混乱，或关系失去弹性。也可能是你太急着进入下一阶段，没有给自己足够的恢复和整理时间。此时，强行启航未必会更快抵达，反而可能因为船身还没修好就在途中漏水。

节制逆位也可能表示无法整合。你的内在想要一种东西，现实要求另一种东西；你的理智告诉你该冷静，情绪却已经泛滥。它提醒你不要急着选边站，而是先看见两边各自需要什么。真正的平衡不是把一边压下去，而是找到能让两边都被安置的位置。

节制的核心信息是：真正成熟的前进，不是永远向前冲，而是知道什么时候该调慢、该修复、该让不同的部分重新融合。你拥有启航的能力，但此刻的停留不是软弱，而是在为下一次出发调好风、调好水，也调好自己。`,
    translations: {
      en: {
        name: 'Temperance',
        keywords: ['Balance', 'Harmony', 'Patience', 'Healing', 'Integration', 'Rhythm', 'Moderation', 'Preparing to Set Sail'],
        daily_upright:
          'Today is good for adjusting your pace. You may be ready to set out, but first bring inner life and outer reality into better balance.',
        daily_reversed:
          'Today asks you to watch for imbalance, impatience, or overexertion. Do not force yourself forward before your state is ready, and do not let emotion tear apart your rhythm.',
        reading_upright: `Temperance upright represents balance, harmony, patience, and integration. You are entering a phase that asks for gradual adjustment rather than extreme action or rushed results.

In a spread, Temperance reminds you that the issue is not lack of ability, but the need for the right pace. You may already be able to set sail, yet remaining still for now helps you leave in a fuller and clearer state.`,
        reading_reversed: `Temperance reversed represents imbalance, impatience, excess, confused pacing, or difficulty reconciling inner and outer conflict. You may swing between extremes or push ahead before your body, emotions, and circumstances can support it.

In a spread, it asks you to restore proportion rather than continue advancing through imbalance.`,
        detail: `Temperance is card 14 of the Major Arcana. It symbolizes balance, harmony, patience, healing, and integration. Coming after Death, it carries a special mood: after an ending, life cannot simply rush into the next stage. It needs first to recalibrate, like mixing two waters of different temperatures until they become bearable together.

The angel on the card stands with one foot on land and one in water. Land symbolizes reality, action, the body, and visible life; water symbolizes feeling, the subconscious, and inner flow. The act of pouring from one cup to another becomes a quiet alchemy. The point is not to erase difference, but to let unlike things find a way to coexist.

Temperance does not really mean stagnation. It means adjustment. It does not say you cannot move, nor that you must remain where you are forever. Quite often it means you already possess the ability to depart, but that what matters now is not speed. It is whether you can leave from a place of steadiness.

Upright, Temperance asks for patience, proportion, and rhythm. It may describe healing, reconciliation, preparation, or a plan still settling into shape. Too much force now can break what balance is trying to form.

It also often represents healing after rupture. Not dramatic light, but slow repair. Cups pour into one another as though saying that pain can be diluted, life can be remixed, and imbalance can be brought back toward center.

In relationships, Temperance speaks of communication, adaptation, and finding the right distance and temperature between two people. In work, it points to coordination, pacing, and the skill of bringing different conditions into useful relation.

Reversed, it warns of imbalance, overdoing, and trying to move into the next stage before inner and outer conditions are truly ready. It can also point to difficulty integrating conflicting needs. Its core message is that mature movement is not constant acceleration, but knowing when to slow down, restore, and blend yourself back together before departure.`,
      },
      it: {
        name: 'Temperanza',
        keywords: ['Equilibrio', 'Armonia', 'Pazienza', 'Guarigione', 'Integrazione', 'Ritmo', 'Moderazione', 'Prepararsi a salpare'],
        daily_upright:
          'Oggi e il momento giusto per regolare il tuo ritmo. Hai la capacita di partire, ma prima porta il mondo interiore e la realta in un punto di equilibrio migliore.',
        daily_reversed:
          'Oggi fai attenzione a squilibrio, fretta o eccessivo consumo di energie. Non forzare la partenza se non hai ancora ritrovato il tuo centro.',
        reading_upright: `Temperanza diritta rappresenta equilibrio, armonia, pazienza e integrazione. Stai entrando in una fase che richiede aggiustamenti graduali piu che azioni estreme o risultati immediati.

In una stesa, Temperanza ricorda che il problema non e la mancanza di capacita, ma il bisogno di un ritmo giusto. Potresti gia essere in grado di salpare, ma restare ferma o fermo ora ti permette di partire in modo piu pieno e lucido.`,
        reading_reversed: `Temperanza rovesciata rappresenta squilibrio, impazienza, eccesso, ritmo confuso o difficolta nel riconciliare conflitti interiori ed esteriori. Potresti oscillare tra estremi o spingerti avanti prima che corpo, emozioni e circostanze possano sostenerti.

In una stesa, chiede di ristabilire le proporzioni invece di continuare ad avanzare in modo sbilanciato.`,
        detail: `Temperanza e la carta numero 14 degli Arcani Maggiori. Simboleggia equilibrio, armonia, pazienza, guarigione e integrazione. Apparendo dopo la Morte, porta con se un’atmosfera particolare: dopo una fine, la vita non puo correre subito oltre. Deve prima riequilibrare le proprie proporzioni, come acqua di temperature diverse che viene lentamente mescolata.

L’angelo della carta ha un piede sulla terra e uno nell’acqua. La terra simboleggia realta, azione, corpo e vita visibile; l’acqua emozione, subconscio e flusso interiore. Il travasare da un calice all’altro e una piccola alchimia. Non si tratta di cancellare le differenze, ma di farle convivere.

Temperanza non significa davvero stallo. Significa aggiustamento. Non dice che non puoi muoverti, ne che devi restare ferma o fermo per sempre. Spesso indica che la capacita di partire esiste gia, ma che ora conta meno la velocita e piu la qualita della preparazione.

Dritta, chiede pazienza, misura e ritmo. Può descrivere guarigione, riconciliazione, preparazione o un progetto che sta ancora cercando la propria forma. Troppa forza adesso potrebbe rompere il fragile equilibrio che si sta creando.

Parla spesso anche di guarigione dopo una rottura. Non di una luce abbagliante, ma di una riparazione lenta. I calici che si versano l’uno nell’altro suggeriscono che il dolore puo essere diluito e la vita puo essere rimescolata.

Nelle relazioni parla di comunicazione, adattamento e della giusta distanza tra due persone. Nel lavoro indica coordinamento, ritmo e la capacita di mettere in relazione condizioni diverse.

Rovesciata, avverte di squilibrio, eccesso e del rischio di entrare nella fase successiva prima che il dentro e il fuori siano davvero pronti. Il suo messaggio centrale e che il vero avanzamento maturo non e correre sempre, ma sapere quando rallentare, riparare e ricomporre te stessa o te stesso prima di partire.`,
      },
    },
  }),
  createMeaningCard({
    id: 'the-devil',
    number: 15,
    name_cn: '恶魔',
    name_en: 'The Devil',
    keywords: ['欲望', '束缚', '诱惑', '契约', '成瘾', '代价', '控制', '物质利益', '野心'],
    daily_upright:
      '今天要小心被欲望和利益牵着走。某个机会也许很诱人，但先看清它背后需要你付出什么代价。',
    daily_reversed:
      '今天适合看清束缚自己的东西，并尝试松开它。你未必真的被困住，有些锁链只是因为习惯和恐惧才一直没有解开。',
    reading_upright: `恶魔正位代表欲望、诱惑、束缚、成瘾与带有代价的交换。它说明你可能正在被某种强烈的欲望驱动：金钱、权力、身体欲望、成功、控制感、关系依赖，或某种明知不健康却难以摆脱的东西。

在牌阵中出现时，恶魔提醒你看清眼前的“契约”。它不一定只代表坏事，也可能表示事业上的升职、业绩提升、资源获取、名利增长，甚至某种现实意义上的成功。但问题在于：你需要拿什么来换？是时间、身体、自由、睡眠、情绪，还是对自我的掌控权？恶魔的重点不是机会不存在，而是机会背后的代价必须被看见。`,
    reading_reversed: `恶魔逆位代表脱离束缚、看清诱惑、解除不健康的依赖，或开始拒绝某种有毒的交换。你可能终于意识到，某个让你上瘾、让你沉迷、让你不断付出的东西，并没有真正让你自由。

在牌阵中出现时，恶魔逆位提醒你重新拿回选择权。你也许正在从一段关系、一种工作模式、一种欲望循环，或某个“我必须这样才能得到想要的东西”的信念中醒来。它也可能表示你正在尝试打破成瘾、离开控制，或不再愿意为了短期利益继续出卖自己的长期状态。`,
    detail: `恶魔是大阿尔卡那的第 15 张牌，象征欲望、诱惑、束缚、成瘾、控制，以及带有代价的交换。它不是简单的邪恶之牌，而是一张非常现实的牌：人会被想要的东西吸引，也会因为想要而签下一些并不完全自由的契约。

牌面中，恶魔通常高坐在上方，下面有一男一女被锁链束缚。他们看起来像是被囚禁，但锁链往往并没有紧到完全无法挣脱。这是恶魔最微妙的地方：很多束缚并不是彻底不可逃离，而是人已经习惯了它，甚至从中获得了某种好处。于是离开变得困难，因为那不只是离开痛苦，也是在离开一部分欲望带来的满足。

恶魔代表欲望的驱动。它可以是金钱、权力、性、名声、控制感、胜负心，也可以是关系中的占有、依赖和拉扯。欲望本身并不一定是坏的，它让人行动，让人争取，让人想要更多。但当欲望不再被人掌控，而是反过来掌控人时，恶魔就出现了。你以为自己在追求某个目标，实际上可能正在被那个目标牵着走。

在事业中，恶魔常常表现得非常具体。它可能代表升职、业绩增长、高薪机会、资源交换、进入更有权力的位置。表面上看，这是现实意义上的成功：你得到更多钱、更高职位、更强影响力，也获得了被看见的机会。但恶魔会问你：这份成功的附加条款是什么？你是不是要用长期加班、熬夜、焦虑、健康损耗、私人生活崩塌，甚至价值观妥协来交换？

所以恶魔并不一定说“不要签约”。它更像是在把契约摊开，让你看见小字部分。它提醒你，世界上有些东西确实能给你想要的结果，但它们不会免费。你需要清楚自己正在交换什么，也需要知道这份交换是否仍然值得。如果你清醒地选择，并且能承担代价，那是一种现实判断；如果你假装没有代价，那就是被恶魔牵着走。

在关系中，恶魔可能代表强烈吸引、欲望纠缠、依赖、控制、嫉妒或无法放手的关系。它不是恋人牌里那种互相看见、互相理解的连接，而是一种更黏、更暗、更难挣脱的绑定。你可能明知这段关系让自己痛苦，却仍然无法离开，因为里面有你渴望的东西：被需要、被占有、被刺激，或被某种强烈情绪证明自己还活着。

当恶魔正位出现时，它通常意味着你需要看清自己被什么驱动。你想要的东西是什么？你为了得到它愿意牺牲什么？你是真的在选择，还是已经失去了拒绝的能力？这张牌最尖锐的地方在于，它不允许人用高尚的理由掩盖欲望。它要求你诚实承认：我想要，我沉迷，我害怕失去，我正在被某种东西控制。

当恶魔逆位出现时，它代表看清束缚之后的松动。你可能开始意识到，自己并非完全无路可走。那条锁链也许没有你以为的那么牢，只是你太久没有尝试摘下它。恶魔逆位常常意味着脱离成瘾、打破控制、拒绝不健康的交换，或从某种欲望循环中醒来。

但恶魔逆位的解放并不总是轻松。离开一个长期依赖的东西，会带来空虚、不安，甚至短暂的失重感。你可能会怀疑：没有这份工作、这段关系、这套成功标准、这种刺激，我还剩下什么？但这也正是恶魔逆位的真正意义：当你不再靠锁链定义自己，你才会重新发现自己的自由。

恶魔的核心信息是：欲望会给你力量，也会给你锁链。你可以追求成功、金钱、爱和满足，但必须看清每一份契约背后的代价。真正危险的不是欲望本身，而是你明明已经被束缚，却还以为那就是自由。`,
    translations: {
      en: {
        name: 'The Devil',
        keywords: ['Desire', 'Bondage', 'Temptation', 'Contract', 'Addiction', 'Cost', 'Control', 'Material Gain', 'Ambition'],
        daily_upright:
          'Today asks you to watch how desire and gain may be pulling you. An opportunity may look attractive, but first notice the price it requires.',
        daily_reversed:
          'Today is good for seeing clearly what binds you and beginning to loosen it. Some chains stay in place only because habit and fear keep them there.',
        reading_upright: `The Devil upright represents desire, temptation, bondage, addiction, and exchanges that come with a price. You may be driven by money, power, bodily desire, success, control, dependence, or something unhealthy that still feels hard to leave.

In a spread, The Devil asks you to look clearly at the contract in front of you. It may not always represent obvious evil. It can also point to success, promotion, resources, or gains that cost time, health, freedom, sleep, peace, or self-command.`,
        reading_reversed: `The Devil reversed represents loosening bondage, seeing temptation clearly, breaking unhealthy dependence, or refusing a toxic exchange. You may finally realize that something addictive or consuming has not made you free.

In a spread, it asks you to take back your power to choose, whether in relationship, work, desire, or the belief that you must sacrifice yourself to get what you want.`,
        detail: `The Devil is card 15 of the Major Arcana. It symbolizes desire, temptation, bondage, addiction, control, and exchange with a price. It is not simply a card of evil. It is a deeply realistic card about how human beings are drawn toward what they want and what they are willing to trade in order to obtain it.

The chains on the card are important because they are often not absolute. That is the subtle horror of The Devil: some forms of bondage continue not because escape is impossible, but because the bond still offers pleasure, identity, status, stimulation, or comfort.

Desire itself is not automatically wrong. It can give momentum, ambition, and vividness to life. The danger begins when desire no longer serves you, and instead you begin serving it.

In work, this may show up as promotion, performance, salary, influence, or status purchased at the cost of health, sleep, private life, peace, or integrity. In relationship, it can appear as attraction mixed with control, dependency, jealousy, obsession, or a tie that hurts but still feels impossible to leave.

Upright, The Devil demands honesty: what do you want, what are you paying, and are you still choosing freely? Reversed, it marks the beginning of release. The chain may not be as fixed as you believed, but freedom can feel strange when your old identity depended on the bond.

Its core message is that desire can give you energy, but it can also bind you. The real danger is not wanting, but forgetting the cost of what you have agreed to serve.`,
      },
      it: {
        name: 'Il Diavolo',
        keywords: ['Desiderio', 'Vincolo', 'Tentazione', 'Patto', 'Dipendenza', 'Prezzo', 'Controllo', 'Guadagno materiale', 'Ambizione'],
        daily_upright:
          'Oggi fai attenzione al modo in cui desiderio e vantaggio possono trascinarti. Un’opportunita puo sembrare molto attraente, ma prima guarda il prezzo che richiede.',
        daily_reversed:
          'Oggi e utile vedere con chiarezza cio che ti tiene legata o legato e iniziare ad allentarlo. Alcune catene restano solo per abitudine e paura.',
        reading_upright: `Il Diavolo diritto rappresenta desiderio, tentazione, vincolo, dipendenza e scambi che hanno un prezzo. Potresti essere spinta o spinto da denaro, potere, successo, controllo, dipendenza o da qualcosa che sai gia essere nocivo.

In una stesa, il Diavolo ti chiede di guardare bene il contratto che hai davanti. Non sempre parla di male evidente. Puo anche indicare successo, promozione, risorse o guadagni ottenuti al prezzo di tempo, salute, liberta, sonno, pace o padronanza di te.`,
        reading_reversed: `Il Diavolo rovesciato rappresenta l’allentarsi del vincolo, la tentazione vista con lucidita e il rifiuto di uno scambio tossico. Potresti renderti conto che qualcosa di coinvolgente o assorbente non ti ha mai reso davvero libera o libero.

In una stesa, ti chiede di riprendere il potere di scegliere, in relazione, nel lavoro, nel desiderio o nell’idea che tu debba sacrificarti per ottenere cio che vuoi.`,
        detail: `Il Diavolo e la carta numero 15 degli Arcani Maggiori. Simboleggia desiderio, tentazione, vincolo, dipendenza, controllo e scambio con un prezzo. Non e semplicemente una carta del male. E una carta molto concreta su cio che gli esseri umani desiderano e su cio che sono disposti a dare in cambio.

Le catene della carta sono importanti proprio perche spesso non sono assolute. E qui che il Diavolo diventa inquietante: certi vincoli non continuano perche sia impossibile fuggire, ma perche continuano a offrire piacere, identita, status, stimolo o conforto.

Il desiderio di per se non e sempre sbagliato. Può dare spinta, ambizione e intensita alla vita. Il pericolo comincia quando il desiderio smette di servirti e sei tu a servire lui.

Nel lavoro, puo mostrarsi come promozione, risultati, stipendio, influenza o status comprati al prezzo di salute, sonno, vita privata, pace o integrita. Nelle relazioni, puo apparire come attrazione mescolata a controllo, dipendenza, gelosia, ossessione o a un legame che fa male ma da cui sembra impossibile uscire.

Dritto, il Diavolo pretende onesta: che cosa vuoi, che cosa stai pagando e se stai ancora scegliendo liberamente. Rovesciato, segna l’inizio del rilascio. La catena potrebbe non essere cosi fissa come credevi, ma la liberta puo sembrare strana quando la vecchia identita dipendeva proprio da quel vincolo.

Il suo messaggio centrale e che il desiderio puo darti energia, ma puo anche legarti. Il vero pericolo non e desiderare, ma dimenticare il prezzo di cio che hai accettato di servire.`,
      },
    },
  }),
  createMeaningCard({
    id: 'the-tower',
    number: 16,
    name_cn: '高塔',
    name_en: 'The Tower',
    keywords: ['崩塌', '突变', '冲击', '真相爆发', '危机', '瓦解', '错误依赖', '清醒', '自力更生'],
    daily_upright:
      '今天要小心突发变化或某个真相被突然揭开。看似稳定的东西可能被动摇，但崩塌也会让你看清真正的问题。',
    daily_reversed:
      '今天你可能感觉某个危机正在逼近，并努力阻止它显现。别只想着维持原状，有些裂缝出现，是为了让你脱离错误的依赖。',
    reading_upright: `高塔正位代表突如其来的崩塌、冲击、危机与真相爆发。它说明某个原本看似稳定的结构，可能已经无法继续维持。这个结构可能是一段关系、一个计划、一份工作、一种信念，或你一直以为安全的生活框架。

在牌阵中出现时，高塔提醒你：有些东西不是突然坏掉的，而是早已出现裂缝，只是之前没有被真正看见。高塔的崩塌虽然痛苦，却也带来清醒。它把虚假的安全感击碎，让你无法再继续假装一切正常。此时最重要的不是死守旧建筑，而是在尘埃落定后看清：什么已经不值得重建，什么才是真正可以保留下来的地基。`,
    reading_reversed: `高塔逆位代表被压抑的危机、延迟的崩塌、对变化的抗拒，或某个担忧已久的问题正在地平线上逼近。你可能已经感觉到不对劲，也知道某个结构正在摇晃，却仍然竭尽全力避免它真正爆发。

在牌阵中出现时，高塔逆位提醒你：你正在试图保住的东西，未必真的值得保住。那座塔可能从一开始就建在有缺陷的地基上，它必须倒塌，才能让你看清自己曾经依赖的东西并不稳固。这个过程会痛苦，也会让人感到羞耻、失控或无力，但它带来的谦卑会让你回到更真实的位置。你所依赖的旧结构可能不再存在，而这正是你学习自力更生的开始。`,
    detail: `高塔是大阿尔卡那的第 16 张牌，象征突变、崩塌、危机、真相爆发与虚假结构的瓦解。它是一张非常强烈的牌，像一道雷直接劈向高塔，让原本看似坚固的建筑在瞬间裂开。人从塔中坠落，火光、黑夜和碎石一起出现，所有被勉强维持的秩序都被打破。

高塔的可怕之处在于突然。它不像倒吊人那样给你暂停和思考的时间，也不像死神那样呈现一个逐渐走向终点的周期。高塔更像是某个真相终于压不住了，某个问题终于爆发了，某个长期被忽视的裂缝终于扩大到无法遮掩。它带来的不是温柔的提醒，而是强制性的清醒。

但高塔并不只是灾难。一场突如其来的大火，它真正摧毁的，往往是虚假的稳定。那座塔也许从一开始就建立在不稳的地基上：一段靠忍耐维持的关系，一份靠透支支撑的工作，一个靠自我欺骗维持的信念，一个外表光鲜却内部腐烂的系统。雷电不是凭空制造裂缝，而是让裂缝显现出来。

当高塔正位出现时，它通常意味着某种剧烈变化正在发生，或即将发生。你可能会遇到突发消息、计划失败、关系破裂、工作变动、信念崩塌，或某个一直担心的东西突然爆发。它会让人感到失控，因为你无法再按照原来的方式维持局面。旧结构倒下了，旧解释失效了，旧安全感也不再能保护你。

这张牌的痛苦在于，它让人无法继续装睡。很多时候，高塔发生之前，人其实已经隐约知道哪里不对。只是因为害怕改变、害怕失去，或不愿面对后果，所以一直把问题压下去。高塔出现时，压抑失效，真相冲出来，事情被迫进入清算。

在关系中，高塔可能代表争吵爆发、秘密揭开、关系结构崩塌，或某种长期积累的不满终于失控。在事业中，它可能代表项目突然失败、公司或团队发生变动、原本依赖的计划被推翻。在个人层面，它也可能是信念的坍塌：你突然意识到，自己过去相信的某件事并不成立。

当高塔逆位出现时，它的表现会更内在，也更有预警感。你可能感觉到危机正在地平线上迫近，像远处已经能听见雷声。你知道某些事情不对，知道那座塔正在晃动，于是竭尽全力想要避免它真正倒塌。你想修补，想压住，想维持表面的平静，想让一切看起来仍然可以继续。

但高塔逆位会提醒你：你正在避免的崩塌，也许正是必须发生的清理。有些故障不是为了毁掉你，而是为了打破你对错误事物的依赖。那座塔建在有缺陷的地基上，它必须倒塌，因为继续住在里面才是真正危险的事。崩塌当然会痛苦，会让你失去依靠，也会让你承认自己曾经相信了不该相信的东西。但由此产生的谦卑，反而可能带来某种平静。

高塔逆位也指向自力更生。你所依赖的东西可能不再存在：某个人的保护、某段关系的支撑、某个职位的安全感、某种旧信念，或一个你以为永远不会变的生活结构。不要只把这看成剧烈而令人沮丧的变化。它也可能是在逼你发现：当外部的塔倒下之后，你仍然可以站在废墟之上，重新建立自己的支撑。

不过，高塔逆位并不总是温和。它有时也代表“延迟的爆炸”：问题没有消失，只是暂时被按住了。如果继续假装无事发生，未来的崩塌可能更严重。此时最重要的是主动处理裂缝，而不是等雷劈下来。你需要诚实地问自己：我现在维护的是安全，还是幻觉？我害怕失去的，是爱与价值，还是一个早已不稳的壳？

高塔的核心信息是：虚假的稳定终会崩塌，真相迟早会冲破外壳。它带来的冲击也许痛苦，但它也把你从错误的建筑里释放出来。真正的问题不是塔倒了，而是你是否还要在废墟上重建同一座塔。`,
    translations: {
      en: {
        name: 'The Tower',
        keywords: ['Collapse', 'Sudden Change', 'Shock', 'Truth Exposed', 'Crisis', 'Breakdown', 'False Dependence', 'Clarity', 'Self-Reliance'],
        daily_upright:
          'Today asks you to watch for sudden change or a truth being abruptly revealed. Something that looked stable may shake, but collapse can also expose the real problem.',
        daily_reversed:
          'Today you may feel a crisis approaching and try to keep it from appearing. Do not focus only on preserving the old shape; some cracks open to free you from false dependence.',
        reading_upright: `The Tower upright represents sudden collapse, shock, crisis, and truth erupting into view. A structure that once seemed stable may no longer be able to stand. That structure could be a relationship, a plan, a job, a belief, or the life framework you once assumed was safe.

In a spread, The Tower reminds you that some things do not break all at once; they have been cracked for a long time, only not fully seen. The collapse is painful, but it is also clarifying. It smashes false security so that you can no longer pretend everything is fine. What matters now is not clinging to the old building, but seeing what is no longer worth rebuilding and what foundation can still remain.`,
        reading_reversed: `The Tower reversed represents a crisis being suppressed, collapse delayed, resistance to change, or a feared problem drawing closer on the horizon. You may already sense that something is wrong and know that a structure is shaking, yet still be trying with all your strength to keep it from breaking open.

In a spread, The Tower reversed asks whether what you are trying to preserve is truly worth preserving. The tower may have stood on a faulty foundation from the beginning. It has to fall so that you can see that what you relied on was never stable. The process can feel painful, humiliating, out of control, or helpless, but the humility it brings can return you to a more real place. The old structure may no longer exist, and that may be the beginning of learning how to stand on your own.`,
        detail: `The Tower is card 16 of the Major Arcana. It symbolizes sudden change, collapse, crisis, the eruption of truth, and the breakdown of false structures. It is an intense card, like lightning striking a tower and splitting what once looked solid in a single moment. People fall, fire breaks out, the night opens, and the order that was being forced into place can no longer hold.

What makes The Tower frightening is its suddenness. It does not offer the pause of The Hanged Man, nor the gradual ending of Death. It is more like a truth that can no longer be pressed down, a problem that can no longer remain hidden, a crack that has widened until it cannot be disguised. Its message is not gentle warning but enforced awakening.

Yet The Tower is not only disaster. What it truly destroys is false stability. The tower may have been built on an unstable foundation from the start: a relationship maintained through endurance alone, a job held together through depletion, a belief preserved by self-deception, or a system polished on the outside and rotten within. Lightning does not invent the fracture; it reveals it.

Upright, The Tower usually marks dramatic change already happening or about to happen: sudden news, a failed plan, a relationship break, upheaval at work, the collapse of a belief, or the explosion of something long feared. It hurts because it removes the ability to keep managing life in the old way. The old structure falls, the old explanation fails, and the old sense of safety no longer protects you.

Its pain comes from the end of pretending. Long before The Tower strikes, people often already know that something is wrong. They simply keep pressing it down because they fear loss, change, or consequence. When The Tower appears, suppression fails, truth bursts out, and life enters reckoning.

In relationships, it can mean a major fight, exposed secrets, structural collapse, or long-buried dissatisfaction finally breaking open. In work, it can signal a project crashing, a company or team shifting, or a relied-upon plan falling apart. On the personal level, it can be the collapse of a belief: the moment you realize something you once trusted is no longer true.

Reversed, The Tower often feels more internal and more like warning. You can already hear thunder in the distance. You know something is unstable, and you keep trying to patch it, press it down, and preserve the appearance that life can continue as before.

But The Tower reversed reminds you that the collapse you are avoiding may be the clearing that has to happen. Some breakdowns are not here to destroy you but to break your reliance on what was never stable. The tower must fall because continuing to live inside it is the real danger. That collapse is painful, but it can also teach humility and bring you back to ground that is more honest.

The reversed Tower also points toward self-reliance. What you used to depend on may no longer exist: another person's protection, a relationship's support, a job title's safety, an old belief, or a life structure you assumed would never change. Do not see this only as devastating upheaval. It may also be forcing you to discover that after the outer tower falls, you can still stand in the ruins and build your own support.

Still, The Tower reversed is not always softer. Sometimes it is simply a delayed explosion. The problem has not disappeared; it has only been held down for now. If you keep pretending nothing is happening, the future collapse may be worse. The essential question becomes: am I protecting what is real, or only maintaining an illusion? Am I afraid of losing love and value, or only the shell that once seemed safe?

The core message of The Tower is this: false stability will collapse, and truth will eventually break through its shell. The shock may hurt, but it can also release you from the wrong structure. The real question is not whether the tower has fallen, but whether you will rebuild the same tower on the same ruins.`,
      },
      it: {
        name: 'La Torre',
        keywords: ['Crollo', 'Mutamento improvviso', 'Shock', 'Verita che esplode', 'Crisi', 'Disgregazione', 'Dipendenza falsa', 'Chiarezza', 'Autosufficienza'],
        daily_upright:
          'Oggi fai attenzione a un cambiamento improvviso o a una verita che viene svelata all’improvviso. Qualcosa che sembrava stabile puo vacillare, ma il crollo puo anche mostrarti il vero problema.',
        daily_reversed:
          'Oggi potresti sentire una crisi avvicinarsi e cercare di impedirle di manifestarsi. Non pensare solo a mantenere la forma attuale: alcune crepe si aprono per liberarti da dipendenze sbagliate.',
        reading_upright: `La Torre diritta rappresenta crollo improvviso, shock, crisi ed esplosione della verita. Una struttura che sembrava stabile potrebbe non riuscire piu a reggersi. Questa struttura puo essere una relazione, un piano, un lavoro, una convinzione o l'impalcatura di vita che pensavi sicura.

In una stesa, La Torre ricorda che alcune cose non si rompono all'improvviso: erano gia incrinate da tempo, ma non erano state veramente viste. Il crollo e doloroso, ma porta anche lucidita. Spezza il falso senso di sicurezza e non ti permette piu di fingere che tutto vada bene. Cio che conta ora non e difendere l'edificio vecchio, ma capire che cosa non merita piu di essere ricostruito e quale fondamento puo ancora restare.`,
        reading_reversed: `La Torre rovesciata rappresenta una crisi repressa, un crollo rimandato, resistenza al cambiamento o un problema temuto che si avvicina all'orizzonte. Potresti gia sentire che qualcosa non va e sapere che una struttura sta tremando, ma continuare comunque a fare di tutto per evitare che si apra davvero.

In una stesa, La Torre rovesciata ti chiede se cio che stai cercando di salvare meriti davvero di essere salvato. La torre potrebbe essere stata costruita fin dall'inizio su una base difettosa. Deve cadere per mostrarti che cio su cui contavi non era stabile. Il processo puo sembrare doloroso, umiliante, fuori controllo o impotente, ma l'umilta che ne nasce puo riportarti in un luogo piu reale. La vecchia struttura puo non esistere piu, e questo puo essere l'inizio dell'imparare a reggerti da sola o da solo.`,
        detail: `La Torre e la carta numero 16 degli Arcani Maggiori. Simboleggia mutamento improvviso, crollo, crisi, esplosione della verita e disgregazione di strutture false. E una carta intensa, come un fulmine che colpisce una torre e spacca in un istante cio che sembrava solido. Le persone precipitano, il fuoco si accende, la notte si apre, e l'ordine tenuto insieme a forza non puo piu restare in piedi.

Ciò che rende La Torre spaventosa e la sua improvvisita. Non offre la pausa dell'Appeso, ne il ciclo graduale della Morte. E piu simile a una verita che non si puo piu comprimere, a un problema che non puo piu restare nascosto, a una crepa che si e allargata fino a non poter essere mascherata. Il suo messaggio non e un avvertimento gentile, ma un risveglio imposto.

Eppure La Torre non e soltanto catastrofe. Cio che distrugge davvero e la falsa stabilita. La torre potrebbe essere stata costruita fin dall'inizio su fondamenta instabili: una relazione mantenuta solo con sopportazione, un lavoro tenuto insieme dal logoramento, una convinzione sostenuta dall'autoinganno, o un sistema lucido all'esterno e marcio all'interno. Il fulmine non inventa la frattura; la rende visibile.

Diritta, La Torre segna spesso un cambiamento drammatico gia in atto o imminente: una notizia improvvisa, un piano che fallisce, una rottura, uno scossone sul lavoro, il crollo di una convinzione o l'esplosione di qualcosa a lungo temuto. Fa male perche toglie la possibilita di gestire la vita nel modo di prima. La vecchia struttura cade, la vecchia spiegazione non regge, e la vecchia sicurezza non protegge piu.

Il suo dolore nasce dalla fine della finzione. Molto prima che la Torre colpisca, spesso le persone sanno gia che qualcosa non va. Semplicemente continuano a reprimerlo per paura della perdita, del cambiamento o delle conseguenze. Quando La Torre appare, la repressione cede, la verita irrompe e la vita entra nel tempo del conto aperto.

Nelle relazioni puo indicare un litigio esplosivo, segreti rivelati, il crollo della struttura del legame o un malcontento sepolto che non puo piu essere contenuto. Nel lavoro puo indicare un progetto che crolla, un cambiamento nel gruppo o in azienda, o il fallimento del piano su cui contavi. Sul piano personale puo essere il crollo di una convinzione: il momento in cui capisci che qualcosa in cui credevi non regge piu.

Rovesciata, La Torre appare spesso in modo piu interiore e come avvertimento. Il tuono si sente gia in lontananza. Sai che qualcosa e instabile e continui a provare a rattopparlo, comprimerlo e salvare l'apparenza che tutto possa andare avanti com'e.

Ma La Torre rovesciata ricorda che il crollo che stai evitando potrebbe essere proprio la pulizia necessaria. Alcuni guasti non arrivano per distruggerti, ma per rompere la dipendenza da cio che non e mai stato veramente stabile. La torre deve cadere perche continuare a viverci dentro e il vero pericolo. Il crollo e doloroso, ma puo anche insegnare umilta e riportarti a un terreno piu onesto.

La Torre rovesciata parla anche di autosufficienza. Cio da cui dipendevi potrebbe non esistere piu: la protezione di qualcuno, il sostegno di una relazione, la sicurezza di un ruolo, una vecchia convinzione o una struttura di vita che pensavi immutabile. Non guardarlo solo come sconvolgimento devastante. Potrebbe anche costringerti a scoprire che, dopo la caduta della torre esterna, puoi ancora stare in piedi tra le rovine e costruire il tuo sostegno.

Tuttavia La Torre rovesciata non e sempre piu dolce. A volte e semplicemente un'esplosione ritardata. Il problema non e sparito; e stato solo schiacciato per un po'. Se continui a fingere che non stia succedendo nulla, il crollo futuro potrebbe essere peggiore. La domanda essenziale diventa allora: sto proteggendo qualcosa di reale o sto solo mantenendo un'illusione? Ho paura di perdere amore e valore, oppure solo il guscio che un tempo sembrava sicuro?

Il messaggio centrale della Torre e questo: la falsa stabilita crollera, e la verita prima o poi spacchera il proprio involucro. Lo shock puo far male, ma puo anche liberarti dalla struttura sbagliata. La vera domanda non e se la torre sia caduta, ma se intendi ricostruire la stessa torre sulle stesse rovine.`,
      },
    },
  }),
  createMeaningCard({
    id: 'the-star',
    number: 17,
    name_cn: '星星',
    name_en: 'The Star',
    keywords: ['希望', '疗愈', '纯净', '祝福', '信念', '灵感', '指引', '重生后的宁静'],
    daily_upright: '今天适合重新相信希望。即使你刚经历过疲惫或动荡，也会有一点温柔的光提醒你：未来仍然可以变好。',
    daily_reversed: '今天要小心失去信心，或因为过去的伤害而不敢再期待。希望并没有完全消失，只是你暂时看不见它。',
    reading_upright: `星星正位代表希望、疗愈、纯净的心，以及经历考验之后重新出现的信念。它说明你可能已经走过一段混乱、崩塌或失望的时期，现在开始慢慢回到更安静、更清澈的状态。

在牌阵中出现时，星星提醒你相信未来仍有可能。它不是立刻实现愿望的牌，而是一种温柔的指引：你还没有走到终点，但远处已经有光。它也可能象征来自宇宙的祝福、灵感、贵人般的支持，或某种让你重新恢复生命力的东西。此时最重要的是不要放弃希望，也不要因为曾经受伤，就拒绝继续相信。`,
    reading_reversed: `星星逆位代表信心低落、希望感减弱、疗愈受阻，或对未来失去期待。你可能正在经历一种心灵上的干涸：明明知道应该往前走，却很难再相信事情会变好。

在牌阵中出现时，星星逆位提醒你先不要责怪自己不够乐观。经历过高塔式的崩塌之后，人当然可能变得谨慎、疲惫，甚至不敢再许愿。它提示你，疗愈需要时间，希望也需要被重新培养。此时不必强迫自己立刻振作，只要愿意保留一点点微弱的光，就已经是在向未来靠近。`,
    detail: `星星是大阿尔卡那的第 17 张牌，象征希望、疗愈、纯净、信念与来自宇宙的祝福。它紧跟在高塔之后，因此它的希望并不是未经考验的天真，而是在崩塌之后重新出现的光。高塔把虚假的结构击碎，星星则在废墟之后带来一种安静的恢复：你失去了某些东西，但你并没有失去全部；世界裂开之后，天空反而显露出来。

牌面中的女性赤裸地跪在水边，将水倒入池中，也倒向土地。她没有盔甲，没有武器，也没有华丽的遮掩。她的赤裸象征纯净、真实与重新回到本质。经历过动荡之后，人不再需要用坚硬的外壳证明自己。星星让人卸下防备，重新靠近内心最柔软、最诚实的部分。

这张牌的力量很温柔。它不是太阳那种明亮的胜利，也不是战车那种强势的推进。星星更像夜空里安静的光，它不会替你立刻解决所有问题，却会让你知道：黑夜不是永恒的。你仍然可以被指引，仍然可以恢复，仍然可以再次相信生活中有值得期待的东西。

当星星正位出现时，它通常意味着希望正在重新回来。你可能刚经历过失望、动荡、关系破裂、计划失败，或某种精神上的低谷。但星星说明，痛苦之后并不是只剩荒芜。你正在进入一个疗愈期，情绪会慢慢变清，内心会慢慢恢复流动，曾经被打碎的信念也可能以更成熟的方式重新长出来。

星星也代表纯净的心。这里的纯净不是幼稚，而是在经历现实之后仍然没有彻底变得冷硬。它是一种很珍贵的能力：看见过失望，却仍然愿意相信善意；经历过崩塌，却仍然愿意抬头看星空；知道世界并不完美，却仍然不放弃对美好事物的感知。

这张牌也带有灵感和宇宙祝福的意味。星星出现时，常常像是远方有某种力量在回应你。它可能是一段温柔的关系，一个突然出现的机会，一个让你重新燃起创作欲的灵感，也可能只是某个瞬间，你忽然感觉自己没有被世界完全抛下。它不一定轰轰烈烈，却足够让人继续走下去。

在关系中，星星可能代表真诚、疗愈与重新建立信任。它不是强烈的占有，也不是激烈的纠缠，而是一种清澈的陪伴。对方也许无法立刻给你全部答案，但这段关系可能让你感到被理解、被安抚，或重新相信自己值得被温柔对待。

在事业或创作中，星星代表灵感、愿景与长期希望。它不一定表示马上成功，但表示你正在接近一个更适合自己的方向。它鼓励你相信自己的愿望，不要因为短期挫败就否定整条路。星星说的是远方，不是立刻；是信念，不是急功近利。

当星星逆位出现时，它提醒你留意希望感的流失。你可能正在怀疑未来，觉得许愿没有意义，觉得自己已经被现实消耗得太多。你也可能因为过去的创伤而不敢再相信任何祝福，甚至在机会出现时也下意识后退。星星逆位不是说希望不存在，而是说你暂时与希望失去了连接。

此时最重要的不是强迫自己积极，而是允许疗愈慢慢发生。希望不一定一开始就是巨大的光，它可能只是很小的一点：今天愿意起床，愿意洗一杯水，愿意重新写下一句话，愿意相信明天也许没有那么坏。星星逆位提醒你，只要那一点光还在，你就还没有真正与未来断开。

星星的核心信息是：经历过黑夜之后，仍然可以抬头看见光。希望不是幼稚的幻想，而是一种在废墟之后仍愿意继续生活的能力。你被考验过，也仍然可以被祝福；你曾经破碎，也仍然可以重新变得清澈。`,
    translations: {
      en: {
        name: 'The Star',
        keywords: ['Hope', 'Healing', 'Purity', 'Blessing', 'Faith', 'Inspiration', 'Guidance', 'Calm after rebirth'],
        daily_upright:
          'Today is a good day to believe in hope again. Even if you have just come through exhaustion or upheaval, a gentle light can still remind you that the future can improve.',
        daily_reversed:
          'Today, watch for a loss of faith or a reluctance to hope because of past wounds. Hope has not disappeared completely. You just may not be able to see it clearly right now.',
        reading_upright: `The Star upright represents hope, healing, purity of heart, and faith returning after hardship. It suggests that you may already have moved through a period of chaos, collapse, or disappointment and are now slowly coming back to a quieter and clearer state.

In a spread, The Star reminds you that the future is still possible. It is not the card of instant wish fulfillment, but of gentle guidance: you have not reached the end yet, but there is already light in the distance. It can also symbolize a blessing from the universe, inspiration, support that feels almost protective, or something that helps your life force return. What matters now is not giving up on hope and not refusing to believe again just because you were hurt before.`,
        reading_reversed: `The Star reversed represents low confidence, weakened hope, blocked healing, or difficulty expecting anything good from the future. You may be going through a kind of spiritual dryness: you know you should keep moving, but it is hard to believe things will improve.

In a spread, The Star reversed asks you not to blame yourself for failing to stay optimistic. After a Tower-like collapse, people often become cautious, tired, or even afraid to wish for anything at all. This card reminds you that healing takes time, and hope also has to be nurtured again. You do not need to force yourself to recover immediately. Keeping even a faint light alive is already a movement toward the future.`,
        detail: `The Star is card 17 of the Major Arcana. It symbolizes hope, healing, purity, faith, and blessings that feel as if they come from the universe itself. It follows The Tower, which is why its hope is not naive or untouched by reality. It is the light that appears after collapse. The Tower breaks false structures apart, while The Star brings a quiet form of restoration after the ruins: you have lost something, but you have not lost everything; once the world cracks open, the sky becomes visible.

The woman in the card kneels naked beside the water, pouring water into the pool and onto the land. She has no armor, no weapons, and no ornate covering. Her nakedness symbolizes purity, honesty, and a return to what is essential. After upheaval, a person no longer needs to prove strength through hard outer defenses. The Star invites you to lower those defenses and move closer to the softest and most truthful part of yourself.

The power of this card is gentle. It is not the bright triumph of The Sun or the forceful advance of The Chariot. It is more like a quiet light in the night sky. It will not solve everything for you at once, but it tells you that night is not forever. You can still be guided, still recover, and still believe again that life contains things worth longing for.

When The Star appears upright, it usually means hope is beginning to return. You may have just gone through disappointment, upheaval, heartbreak, failure, or a spiritual low point. Yet The Star says that pain is not the end of the landscape. You are entering a healing period. Your emotions can gradually become clearer, your inner life can begin to flow again, and beliefs that were once shattered may grow back in a more mature form.

The Star also represents a pure heart. This purity is not childishness. It is the rare ability to go through reality without becoming completely hardened by it. You may have seen disappointment and still choose to believe in kindness. You may have lived through collapse and still choose to lift your eyes to the stars. You may know the world is imperfect and still refuse to lose your sensitivity to beauty.

This card also carries the meaning of inspiration and blessing. When The Star appears, it often feels as though something in the distance is responding to you. It may be a gentle relationship, an unexpected opportunity, a spark that revives your creative drive, or simply a moment when you suddenly realize that the world has not abandoned you completely. It may not be dramatic, but it is enough to help you keep going.

In relationships, The Star can represent sincerity, healing, and the rebuilding of trust. It is not intense possession or painful entanglement, but a clear and soothing kind of companionship. The other person may not be able to give you every answer right away, but the bond can help you feel understood, comforted, or able to believe again that you deserve tenderness.

In work or creative life, The Star points to inspiration, vision, and long-term hope. It does not necessarily mean immediate success, but it does suggest that you are moving toward a direction that fits you better. It encourages you to trust your wishes and not deny the entire path because of temporary setbacks. The Star speaks of distance rather than instant reward, and of faith rather than short-term gain.

When The Star appears reversed, it asks you to notice the loss of hope. You may be doubting the future, feeling that wishing no longer matters, or thinking reality has worn too much out of you. You may also be so shaped by past wounds that you pull back even when blessings or opportunities appear. The Star reversed does not mean hope no longer exists. It means you are temporarily disconnected from it.

What matters most now is not forcing positivity, but letting healing happen slowly. Hope does not need to begin as a great light. It can be something very small: getting out of bed today, pouring a glass of water, writing one sentence again, or allowing yourself to believe that tomorrow may not be quite as bad. The Star reversed reminds you that if even that small light remains, then you have not truly lost contact with the future.

The core message of The Star is this: after the night, you can still lift your head and see light. Hope is not childish fantasy. It is the ability to keep living after ruins. You have been tested and can still be blessed. You have been broken and can still become clear again.`,
      },
      it: {
        name: 'La Stella',
        keywords: ['Speranza', 'Guarigione', 'Purezza', 'Benedizione', 'Fede', 'Ispirazione', 'Guida', 'Calma dopo la rinascita'],
        daily_upright:
          'Oggi e il momento giusto per tornare a credere nella speranza. Anche se hai appena attraversato stanchezza o sconvolgimento, una luce gentile puo ancora ricordarti che il futuro puo migliorare.',
        daily_reversed:
          'Oggi fai attenzione a una perdita di fiducia o alla paura di sperare di nuovo a causa di ferite passate. La speranza non e sparita del tutto. E solo che per ora potresti non riuscire a vederla chiaramente.',
        reading_upright: `La Stella diritta rappresenta speranza, guarigione, purezza di cuore e il ritorno della fede dopo una prova difficile. Indica che potresti aver gia attraversato un periodo di caos, crollo o delusione e che ora stai tornando lentamente verso uno stato piu quieto e piu limpido.

In una stesa, La Stella ti ricorda che il futuro e ancora possibile. Non e la carta dei desideri che si realizzano immediatamente, ma di una guida gentile: non sei ancora arrivata o arrivato alla fine, ma in lontananza c'e gia una luce. Puo anche simboleggiare una benedizione dell'universo, ispirazione, un sostegno quasi protettivo, o qualcosa che ti aiuta a recuperare vitalita. La cosa piu importante ora e non rinunciare alla speranza e non rifiutarti di credere ancora solo perche sei stata ferita o sei stato ferito.`,
        reading_reversed: `La Stella rovesciata rappresenta fiducia bassa, speranza indebolita, guarigione ostacolata o difficolta a immaginare qualcosa di buono nel futuro. Potresti attraversare una specie di aridita interiore: sai che dovresti andare avanti, ma fai fatica a credere che le cose possano migliorare.

In una stesa, La Stella rovesciata ti chiede di non accusarti per il fatto di non riuscire a restare ottimista. Dopo un crollo simile alla Torre, e naturale diventare cauti, stanchi, o perfino impauriti dall'idea di esprimere un desiderio. Questa carta ricorda che la guarigione richiede tempo e che anche la speranza deve essere coltivata di nuovo. Non hai bisogno di costringerti a riprenderti subito. Conservare anche solo una luce debole significa gia muoverti verso il futuro.`,
        detail: `La Stella e la carta numero 17 degli Arcani Maggiori. Simboleggia speranza, guarigione, purezza, fede e benedizioni che sembrano arrivare direttamente dall'universo. Segue La Torre, e proprio per questo la sua speranza non e ingenua ne separata dalla realta. E la luce che appare dopo il crollo. La Torre spezza le strutture false, mentre La Stella porta una forma silenziosa di ripresa dopo le rovine: hai perso qualcosa, ma non hai perso tutto; quando il mondo si apre e si spezza, il cielo diventa finalmente visibile.

La figura della carta e inginocchiata nuda accanto all'acqua e versa acqua sia nello stagno sia sulla terra. Non ha armatura, non ha armi, non ha coperture solenni. La sua nudita simboleggia purezza, verita e ritorno all'essenziale. Dopo uno sconvolgimento, una persona non ha piu bisogno di dimostrare forza attraverso difese rigide. La Stella ti invita ad abbassare quelle difese e ad avvicinarti di nuovo alla parte piu morbida e piu sincera di te.

La forza di questa carta e gentile. Non e il trionfo luminoso del Sole, ne l'avanzata energica del Carro. E piuttosto una luce tranquilla nel cielo notturno. Non risolvera tutto in un solo istante, ma ti ricorda che la notte non dura per sempre. Puoi ancora essere guidata o guidato, puoi ancora guarire e puoi ancora credere che la vita contenga qualcosa che valga la pena desiderare.

Quando La Stella appare diritta, di solito significa che la speranza sta tornando. Potresti aver appena attraversato delusione, sconvolgimento, una rottura, un fallimento, o un periodo di calo spirituale. Eppure La Stella dice che il dolore non e la fine del paesaggio. Stai entrando in una fase di guarigione. Le emozioni possono diventare piu limpide, la vita interiore puo tornare a fluire, e le convinzioni che erano state spezzate possono ricrescere in una forma piu matura.

La Stella rappresenta anche un cuore puro. Questa purezza non e infantilita. E la rara capacita di passare attraverso la realta senza diventare completamente induriti. Puoi aver visto la delusione e scegliere comunque di credere nella gentilezza. Puoi aver vissuto il crollo e scegliere comunque di alzare lo sguardo alle stelle. Puoi sapere che il mondo e imperfetto e rifiutarti comunque di perdere la sensibilita verso la bellezza.

Questa carta porta anche il significato di ispirazione e benedizione. Quando appare, spesso sembra che qualcosa da lontano ti stia rispondendo. Puo essere una relazione delicata, un'opportunita inattesa, una scintilla che riaccende il desiderio di creare, o semplicemente un momento in cui capisci che il mondo non ti ha abbandonato del tutto. Non deve essere qualcosa di spettacolare. Basta che ti aiuti a continuare.

Nelle relazioni, La Stella puo rappresentare sincerita, guarigione e ricostruzione della fiducia. Non e possesso intenso o intreccio doloroso, ma una compagnia limpida e rasserenante. L'altra persona potrebbe non poterti dare tutte le risposte subito, ma il legame puo aiutarti a sentirti compresa o compreso, consolata o consolato, e a credere di nuovo di meritare tenerezza.

Nel lavoro o nella creativita, La Stella indica ispirazione, visione e speranza di lungo periodo. Non significa necessariamente successo immediato, ma suggerisce che ti stai muovendo verso una direzione piu adatta a te. Ti incoraggia a fidarti dei tuoi desideri e a non negare l'intero cammino per colpa di ostacoli temporanei. La Stella parla di lontananza piu che di ricompensa immediata, e di fede piu che di guadagno rapido.

Quando La Stella appare rovesciata, ti chiede di notare la perdita di speranza. Potresti dubitare del futuro, sentire che desiderare non serve piu, o pensare che la realta ti abbia consumata o consumato troppo. Potresti anche essere cosi segnata o segnato da ferite passate da arretrare perfino quando arrivano benedizioni o opportunita. La Stella rovesciata non significa che la speranza non esista piu. Significa che per ora sei temporaneamente scollegata o scollegato da essa.

La cosa piu importante non e forzare la guarigione con ottimismo artificiale, ma lasciare che la cura avvenga lentamente. La speranza non deve iniziare come una luce enorme. Puo essere qualcosa di molto piccolo: alzarti dal letto oggi, versarti un bicchiere d'acqua, scrivere di nuovo una frase, o permetterti di credere che domani forse non sara cosi duro. La Stella rovesciata ricorda che se rimane anche solo quella piccola luce, allora non hai davvero perso il contatto con il futuro.

Il messaggio centrale della Stella e questo: dopo la notte, puoi ancora alzare la testa e vedere la luce. La speranza non e una fantasia infantile. E la capacita di continuare a vivere dopo le rovine. Sei stata messa alla prova o sei stato messo alla prova, e puoi ancora essere benedetta o benedetto. Ti sei spezzata o spezzato, e puoi ancora tornare limpida o limpido.`,
      },
    },
  }),
  createMeaningCard({
    id: 'the-moon',
    number: 18,
    name_cn: '月亮',
    name_en: 'The Moon',
    keywords: ['迷雾', '恐惧', '幻觉', '潜意识', '想象力', '直觉', '灵感', '隐藏真相', '未知'],
    daily_upright:
      '今天要留意不安、误解或看不清的情况，但也可以相信细微的直觉。别急着相信第一眼看到的东西，让月光慢慢带你穿过迷雾。',
    daily_reversed:
      '今天适合拨开迷雾，面对一直困扰你的恐惧。隐藏的信息可能慢慢显现，你也会开始分清什么是真相，什么只是焦虑制造的影子。',
    reading_upright: `月亮正位代表未知、恐惧、幻觉、潜意识、想象力与直觉。它说明当前局面并不完全透明，你看到的可能只是事情的一部分，甚至可能被情绪、想象、恐惧或他人的隐瞒所扭曲。

在牌阵中出现时，月亮提醒你不要急着下结论。你可能正走在一条看不清尽头的夜路上，前方似乎有危险，也似乎有召唤。此时，你需要分辨：什么是真正的直觉，什么只是过去伤口带来的投射；什么是灵感，什么只是恐惧制造的幻影。月亮的光不够明亮，却仍然能给你一点方向。`,
    reading_reversed: `月亮逆位代表迷雾散去、真相浮现、恐惧被看见，或自欺欺人逐渐结束。你可能终于开始意识到，某些让你不安的东西并不是凭空出现的，也可能发现自己一直被焦虑、幻想或不完整的信息牵着走。

在牌阵中出现时，月亮逆位提醒你面对那些被压进潜意识深处的恐惧。隐藏的力量正在显露，秘密可能被揭开，误解也可能开始澄清。这个过程未必轻松，但它会帮助你把负面的情绪转化为更清醒、更有建设性的力量。`,
    detail: `月亮是大阿尔卡那的第 18 张牌，象征未知、黑暗、恐惧、幻觉、潜意识、想象力与直觉。它出现在星星之后，却不像星星那样带来清澈的希望。星星是夜空中温柔而确定的光，月亮则是变形的光：它照亮世界，也让世界变得暧昧、神秘、难以辨认。

牌面中的月亮悬在夜空之上，地面有狗、狼、道路、水池和从水中爬出的生物。狗与狼像是文明与本能的两端，一个属于被驯化的意识，一个属于原始的野性。水池象征潜意识，从水中爬出的龙虾像是深处的恐惧、记忆、灵感与本能正在浮出水面。远方的道路通向黑暗之中，说明你正在经过一段看不清终点的旅程。

月亮牌最强烈的感受，是对未知和黑暗的恐惧。你不知道前方有什么，也不知道自己所看见的是否可靠。眼前的事物被月光照亮，却并不完全真实。影子被拉长，轮廓被改变，普通的东西也可能变得可怕。此时，外界的模糊与内心的不安会互相放大，让你很难判断自己究竟是在看见危险，还是在被恐惧支配。

但月亮并不只代表恐惧。它也代表想象力、梦境、灵感和来自潜意识的指引。一方面，你的想象力可能正在占据上风，让你在黑暗中看见过度放大的影子；另一方面，想象力也可能成为你的天赋，让你捕捉到理性尚未能解释的信号。月亮的世界不是白日世界，它不靠清晰的逻辑前进，而靠梦、象征、直觉和微弱的感应。

你像牌面中走上道路的小龙虾，从水里爬出，进入一条未知的路。你并不知道路的深处是否潜伏着危险，但你也不能永远留在水中。月亮的光带来的不是完全的确定，而是一种朦胧的清晰。它让你在黑暗里勉强看见轮廓，也让你学会相信那些细微的感觉：某个梦境、某种预感、某个反复出现的念头，或内心深处一直没有被说出口的声音。

当月亮正位出现时，它通常意味着当前局面存在不确定、隐瞒、误解或自我欺骗。你可能没有得到完整信息，也可能有人没有说出全部真相。你现在看到的，可能只是光明的诡计：某些东西看似清楚，其实仍然被阴影遮住。月亮提醒你，必须继续寻找那些尚未被解开的隐藏力量。

但这张牌也提醒你，不要把所有不确定都视为坏事。有些真相本来就不是立刻显现的，有些灵感也只能在黑暗里诞生。白天太明亮，世界太喧哗，反而让人听不见潜意识的声音。月亮出现时，你需要的不是马上冲出去证明什么，而是在迷雾中保持敏锐，让直觉带你一步一步走过这片黑暗。

在关系中，月亮可能代表暧昧、误会、秘密、猜疑或不安全感。你可能感觉对方有什么没有说清，也可能是自己因为害怕受伤而不断脑补最坏结果。在事业或现实事务中，月亮可能表示信息不透明、方向不清、计划含糊，或你暂时无法看见完整局面。但在创作中，月亮也可能是非常强的灵感牌：它让想象力打开，让梦境、图像、隐喻和情绪流动出来。

当月亮逆位出现时，它通常表示迷雾开始散开。隐藏的真相可能逐渐浮现，内心的恐惧也开始被看见。你可能终于意识到，自己一直害怕的东西是什么，也可能发现某个困扰你的问题并没有想象中那么不可名状。月亮逆位不是立刻走出黑暗，而是开始分辨黑暗里到底有什么。

月亮逆位也代表释放。那些深刻的记忆、恐惧和负能量不能永远被压在心底。它们需要被看见，被命名，被转化。只有这样，它们才不会继续以焦虑、猜疑、自欺欺人或噩梦的形式控制你。此时，真相未必温柔，但它比幻觉更值得信任。

月亮的核心信息是：黑暗会放大恐惧，也会孕育灵感。月光会制造幻象，也会给你微弱的方向。你需要谨慎地走过这段路，不急着相信表象，也不急着否定直觉。真正的清醒，不是立刻照亮全部黑夜，而是在迷雾中仍然保持分辨力，让内心深处的声音带你走向隐藏的真相。`,
    translations: {
      en: {
        name: 'The Moon',
        keywords: ['Mist', 'Fear', 'Illusion', 'Subconscious', 'Imagination', 'Intuition', 'Inspiration', 'Hidden Truth', 'Unknown'],
        daily_upright:
          'Today, pay attention to anxiety, misunderstanding, or situations that are hard to read, but also trust subtle intuition. Do not rush to believe what you see at first glance. Let the moonlight guide you slowly through the fog.',
        daily_reversed:
          'Today is a good time to clear the fog and face the fears that have been troubling you. Hidden information may begin to appear, and you may start to distinguish truth from shadows created by anxiety.',
        reading_upright: `The Moon upright represents the unknown, fear, illusion, the subconscious, imagination, and intuition. It suggests that the current situation is not fully transparent. What you see may be only part of the story, and it may even be distorted by emotion, fantasy, fear, or someone else's concealment.

In a spread, The Moon asks you not to rush to conclusions. You may be walking a night road whose end you cannot clearly see. Ahead of you there seems to be both danger and a strange call forward. At this moment, you need to distinguish between true intuition and projection born from old wounds, between inspiration and images created by fear. The light of The Moon is not bright, but it can still offer direction.`,
        reading_reversed: `The Moon reversed represents the fog beginning to clear, truth emerging, fear becoming visible, or self-deception gradually coming to an end. You may finally begin to realize that some of the things disturbing you did not appear from nowhere, or that you have been led around by anxiety, fantasy, or incomplete information.

In a spread, The Moon reversed asks you to face the fears buried deep in the subconscious. Hidden forces are beginning to show themselves. Secrets may be exposed, and misunderstandings may start to clear. The process may not be easy, but it can help you transform negative emotion into something clearer and more constructive.`,
        detail: `The Moon is card 18 of the Major Arcana. It symbolizes the unknown, darkness, fear, illusion, the subconscious, imagination, and intuition. It comes after The Star, yet unlike The Star it does not offer clear hope. The Star is a gentle and certain light in the night sky, while The Moon is a changing light. It illuminates the world, but also makes it ambiguous, mysterious, and difficult to identify.

In the imagery of the card, the moon hangs above the night sky, while below are a dog, a wolf, a road, a pool of water, and a creature climbing out of the water. The dog and the wolf resemble two ends of the human condition: the domesticated mind and primal instinct. The pool represents the subconscious, and the crayfish crawling out of it suggests that deep fears, memories, inspiration, and instinct are rising toward the surface. The road stretches into darkness, showing that you are passing through a journey whose destination is still unclear.

The strongest feeling in The Moon is fear of the unknown and of darkness. You do not know what lies ahead, and you do not know whether what you are seeing can be trusted. Things are lit by moonlight, but not fully revealed. Shadows grow longer, outlines change, and ordinary things can begin to look frightening. In that state, outer uncertainty and inner unease amplify each other, making it hard to tell whether you are perceiving danger or being ruled by fear.

Yet The Moon does not only represent fear. It also represents imagination, dreams, inspiration, and guidance coming from the subconscious. On one hand, imagination may dominate and make you see enlarged shadows in the dark. On the other hand, imagination may be your gift, allowing you to catch signals that reason cannot yet explain. The world of The Moon is not the world of daylight. It does not move forward through clean logic, but through dreams, symbols, intuition, and faint perception.

You are like the small creature on the card leaving the water and entering an unknown path. You do not know whether danger waits deeper along the road, but you also cannot stay in the water forever. The Moon does not give complete certainty. It gives a blurred kind of clarity. It lets you barely make out shapes in the dark, and it teaches you to trust subtle feelings: a dream, a premonition, a recurring thought, or a voice from deep within that has never quite been spoken aloud.

When The Moon appears upright, it usually means the current situation contains uncertainty, concealment, misunderstanding, or self-deception. You may not have complete information, or someone may not be telling the whole truth. What you see now may be a trick of light: something that looks clear but remains partly hidden in shadow. The Moon reminds you to keep searching for the hidden forces that have not yet been fully revealed.

At the same time, this card warns you not to treat all uncertainty as something bad. Some truths are not meant to appear immediately, and some inspiration can only be born in darkness. Daylight can be too bright and the world too loud, drowning out the voice of the subconscious. When The Moon appears, what you need is not to rush out and prove something, but to remain alert in the fog and let intuition lead you one step at a time.

In relationships, The Moon may point to ambiguity, misunderstanding, secrets, suspicion, or insecurity. You may feel that the other person has not said everything clearly, or you may be imagining the worst because you fear being hurt. In work or practical matters, The Moon may indicate unclear information, uncertain direction, a vague plan, or an incomplete view of the whole situation. In creative work, however, The Moon can be a very powerful card of inspiration, opening imagination and letting dreams, images, metaphor, and emotion flow.

When The Moon appears reversed, it often means the fog is beginning to lift. Hidden truth may gradually emerge, and inner fear may start to become visible. You may finally realize what it is you have truly been afraid of, or see that a problem troubling you is not as nameless as it once felt. The Moon reversed is not an instant exit from darkness, but the beginning of knowing what actually lives there.

The Moon reversed also represents release. Deep memories, fear, and negative emotion cannot stay buried forever. They need to be seen, named, and transformed. Only then will they stop controlling you through anxiety, suspicion, self-deception, or nightmares. The truth may not always be gentle, but it is more trustworthy than illusion.

The core message of The Moon is this: darkness magnifies fear, but it also gives birth to inspiration. Moonlight creates illusion, but it also offers a faint direction. You need to walk this path carefully, neither rushing to believe appearances nor rushing to reject intuition. True clarity is not flooding the whole night with light at once. It is keeping your power of discernment in the fog and letting the voice deep inside guide you toward hidden truth.`,
      },
      it: {
        name: 'La Luna',
        keywords: ['Nebbia', 'Paura', 'Illusione', 'Subconscio', 'Immaginazione', 'Intuizione', 'Ispirazione', 'Verita nascosta', 'Ignoto'],
        daily_upright: `Oggi fai attenzione a inquietudine, malintesi o situazioni difficili da leggere, ma puoi anche fidarti di un'intuizione sottile. Non avere fretta di credere a cio che vedi al primo sguardo. Lascia che la luce della luna ti accompagni lentamente attraverso la nebbia.`,
        daily_reversed: `Oggi e un buon momento per diradare la nebbia e affrontare le paure che ti disturbano da tempo. Informazioni nascoste potrebbero emergere poco a poco, e potresti iniziare a distinguere la verita dalle ombre create dall'ansia.`,
        reading_upright: `La Luna diritta rappresenta l'ignoto, la paura, l'illusione, il subconscio, l'immaginazione e l'intuizione. Indica che la situazione attuale non e completamente trasparente. Cio che vedi potrebbe essere solo una parte della storia, e potrebbe perfino essere deformato da emozioni, fantasia, paura o dal silenzio di qualcun altro.

In una stesa, La Luna ti chiede di non affrettare le conclusioni. Potresti camminare su una strada notturna di cui non riesci a vedere bene la fine. Davanti a te sembra esserci sia pericolo sia una chiamata sottile. In questo momento hai bisogno di distinguere tra vera intuizione e proiezione nata da vecchie ferite, tra ispirazione e immagini create dalla paura. La luce della Luna non e intensa, ma puo comunque offrirti una direzione.`,
        reading_reversed: `La Luna rovesciata rappresenta la nebbia che comincia a diradarsi, la verita che emerge, la paura che diventa visibile, o l'autoinganno che lentamente si esaurisce. Potresti finalmente iniziare a capire che alcune cose che ti turbano non sono apparse dal nulla, oppure accorgerti di essere stata guidata o guidato da ansia, fantasia o informazioni incomplete.

In una stesa, La Luna rovesciata ti invita a guardare in faccia le paure sepolte nel subconscio. Le forze nascoste stanno iniziando a mostrarsi. Segreti possono essere svelati, e i malintesi possono cominciare a chiarirsi. Il processo potrebbe non essere facile, ma puo aiutarti a trasformare le emozioni negative in una forza piu lucida e piu costruttiva.`,
        detail: `La Luna e la carta numero 18 degli Arcani Maggiori. Simboleggia l'ignoto, il buio, la paura, l'illusione, il subconscio, l'immaginazione e l'intuizione. Arriva dopo la Stella, ma a differenza della Stella non porta una speranza limpida. La Stella e una luce gentile e certa nel cielo notturno, mentre la Luna e una luce mutevole: illumina il mondo, ma allo stesso tempo lo rende ambiguo, misterioso e difficile da riconoscere con precisione.

Nell'immagine della carta, la luna domina il cielo notturno; sotto di lei compaiono un cane, un lupo, una strada, uno stagno e una creatura che esce dall'acqua. Il cane e il lupo ricordano due estremi dell'esperienza umana: la mente addomesticata e l'istinto primordiale. Lo stagno rappresenta il subconscio, e il gambero che emerge dall'acqua suggerisce che paure profonde, ricordi, ispirazioni e impulsi stanno salendo verso la superficie. La strada prosegue nel buio, mostrando che stai attraversando un percorso di cui non riesci ancora a vedere il termine.

La sensazione piu forte della Luna e la paura dell'ignoto e del buio. Non sai cosa ti aspetta davanti, e non sai se cio che stai vedendo e affidabile. Le cose sono illuminate dal chiarore lunare, ma non sono del tutto rivelate. Le ombre si allungano, i contorni cambiano, e cose ordinarie possono diventare spaventose. In quello stato, l'incertezza esterna e l'inquietudine interiore si amplificano a vicenda, rendendo difficile capire se stai davvero percependo un pericolo oppure se sei dominata o dominato dalla paura.

Eppure La Luna non rappresenta soltanto paura. Rappresenta anche immaginazione, sogni, ispirazione e guida che arrivano dal subconscio. Da una parte, l'immaginazione puo prendere il sopravvento e farti vedere ombre ingigantite nel buio. Dall'altra, l'immaginazione puo anche essere il tuo dono, permettendoti di cogliere segnali che la ragione non sa ancora spiegare. Il mondo della Luna non e il mondo del giorno. Non avanza tramite logica limpida, ma attraverso sogni, simboli, intuizione e percezioni sottili.

Sei come la piccola creatura della carta che esce dall'acqua e si avvia su un sentiero sconosciuto. Non sai se piu avanti ci sara un pericolo, ma non puoi nemmeno restare per sempre nell'acqua. La Luna non offre certezza completa. Offre una chiarezza sfumata. Ti permette di intravedere a fatica i contorni nel buio, e ti insegna a fidarti di sensazioni sottili: un sogno, un presentimento, un pensiero ricorrente, o una voce interiore che non e mai stata del tutto espressa.

Quando La Luna appare diritta, di solito indica che la situazione attuale contiene incertezza, nascondimento, malinteso o autoinganno. Potresti non avere informazioni complete, oppure qualcuno potrebbe non dire tutta la verita. Quello che vedi adesso potrebbe essere un trucco della luce: qualcosa che sembra chiaro ma resta ancora parzialmente coperto dall'ombra. La Luna ti ricorda di continuare a cercare le forze nascoste che non sono ancora state pienamente rivelate.

Allo stesso tempo, questa carta ti avverte di non considerare ogni incertezza come qualcosa di negativo. Alcune verita non sono destinate ad apparire immediatamente, e alcune ispirazioni possono nascere solo nel buio. La luce del giorno puo essere troppo forte, e il mondo troppo rumoroso, fino a coprire la voce del subconscio. Quando appare La Luna, cio di cui hai bisogno non e correre fuori per dimostrare qualcosa, ma restare vigile nella nebbia e lasciare che l'intuizione ti guidi passo dopo passo.

Nelle relazioni, La Luna puo indicare ambiguita, malintesi, segreti, sospetto o insicurezza. Potresti sentire che l'altra persona non ha detto tutto chiaramente, oppure potresti immaginare il peggio per paura di essere ferita o ferito. Nel lavoro o nelle questioni pratiche, La Luna puo indicare informazioni poco trasparenti, direzione incerta, un piano vago o una visione ancora incompleta della situazione. Nella creativita, invece, puo essere una carta molto potente di ispirazione, capace di aprire l'immaginazione e di far fluire sogni, immagini, metafore ed emozioni.

Quando La Luna appare rovesciata, spesso significa che la nebbia comincia a sollevarsi. La verita nascosta puo emergere gradualmente, e la paura interiore puo iniziare a diventare visibile. Potresti finalmente capire di cosa hai davvero avuto paura, oppure vedere che un problema che ti tormentava non era cosi indefinibile come sembrava. La Luna rovesciata non e un'uscita immediata dal buio, ma l'inizio della comprensione di cio che davvero vive li dentro.

La Luna rovesciata rappresenta anche liberazione. Ricordi profondi, paura ed emozioni negative non possono restare sepolti per sempre. Devono essere visti, nominati e trasformati. Solo allora smetteranno di controllarti sotto forma di ansia, sospetto, autoinganno o incubi. La verita potrebbe non essere sempre gentile, ma e piu degna di fiducia dell'illusione.

Il messaggio centrale della Luna e questo: il buio ingrandisce la paura, ma fa nascere anche l'ispirazione. La luce lunare crea illusioni, ma offre anche una direzione sottile. Devi attraversare questo cammino con cautela, senza avere fretta di credere alle apparenze e senza avere fretta di rifiutare l'intuizione. La vera lucidita non consiste nell'illuminare tutta la notte in un solo istante, ma nel conservare discernimento dentro la nebbia e lasciare che la voce piu profonda ti conduca verso la verita nascosta.`,
      },
    },
  }),
  createMeaningCard({
    id: 'the-sun',
    number: 19,
    name_cn: '太阳',
    name_en: 'The Sun',
    keywords: ['快乐', '成功', '纯真', '自信', '富足', '光彩', '生命力', '温暖', '分享'],
    daily_upright: '今天适合自信地站到阳光下。快乐、活力和好运正在靠近，你也会把自己的温暖带给身边的人。',
    daily_reversed: '今天要小心快乐感被削弱，或因为自我怀疑而看不见已有的成果。阳光仍在，只是你可能暂时被阴影挡住了视线。',
    reading_upright: `太阳正位代表成功、快乐、富足、自信与生命力。它说明某件事正在走向明朗，原本模糊或压抑的状态会被光照亮，你也更容易感受到幸福、成就和被支持的力量。

在牌阵中出现时，太阳提醒你接受属于自己的光彩。你可能正在迎来成果、认可、好消息，或一段更轻盈、更坦诚的时期。它也代表纯真与开放：你不需要用复杂的方式证明自己，只要自然地散发能量，就会吸引他人靠近。你的成就不只属于你，也会成为别人眼中的希望和灵感。`,
    reading_reversed: `太阳逆位代表快乐受阻、自信不足、成果延迟，或暂时无法感受到生活中的光。你可能明明已经拥有一些成绩，却仍然不敢相信自己值得被看见；也可能因为疲惫、焦虑或外界压力，而无法真正享受眼前的幸福。

在牌阵中出现时，太阳逆位提醒你重新找回自己的生命力。它并不一定表示失败，而是说明光芒被遮住了。你需要看见自己已经做到的部分，也需要允许自己休息、玩耍、表达和被爱。不要因为短暂的不安，就否定整片阳光。`,
    detail: `太阳是大阿尔卡那的第 19 张牌，象征快乐、成功、富足、纯真、自信与充满生命力的光。它是一张非常明亮的牌，像太阳本身一样，把温暖、力量和活力带给所有有幸感受到它光芒的人。经历了月亮的迷雾与恐惧之后，太阳让世界重新变得清晰：黑夜过去，阴影退开，生命再次露出明亮的轮廓。

牌面中的孩子通常骑在白马上，周围有鲜艳的太阳花，头顶是巨大的太阳。孩子象征纯真、坦率和不被羞耻压抑的生命力；白马象征自然、自由与纯净的前进力量；太阳花则象征丰盛、开放和面向光生长的姿态。整张牌都在表达一种很直接的幸福：不再躲藏，不再猜测，不再害怕被看见。

当太阳正位出现时，它通常意味着成功、好消息、成果显现和自信回归。你可能在事业、关系、创作、学业或个人成长上迎来更明朗的阶段。某些努力终于有了结果，某些压抑终于被释放，某些长期困扰你的问题也开始变得简单、清楚、可以处理。太阳的能量不是隐秘的，它会把事情带到光下，让你看见真实，也让别人看见你。

太阳也代表富足。这里的富足不只是金钱，也包括精力、爱、认可、机会和生活本身的饱满感。它像是在说：你可以享受已经到来的好东西，不必总是担心它会不会立刻消失。快乐不是肤浅，成功也不需要被压低。你可以坦然承认自己的成就，也可以大方接住来自世界的善意。

这张牌还带有很强的分享意味。因为你自己的个人成就，你也可能为他人带来灵感和快乐。人们会被你吸引，是因为他们能看见你身上温暖而美丽的能量。你不只是在发光，也在照亮别人。你可能处在一个可以分享经验、资源、爱意或成果的位置，把自己的品质和收获传递给关心的人。

在关系中，太阳代表坦诚、快乐、亲密和毫不拧巴的表达。它是一种不需要反复猜测的爱：喜欢就是喜欢，靠近就是靠近，温暖就是温暖。它也可能代表孩子、家庭、公开的关系，或一段让人感到被滋养、被鼓励的连接。太阳的关系不是潮湿的纠缠，而是明亮的陪伴。

在事业或创作中，太阳代表被看见、被认可、成果公开和自信表达。你可能进入一个更适合展示自己的阶段。此时不要过度谦缩，也不要害怕自己的光太亮。真正健康的光芒不会夺走别人的位置，它会让更多东西一起生长。

当太阳逆位出现时，它提醒你留意快乐感的削弱。你可能因为焦虑、疲惫、自我怀疑或外部阻碍，暂时感受不到阳光。也许成果还没有完全到来，也许你已经取得一些成绩，却仍然觉得不够好。太阳逆位有时不是没有光，而是你不敢站进光里。

太阳逆位也可能表示过度乐观、只看好的一面，或把快乐表现成一种必须维持的状态。真正的太阳不是强迫自己开心，而是在承认阴影存在之后，仍然愿意靠近温暖。它提醒你：不必永远灿烂，但不要忘记自己仍然拥有发光的能力。

太阳的核心信息是：快乐、成功和光彩可以被坦然接住。你经历过黑夜，也走过迷雾，现在可以重新相信生命的明亮。让自己被阳光照见，也让你的温暖照向那些你在意的人。`,
    translations: {
      en: {
        name: 'The Sun',
        keywords: ['Joy', 'Success', 'Innocence', 'Confidence', 'Abundance', 'Radiance', 'Vitality', 'Warmth', 'Sharing'],
        daily_upright:
          'Today is a good day to stand confidently in the sunlight. Joy, vitality, and good fortune are moving closer, and your warmth can also reach the people around you.',
        daily_reversed:
          'Today, watch for your sense of joy being dimmed, or for self-doubt making you overlook what you have already achieved. The sunlight is still there, but shadows may be blocking your view for now.',
        reading_upright: `The Sun upright represents success, joy, abundance, confidence, and vitality. It suggests that something is becoming clear and open. A state that was once vague or repressed is now being illuminated, and you are more likely to feel happiness, achievement, and the support that surrounds you.

In a spread, The Sun reminds you to accept the light that belongs to you. You may be moving into results, recognition, good news, or a lighter and more honest phase of life. It also represents innocence and openness: you do not need to prove yourself through complexity. If you simply radiate your energy naturally, others will be drawn closer. Your achievements do not belong only to you; they can also become hope and inspiration in the eyes of others.`,
        reading_reversed: `The Sun reversed represents blocked joy, weakened confidence, delayed results, or a temporary inability to feel the light in life. You may already have something to be proud of, yet still hesitate to believe that you deserve to be seen. Or you may be too tired, anxious, or burdened by outside pressure to truly enjoy the happiness in front of you.

In a spread, The Sun reversed asks you to reconnect with your own life force. It does not necessarily mean failure. It means the light is being covered. You need to see what you have already done, and you also need to allow yourself to rest, play, express, and receive love. Do not deny an entire field of sunlight because of a passing shadow.`,
        detail: `The Sun is card 19 of the Major Arcana. It symbolizes joy, success, abundance, innocence, confidence, and a light filled with life force. It is a very bright card. Like the sun itself, it gives warmth, strength, and vitality to all who are fortunate enough to feel its rays. After the fog and fear of The Moon, The Sun makes the world clear again: night passes, shadows retreat, and life reveals its bright outline once more.

The child in the image often rides a white horse, surrounded by vivid sunflowers beneath a great shining sun. The child symbolizes innocence, honesty, and life force that is not suppressed by shame. The white horse symbolizes natural freedom and a pure moving force. The sunflowers symbolize abundance, openness, and a way of growing toward light. The whole card expresses a very direct kind of happiness: no more hiding, no more guessing, no more fear of being seen.

When The Sun appears upright, it usually means success, good news, visible results, and a return of confidence. You may be entering a brighter phase in work, relationships, creativity, study, or personal growth. Some efforts are finally bearing fruit, some repression is finally being released, and some problems that have troubled you for a long time are beginning to feel simpler, clearer, and more manageable. The Sun does not work in secret. It brings things into the light so that you can see what is real, and so that others can see you as well.

The Sun also represents abundance. This abundance is not only material. It includes energy, love, recognition, opportunity, and a sense of fullness in life itself. It is as if the card is saying that you are allowed to enjoy what has already arrived without always fearing that it will disappear at once. Joy is not shallow, and success does not need to be minimized. You can acknowledge your achievements directly, and you can receive the goodwill of the world without shrinking from it.

This card also carries a strong meaning of sharing. Through your own personal success, you may also bring inspiration and joy to other people. Others are drawn to you because they can see warm and beautiful energy in you. You are not only shining; you are also helping to illuminate others. You may be in a position to share experience, resources, affection, or results, passing your qualities and your harvest to the people you care about.

In relationships, The Sun represents honesty, happiness, closeness, and expression without unnecessary complication. It is a kind of love that does not need endless guessing: liking is liking, closeness is closeness, warmth is warmth. It can also point to children, family, a public relationship, or a bond that feels nourishing and encouraging. The Sun is not a damp entanglement. It is bright companionship.

In work or creativity, The Sun represents being seen, being recognized, public results, and confident expression. You may be entering a stage that is more suitable for showing yourself openly. At this moment, do not shrink too much and do not fear that your light is too bright. Healthy radiance does not steal someone else's place. It helps more things grow.

When The Sun appears reversed, it asks you to notice a weakening of joy. You may be too anxious, too tired, too doubtful of yourself, or too blocked by outer conditions to feel the sunlight fully. Perhaps the results have not completely arrived yet, or perhaps you already have some achievements and still feel that they are not enough. Sometimes The Sun reversed does not mean the absence of light. It means you are afraid to step into it.

The Sun reversed can also point to excessive optimism, seeing only the pleasant side, or treating happiness as something that must always be performed. The true Sun is not forcing yourself to be cheerful. It is being willing to move toward warmth even after acknowledging that shadows exist. It reminds you that you do not have to be brilliant all the time, but you should not forget that you still have the ability to shine.

The core message of The Sun is this: joy, success, and radiance can be received without shame. You have lived through night and passed through fog, and now you can believe again in the brightness of life. Let yourself be seen in sunlight, and let your warmth reach the people who matter to you.`,
      },
      it: {
        name: 'Il Sole',
        keywords: ['Gioia', 'Successo', 'Innocenza', 'Fiducia', 'Abbondanza', 'Splendore', 'Vitalita', 'Calore', 'Condivisione'],
        daily_upright: `Oggi e il momento giusto per stare con fiducia sotto il sole. Gioia, vitalita e buona sorte si stanno avvicinando, e anche il tuo calore raggiungera le persone che ti sono vicine.`,
        daily_reversed: `Oggi fai attenzione a un indebolimento della gioia, o al fatto che il dubbio verso te stessa o te stesso ti impedisca di vedere i risultati che hai gia ottenuto. Il sole c'e ancora, ma potresti avere per ora lo sguardo coperto da un'ombra.`,
        reading_upright: `Il Sole diritto rappresenta successo, gioia, abbondanza, fiducia e vitalita. Indica che qualcosa sta diventando chiaro e luminoso. Uno stato che prima era vago o represso viene ora illuminato, e tu puoi percepire piu facilmente felicita, realizzazione e il sostegno che ti circonda.

In una stesa, Il Sole ti ricorda di accogliere la luce che ti appartiene. Potresti entrare in una fase di risultati, riconoscimento, buone notizie o maggiore leggerezza e sincerita. Rappresenta anche innocenza e apertura: non hai bisogno di dimostrare il tuo valore in modo complicato. Se lasci emergere la tua energia in modo naturale, gli altri si avvicineranno. I tuoi risultati non appartengono solo a te; possono diventare anche speranza e ispirazione per chi ti guarda.`,
        reading_reversed: `Il Sole rovesciato rappresenta gioia ostacolata, fiducia ridotta, risultati rimandati, o una difficolta temporanea nel sentire la luce della vita. Potresti avere gia ottenuto qualcosa di importante, eppure non riuscire ancora a credere di meritare visibilita. Oppure potresti essere troppo stanca o stanco, troppo ansiosa o ansioso, o troppo sotto pressione per goderti davvero la felicita che hai davanti.

In una stesa, Il Sole rovesciato ti chiede di ritrovare la tua forza vitale. Non significa necessariamente fallimento. Significa che la luce e coperta. Hai bisogno di riconoscere cio che hai gia fatto, e anche di permetterti di riposare, giocare, esprimerti e ricevere amore. Non negare un intero campo di sole solo a causa di un'ombra momentanea.`,
        detail: `Il Sole e la carta numero 19 degli Arcani Maggiori. Simboleggia gioia, successo, abbondanza, innocenza, fiducia e una luce piena di forza vitale. E una carta molto luminosa. Proprio come il sole, porta calore, forza ed energia a chi ha la fortuna di sentirne i raggi. Dopo la nebbia e la paura della Luna, il Sole rende di nuovo il mondo chiaro: la notte passa, le ombre si ritirano, e la vita mostra ancora una volta il proprio contorno luminoso.

Nell'immagine della carta, il bambino cavalca spesso un cavallo bianco, circondato da grandi girasoli sotto un sole radioso. Il bambino simboleggia innocenza, franchezza e una vitalita non soffocata dalla vergogna. Il cavallo bianco simboleggia liberta naturale e una forza pura che avanza. I girasoli simboleggiano abbondanza, apertura e la capacita di crescere verso la luce. L'intera carta esprime una felicita molto diretta: non nascondersi piu, non indovinare piu, non avere piu paura di essere visti.

Quando Il Sole appare diritto, di solito indica successo, buone notizie, risultati visibili e ritorno della fiducia. Potresti entrare in una fase piu luminosa nel lavoro, nelle relazioni, nella creativita, nello studio o nella crescita personale. Alcuni sforzi stanno finalmente dando frutto, alcune repressioni si stanno finalmente sciogliendo, e alcuni problemi che ti hanno tormentata o tormentato a lungo iniziano a diventare piu semplici, piu chiari e piu gestibili. L'energia del Sole non lavora in segreto. Porta tutto alla luce, cosi che tu possa vedere cio che e reale e cosi che anche gli altri possano vedere te.

Il Sole rappresenta anche abbondanza. Questa abbondanza non e solo materiale. Comprende energia, amore, riconoscimento, opportunita e un senso di pienezza nella vita stessa. E come se la carta ti dicesse che puoi goderti cio che e gia arrivato senza vivere sempre nella paura che scompaia subito. La gioia non e superficiale, e il successo non ha bisogno di essere sminuito. Puoi riconoscere apertamente i tuoi risultati, e puoi accogliere la benevolenza del mondo senza tirarti indietro.

Questa carta porta anche un forte significato di condivisione. Attraverso i tuoi risultati personali, puoi offrire ispirazione e gioia anche agli altri. Le persone sono attratte da te perche vedono in te un'energia calda e bella. Tu non stai solo brillando; stai anche illuminando gli altri. Potresti trovarti in una posizione in cui puoi condividere esperienza, risorse, affetto o risultati, trasmettendo le tue qualita e il tuo raccolto alle persone a cui tieni.

Nelle relazioni, Il Sole rappresenta sincerita, felicita, vicinanza ed espressione senza complicazioni inutili. E un tipo di amore che non richiede continui dubbi: piacere vuol dire piacere, vicinanza vuol dire vicinanza, calore vuol dire calore. Puo anche indicare bambini, famiglia, una relazione vissuta alla luce del sole, o un legame che nutre e incoraggia. Il Sole non e un intreccio umido e soffocante. E una compagnia luminosa.

Nel lavoro o nella creativita, Il Sole rappresenta essere visti, essere riconosciuti, rendere pubblici i risultati ed esprimersi con fiducia. Potresti entrare in una fase piu adatta a mostrarti apertamente. In questo momento, non restringerti troppo e non temere che la tua luce sia eccessiva. Una luce sana non ruba il posto a nessuno. Aiuta piu cose a crescere.

Quando Il Sole appare rovesciato, ti chiede di notare un indebolimento della gioia. Potresti essere troppo ansiosa o ansioso, troppo stanca o stanco, troppo piena o pieno di dubbi, o troppo ostacolata o ostacolato dalle condizioni esterne per sentire pienamente la luce. Forse i risultati non sono ancora arrivati del tutto, o forse ne hai gia alcuni e continui comunque a pensare che non bastino. A volte Il Sole rovesciato non significa assenza di luce. Significa paura di entrarci davvero.

Il Sole rovesciato puo anche indicare ottimismo eccessivo, il vedere solo il lato piacevole, o il trasformare la felicita in una recita da mantenere sempre. Il vero Sole non e costringerti a essere allegra o allegro. E la disponibilita ad avvicinarti al calore anche dopo aver riconosciuto che le ombre esistono. Ti ricorda che non devi essere splendente in ogni momento, ma non devi dimenticare di avere ancora la capacita di brillare.

Il messaggio centrale del Sole e questo: gioia, successo e splendore possono essere accolti senza vergogna. Hai attraversato la notte e superato la nebbia, e ora puoi tornare a credere nella luminosita della vita. Lasciati vedere alla luce del sole, e lascia che il tuo calore raggiunga le persone che contano per te.`,
      },
    },
  }),
  createMeaningCard({
    id: 'judgement',
    number: 20,
    name_cn: '审判',
    name_en: 'Judgement',
    keywords: ['审视', '觉醒', '清算', '反省', '成果', '召唤', '重生', '阶段总结', '因果回响'],
    daily_upright: '今天适合回顾过去的选择和成果。你会更清楚自己走到了哪里，也会看见下一步该如何成长。',
    daily_reversed: '今天要小心逃避反省，或因为害怕面对结果而停在原地。真正阻碍你的，可能不是过去本身，而是不愿承认过去带来的答案。',
    reading_upright: `审判正位代表自我反省、阶段性总结、成果显现与精神上的觉醒。它说明某个周期正在进入结算时刻，你需要回头审视自己过去的选择、努力、错误和收获。

在牌阵中出现时，审判提醒你：一分耕耘，一分收获。你现在所处的位置并非凭空出现，而是由过去的行动、选择和经验共同推到这里。此时不是为了责备自己，而是为了更清晰、客观地看见现实：你已经完成了什么，还欠缺什么，又需要如何进入下一个阶段。`,
    reading_reversed: `审判逆位代表逃避反省、害怕结果、自我否定，或迟迟无法回应内心的召唤。你可能已经知道某个阶段应该结束，也隐约知道自己需要改变，但仍然因为恐惧、内疚或不甘心而不愿真正面对。

在牌阵中出现时，审判逆位提醒你不要一直停留在旧错误里。反省不是为了把自己钉在过去，而是为了看清下一步。它也可能表示你还没有准备好接受某个结果，或总是在等待外界替你给出答案。此时，你需要重新听见内心的声音：你到底被什么召唤？你是否愿意从旧身份中醒来？`,
    detail: `审判是大阿尔卡那的第 20 张牌，象征觉醒、反省、清算、召唤与重生。它不像正义那样强调外部规则和冷静裁决，也不像命运之轮那样强调不可控的转折。审判更像一个周期结束时响起的号角：你必须回头看，必须总结，必须承认自己已经走到某个阶段的尽头。

牌面中，天使吹响号角，人们从棺木中醒来，抬头回应来自上方的召唤。这个画面并不只是“被审判”，更像是一次从沉睡中苏醒。过去被埋下的东西重新浮现，曾经做出的选择开始产生回响，而人也终于有机会看清自己真正的位置。

审判的核心是自我反省。它要求你不再模糊地生活，不再把一切归因于运气、他人或环境，而是认真看见：我做过什么？我逃避过什么？我真正努力过什么？我从哪些失败中学到了东西？又有哪些问题反复出现，说明我仍然没有完成成长？

当审判正位出现时，它通常意味着某个阶段正在进入总结和评估。可能是一段关系走到需要定论的时候，一份工作或学业迎来成果检验，一个长期计划终于看见结果，或你对自己的人生方向产生更清醒的认识。它有一种“一分耕耘，一分收获”的意味：过去的投入不会完全消失，过去的忽视也不会完全没有代价。

但审判并不是为了惩罚人。它真正的意义是让人变得清醒。通过自我反省，你才能更客观地了解自己现在所处的位置：哪些能力已经长出来，哪些旧问题仍然存在，哪些关系值得继续，哪些身份已经不再适合你。审判给你的不是温柔的幻觉，而是一次严肃的照见。

这张牌也代表召唤。你可能会感觉到，内心有某个声音在提醒你：不能再继续像过去一样生活了。它可能召唤你换一个方向，承担一个责任，结束一段拖延，承认一个事实，或开始真正回应自己的人生任务。这个召唤不一定轻松，因为它要求你离开旧的麻木状态。

在关系中，审判可能代表关系进入评估期。两个人过去如何相处，彼此是否真正成长，关系是否还有继续的意义，都会变得更清楚。它也可能代表旧人旧事重新出现，让你重新审视曾经的决定。在事业中，审判可能代表考核、面试、项目复盘、升迁评估、成果结算，或你终于意识到自己真正适合的道路。

当审判逆位出现时，它提醒你留意对结果的逃避。你可能害怕面对过去的错误，也可能不愿承认某些努力并没有得到理想回报。你也可能一直在自我审判，把反省变成苛责，把成长变成惩罚。这样反而会让你困在过去，无法真正进入新的阶段。

审判逆位也可能表示你没有回应内心的召唤。你听见了那个声音，却装作没有听见；你知道自己该改变，却继续拖延；你知道某个周期已经结束，却仍然留在旧身份里。此时，最重要的不是等待别人来判定你的人生，而是自己承认：我已经看见了，我需要行动。

审判的核心信息是：过去不会凭空消失，它会以成果、经验、代价和觉醒的形式回到你面前。真正的反省不是为了惩罚自己，而是为了看清现在的位置，并更清醒地走向下一阶段。号角已经响起，你需要从旧周期中醒来。`,
    translations: {
      en: {
        name: 'Judgement',
        keywords: ['Review', 'Awakening', 'Reckoning', 'Reflection', 'Results', 'Calling', 'Rebirth', 'Stage Summary', 'Echo of Cause and Effect'],
        daily_upright:
          'Today is a good time to review your past choices and results. You can see more clearly where you have arrived and how you need to grow next.',
        daily_reversed:
          'Today, watch for avoiding reflection, or staying still because you are afraid to face the outcome. What is really blocking you may not be the past itself, but your refusal to acknowledge what the past has already shown you.',
        reading_upright: `Judgement upright represents self-reflection, the summary of a life stage, visible results, and spiritual awakening. It suggests that a cycle is entering a moment of reckoning, and you need to look back at your past choices, efforts, mistakes, and gains.

In a spread, Judgement reminds you that effort brings consequence. The place where you stand now did not appear out of nowhere. It was created by your past actions, decisions, and experiences. This is not a time to blame yourself, but a time to see reality more clearly and more objectively: what you have already completed, what is still lacking, and how you need to move into the next stage.`,
        reading_reversed: `Judgement reversed represents avoiding reflection, fearing the result, self-denial, or being unable to respond to an inner calling. You may already know that a certain phase should end, and you may sense that change is necessary, yet still refuse to face it because of fear, guilt, or reluctance.

In a spread, Judgement reversed asks you not to remain trapped in old mistakes. Reflection is not for nailing yourself to the past, but for seeing the next step clearly. It can also mean that you are not yet ready to accept a certain result, or that you keep waiting for the outside world to answer for you. At this moment, you need to hear the inner voice again: what is calling you, and are you willing to wake up from the old identity?`,
        detail: `Judgement is card 20 of the Major Arcana. It symbolizes awakening, reflection, reckoning, calling, and rebirth. It is not like Justice, which emphasizes external rules and calm verdicts, and it is not like the Wheel of Fortune, which emphasizes uncontrollable turns. Judgement is more like a trumpet sounding at the end of a cycle: you have to look back, you have to take stock, and you have to admit that you have reached the end of a certain phase.

In the image, an angel sounds a trumpet while people rise from their coffins and lift their heads toward a call from above. This scene is not only about being judged. It is more like waking from sleep. What was buried in the past begins to rise again, choices once made begin to echo, and a person finally has a chance to see their true position clearly.

The core of Judgement is self-reflection. It asks you to stop living vaguely, to stop blaming everything on luck, other people, or circumstances, and to honestly ask: what have I done, what have I avoided, where have I truly worked, what have I learned from failure, and which problems keep repeating because growth is still unfinished?

When Judgement appears upright, it usually means a phase is entering summary and evaluation. A relationship may be reaching the point where it needs a conclusion. Work or study may be arriving at a moment when results are tested. A long-term plan may finally be showing its outcome. Or you may be gaining a clearer understanding of your direction in life. There is a strong sense here that effort brings harvest, and neglect also has its cost.

But Judgement is not here to punish. Its real meaning is clarity. Through self-reflection, you can understand more objectively where you stand now: which abilities have grown, which old problems still remain, which relationships deserve continuation, and which identities no longer fit who you are. Judgement does not give you a comforting illusion. It gives you a serious mirror.

This card also represents a calling. You may feel that an inner voice is reminding you that you cannot keep living as before. It may call you to change direction, take responsibility, end a long delay, admit a fact, or finally answer the deeper task of your life. This calling is not always easy, because it asks you to leave behind the numbness of the old state.

In relationships, Judgement can represent a period of evaluation. How two people have treated each other, whether growth has actually happened, and whether the relationship still has meaning can all become clearer. It can also represent old people or old events returning so that you can review past choices. In work, Judgement can point to review, interviews, project retrospectives, promotion evaluation, or the settling of results. It can also indicate that you are finally recognizing the path that truly suits you.

When Judgement appears reversed, it asks you to notice avoidance of outcomes. You may be afraid to face past mistakes, or unwilling to admit that certain efforts did not lead to the result you wanted. You may also be judging yourself so harshly that reflection turns into punishment and growth turns into self-condemnation. That only traps you in the past and prevents you from entering a new stage.

Judgement reversed can also mean that you are not responding to the inner call. You hear the voice but pretend not to hear it. You know you need to change, yet you keep delaying. You know a cycle has ended, but you still remain inside the old identity. In such a moment, the important thing is not waiting for someone else to judge your life, but admitting it yourself: I have seen it, and I need to act.

The core message of Judgement is this: the past does not vanish for free. It returns in the form of results, experience, cost, and awakening. True reflection is not about punishing yourself. It is about understanding where you stand now and walking more consciously into the next stage. The trumpet has already sounded. You need to wake up from the old cycle.`,
      },
      it: {
        name: 'Il Giudizio',
        keywords: ['Esame', 'Risveglio', 'Resa dei conti', 'Riflessione', 'Risultati', 'Chiamata', 'Rinascita', 'Bilancio di fase', 'Eco di causa ed effetto'],
        daily_upright: `Oggi e un buon momento per ripensare alle scelte e ai risultati del passato. Vedrai con piu chiarezza dove sei arrivata o arrivato, e capirai meglio come crescere nel passo successivo.`,
        daily_reversed: `Oggi fai attenzione all'evitare la riflessione, o al restare ferma o fermo per paura di affrontare il risultato. Cio che ti blocca davvero potrebbe non essere il passato in se, ma il rifiuto di riconoscere cio che il passato ti ha gia mostrato.`,
        reading_upright: `Il Giudizio diritto rappresenta autoriflessione, bilancio di una fase, risultati che emergono e risveglio spirituale. Indica che un ciclo sta entrando in un momento di resa dei conti, e che hai bisogno di guardare indietro alle tue scelte, ai tuoi sforzi, ai tuoi errori e ai tuoi guadagni.

In una stesa, Il Giudizio ti ricorda che ogni semina porta un raccolto. Il punto in cui ti trovi ora non e apparso dal nulla. E stato costruito dalle tue azioni, decisioni ed esperienze passate. Questo non e un momento per accusarti, ma per vedere la realta con piu chiarezza e piu obiettivita: che cosa hai gia completato, che cosa manca ancora, e come devi entrare nella fase successiva.`,
        reading_reversed: `Il Giudizio rovesciato rappresenta fuga dalla riflessione, paura del risultato, negazione di se, o incapacita di rispondere a una chiamata interiore. Potresti gia sapere che una certa fase dovrebbe finire, e potresti intuire che il cambiamento e necessario, ma continuare a non affrontarlo davvero per paura, senso di colpa o riluttanza.

In una stesa, Il Giudizio rovesciato ti chiede di non restare bloccata o bloccato negli errori del passato. Riflettere non significa inchiodarsi al passato, ma vedere con chiarezza il passo successivo. Puo anche indicare che non sei ancora pronta o pronto ad accettare un certo risultato, o che continui ad aspettare che il mondo esterno risponda al posto tuo. In questo momento hai bisogno di ascoltare di nuovo la voce interiore: che cosa ti sta chiamando, e sei disposta o disposto a risvegliarti dalla vecchia identita?`,
        detail: `Il Giudizio e la carta numero 20 degli Arcani Maggiori. Simboleggia risveglio, riflessione, resa dei conti, chiamata e rinascita. Non e come la Giustizia, che sottolinea le regole esterne e il verdetto calmo, e non e come la Ruota della Fortuna, che sottolinea le svolte incontrollabili. Il Giudizio somiglia piuttosto a una tromba che risuona alla fine di un ciclo: devi voltarti indietro, devi fare il bilancio, e devi ammettere di essere arrivata o arrivato alla fine di una certa fase.

Nell'immagine, un angelo suona la tromba mentre le persone si alzano dai sepolcri e sollevano il volto verso la chiamata che viene dall'alto. Questa scena non parla soltanto di essere giudicati. E piuttosto un risveglio da un lungo sonno. Cio che era stato sepolto nel passato torna a emergere, le scelte fatte in altri momenti iniziano a produrre eco, e una persona ha finalmente l'occasione di vedere con chiarezza la propria posizione reale.

Il nucleo del Giudizio e l'autoriflessione. Ti chiede di smettere di vivere in modo vago, di smettere di attribuire tutto alla fortuna, agli altri o alle circostanze, e di domandarti con sincerita: che cosa ho fatto, che cosa ho evitato, dove ho davvero messo impegno, che cosa ho imparato dai fallimenti, e quali problemi continuano a tornare perche la crescita non e ancora stata completata?

Quando Il Giudizio appare diritto, di solito significa che una fase sta entrando nel momento del riepilogo e della valutazione. Una relazione puo essere arrivata al punto in cui serve una conclusione. Il lavoro o lo studio possono entrare in una fase di verifica dei risultati. Un progetto di lungo periodo puo finalmente mostrare il proprio esito. Oppure potresti ottenere una comprensione piu limpida della tua direzione di vita. In questa carta c'e una forte idea: a ogni sforzo corrisponde un raccolto, e anche la trascuratezza ha un costo.

Ma Il Giudizio non arriva per punire. Il suo vero significato e la lucidita. Attraverso l'autoriflessione puoi capire con piu obiettivita dove ti trovi adesso: quali capacita sono cresciute, quali vecchi problemi restano, quali relazioni meritano di continuare, e quali identita non ti appartengono piu. Il Giudizio non ti offre un'illusione consolante. Ti offre uno specchio serio.

Questa carta rappresenta anche una chiamata. Potresti sentire che una voce interiore ti ricorda che non puoi piu continuare a vivere come prima. Potrebbe chiamarti a cambiare direzione, ad assumerti una responsabilita, a concludere un rinvio, ad ammettere un fatto, o a rispondere finalmente al compito piu profondo della tua vita. Questa chiamata non e sempre facile, perche ti chiede di lasciare lo stato di torpore del passato.

Nelle relazioni, Il Giudizio puo rappresentare un periodo di valutazione. Diventa piu chiaro come due persone si sono trattate, se c'e stata vera crescita, e se il legame ha ancora significato. Puo anche indicare il ritorno di persone o eventi del passato, cosi da permetterti di rivedere vecchie decisioni. Nel lavoro, Il Giudizio puo indicare verifiche, colloqui, revisioni di progetto, valutazioni per avanzamenti, o il momento in cui i risultati vengono messi sul tavolo. Puo anche indicare che stai finalmente riconoscendo il cammino che ti si addice davvero.

Quando Il Giudizio appare rovesciato, ti invita a notare la fuga dalle conseguenze. Potresti avere paura di guardare in faccia gli errori del passato, o non voler ammettere che certi sforzi non hanno portato al risultato desiderato. Potresti anche stare giudicando te stessa o te stesso con troppa durezza, trasformando la riflessione in castigo e la crescita in condanna. Questo ti intrappola nel passato e ti impedisce di entrare veramente in una fase nuova.

Il Giudizio rovesciato puo anche significare che non stai rispondendo alla chiamata interiore. Senti la voce, ma fai finta di non sentirla. Sai che devi cambiare, ma continui a rimandare. Sai che un ciclo e finito, ma resti comunque dentro la vecchia identita. In un momento simile, la cosa importante non e aspettare che siano altri a giudicare la tua vita, ma ammetterlo tu stessa o tu stesso: l'ho visto, e devo agire.

Il messaggio centrale del Giudizio e questo: il passato non sparisce senza lasciare traccia. Ritorna sotto forma di risultati, esperienza, costo e risveglio. La vera riflessione non serve a punirti, ma a capire dove ti trovi adesso e ad avanzare con piu coscienza verso la fase successiva. La tromba ha gia suonato. Devi svegliarti dal vecchio ciclo.`,
      },
    },
  }),
  createMeaningCard({
    id: 'the-world',
    number: 21,
    name_cn: '世界',
    name_en: 'The World',
    keywords: ['完成', '圆满', '整合', '抵达', '成就', '毕业', '闭环', '新阶段', '广阔世界'],
    daily_upright: '今天适合确认自己的成果。某个阶段正在走向圆满，你可以为已经完成的部分感到骄傲，也准备好进入更广阔的世界。',
    daily_reversed: '今天要小心临门一脚的停滞，或明明已经接近完成，却仍然不敢真正收尾。别让未完成感困住你，先把这一阶段好好结束。',
    reading_upright: `世界正位代表完成、圆满、整合与阶段性的成功。它说明一段旅程正在抵达终点，过去的努力、经验、失败和成长开始被整合成一个完整的结果。

在牌阵中出现时，世界提醒你：你已经走过了某个重要周期，不再是刚出发时的自己。它可能象征毕业、结项、旅行、搬迁、作品完成、关系进入稳定阶段，或人生进入更成熟、更开阔的位置。世界不是简单的结束，而是完成之后的打开：当一个圆闭合，另一个更大的世界也会向你展开。`,
    reading_reversed: `世界逆位代表未完成、停滞、临门一脚、无法收尾，或虽然已经经历很多，却还没有真正完成整合。你可能接近成功，却在最后一步犹豫；也可能某个周期迟迟无法结束，让你无法顺利进入新的阶段。

在牌阵中出现时，世界逆位提醒你检查哪里还没有闭环。是否还有未完成的任务、未说出口的话、未整理的经验，或某种不愿承认的结束？它并不一定表示失败，而是说明你还需要完成最后的整理。真正的圆满不是事情看起来结束了，而是你内心也承认：这一章可以翻过去了。`,
    detail: `世界是大阿尔卡那的第 21 张牌，也是大阿尔卡那旅程的最后一张牌。它象征完成、圆满、整合、抵达与新阶段的开启。从愚人的出发到世界的完成，这是一整个生命旅程的闭环：一个人经历天真、行动、学习、关系、考验、崩塌、希望、迷雾、光明与审判之后，终于来到一个更完整的位置。

牌面中的人物位于花环之中，像是在一个圆形的门内舞动。花环象征完成的周期，也像一扇通往新世界的门。四角常出现象征四元素或四福音兽的形象，代表不同力量被整合到一个稳定的整体之中。世界牌的重点不是某一方面的成功，而是生命各个部分终于形成一种更完整的秩序。

当世界正位出现时，它通常意味着某个阶段已经完成。你可能终于抵达了一个长期目标：完成学业、结束项目、拿到结果、完成作品、走出旧关系、实现迁移，或在精神上完成一次重要成长。它不是一夜之间的好运，而是漫长过程之后的收束。那些曾经混乱、分散、痛苦、迟疑的经验，终于开始拼成一幅完整的图。

世界牌也代表成就感。它允许你承认自己走了很远，也允许你为自己的努力感到骄傲。你不必把一切都说成侥幸，也不必因为未来还有新的难题，就否定此刻的完成。世界提醒你：阶段性的圆满是值得被庆祝的。一个周期闭合，本身就是很大的事情。

这张牌也有“进入广阔世界”的含义。它可能与旅行、跨地域发展、国际交流、公开展示、作品发布、毕业后的新生活，或从小环境走向大环境有关。世界不是让你停在终点，而是告诉你：你已经完成了这一关，所以可以去到更大的地图。它像游戏里通关后的新周目，也像一扇门打开之后，远处突然显现出更辽阔的道路。

在关系中，世界可能代表关系进入成熟、稳定、完整的阶段。它不是单纯的激情，而是一种经历过考验后仍然能够形成整体的状态。两个人可能终于达成理解，也可能某段关系已经完整地完成了它的使命，无论继续还是告别，都不再是混乱的悬而未决。

在事业和创作中，世界代表完成、发表、验收、成果落地与被更大范围看见。它适合项目收尾、作品上线、考试结束、履历阶段完成，或某个努力终于被放到现实世界中接受回应。它是一张很适合“完成作品”的牌，因为它强调从内部孕育到外部呈现的完整过程。

当世界逆位出现时，它提醒你留意未完成感。你可能已经走了很远，却因为最后一步没有完成，而迟迟无法真正松一口气。也许是项目还差一个收尾，关系还差一个明确答案，内心还差一次真正的告别，或者你明明已经成长了，却还在用旧身份看待自己。

世界逆位也可能表示整合尚未完成。你经历了很多事情，但还没有把它们变成经验和智慧。过去像一堆散落的碎片，虽然已经发生，却还没有被你真正理解。此时需要的不是急着开始下一段，而是回头整理：我从这一阶段学到了什么？我完成了什么？我可以带着什么离开？又有什么应该留在原地？

世界的核心信息是：旅程终会抵达，经验终会闭环。真正的圆满不是没有遗憾，而是你终于能够看见，过去的一切如何把你带到现在。一个世界完成了，而你也因此拥有资格，走向下一个更大的世界。`,
    translations: {
      en: {
        name: 'The World',
        keywords: ['Completion', 'Wholeness', 'Integration', 'Arrival', 'Achievement', 'Graduation', 'Closure', 'New Stage', 'Wider World'],
        daily_upright:
          'Today is a good time to acknowledge your results. A certain stage is moving toward completion. You can feel proud of what has already been finished, and you can also prepare to enter a wider world.',
        daily_reversed:
          'Today, watch for stagnation at the final step, or for being close to completion yet still not daring to truly finish. Do not let the feeling of incompleteness trap you. Close this phase properly first.',
        reading_upright: `The World upright represents completion, fulfillment, integration, and stage-based success. It suggests that a journey is reaching its destination, and that past effort, experience, failure, and growth are beginning to gather into a complete result.

In a spread, The World reminds you that you have already moved through an important cycle and are no longer the person you were at the beginning. It can symbolize graduation, closing a project, travel, relocation, the completion of a work, a relationship entering a stable phase, or life itself opening into a more mature and spacious position. The World is not merely an ending. It is the opening that comes after completion: when one circle closes, a larger world begins to unfold before you.`,
        reading_reversed: `The World reversed represents incompletion, stagnation, being one step away, being unable to finish, or having gone through a great deal without truly integrating it yet. You may be close to success but hesitate at the final step. Or a cycle may be refusing to close, keeping you from entering the next stage smoothly.

In a spread, The World reversed asks you to examine where the loop has not yet closed. Are there tasks left unfinished, words left unsaid, lessons left unorganized, or some ending you still refuse to acknowledge? This does not necessarily mean failure. It means the final layer of completion is still needed. True fulfillment is not only that things look finished from the outside, but that you also admit inwardly that this chapter can be turned.`,
        detail: `The World is card 21 of the Major Arcana, and it is also the final card of the Major Arcana journey. It symbolizes completion, fulfillment, integration, arrival, and the opening of a new stage. From the departure of The Fool to the completion of The World, this is the closing of an entire life cycle: a person passes through innocence, action, learning, relationship, trial, collapse, hope, fog, light, and judgement, and finally arrives at a more complete position.

The figure in the card stands or dances within a wreath, as if inside a circular gate. The wreath symbolizes a completed cycle, and it also resembles a doorway into a new world. At the four corners there are often figures representing the four elements or the four living beings, showing that different forces have been integrated into one stable whole. The focus of The World is not success in only one area, but the way different parts of life finally form a more complete order.

When The World appears upright, it usually means a phase has been completed. You may finally have reached a long-term goal: finishing your studies, ending a project, receiving a result, completing a work, leaving an old relationship behind, moving elsewhere, or completing an important inner growth process. This is not sudden luck. It is the closing movement after a long journey. Experiences that once felt chaotic, scattered, painful, or uncertain are finally beginning to assemble into a whole picture.

The World also represents a sense of accomplishment. It allows you to admit how far you have come, and it allows you to feel proud of your effort. You do not need to reduce everything to luck, and you do not need to deny this moment of completion simply because new difficulties will still come in the future. The World reminds you that stage-based fulfillment deserves celebration. The closing of a cycle is already something substantial.

This card also carries the meaning of entering a wider world. It may relate to travel, working across regions, international exchange, public display, releasing a work, life after graduation, or stepping from a small environment into a bigger one. The World does not tell you to stay at the finish line. It tells you that you have cleared this level, and therefore you can move into a larger map. It is like starting a new round after finishing a game, or like a door opening and suddenly revealing a wider road in the distance.

In relationships, The World can represent a mature, stable, and complete phase. It is not just passion. It is a state that can hold together after being tested. Two people may finally reach understanding, or a relationship may have fully completed its purpose. Whether it continues or ends, it is no longer a suspended and chaotic question.

In work and creativity, The World points to completion, publication, acceptance, results landing in reality, and being seen on a wider scale. It suits project wrap-up, a work going live, the end of an exam period, a phase of your resume being completed, or an effort finally being placed into the real world for response. It is especially fitting for finishing a work, because it emphasizes the complete process from inner gestation to outer presentation.

When The World appears reversed, it asks you to notice the feeling of incompletion. You may already have come very far, but because the final step has not been taken, you still cannot fully exhale. A project may still need its final close, a relationship may still need a clear answer, your heart may still need a real farewell, or you may already have grown and still be looking at yourself through an old identity.

The World reversed can also indicate that integration is not yet finished. You have experienced many things, but they have not yet become wisdom and understood experience. The past may feel like scattered fragments that happened but were never fully processed. What is needed now is not a rush into the next chapter, but a return to gather what this one has taught you: what did I complete, what can I carry forward, and what should remain behind?

The core message of The World is this: journeys do reach their destination, and experience does close into a whole. True fulfillment is not the absence of regret. It is the ability to see how everything in the past brought you here. One world has been completed, and that completion gives you the right to step into a larger one.`,
      },
      it: {
        name: 'Il Mondo',
        keywords: ['Compimento', 'Pienezza', 'Integrazione', 'Arrivo', 'Realizzazione', 'Diploma', 'Chiusura del ciclo', 'Nuova fase', 'Mondo piu ampio'],
        daily_upright:
          'Oggi e un buon momento per riconoscere i tuoi risultati. Una certa fase si sta avvicinando al compimento. Puoi essere orgogliosa o orgoglioso di cio che hai gia concluso, e allo stesso tempo prepararti a entrare in un mondo piu ampio.',
        daily_reversed:
          `Oggi fai attenzione a un blocco proprio all'ultimo passo, o al fatto di essere vicina o vicino alla conclusione senza avere il coraggio di chiudere davvero. Non lasciare che il senso di incompiuto ti trattenga. Concludi bene questa fase prima di tutto.`,
        reading_upright: `Il Mondo diritto rappresenta compimento, pienezza, integrazione e successo di fase. Indica che un viaggio sta arrivando alla sua destinazione e che sforzi, esperienze, fallimenti e crescita del passato stanno iniziando a raccogliersi in un risultato completo.

In una stesa, Il Mondo ti ricorda che hai gia attraversato un ciclo importante e che non sei piu la persona che eri all'inizio. Puo simboleggiare un diploma, la chiusura di un progetto, un viaggio, un trasferimento, il completamento di un'opera, una relazione che entra in una fase stabile, o la vita che si apre verso una posizione piu matura e piu ampia. Il Mondo non e soltanto una fine. E l'apertura che arriva dopo il completamento: quando un cerchio si chiude, un mondo piu grande inizia ad aprirsi davanti a te.`,
        reading_reversed: `Il Mondo rovesciato rappresenta incompiutezza, stasi, l'essere a un passo dal traguardo, l'incapacita di chiudere, oppure l'aver vissuto molto senza aver ancora davvero integrato tutto. Potresti essere vicina o vicino al successo, ma esitare proprio nell'ultimo passo. Oppure un ciclo potrebbe non riuscire a chiudersi, impedendoti di entrare con fluidita nella fase successiva.

In una stesa, Il Mondo rovesciato ti chiede di osservare dove il cerchio non si e ancora chiuso. Ci sono compiti lasciati a meta, parole non dette, esperienze non riordinate, o una fine che ancora non vuoi riconoscere? Questo non significa necessariamente fallimento. Significa che manca ancora l'ultimo strato del compimento. La vera pienezza non e solo il fatto che dall'esterno tutto sembri finito, ma anche il fatto che dentro di te tu possa ammettere che questo capitolo puo essere girato.`,
        detail: `Il Mondo e la carta numero 21 degli Arcani Maggiori ed e anche l'ultima carta del loro viaggio. Simboleggia compimento, pienezza, integrazione, arrivo e l'apertura di una nuova fase. Dalla partenza del Matto al completamento del Mondo, questo e il cerchio che chiude un intero percorso di vita: una persona attraversa innocenza, azione, apprendimento, relazioni, prove, crollo, speranza, nebbia, luce e giudizio, e arriva infine in una posizione piu completa.

La figura della carta si trova o danza all'interno di una ghirlanda, come se fosse dentro una porta circolare. La ghirlanda simboleggia un ciclo compiuto, ma assomiglia anche a un varco verso un mondo nuovo. Ai quattro angoli compaiono spesso figure che rappresentano i quattro elementi o i quattro esseri viventi, a indicare che forze diverse sono state integrate in un insieme stabile. Il centro del Mondo non e il successo in un solo ambito, ma il fatto che le diverse parti della vita siano finalmente entrate in un ordine piu completo.

Quando Il Mondo appare diritto, di solito significa che una fase e stata completata. Potresti aver finalmente raggiunto un obiettivo di lungo periodo: finire gli studi, chiudere un progetto, ricevere un risultato, completare un'opera, uscire da una vecchia relazione, trasferirti, o portare a termine una crescita interiore importante. Non si tratta di fortuna improvvisa. E il movimento di chiusura dopo un lungo percorso. Esperienze che un tempo sembravano caotiche, disperse, dolorose o incerte iniziano finalmente a comporsi in un'immagine intera.

Il Mondo rappresenta anche il senso di realizzazione. Ti permette di riconoscere quanta strada hai fatto, e ti permette di essere fiera o fiero del tuo impegno. Non hai bisogno di ridurre tutto alla fortuna, e non hai bisogno di negare questo momento di compimento solo perche in futuro ci saranno ancora nuove difficolta. Il Mondo ti ricorda che la pienezza di una fase merita di essere celebrata. La chiusura di un ciclo e gia di per se qualcosa di importante.

Questa carta porta anche il significato di entrare in un mondo piu ampio. Puo avere a che fare con viaggi, sviluppo oltre il proprio territorio, scambi internazionali, esposizione pubblica, pubblicazione di un'opera, nuova vita dopo il diploma, o il passaggio da un ambiente piccolo a uno piu grande. Il Mondo non ti dice di restare alla linea d'arrivo. Ti dice che hai superato questo livello, e proprio per questo puoi entrare in una mappa piu vasta. E come iniziare un nuovo giro dopo aver finito un gioco, o come una porta che si apre rivelando all'improvviso una strada piu ampia in lontananza.

Nelle relazioni, Il Mondo puo rappresentare una fase matura, stabile e completa. Non e solo passione. E uno stato che riesce a reggersi dopo essere stato messo alla prova. Due persone possono arrivare finalmente a una comprensione reciproca, oppure una relazione puo aver completato del tutto il proprio compito. Che continui oppure finisca, non resta piu sospesa nel caos.

Nel lavoro e nella creativita, Il Mondo indica completamento, pubblicazione, approvazione, risultati che arrivano nel mondo reale ed essere visti su una scala piu ampia. E adatto alla chiusura di un progetto, all'uscita di un'opera, alla fine di un periodo di esami, al completamento di una fase del proprio percorso, o a uno sforzo che viene finalmente presentato al mondo reale per ricevere risposta. E una carta molto adatta al completamento di un'opera, perche sottolinea l'intero processo che va dalla gestazione interiore alla presentazione esterna.

Quando Il Mondo appare rovesciato, ti chiede di notare il senso di incompiuto. Potresti aver gia percorso molta strada, ma se l'ultimo passo non viene fatto davvero, non riesci ancora a tirare un respiro pieno. Forse un progetto ha ancora bisogno della chiusura finale, una relazione ha ancora bisogno di una risposta chiara, il cuore ha ancora bisogno di un vero saluto, oppure sei gia cresciuta o cresciuto ma continui a guardarti con un'identita vecchia.

Il Mondo rovesciato puo anche indicare che l'integrazione non e ancora compiuta. Hai vissuto molte cose, ma non le hai ancora trasformate in esperienza compresa e in saggezza. Il passato puo sembrare una serie di frammenti sparsi: cose accadute ma mai davvero elaborate. Cio che serve ora non e correre subito verso il capitolo successivo, ma tornare a raccogliere cio che questa fase ti ha insegnato: che cosa ho completato, che cosa posso portare con me, e che cosa deve restare indietro?

Il messaggio centrale del Mondo e questo: i viaggi arrivano davvero a destinazione, e l'esperienza puo chiudersi in un tutto. La vera pienezza non e l'assenza di rimpianti. E la capacita di vedere come tutto cio che e venuto prima ti abbia condotta o condotto fin qui. Un mondo si e completato, e proprio questo compimento ti da il diritto di entrare in uno piu grande.`,
      },
    },
  }),
  createMeaningCard({
    id: 'ace-of-wands',
    number: 1,
    name_cn: '权杖首牌',
    name_en: 'Ace of Wands',
    arcana: 'minor',
    suit: 'wands',
    keywords: ['新开始', '灵感', '行动力', '创造力', '热情', '机会', '生命力', '火种'],
    daily_upright:
      '今天可能出现新的灵感、机会或行动冲动。别轻视这点火苗，它也许会成为你下一段旅程的开始。',
    daily_reversed:
      '今天要小心热情受阻，或明明有想法却迟迟没有行动。火种已经出现，但它需要被点燃，而不是被放在原地冷掉。',
    reading_upright: `权杖首牌正位代表新的开始、灵感降临、行动力苏醒与创造力的火种。它说明某件事正在被点燃，你可能突然有了想做、想试、想表达、想出发的冲动。

在牌阵中出现时，权杖首牌提醒你抓住最初的热情。它不一定表示计划已经成熟，但表示生命力正在回到你身上。此时适合开始新项目、提出新想法、尝试新方向，或把心中一直燃着的小火真正带到现实里。`,
    reading_reversed: `权杖首牌逆位代表灵感受阻、行动力不足、热情熄灭，或机会没有被真正接住。你可能有想法、有欲望，也感到某种新的可能性正在靠近，但却因为犹豫、拖延、疲惫或外部阻碍而无法开始。

在牌阵中出现时，权杖首牌逆位提醒你看清火焰为什么没有燃起来。是你还没有准备好，还是害怕失败？是现实条件不足，还是你把灵感消耗在反复想象里？此时需要保护最初的热情，同时为它找到一个具体的出口。`,
    detail: `权杖首牌是权杖牌组的第一张牌，也是火元素最原初的种子。它象征灵感、热情、行动力、创造欲和新机会的出现。它不是已经完成的成果，也不是稳定成熟的计划，而是一股刚刚冒出来的生命力：突然想开始，突然想表达，突然觉得自己还有力气去做点什么。

牌面中，通常有一只手从云中伸出，握着一根发芽的权杖。云中的手像是命运递来的机会，而权杖上的嫩芽说明这份机会带有生长的可能。它还很年轻，还没有变成树，也没有结出果实，但它已经有了向上生长的力量。

当权杖首牌正位出现时，它通常意味着一段新的行动周期正在开启。你可能会被某个想法点燃，也可能遇到一个让你兴奋的人、项目、工作机会、创作方向或生活计划。这张牌带来的不是安静的思考，而是更直接的冲动：去做，去试，去开始，去让事情发生。

权杖首牌也很适合代表创作和事业上的开端。它可能是一篇文章的第一句话，一个项目的初始概念，一次创业的念头，一次面试机会，一次想要改变生活的冲动。它不保证你立刻成功，但它说明你已经拿到了第一根火柴。接下来重要的是，你要不要把它划亮。

这张牌也与身体里的生命力有关。它可能代表热情回归、欲望苏醒、勇气出现，或一个人重新感到“我想活得更有劲一点”。它的能量是向外的、向上的、带着一点野性和冒险感。它让你从停滞里醒来，让你意识到自己还有创造现实的力量。

但权杖首牌也有不稳定的一面。火种很珍贵，也很容易熄灭。如果只停留在兴奋里，不去行动，它会慢慢变成空想；如果太急着燃烧，又可能在一开始就耗尽。它需要被接住，被保护，也需要一点现实层面的安排。

当权杖首牌逆位出现时，它提醒你留意灵感被堵住的状态。你可能很想开始某件事，却总是被拖延、恐惧、自我怀疑或现实压力拦住。也可能是机会已经出现，但你没有真正伸手接住。此时，你需要问自己：这点火为什么没有燃起来？它缺少燃料，还是我不敢让它变大？

权杖首牌的核心信息是：新的火已经出现。不要急着要求它立刻变成完整的事业、关系或成果，先承认它的存在，给它一个开始的动作。很多宏大的旅程，最初都只是心里那一下“我想试试”的发热。`,
    translations: {
      en: {
        name: 'Ace of Wands',
        keywords: ['new beginning', 'inspiration', 'drive', 'creativity', 'passion', 'opportunity', 'vitality', 'spark'],
        daily_upright:
          'A new spark, opportunity, or impulse to act may appear today. Do not dismiss this small flame. It may become the beginning of your next journey.',
        daily_reversed:
          'Watch out today for blocked passion or ideas that never become action. The spark is already here, but it needs to be lit instead of left to go cold.',
        reading_upright: `The Ace of Wands upright represents a new beginning, arriving inspiration, awakening drive, and the spark of creativity. Something is being lit, and you may suddenly feel the urge to act, try, express yourself, or set out.

In a spread, the Ace of Wands asks you to hold on to your first burst of passion. The plan may not be mature yet, but your life force is returning. This is a good time to begin a new project, propose a new idea, test a new direction, or bring a small inner flame into reality.`,
        reading_reversed: `The Ace of Wands reversed represents blocked inspiration, weak momentum, fading passion, or an opportunity that was never truly taken. You may have ideas and desire, and you may feel a new possibility approaching, but hesitation, delay, fatigue, or outside obstacles are keeping you from starting.

In a spread, the reversed Ace of Wands asks why the fire did not catch. Are you not ready, or are you afraid to fail? Are practical conditions lacking, or have you spent your spark in endless imagining? Protect the first flame, and find a concrete outlet for it.`,
        detail: `The Ace of Wands is the first card of the Wands suit and the most primal seed of fire. It symbolizes inspiration, passion, drive, creative desire, and the appearance of a new opportunity. It is not a finished result or a stable mature plan. It is a pulse of life just beginning to rise: suddenly wanting to start, speak, create, or move.

In the image, a hand usually reaches out from a cloud holding a budding wand. The hand from the cloud feels like an opportunity offered by fate, while the fresh shoots show that this chance carries the power to grow. It is still young. It has not become a tree or borne fruit, but the force of upward growth is already present.

When the Ace of Wands appears upright, it usually means a new cycle of action is opening. You may be lit up by an idea, or encounter a person, project, job opening, creative path, or life plan that excites you. This card does not bring quiet reflection. It brings a direct impulse: do it, try it, begin it, make it happen.

It is also a strong card for creative and professional beginnings. It may be the first sentence of an article, the initial concept of a project, the thought of starting a business, an interview opportunity, or the urge to change your life. It does not promise instant success, but it tells you that you already have the first match. What matters now is whether you will strike it.

This card is also tied to vitality in the body. It can signal returning passion, awakened desire, renewed courage, or the feeling that you want to live with more force again. Its energy moves outward and upward with a wild and adventurous edge. It wakes you out of stagnation and reminds you that you still have the power to create reality.

Yet the Ace of Wands is also unstable. A spark is precious, and it can die easily. If you stay only in excitement without acting, it becomes fantasy. If you rush to burn too hard, it can consume itself at the start. It must be received, protected, and given some practical structure.

When the Ace of Wands appears reversed, it asks you to notice where inspiration has become blocked. You may want to begin something but keep being stopped by delay, fear, self-doubt, or pressure from reality. Or the opportunity may have appeared without you truly reaching out to take it. Ask yourself why the spark did not catch. Is it lacking fuel, or are you afraid to let it grow?

The core message of the Ace of Wands is simple: a new fire has appeared. Do not demand that it instantly become a whole career, relationship, or result. First acknowledge it, then give it one real beginning. Many great journeys start with nothing more than the heat of I want to try.`,
      },
      it: {
        name: 'Asso di Bastoni',
        keywords: ['nuovo inizio', 'ispirazione', 'slancio', 'creativita', 'passione', 'opportunita', 'vitalita', 'scintilla'],
        daily_upright:
          'Oggi puo comparire una nuova scintilla, un’occasione o un impulso ad agire. Non sottovalutare questa piccola fiamma: potrebbe essere l’inizio del tuo prossimo viaggio.',
        daily_reversed:
          'Oggi fai attenzione a una passione bloccata o a idee che non diventano azione. La scintilla c’è gia, ma va accesa invece di lasciarla raffreddare.',
        reading_upright: `L’Asso di Bastoni diritto rappresenta un nuovo inizio, l’arrivo dell’ispirazione, il risveglio dell’azione e la scintilla della creativita. Qualcosa si sta accendendo e potresti sentire improvvisamente il desiderio di fare, provare, esprimerti o partire.

In una stesa, l’Asso di Bastoni ti ricorda di afferrare il primo slancio. Il piano forse non e ancora maturo, ma la tua forza vitale sta tornando. Questo e un buon momento per iniziare un nuovo progetto, proporre una nuova idea, testare una nuova direzione o portare nel reale una piccola fiamma interiore.`,
        reading_reversed: `L’Asso di Bastoni rovesciato rappresenta ispirazione bloccata, poca energia d’azione, passione che si spegne oppure un’opportunita non davvero raccolta. Potresti avere idee e desiderio, e sentire che una nuova possibilita si avvicina, ma esitazione, rinvio, stanchezza o ostacoli esterni ti impediscono di iniziare.

In una stesa, l’Asso di Bastoni rovesciato ti chiede di capire perche il fuoco non si e acceso. Non sei pronta o pronto, oppure temi di fallire? Mancano le condizioni pratiche, oppure hai consumato la scintilla nell’immaginazione ripetuta? Proteggi il primo slancio e trovagli un’uscita concreta.`,
        detail: `L’Asso di Bastoni e la prima carta del seme di Bastoni ed e il seme piu originario dell’elemento fuoco. Simboleggia ispirazione, passione, slancio, desiderio creativo e comparsa di una nuova opportunita. Non e un risultato compiuto, ne un piano stabile e maturo. E una forza vitale che sta appena emergendo: il desiderio improvviso di iniziare, esprimerti, creare o muoverti.

Nell’immagine compare spesso una mano che esce da una nuvola e regge un bastone che germoglia. La mano nella nuvola sembra un’occasione offerta dal destino, mentre i germogli mostrano che questa opportunita ha il potere di crescere. E ancora giovane. Non e diventata un albero e non ha ancora dato frutti, ma la spinta verso l’alto e gia presente.

Quando l’Asso di Bastoni appare diritto, di solito indica l’apertura di un nuovo ciclo d’azione. Potresti essere acceso da un’idea, oppure incontrare una persona, un progetto, un’opportunita di lavoro, una direzione creativa o un piano di vita che ti entusiasma. Questa carta non porta riflessione quieta. Porta un impulso diretto: fallo, provaci, comincia, fai accadere le cose.

E anche una carta molto forte per gli inizi creativi e professionali. Puo essere la prima frase di un testo, il concetto iniziale di un progetto, l’idea di avviare un’attivita, un colloquio, oppure il desiderio di cambiare vita. Non promette successo immediato, ma indica che hai gia il primo fiammifero. Adesso conta se deciderai di accenderlo.

Questa carta e legata anche alla vitalita del corpo. Puo indicare il ritorno della passione, il risveglio del desiderio, il ritorno del coraggio o la sensazione di voler vivere con piu forza. La sua energia va verso l’esterno e verso l’alto, con una sfumatura un po’ selvatica e avventurosa. Ti risveglia dalla stagnazione e ti ricorda che hai ancora il potere di creare realta.

Ma l’Asso di Bastoni e anche instabile. Una scintilla e preziosa, e puo spegnersi facilmente. Se rimani solo nell’entusiasmo senza agire, diventa fantasia. Se bruci troppo in fretta, potresti consumarti all’inizio. Deve essere raccolta, protetta e accompagnata da un minimo di struttura concreta.

Quando l’Asso di Bastoni appare rovesciato, ti invita a notare dove l’ispirazione si e bloccata. Potresti voler iniziare qualcosa, ma essere fermata o fermato da rinvii, paura, dubbi su di te o pressione della realta. Oppure l’occasione puo essere comparsa senza che tu l’abbia davvero afferrata. Chiediti perche la scintilla non si e accesa. Manca combustibile, oppure hai paura di farla diventare piu grande?

Il messaggio centrale dell’Asso di Bastoni e semplice: e apparso un fuoco nuovo. Non pretendere che diventi subito una carriera intera, una relazione intera o un risultato completo. Riconoscilo, e poi dagli un primo gesto reale. Molti grandi viaggi iniziano soltanto con quel calore interiore che dice: voglio provare.`,
      },
    },
  }),
  createMeaningCard({
    id: 'two-of-wands',
    number: 2,
    name_cn: '权杖二',
    name_en: 'Two of Wands',
    arcana: 'minor',
    suit: 'wands',
    keywords: ['规划', '远方', '选择', '野心', '布局', '视野', '等待时机', '扩张'],
    daily_upright:
      '今天适合为未来做规划。你已经不满足于眼前的小范围，心里开始望向更远的地方。',
    daily_reversed:
      '今天要小心想得很远却迟迟不动，或因为害怕离开舒适区而停在原地。远方很好，但也需要真正迈出第一步。',
    reading_upright: `权杖二正位代表规划、选择、远方视野与扩张的野心。它说明你已经拥有一定基础，不再只是被灵感点燃，而是开始思考下一步要去哪里、如何把手中的可能性发展成更大的版图。

在牌阵中出现时，权杖二提醒你站高一点看问题。你可能正在考虑新的道路、新的城市、新的事业方向、新的合作机会，或某个需要长远布局的计划。此时不必急着冲出去，但需要认真判断：你真正想抵达的远方是什么？`,
    reading_reversed: `权杖二逆位代表犹豫不决、计划停滞、视野受限，或害怕踏出舒适区。你可能已经看见了新的可能，却仍然抓着熟悉的东西不愿放手。

在牌阵中出现时，权杖二逆位提醒你不要只在脑中规划未来。你可能想要更大的世界，却又害怕承担选择带来的风险。它也可能表示计划不够成熟，或你对远方的想象过于理想化。此时需要重新评估方向，把宏大的愿景拆成可以执行的步骤。`,
    detail: `权杖二是权杖首牌之后的阶段。如果权杖首牌是火种的出现，那么权杖二就是一个人握着这点火，站在高处开始看向远方。热情已经不只是短暂冲动，它开始变成规划、野心和对未来版图的想象。

牌面中，人物通常站在城墙或高处，一手握着权杖，一手拿着地球仪，望向远方。这个画面很重要：他已经拥有某种基础，脚下有城堡，有已有的资源和位置；但他的目光并不只停留在眼前。他开始意识到，世界比现在所在的地方更大，自己也许可以走得更远。

当权杖二正位出现时，它通常意味着你进入了规划阶段。你可能正在考虑未来方向、职业选择、出国旅行、搬迁、合作、创业，或某个更长远的发展计划。它不像权杖骑士那样立刻冲出去，而是先站在高处观察路线。它的力量不是速度，而是视野。

权杖二也代表选择。你可能已经拥有一根权杖，也就是已有的资源、位置和安全感；但另一根权杖指向外面的世界，象征更大的可能性。此时的问题是：你要继续留在熟悉的地方，还是向未知扩张？你要守住已有的一切，还是冒险去争取更大的地图？

这张牌有很强的野心感，但这种野心还没有完全行动化。它像事业蓝图的初稿，也像远行之前展开的地图。它提醒你，真正的扩张不是盲目出走，而是先理解自己拥有什么、缺什么、想去哪里，以及愿意承担怎样的风险。

在事业中，权杖二可能代表战略规划、市场扩张、跨地域发展、职业转向，或开始思考更大的舞台。在关系中，它可能表示一个人正在评估关系的未来：这段关系能不能走远？两个人是否有共同方向？自己是否愿意为这段关系走出原有舒适区？

当权杖二逆位出现时，它提醒你留意计划与行动之间的断裂。你可能想得很多，规划很多，也幻想过很多远方，但迟迟没有迈出真正的一步。也可能是你害怕离开熟悉环境，所以宁愿停在原地，用“再等等”来掩盖内心的犹豫。

权杖二逆位也可能表示视野受限。你可能只看到眼前的安全感，却不敢承认自己其实想要更大的世界；或者相反，把远方想得太美，却没有认真考虑现实条件。此时需要的不只是梦想，而是更清楚的计划和更诚实的自我判断。

权杖二的核心信息是：你已经站到可以眺望远方的位置。眼前的世界并不是全部，你心里也开始知道自己想要更多。现在要做的，是把野心变成路线，把远方变成计划，然后决定自己是否真的愿意出发。`,
    translations: {
      en: {
        name: 'Two of Wands',
        keywords: ['planning', 'distance', 'choice', 'ambition', 'strategy', 'vision', 'timing', 'expansion'],
        daily_upright:
          'Today is good for planning the future. You are no longer satisfied with a small immediate horizon, and your mind is beginning to look farther ahead.',
        daily_reversed:
          'Watch out today for thinking far ahead without moving, or staying still because you fear leaving your comfort zone. The distance may be promising, but it still requires a real first step.',
        reading_upright: `The Two of Wands upright represents planning, choice, a far-reaching view, and the ambition to expand. You already have some foundation. You are no longer only lit by inspiration, but are starting to think about where to go next and how to turn what you hold into a larger map.

In a spread, the Two of Wands asks you to stand higher and look wider. You may be considering a new road, a new city, a new career direction, a new collaboration, or a plan that needs long-range design. You do not need to rush out yet, but you do need to judge carefully what destination you truly want.`,
        reading_reversed: `The Two of Wands reversed represents hesitation, stalled planning, limited vision, or fear of stepping out of the comfort zone. You may already see new possibilities but still cling to what is familiar.

In a spread, the reversed Two of Wands reminds you not to plan the future only in your head. You may want a larger world while fearing the risk that choice brings. It can also mean the plan is not mature enough yet, or that your idea of the far horizon is too idealized. Reassess the direction and break the grand vision into workable steps.`,
        detail: `The Two of Wands comes after the Ace of Wands. If the Ace is the appearance of a spark, then the Two is the stage where someone holds that spark, stands at a height, and begins to look toward the distance. Passion is no longer only a passing impulse. It begins to turn into planning, ambition, and an image of a future map.

In the card image, a figure usually stands on a wall or high place, holding one wand and a globe, looking toward the horizon. This image matters. The person already has some foundation beneath their feet: a castle, resources, a position already gained. Yet their gaze does not remain on what is close. They begin to understand that the world is larger than the place they stand, and that they may be able to go farther.

When the Two of Wands appears upright, it usually means you are entering a planning stage. You may be thinking about future direction, career choices, travel abroad, relocation, collaboration, entrepreneurship, or a longer-term development plan. It is not like the Knight of Wands charging out immediately. It first stands high and studies the route. Its strength is not speed, but vision.

The Two of Wands also represents choice. You may already possess one wand, meaning resources, position, and a degree of security. But the other wand points outward toward a larger world. The question becomes whether you remain where things are familiar or expand into the unknown, whether you protect what you already have or risk yourself for a wider map.

This card carries a strong sense of ambition, but that ambition has not yet fully become action. It is like the first draft of a business blueprint or a map opened before a long journey. It reminds you that real expansion is not blind departure. It begins by understanding what you have, what you lack, where you want to go, and what kind of risk you are willing to bear.

In career matters, the Two of Wands can represent strategy, market expansion, development across regions, a career shift, or the desire for a bigger stage. In relationships, it may show someone evaluating the future of the bond: can it go farther, do both people share a direction, and is one willing to step beyond the old comfort zone for this relationship?

When the Two of Wands appears reversed, it asks you to notice the break between planning and action. You may think a great deal, plan a great deal, and imagine many horizons, yet still fail to take a real step. Or you may fear leaving familiar surroundings so much that you stay still and hide that hesitation behind the thought of waiting a little longer.

The reversed Two of Wands can also indicate limited vision. You may see only the security before you and not admit that you want a larger world, or you may imagine the distant horizon too beautifully without taking practical conditions seriously. What is needed now is not only dreaming, but clearer planning and more honest self-judgment.

The core message of the Two of Wands is this: you have reached a place from which you can look out toward distance. The world before you is not the whole world, and you are beginning to know that you want more. Now you must turn ambition into route, turn distance into plan, and decide whether you are truly willing to depart.`,
      },
      it: {
        name: 'Due di Bastoni',
        keywords: ['pianificazione', 'lontananza', 'scelta', 'ambizione', 'strategia', 'visione', 'attesa del momento', 'espansione'],
        daily_upright:
          'Oggi e un buon momento per pianificare il futuro. Non ti basta piu l’orizzonte immediato, e il tuo sguardo comincia a spingersi piu lontano.',
        daily_reversed:
          'Oggi fai attenzione a pensare molto lontano senza muoverti, oppure a restare ferma o fermo per paura di uscire dalla zona di comfort. Il lontano e promettente, ma richiede comunque un primo passo reale.',
        reading_upright: `Il Due di Bastoni diritto rappresenta pianificazione, scelta, visione ampia e ambizione di espansione. Hai gia una certa base. Non sei piu soltanto acceso dall’ispirazione, ma stai iniziando a pensare a dove andare e a come trasformare cio che hai in una mappa piu grande.

In una stesa, il Due di Bastoni ti invita a guardare la situazione da una posizione piu alta. Potresti valutare una nuova strada, una nuova citta, una nuova direzione professionale, una nuova collaborazione, oppure un piano che richiede una strategia a lungo termine. Non serve correre subito, ma serve capire con precisione quale orizzonte vuoi davvero raggiungere.`,
        reading_reversed: `Il Due di Bastoni rovesciato rappresenta esitazione, pianificazione bloccata, visione limitata o paura di uscire dalla zona di comfort. Potresti gia vedere nuove possibilita e continuare comunque ad aggrapparti a cio che conosci.

In una stesa, il Due di Bastoni rovesciato ti ricorda di non progettare il futuro soltanto nella tua testa. Potresti desiderare un mondo piu grande e allo stesso tempo temere il rischio che la scelta comporta. Puo anche indicare che il piano non e ancora abbastanza maturo, oppure che la tua immagine del lontano e troppo idealizzata. Rivedi la direzione e trasforma la grande visione in passaggi concreti.`,
        detail: `Il Due di Bastoni arriva dopo l’Asso di Bastoni. Se l’Asso e la comparsa della scintilla, il Due e il momento in cui qualcuno prende quella scintilla, si mette in alto e guarda verso la distanza. La passione non e piu solo impulso momentaneo. Inizia a diventare pianificazione, ambizione e immaginazione di una mappa futura.

Nell’immagine della carta, una figura si trova spesso su una muraglia o in un punto elevato, con un bastone in mano e un globo, mentre guarda l’orizzonte. Questa immagine e importante. La persona possiede gia una certa base: ha un castello, risorse, una posizione conquistata. Ma il suo sguardo non resta fermo su cio che e vicino. Inizia a capire che il mondo e piu grande del luogo in cui si trova e che forse puo andare molto oltre.

Quando il Due di Bastoni appare diritto, di solito indica che stai entrando in una fase di pianificazione. Potresti pensare alla direzione futura, a scelte professionali, a un viaggio all’estero, a un trasferimento, a una collaborazione, a un progetto imprenditoriale o a uno sviluppo di lungo periodo. Non e come il Cavaliere di Bastoni che parte subito all’attacco. Prima osserva il percorso dall’alto. La sua forza non e la velocita, ma la visione.

Il Due di Bastoni rappresenta anche la scelta. Potresti gia possedere un bastone, cioe risorse, posizione e una certa sicurezza. Ma l’altro bastone punta verso il mondo esterno, simbolo di una possibilita piu grande. La domanda diventa allora questa: restare dove tutto e familiare oppure espanderti nell’ignoto? Difendere cio che gia possiedi oppure rischiare per una mappa piu ampia?

Questa carta porta una forte energia di ambizione, ma non ancora completamente trasformata in azione. E come la prima bozza di una strategia o una mappa aperta prima di un lungo viaggio. Ti ricorda che l’espansione reale non e partire alla cieca. Comincia col capire cosa hai, cosa ti manca, dove vuoi andare e quale tipo di rischio sei disposta o disposto a sostenere.

Nel lavoro, il Due di Bastoni puo rappresentare strategia, espansione del mercato, sviluppo in altre aree, svolta professionale o desiderio di un palcoscenico piu grande. Nelle relazioni, puo mostrare una persona che sta valutando il futuro del legame: puo andare lontano, esiste una direzione comune, e si e davvero disposte o disposti a uscire dalla vecchia comodita per questa relazione?

Quando il Due di Bastoni appare rovesciato, ti invita a notare la frattura tra pianificazione e azione. Potresti pensare moltissimo, pianificare moltissimo e immaginare molti orizzonti, senza pero compiere un vero passo. Oppure potresti avere cosi tanta paura di lasciare cio che conosci da restare ferma o fermo, coprendo l’esitazione con l’idea di aspettare ancora un po’.

Il Due di Bastoni rovesciato puo anche indicare una visione limitata. Potresti vedere solo la sicurezza davanti a te e non ammettere di desiderare un mondo piu grande, oppure potresti idealizzare troppo il lontano senza considerare seriamente le condizioni reali. In questo momento non basta sognare: servono un piano piu chiaro e un giudizio piu onesto su te stessa o te stesso.

Il messaggio centrale del Due di Bastoni e questo: sei gia arrivata o arrivato in un punto da cui puoi guardare lontano. Il mondo davanti a te non e tutto il mondo, e dentro di te stai gia capendo di volere di piu. Ora il compito e trasformare l’ambizione in percorso, la distanza in piano, e decidere se sei davvero pronta o pronto a partire.`,
      },
    },
  }),
  createMeaningCard({
    id: 'page-of-wands',
    number: 32,
    name_cn: '权杖侍从',
    name_en: 'Page of Wands',
    arcana: 'minor',
    suit: 'wands',
    keywords: ['灵感', '探索', '热情', '好奇', '新消息', '冒险', '创意萌芽', '行动欲'],
    daily_upright:
      '今天可能有新的灵感或想尝试的事情冒出来。先让好奇心带你走一步，不必一开始就要求自己完全成熟。',
    daily_reversed:
      '今天要小心三分钟热度、冲动开始又很快放弃。灵感和驱动力很珍贵，但也需要一点计划来保护它。',
    reading_upright: `权杖侍从正位代表新的热情、创意萌芽、探索欲和充满可能性的开始。它说明你可能刚刚被某件事点燃，心里出现了想行动、想尝试、想走出去看看的冲动。

在牌阵中出现时，权杖侍从提醒你不要轻视刚出现的小火苗。它也许还不是成熟的计划，但已经代表生命力开始苏醒。此时适合学习、尝试、表达、发起新项目，或接受某个让你感到兴奋的新消息。`,
    reading_reversed: `权杖侍从逆位代表热情不稳定、行动力分散、冲动冒进，或有想法却迟迟没有真正开始。你可能脑中有很多计划，但每一个都还停留在“想想而已”的阶段。

在牌阵中出现时，它提醒你检查自己的热情是否真的能持续。不要因为一时兴奋就做出过度承诺，也不要因为害怕失败就把灵感一直压着。此时需要把模糊的冲动整理成更具体的小步骤。`,
    detail: `权杖侍从是权杖牌组中最年轻、最原初的火焰。它象征热情刚刚点燃、创意刚刚出现、行动欲刚刚冒头的状态。它不像权杖骑士那样已经冲出去，也不像权杖国王那样能够掌控全局；它更像一个站在荒野中的年轻人，手里握着权杖，眼睛里亮着“我想试试看”的光。

这张牌最核心的能量是好奇和探索。你可能突然对某件事产生兴趣，想学习一门技能，想开始一个项目，想去一个新的地方，或者想用更大胆的方式表达自己。权杖侍从不保证事情一定成功，但它代表一种非常珍贵的开始：你重新对世界产生了兴趣。

当权杖侍从正位出现时，它通常意味着新的灵感、新消息、新机会或新阶段的邀请。它可能出现在创作、学习、旅行、社交、事业探索，或任何需要热情推动的场景中。它鼓励你先迈出一步，因为很多事情只有真正试过，才知道会不会长成更大的火焰。

但权杖侍从也有不成熟的一面。它容易兴奋，也容易转移注意力；容易被新鲜感吸引，却未必已经准备好承担长期责任。它的火焰明亮，但还小，需要被保护、被培养，而不是被自己的一阵风吹灭。

当权杖侍从逆位出现时，它可能表示灵感受阻、热情不稳、拖延开始，或冲动行动之后很快失去兴趣。你可能很想做很多事，却没有真正落实；也可能因为担心自己不够好，而一直不敢把想法拿出来。此时最重要的是不要让火苗熄灭，也不要假装火苗已经是篝火。先从一个小行动开始，让热情有地方落地。

权杖侍从的核心信息是：灵感刚刚出现时，不要急着审判它。先保护那一点火光，带着好奇心试试看。很多真正重要的旅程，都是从一个“不如我去看看”开始的。`,
    translations: {
      en: {
        name: 'Page of Wands',
        keywords: ['inspiration', 'exploration', 'passion', 'curiosity', 'new message', 'adventure', 'creative spark', 'urge to act'],
        daily_upright:
          'A new idea or a fresh urge to try something may appear today. Let curiosity move you one step forward without demanding total maturity from yourself at the start.',
        daily_reversed:
          'Watch out today for short-lived excitement, impulsive beginnings, and giving up too quickly. Inspiration and drive are valuable, but they also need a little structure to survive.',
        reading_upright: `The Page of Wands upright represents fresh enthusiasm, the first spark of creativity, curiosity, and a beginning full of possibility. It suggests that something has just lit you up, and you may feel an urge to act, experiment, and step out to see what is possible.

In a spread, the Page of Wands reminds you not to dismiss a small new flame. It may not yet be a fully formed plan, but it already signals that your life force is waking up. This is a good time to learn, experiment, express yourself, start a new project, or welcome news that excites you.`,
        reading_reversed: `The Page of Wands reversed represents unstable enthusiasm, scattered action, reckless impulsiveness, or ideas that never quite become a real beginning. You may have many plans in mind, but each of them still remains at the stage of only thinking about it.

In a spread, this card asks you to check whether your enthusiasm can actually last. Do not overpromise because of temporary excitement, and do not keep suppressing your inspiration just because you fear failure. What is needed now is to turn vague impulses into smaller, more concrete steps.`,
        detail: `The Page of Wands is the youngest and most primal flame in the suit of Wands. It symbolizes the moment when passion has just been lit, creativity has just appeared, and the urge to act has only begun to rise. It is not yet like the Knight of Wands already racing ahead, nor like the King of Wands holding the whole field in command. It is more like a young person standing in the open land, wand in hand, with eyes shining with the thought: I want to try.

The core energy of this card is curiosity and exploration. You may suddenly become interested in something, want to learn a skill, start a project, travel somewhere new, or express yourself in a bolder way. The Page of Wands does not promise success, but it represents a very precious beginning: you are becoming interested in the world again.

When the Page of Wands appears upright, it usually means new inspiration, new messages, new opportunities, or an invitation into a new phase. It can show up in creativity, study, travel, social life, career exploration, or any area that needs passion to move forward. It encourages you to take the first step, because many things only reveal their future size after you truly try them.

But the Page of Wands also has an immature side. It gets excited easily, and it can lose focus just as easily. It may be drawn to novelty without being ready to hold long-term responsibility. Its flame is bright, but it is still small. It needs protection and cultivation rather than being blown out by its own sudden gust of energy.

When the Page of Wands appears reversed, it can point to blocked inspiration, unstable passion, delays in beginning, or impulsive action that quickly loses momentum. You may want to do many things without truly grounding any of them, or you may keep your ideas hidden because you worry you are not good enough. The important thing now is not to let the spark die, but also not to pretend that the spark is already a bonfire. Start with one small act, and give your passion a place to land.

The core message of the Page of Wands is this: when inspiration first appears, do not rush to judge it. Protect that small flame first, and let curiosity lead you. Many important journeys begin with nothing more than the thought: maybe I should go and see.`,
      },
      it: {
        name: 'Fante di Bastoni',
        keywords: ['ispirazione', 'esplorazione', 'passione', 'curiosita', 'nuove notizie', 'avventura', 'scintilla creativa', 'voglia di agire'],
        daily_upright:
          'Oggi potrebbe emergere una nuova idea o la voglia di provare qualcosa. Lascia che la curiosita ti faccia muovere di un passo, senza pretendere da subito una piena maturita.',
        daily_reversed:
          'Fai attenzione oggi agli entusiasmi che durano poco, agli inizi impulsivi e al mollare troppo presto. Ispirazione e slancio sono preziosi, ma hanno bisogno anche di un minimo di struttura per essere protetti.',
        reading_upright: `Il Fante di Bastoni diritto rappresenta nuovo entusiasmo, il germoglio della creativita, desiderio di esplorare e un inizio pieno di possibilita. Indica che qualcosa potrebbe averti appena acceso dentro, facendoti venire voglia di agire, provare e uscire a vedere che cosa puo accadere.

In una stesa, il Fante di Bastoni ti ricorda di non sottovalutare quella piccola fiamma appena nata. Forse non e ancora un piano maturo, ma segnala gia che la tua energia vitale sta tornando a svegliarsi. Questo e un buon momento per imparare, sperimentare, esprimerti, avviare un nuovo progetto o accogliere una notizia che ti entusiasma.`,
        reading_reversed: `Il Fante di Bastoni rovesciato rappresenta entusiasmo instabile, energia dispersa, impulsivita eccessiva, oppure idee che non riescono mai a diventare un vero inizio. Potresti avere molti progetti in mente, ma ognuno di essi e ancora fermo alla fase del solo pensarci.

In una stesa, questa carta ti chiede di verificare se il tuo entusiasmo puo davvero durare. Non fare promesse troppo grandi per un'eccitazione momentanea, ma non continuare nemmeno a reprimere l'ispirazione per paura di fallire. Ora serve trasformare l'impulso vago in piccoli passi concreti.`,
        detail: `Il Fante di Bastoni e la fiamma piu giovane e piu originaria del seme di Bastoni. Simboleggia il momento in cui la passione si e appena accesa, la creativita e appena comparsa e la voglia di agire sta appena emergendo. Non e ancora come il Cavaliere di Bastoni che e gia partito al galoppo, ne come il Re di Bastoni che sa governare l'intero quadro. Assomiglia di piu a un giovane fermo nella terra aperta, con un bastone in mano e negli occhi quella luce che dice: voglio provare.

L'energia centrale di questa carta e la curiosita, insieme all'esplorazione. Potresti improvvisamente interessarti a qualcosa, voler imparare una competenza, iniziare un progetto, andare in un luogo nuovo o esprimerti in modo piu audace. Il Fante di Bastoni non promette il successo, ma rappresenta un inizio molto prezioso: stai tornando a interessarti al mondo.

Quando il Fante di Bastoni appare diritto, di solito annuncia nuova ispirazione, nuove notizie, nuove opportunita o l'invito a entrare in una fase diversa. Puo comparire nella creativita, nello studio, nei viaggi, nella socialita, nell'esplorazione professionale o in qualunque ambito abbia bisogno della passione per muoversi. Ti incoraggia a fare il primo passo, perche molte cose rivelano quanto possono crescere solo dopo che le hai davvero provate.

Ma il Fante di Bastoni ha anche un lato immaturo. Si entusiasma facilmente, e con la stessa facilita puo distrarsi. Puo essere attratto dalla novita senza essere ancora pronto a sostenere una responsabilita lunga. La sua fiamma e luminosa, ma e ancora piccola. Deve essere protetta e coltivata, non spenta da una raffica prodotta dalla sua stessa fretta.

Quando il Fante di Bastoni appare rovesciato, puo indicare ispirazione bloccata, passione instabile, ritardo nel cominciare o un'azione impulsiva che perde slancio in fretta. Potresti voler fare molte cose senza concretizzarne davvero nessuna, oppure nascondere le tue idee per paura di non essere abbastanza. Il punto adesso e non lasciare spegnere la scintilla, ma nemmeno fingere che la scintilla sia gia un grande fuoco. Parti da un piccolo gesto e dai alla tua passione un posto concreto dove atterrare.

Il messaggio centrale del Fante di Bastoni e questo: quando l'ispirazione appare per la prima volta, non correre a giudicarla. Proteggi prima quella piccola fiamma e lascia che sia la curiosita a guidarti. Molti viaggi davvero importanti cominciano con un semplice pensiero: forse dovrei andare a vedere.`,
      },
    },
  }),
  createMeaningCard({
    id: 'knight-of-wands',
    number: 33,
    name_cn: '权杖骑士',
    name_en: 'Knight of Wands',
    arcana: 'minor',
    suit: 'wands',
    keywords: ['冲刺', '热情', '冒险', '行动力', '野心', '速度', '征服欲', '急躁'],
    daily_upright:
      '今天适合主动出击，把热情变成行动。你有很强的推进力，但也要记得看清方向再加速。',
    daily_reversed:
      '今天要小心急躁、冲动和说走就走的失控感。别让一时的兴奋把你带进没有准备好的局面。',
    reading_upright: `权杖骑士正位代表强烈的行动力、冒险精神、冲刺欲望和对目标的热情追逐。它说明你已经不满足于停在想法阶段，而是想立刻行动、立刻推进、立刻去证明自己。

在牌阵中出现时，权杖骑士提醒你可以大胆一点。它适合突破、迁移、旅行、竞争、表达、追求目标，也适合在停滞的局面中打出一股向前的力量。但这张牌也要求你保持方向感，因为速度越快，越需要知道自己要去哪里。`,
    reading_reversed: `权杖骑士逆位代表冲动、鲁莽、缺乏耐心、方向混乱，或热情来得快去得也快。你可能正在被强烈的欲望和胜负心推动，却没有真正考虑后果。

在牌阵中出现时，它提醒你不要把行动力变成失控。你可能太急着赢、太急着离开、太急着得到结果，以至于忽略了细节、承诺和他人的感受。此时需要先稳住节奏，否则热情会变成消耗。`,
    detail: `权杖骑士是权杖牌组中最猛烈、最有冲击力的火焰。它象征行动、速度、冒险、野心和不可压抑的热情。如果权杖侍从是刚点燃的小火苗，那么权杖骑士就是已经冲起来的火。他不愿久等，也不擅长停留，他想要出发、征服、证明、抵达。

当权杖骑士正位出现时，它通常表示一个充满行动力的阶段正在到来。你可能会突然想推动某个计划，离开旧环境，开启新的挑战，向某个人表达心意，或在事业中更积极地争取机会。它是一张很适合“冲”的牌，尤其当你已经拖延太久、犹豫太久时，权杖骑士会像一匹马，把你从原地带出去。

这张牌也有强烈的魅力。权杖骑士常常代表热情、吸引力、直接表达和强烈存在感。他带来的能量鲜明、明亮、甚至有一点危险。你很难忽视他，因为他出现时，空气会变热，局面会开始移动。

但权杖骑士的问题也很明显：他太快。快到可能还没想清楚就开始，快到承诺还没落地就已经想去下一个战场。它可能代表三分钟热度、冲动决定、冒险过头，或者只享受追逐过程，却不擅长承担后续责任。

当权杖骑士逆位出现时，它提醒你留意失控的火。你可能因为愤怒、焦虑、欲望或胜负心而行动过快，也可能在一段关系或计划中忽冷忽热，让别人难以跟上你的节奏。此时不一定要完全停下，但需要重新握住方向盘。

权杖骑士的核心信息是：热情需要出口，行动需要方向。你可以奔跑，可以追逐，可以让野心带你向前，但不要忘记，真正能抵达终点的火，不只是燃得猛，还要燃得稳。`,
    translations: {
      en: {
        name: 'Knight of Wands',
        keywords: ['charge', 'passion', 'adventure', 'action', 'ambition', 'speed', 'desire to conquer', 'impatience'],
        daily_upright:
          'Today favors taking initiative and turning passion into action. You have strong forward drive, but make sure you know your direction before accelerating.',
        daily_reversed:
          'Watch out today for impatience, impulsiveness, and the feeling of rushing off without control. Do not let a burst of excitement drag you into a situation you are not prepared for.',
        reading_upright: `The Knight of Wands upright represents intense drive, adventurous spirit, the urge to charge ahead, and a passionate pursuit of a goal. It suggests that you are no longer satisfied with staying at the idea stage and want to act now, push now, and prove yourself now.

In a spread, the Knight of Wands reminds you that boldness can be useful. It supports breakthroughs, relocation, travel, competition, expression, and pursuit of a target, and it can also inject forward force into a stagnant situation. But this card also asks you to keep your sense of direction, because the faster you move, the more necessary it becomes to know where you are going.`,
        reading_reversed: `The Knight of Wands reversed represents impulsiveness, recklessness, lack of patience, confusion of direction, or passion that arrives quickly and disappears just as fast. You may be driven by strong desire and the urge to win without truly considering consequences.

In a spread, it warns you not to let your power to act become a loss of control. You may be too eager to win, too eager to leave, or too eager to get results, and in doing so you may ignore details, commitments, and the feelings of others. What is needed now is to steady the rhythm before passion turns into pure depletion.`,
        detail: `The Knight of Wands is the fiercest and most forceful fire in the suit of Wands. It symbolizes action, speed, adventure, ambition, and passion that refuses to be held back. If the Page of Wands is the first small spark, then the Knight of Wands is the fire already in motion. He does not like to wait, and he is not skilled at staying still. He wants to depart, conquer, prove, and arrive.

When the Knight of Wands appears upright, it usually signals that a highly active phase is coming. You may suddenly want to push a plan forward, leave an old environment, begin a new challenge, express your feelings to someone, or fight more aggressively for opportunity in your career. It is a card that suits charging ahead, especially when you have already been delaying or hesitating for too long. The Knight of Wands can be the horse that finally carries you out of place.

This card also carries strong charisma. The Knight of Wands often represents passion, attraction, direct expression, and a vivid personal presence. The energy he brings is bright, obvious, and even a little dangerous. He is difficult to ignore, because when he appears the air heats up and the situation begins to move.

But the problem with the Knight of Wands is just as clear: he is too fast. Fast enough to begin before thinking, and fast enough to look for the next battlefield before a promise has even landed. He can point to short-lived enthusiasm, impulsive decisions, overdone risk-taking, or someone who enjoys the chase but is less prepared for the responsibility that follows.

When the Knight of Wands appears reversed, it asks you to watch the fire when it becomes unstable. You may be acting too quickly because of anger, anxiety, desire, or competitiveness, or you may be running hot and cold in a relationship or plan, making it difficult for others to keep pace with you. This does not always mean you must stop completely, but it does mean you need to take the wheel again.

The core message of the Knight of Wands is this: passion needs an outlet, and action needs direction. You can run, pursue, and let ambition drive you forward, but do not forget that the fire that truly reaches the finish line is not only fierce. It is also steady enough to last.`,
      },
      it: {
        name: 'Cavaliere di Bastoni',
        keywords: ['slancio', 'passione', 'avventura', 'azione', 'ambizione', 'velocita', 'desiderio di conquista', 'impazienza'],
        daily_upright:
          'Oggi e il momento di prendere l’iniziativa e trasformare la passione in azione. Hai una forte spinta in avanti, ma ricordati di vedere bene la direzione prima di accelerare.',
        daily_reversed:
          'Fai attenzione oggi all’impazienza, all’impulsivita e alla sensazione di partire senza controllo. Non lasciare che un’ondata di entusiasmo ti trascini in una situazione per cui non sei pronta o pronto.',
        reading_upright: `Il Cavaliere di Bastoni diritto rappresenta una forte energia d'azione, spirito d'avventura, desiderio di scatto in avanti e inseguimento appassionato di un obiettivo. Indica che non ti basta piu restare nella fase dell'idea: vuoi agire subito, spingere subito e dimostrare subito chi sei.

In una stesa, il Cavaliere di Bastoni ti ricorda che un po' di audacia puo essere utile. Favorisce svolte, trasferimenti, viaggi, competizione, espressione e inseguimento di un traguardo, e puo anche portare una spinta in avanti dentro una situazione ferma. Ma questa carta ti chiede anche di mantenere il senso della direzione, perche piu corri e piu diventa necessario sapere dove stai andando.`,
        reading_reversed: `Il Cavaliere di Bastoni rovesciato rappresenta impulsivita, imprudenza, poca pazienza, confusione di direzione, oppure una passione che arriva in fretta e in fretta si consuma. Potresti essere spinta o spinto da un forte desiderio e da una grande voglia di vincere, senza aver davvero considerato le conseguenze.

In una stesa, ti avverte di non trasformare la tua forza d'azione in perdita di controllo. Potresti avere troppa fretta di vincere, di andartene o di ottenere un risultato, e cosi rischi di trascurare dettagli, impegni e sentimenti altrui. Quello che serve adesso e ritrovare il ritmo prima che la passione si trasformi in puro logoramento.`,
        detail: `Il Cavaliere di Bastoni e il fuoco piu impetuoso e piu travolgente del seme di Bastoni. Simboleggia azione, velocita, avventura, ambizione e una passione che non vuole essere trattenuta. Se il Fante di Bastoni e la prima piccola scintilla, allora il Cavaliere di Bastoni e il fuoco gia lanciato nella corsa. Non ama aspettare e non sa stare fermo a lungo. Vuole partire, conquistare, dimostrare e arrivare.

Quando il Cavaliere di Bastoni appare diritto, di solito segnala l'arrivo di una fase molto attiva. Potresti voler improvvisamente spingere avanti un piano, lasciare un vecchio ambiente, aprire una nuova sfida, dichiarare i tuoi sentimenti a qualcuno o cercare con piu decisione un'opportunita nel lavoro. E una carta perfetta per il movimento, soprattutto se hai gia rimandato o esitato troppo a lungo. Il Cavaliere di Bastoni puo essere il cavallo che finalmente ti porta fuori dall'immobilita.

Questa carta porta anche un forte carisma. Il Cavaliere di Bastoni rappresenta spesso passione, attrazione, espressione diretta e una presenza molto intensa. L'energia che porta e luminosa, evidente e perfino un po' pericolosa. E difficile ignorarlo, perche quando arriva l'aria si scalda e la situazione si mette in moto.

Ma il suo problema e altrettanto evidente: corre troppo. Tanto da iniziare prima di aver riflettuto bene, e tanto da cercare gia il prossimo campo di battaglia prima ancora che una promessa si sia davvero posata. Puo indicare entusiasmi brevi, decisioni impulsive, rischio eccessivo o qualcuno che ama l'inseguimento ma e meno disposto a sostenere la responsabilita che viene dopo.

Quando il Cavaliere di Bastoni appare rovesciato, ti chiede di osservare il fuoco quando diventa instabile. Potresti agire troppo in fretta per rabbia, ansia, desiderio o competitivita, oppure alternare caldo e freddo in una relazione o in un progetto, rendendo difficile agli altri stare al tuo passo. Questo non significa sempre che devi fermarti del tutto, ma significa che devi tornare a tenere il timone.

Il messaggio centrale del Cavaliere di Bastoni e questo: la passione ha bisogno di uno sbocco e l'azione ha bisogno di direzione. Puoi correre, inseguire e lasciare che l'ambizione ti spinga avanti, ma non dimenticare che il fuoco che arriva davvero al traguardo non e solo impetuoso. E anche abbastanza stabile da durare.`,
      },
    },
  }),
  createMeaningCard({
    id: 'queen-of-wands',
    number: 34,
    name_cn: '权杖王后',
    name_en: 'Queen of Wands',
    arcana: 'minor',
    suit: 'wands',
    keywords: ['自信', '魅力', '热情', '独立', '吸引力', '创造力', '生命力', '社交能量', '女性贵人'],
    daily_upright:
      '今天适合自信地表达自己。你的热情和魅力会被看见，也能吸引与你频率相近的人靠近。你的勇气会被嘉奖。',
    daily_reversed:
      '今天要小心自我怀疑、嫉妒或能量被消耗。别因为别人的眼光缩小自己，也别把魅力变成过度证明，陷入极端的个人主义之中。',
    reading_upright: `权杖王后正位代表自信、魅力、独立、热情与强大的生命力。它说明你正在散发一种很有吸引力的能量，不一定要刻意争夺注意力，也能自然地被人看见。

在牌阵中出现时，权杖王后提醒你相信自己的存在感。她鼓励你表达、创造、社交、领导，也鼓励你用热情感染他人。她不是依附他人而发光的人，而是因为内在火焰稳定，所以能把周围也照亮。`,
    reading_reversed: `权杖王后逆位代表自信受损、魅力被压抑、嫉妒、控制欲，或过度在意外界评价。你可能明明有能力和吸引力，却因为比较、焦虑或被否定的经验而不敢真正站出来。

在牌阵中出现时，它提醒你重新拿回自己的火。不要为了获得认可而表演，也不要因为害怕被评价就隐藏自己。权杖王后逆位也可能提示人际中的竞争、暗中较劲，或某种热情被扭曲成占有和不安。`,
    detail: `权杖王后是权杖牌组中成熟而稳定的火。她不像权杖骑士那样急着冲刺，也不像权杖侍从那样还在探索。她已经知道自己的热情在哪里，也知道如何把这份热情变成魅力、创造力和影响力。

这张牌象征自信、独立、吸引力和强大的生命力。权杖王后通常是一个很有存在感的人：她勇敢、热情、明亮、有行动力，也不害怕被看见。她的魅力不是单纯外貌上的漂亮，而是一种从内在散发出来的活力。她知道自己是谁，也不急着向所有人解释自己。

当权杖王后正位出现时，它通常意味着你可以更大胆地表达自己。无论是在创作、事业、社交还是关系中，你都可以让自己的热情被看见。你可能正在进入一个更有吸引力、更有影响力的阶段，也可能需要像权杖王后一样，相信自己有能力掌控自己的生活，可以更快速地推进完成事情。

权杖王后也很适合代表女性力量。她不是柔弱地等待别人选择，而是主动生活、主动创造、主动发光。她可以性感，可以强势，可以温暖，也可以骄傲。她的能量不需要被削弱成“讨人喜欢”，因为她本身就有一种让人靠近的生命热度。

在人际和关系中，权杖王后代表热情、坦率、吸引力和彼此鼓励。她喜欢真诚而有活力的连接，不喜欢死气沉沉的关系。她也可能象征一个外向、自信、有创造力、很会带动气氛的人。

当权杖王后逆位出现时，它提醒你留意自信的失衡。一种可能是自信被压抑：你不敢展示自己，害怕被比较、被嫉妒、被否定。另一种可能是自信过度扭曲，变成控制欲、嫉妒心、情绪化或对关注的过度渴望。

权杖王后逆位并不意味着你的火消失了，而是说明这团火可能被困住、被误用，或被外界眼光扰乱。你需要重新回到自己的中心，不是为了证明自己比谁更亮，而是为了让自己的生命力重新顺畅地燃烧。

权杖王后的核心信息是：你的热情和魅力不需要被隐藏。真正稳定的自信，不是压倒别人，而是允许自己明亮地存在，并让这份光自然地感染世界。`,
    translations: {
      en: {
        name: 'Queen of Wands',
        keywords: ['confidence', 'charisma', 'passion', 'independence', 'attraction', 'creativity', 'vitality', 'social energy', 'female benefactor'],
        daily_upright:
          'Today favors expressing yourself with confidence. Your passion and charisma will be noticed, and you can attract people who resonate with your energy. Your courage will be rewarded.',
        daily_reversed:
          'Watch out today for self-doubt, jealousy, or drained energy. Do not shrink because of other people’s eyes, and do not turn charm into overcompensation or extreme individualism.',
        reading_upright: `The Queen of Wands upright represents confidence, charisma, independence, passion, and strong life force. It suggests that you are radiating an attractive energy and can be noticed naturally even without fighting for attention.

In a spread, the Queen of Wands reminds you to trust your own presence. She encourages expression, creativity, social connection, and leadership, and she urges you to inspire others with your passion. She is not someone who shines by attaching herself to others. She shines because her inner fire is steady enough to light the space around her.`,
        reading_reversed: `The Queen of Wands reversed represents damaged confidence, suppressed charm, jealousy, controlling tendencies, or excessive concern with outside judgment. You may clearly have ability and attraction, yet comparison, anxiety, or past experiences of being dismissed may keep you from fully stepping forward.

In a spread, it asks you to reclaim your own fire. Do not perform just to win approval, and do not hide yourself because you fear being judged. The reversed Queen of Wands can also point to social rivalry, silent competition, or passion distorted into possessiveness and insecurity.`,
        detail: `The Queen of Wands is the mature and steady fire of the Wands suit. She is not rushing like the Knight of Wands, and she is no longer only exploring like the Page of Wands. She already knows where her passion lives, and she knows how to transform that passion into charisma, creativity, and influence.

This card symbolizes confidence, independence, attraction, and powerful vitality. The Queen of Wands is often someone with a strong presence: brave, passionate, bright, active, and unafraid of being seen. Her charm is not merely physical beauty. It is the vitality that radiates from within. She knows who she is, and she does not hurry to explain herself to everyone.

When the Queen of Wands appears upright, it usually means that you can express yourself more boldly. In creativity, career, social life, or relationships, your passion can be visible. You may be entering a more magnetic and influential phase, or you may need to become like the Queen of Wands herself and trust that you are capable of steering your own life and moving things forward more decisively.

The Queen of Wands also strongly represents feminine power. She does not wait weakly for others to choose her. She lives actively, creates actively, and shines actively. She can be sensual, powerful, warm, and proud. Her energy does not need to be reduced into simply being likable, because she already carries a living warmth that naturally draws people closer.

In relationships and social dynamics, the Queen of Wands represents passion, candor, attraction, and mutual encouragement. She likes connections that are alive and sincere, not relationships that feel lifeless. She can also symbolize an outgoing, confident, creative person who knows how to energize the room.

When the Queen of Wands appears reversed, it asks you to notice imbalance in confidence. One possibility is that confidence has been suppressed: you do not dare to show yourself because you fear comparison, jealousy, or rejection. Another possibility is that confidence has become distorted into control, envy, moodiness, or an excessive hunger for attention.

The Queen of Wands reversed does not mean your fire has disappeared. It means that this fire may be trapped, misused, or disturbed by the gaze of others. You need to return to your own center, not to prove you are brighter than anyone else, but to let your life force burn freely again.

The core message of the Queen of Wands is this: your passion and charisma do not need to be hidden. Stable confidence is not about overpowering others. It is about allowing yourself to exist brightly and letting that light naturally warm the world around you.`,
      },
      it: {
        name: 'Regina di Bastoni',
        keywords: ['fiducia in se', 'carisma', 'passione', 'indipendenza', 'attrazione', 'creativita', 'vitalita', 'energia sociale', 'figura femminile favorevole'],
        daily_upright:
          'Oggi e il momento di esprimerti con fiducia. La tua passione e il tuo carisma saranno notati, e potrai attrarre persone che vibrano su una frequenza simile alla tua. Il tuo coraggio verra premiato.',
        daily_reversed:
          'Fai attenzione oggi al dubbio verso te stessa o te stesso, alla gelosia o al consumo eccessivo di energia. Non rimpicciolirti per lo sguardo degli altri e non trasformare il tuo fascino in una prova continua di te stessa o te stesso, scivolando in un individualismo estremo.',
        reading_upright: `La Regina di Bastoni diritta rappresenta fiducia in se, carisma, indipendenza, passione e una forte vitalita. Indica che stai emanando un'energia molto attraente e che puoi essere notata o notato in modo naturale, anche senza lottare per ottenere attenzione.

In una stesa, la Regina di Bastoni ti ricorda di avere fiducia nella tua presenza. Ti incoraggia a esprimerti, creare, socializzare e guidare, e ti invita a contagiare gli altri con il tuo entusiasmo. Non e una figura che brilla appoggiandosi a qualcun altro. Brilla perche il suo fuoco interiore e abbastanza stabile da illuminare anche cio che la circonda.`,
        reading_reversed: `La Regina di Bastoni rovesciata rappresenta fiducia ferita, fascino represso, gelosia, bisogno di controllo o eccessiva attenzione al giudizio esterno. Potresti avere chiaramente capacita e attrattiva, ma il confronto, l'ansia o esperienze di svalutazione potrebbero impedirti di emergere davvero.

In una stesa, ti chiede di riprenderti il tuo fuoco. Non recitare per ottenere approvazione, e non nasconderti per paura del giudizio. La Regina di Bastoni rovesciata puo anche indicare competizione sociale, rivalita silenziosa, oppure una passione deformata in possessivita e insicurezza.`,
        detail: `La Regina di Bastoni e il fuoco maturo e stabile del seme di Bastoni. Non corre con l'urgenza del Cavaliere di Bastoni, e non e piu soltanto in esplorazione come il Fante di Bastoni. Sa gia dove vive la sua passione, e sa come trasformarla in carisma, creativita e influenza.

Questa carta simboleggia fiducia in se, indipendenza, attrazione e una grande forza vitale. La Regina di Bastoni e spesso una persona con una presenza molto forte: coraggiosa, appassionata, luminosa, attiva e non impaurita dal fatto di essere vista. Il suo fascino non e solo una questione di bellezza esteriore. E una vitalita che si irradia dall'interno. Sa chi e, e non ha fretta di spiegarsi a tutti.

Quando la Regina di Bastoni appare diritta, di solito significa che puoi esprimerti con piu audacia. Nella creativita, nel lavoro, nella socialita o nelle relazioni, la tua passione puo essere vista. Potresti entrare in una fase piu magnetica e influente, oppure potresti aver bisogno di incarnare la Regina di Bastoni e credere di poter guidare la tua vita con maggiore decisione e velocita nel portare a compimento le cose.

La Regina di Bastoni rappresenta molto bene anche il potere femminile. Non aspetta debolmente che qualcuno la scelga. Vive in modo attivo, crea in modo attivo e splende in modo attivo. Puo essere sensuale, forte, calda e orgogliosa. La sua energia non ha bisogno di essere ridotta al semplice essere gradevole, perche possiede gia un calore vitale che attira naturalmente gli altri.

Nelle relazioni e nella sfera sociale, la Regina di Bastoni rappresenta passione, franchezza, attrazione e incoraggiamento reciproco. Ama le connessioni sincere e vive, non i rapporti spenti. Puo anche simboleggiare una persona estroversa, sicura di se, creativa e capace di animare l'atmosfera.

Quando la Regina di Bastoni appare rovesciata, ti invita a osservare lo squilibrio della fiducia. Una possibilita e che la fiducia sia repressa: non osi mostrarti per paura del confronto, della gelosia o del rifiuto. Un'altra possibilita e che la fiducia si deformi in bisogno di controllo, invidia, emotivita o desiderio eccessivo di attenzione.

La Regina di Bastoni rovesciata non significa che il tuo fuoco sia scomparso. Significa che questo fuoco puo essere intrappolato, usato male o disturbato dallo sguardo esterno. Hai bisogno di tornare al tuo centro, non per dimostrare di brillare piu di chiunque altro, ma per lasciare che la tua forza vitale torni a bruciare in modo libero e fluido.

Il messaggio centrale della Regina di Bastoni e questo: la tua passione e il tuo carisma non hanno bisogno di essere nascosti. La vera fiducia stabile non consiste nel schiacciare gli altri, ma nel permetterti di esistere con luce e lasciare che quel calore tocchi naturalmente il mondo intorno a te.`,
      },
    },
  }),
  createMeaningCard({
    id: 'king-of-wands',
    number: 35,
    name_cn: '权杖国王',
    name_en: 'King of Wands',
    arcana: 'minor',
    suit: 'wands',
    keywords: ['领导力', '远见', '野心', '掌控', '创业', '决断', '影响力', '成熟火焰', '男性贵人'],
    daily_upright:
      '今天适合拿出领导力和决断力。不要只停留在想法里，你可以把愿景变成具体行动，并带动局面向前。',
    daily_reversed:
      '今天要小心强势过头、急于掌控，或因为野心太大而忽略细节和他人的节奏。真正的领导不是只让别人服从你。',
    reading_upright: `权杖国王正位代表成熟的行动力、领导力、远见和将愿景落地的能力。它说明你不仅有热情，也有能力规划方向、调动资源，并带领事情走向更大的目标。

在牌阵中出现时，权杖国王提醒你站到更高的位置看问题。它适合创业、管理、决策、公开表达、战略规划，也可能象征一位有野心、有影响力、有事业能量的男性或领导型人物。此时，关键不是有没有火，而是你能不能掌控这团火，让它成为真正的事业和成就。`,
    reading_reversed: `权杖国王逆位代表专断、控制欲、暴躁、滥用权力，或野心失控。你可能太想推进自己的目标，却忽略了现实条件、团队节奏，或他人的真实感受。

在牌阵中出现时，它提醒你检查自己的领导方式。你是在带领别人，还是在强迫别人配合你的意志？你是在创造愿景，还是只是在用热情掩盖不稳定的判断？权杖国王逆位也可能代表一个强势但不成熟的权威人物，需要小心他的承诺和脾气。`,
    detail: `权杖国王是权杖牌组中最成熟、最有掌控力的火。他不只是拥有热情，而是能够管理热情；不只是想行动，而是能够制定方向；不只是自己发光，而是能够让一群人围绕共同的愿景行动起来。

这张牌象征领导力、远见、野心、创造力和现实中的影响力。权杖国王不是被动等待机会的人，他会主动开辟道路，设定目标，聚集资源，并把脑中的愿景推进到现实之中。他有创业者、领导者、开拓者的气质，身上带着一种“我要把这件事做成”的强烈气场。

当权杖国王正位出现时，它通常意味着你需要更大胆地掌控局面。你可能已经不适合只做执行者，而需要站到更高的位置，思考方向、策略和长期目标。它也可能提示你正在拥有更强的影响力，别人会看你的态度、听你的判断，甚至被你的热情带动。

在事业中，权杖国王是一张很强的牌。它适合创业、管理、拓展市场、做决策、带团队、制定战略，或把个人热情转化成可持续的事业。它不是短暂冲动，而是成熟火焰：燃得旺，也懂得如何让火持续燃烧。

在人际或关系中，权杖国王可能代表一个有自信、有野心、有主导欲的人。他可能很有魅力，也很有行动力，但并不总是温柔细腻。他的爱往往表现为推动、承担、保护、规划，而不是反复表达情绪。如果这张牌代表你自己，它提醒你可以更主动、更明确地争取想要的东西。

但权杖国王也有阴影面。当他的火失去自控，就会变成专断、暴躁、控制欲和自我中心。他可能只相信自己的判断，要求别人跟上他的节奏，却忘了真正的领导需要听见不同声音。野心如果没有责任感，就会变成压迫；远见如果没有落地能力，也可能只是宏大的空话。

当权杖国王逆位出现时，它提醒你留意火焰的失控。你可能太急于证明自己，太想掌控结果，或把自己的愿景强加给别人。它也可能代表一个强势但不稳定的人：他说得很大，气势很足，但未必真的能承担后果。

权杖国王的核心信息是：真正成熟的火，不只是燃烧，而是照亮方向、带动行动，并承担由此产生的责任。你可以有野心，可以有愿景，可以站到领导的位置上；但你也需要记得，能让人追随的从来不只是力量，还有稳定、远见和担当。`,
    translations: {
      en: {
        name: 'King of Wands',
        keywords: ['leadership', 'vision', 'ambition', 'command', 'entrepreneurship', 'decisiveness', 'influence', 'mature fire', 'male benefactor'],
        daily_upright:
          'Today favors leadership and decisiveness. Do not stay only in ideas. You can turn vision into concrete action and move the situation forward.',
        daily_reversed:
          'Watch out today for being overly forceful, too eager to control, or so ambitious that you ignore details and other people’s pace. Real leadership is not just making others obey.',
        reading_upright: `The King of Wands upright represents mature action, leadership, vision, and the ability to bring a vision into reality. It suggests that you not only have passion, but also the ability to set direction, mobilize resources, and lead matters toward a larger goal.

In a spread, the King of Wands asks you to step back and see the situation from a higher vantage point. It supports entrepreneurship, management, decision-making, public expression, and strategic planning, and it can also symbolize an ambitious, influential man or leadership figure with strong career energy. The key now is not whether you have fire, but whether you can command that fire and turn it into real work and accomplishment.`,
        reading_reversed: `The King of Wands reversed represents authoritarian behavior, controlling tendencies, anger, abuse of power, or ambition that has become unstable. You may be so eager to push your own goals that you ignore practical conditions, team rhythm, or the real feelings of other people.

In a spread, it asks you to examine your style of leadership. Are you guiding others, or forcing them to match your will? Are you building a vision, or using passion to cover unstable judgment? The reversed King of Wands can also point to a forceful but immature authority figure whose promises and temper should be handled carefully.`,
        detail: `The King of Wands is the most mature and most commanding fire in the suit of Wands. He does not merely possess passion. He can manage passion. He does not simply want to act. He can establish direction. He does not only shine by himself. He can bring a group of people into motion around a shared vision.

This card symbolizes leadership, vision, ambition, creativity, and real-world influence. The King of Wands is not someone who passively waits for opportunity. He opens roads, sets goals, gathers resources, and pushes the vision in his mind into reality. He carries the temperament of an entrepreneur, leader, and pioneer, along with a strong field that says: I am going to make this happen.

When the King of Wands appears upright, it usually means you need to take control more boldly. You may no longer be in a place where being only an executor is enough. Instead, you may need to stand higher and think about direction, strategy, and long-term goals. It can also indicate that your influence is growing: others may watch your attitude, listen to your judgment, and even be moved by your passion.

In career matters, the King of Wands is a very strong card. It supports entrepreneurship, management, market expansion, decision-making, team leadership, strategic planning, or turning personal passion into sustainable work. It is not brief impulse. It is mature fire: powerful, and also able to keep burning over time.

In relationships or human dynamics, the King of Wands can represent a confident, ambitious, dominant person. He may be charismatic and highly active, but not always gentle or emotionally subtle. His love may show up through pushing forward, taking responsibility, protecting, and planning, rather than repeated emotional expression. If this card represents you, it reminds you that you can pursue what you want in a more direct and active way.

But the King of Wands also has a shadow side. When his fire loses self-command, it becomes authoritarian, volatile, controlling, and self-centered. He may trust only his own judgment and demand that others keep pace with him, forgetting that real leadership must hear different voices. Ambition without responsibility becomes pressure, and vision without grounded execution can become nothing more than grand words.

When the King of Wands appears reversed, it asks you to notice fire when it becomes misdirected. You may be too eager to prove yourself, too eager to control the outcome, or too ready to impose your vision on others. It can also represent a forceful but unstable person: someone who speaks big and carries strong presence, yet may not truly bear the consequences.

The core message of the King of Wands is this: mature fire does not only burn. It lights direction, mobilizes action, and accepts the responsibility that follows. You can have ambition, vision, and a leadership position, but remember that what truly makes others follow is not force alone. It is steadiness, foresight, and accountability as well.`,
      },
      it: {
        name: 'Re di Bastoni',
        keywords: ['leadership', 'visione', 'ambizione', 'controllo', 'spirito imprenditoriale', 'decisione', 'influenza', 'fuoco maturo', 'figura maschile favorevole'],
        daily_upright:
          'Oggi e il momento di mostrare leadership e capacita decisionale. Non restare solo nelle idee: puoi trasformare la visione in azione concreta e spingere la situazione in avanti.',
        daily_reversed:
          'Fai attenzione oggi all’eccesso di forza, alla fretta di controllare tutto o a un’ambizione cosi grande da farti ignorare i dettagli e il ritmo altrui. La vera leadership non consiste solo nel farsi obbedire.',
        reading_upright: `Il Re di Bastoni diritto rappresenta azione matura, leadership, visione e la capacita di trasformare una visione in realta. Indica che non possiedi soltanto passione, ma anche la capacita di stabilire una direzione, mobilitare risorse e guidare le situazioni verso un obiettivo piu grande.

In una stesa, il Re di Bastoni ti invita a osservare il quadro da una posizione piu alta. Favorisce impresa, gestione, decisioni, espressione pubblica e pianificazione strategica, e puo anche simboleggiare un uomo ambizioso, influente o una figura di comando con una forte energia professionale. Il punto ora non e se hai fuoco, ma se sai governarlo e trasformarlo in vero lavoro e vero risultato.`,
        reading_reversed: `Il Re di Bastoni rovesciato rappresenta autoritarismo, bisogno di controllo, rabbia, abuso di potere o ambizione fuori equilibrio. Potresti essere cosi concentrata o concentrato sul portare avanti i tuoi obiettivi da ignorare le condizioni reali, il ritmo del gruppo o i sentimenti autentici degli altri.

In una stesa, ti chiede di esaminare il tuo modo di guidare. Stai conducendo gli altri, oppure li stai forzando a seguire la tua volonta? Stai costruendo una visione, oppure stai usando la passione per coprire un giudizio instabile? Il Re di Bastoni rovesciato puo anche indicare una figura autoritaria ma immatura, di cui conviene osservare con attenzione promesse e temperamento.`,
        detail: `Il Re di Bastoni e il fuoco piu maturo e piu capace di comando del seme di Bastoni. Non possiede soltanto passione: sa governarla. Non vuole soltanto agire: sa stabilire una direzione. Non si limita a brillare da solo: sa mettere in moto un gruppo intero attorno a una visione condivisa.

Questa carta simboleggia leadership, visione, ambizione, creativita e influenza concreta nel mondo reale. Il Re di Bastoni non e qualcuno che aspetta passivamente l'occasione. Apre strade, stabilisce obiettivi, raccoglie risorse e porta nella realta la visione che ha in mente. Ha il temperamento dell'imprenditore, del leader e del pioniere, con un forte campo energetico che dice: questa cosa la porto a compimento.

Quando il Re di Bastoni appare diritto, di solito significa che devi prendere il controllo con maggiore audacia. Potresti non essere piu in una fase in cui basta eseguire. Potresti invece dover salire piu in alto e pensare a direzione, strategia e obiettivi di lungo periodo. Puo anche indicare che la tua influenza sta crescendo: gli altri osservano il tuo atteggiamento, ascoltano il tuo giudizio e possono perfino lasciarsi muovere dalla tua passione.

Nel lavoro, il Re di Bastoni e una carta molto forte. Favorisce impresa, gestione, espansione, decisioni, guida del team, pianificazione strategica o la trasformazione della passione personale in un'attivita sostenibile. Non e un impulso momentaneo. E fuoco maturo: arde forte e sa anche come continuare ad ardere nel tempo.

Nelle relazioni o nelle dinamiche umane, il Re di Bastoni puo rappresentare una persona sicura di se, ambiziosa e dominante. Puo essere carismatica e molto attiva, ma non sempre delicata o sottile sul piano emotivo. Il suo amore spesso si manifesta nel portare avanti, nel prendersi responsabilita, nel proteggere e nel pianificare, piu che nel ripetere espressioni emotive. Se questa carta rappresenta te, ti ricorda che puoi cercare cio che desideri in modo piu diretto e piu attivo.

Ma il Re di Bastoni ha anche un lato ombra. Quando il suo fuoco perde autocontrollo, diventa autoritario, impulsivo, controllante e centrato su se stesso. Puo fidarsi solo del proprio giudizio e pretendere che gli altri stiano al suo ritmo, dimenticando che la vera leadership deve saper ascoltare voci diverse. L'ambizione senza responsabilita diventa pressione, e la visione senza capacita di realizzazione puo ridursi a grandi parole.

Quando il Re di Bastoni appare rovesciato, ti chiede di notare il fuoco quando perde direzione. Potresti essere troppo presa o preso dal bisogno di dimostrare qualcosa, troppo desiderosa o desideroso di controllare il risultato, o troppo pronta o pronto a imporre la tua visione agli altri. Puo anche rappresentare una persona forte ma instabile: parla in grande, ha molta presenza, ma non e detto che sappia davvero assumersi le conseguenze.

Il messaggio centrale del Re di Bastoni e questo: il fuoco maturo non si limita a bruciare. Illumina la direzione, mette in moto l'azione e si assume la responsabilita che ne deriva. Puoi avere ambizione, visione e posizione di guida, ma ricorda che cio che fa davvero seguire gli altri non e la sola forza. Sono anche stabilita, lungimiranza e senso di responsabilita.`,
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
