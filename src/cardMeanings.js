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
  {
    id: 'fool',
    number: 0,
    name_cn: '愚人',
    name_en: 'The Fool',
    arcana: 'major',
    suit: '',
    image: getMeaningImage('愚人'),
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
        keywords: ['Beginnings', 'Freedom', 'Adventure', 'Innocence', 'The Unknown', 'Starting Over'],
        daily_upright:
          'Today is good for opening a new chapter, trying, moving, and beginning again, but major decisions still need a clear head.',
        daily_reversed:
          'Today asks you to watch for risk: do not rush ahead blindly, but do not stay frozen just because risk exists.',
        reading_upright:
          'The Fool upright represents new beginnings, freedom, adventure, and possibility that has not yet been defined. It shows that you are standing at the entrance to a new phase. Past experience does not have to limit you completely, and many unknown roads are still able to unfold.\n\nWhen it appears in a spread, The Fool encourages you to take the first step with more courage. It does not guarantee a stable outcome, but it emphasizes the power of beginning: some answers appear only after you truly set out.',
        reading_reversed:
          'The Fool reversed represents impulsiveness, lack of preparation, avoidance of reality, or poor judgment around risk. You may be seeing only the freedom in the distance while ignoring the cliff beneath your feet.\n\nWhen it appears in a spread, it asks you to stop and confirm your direction. The small dog in the image is like a reminder to hear the voices around you: do not rush forward blindly, but do not stay stuck only because you are afraid.',
        detail:
          'The Fool is card 0 of the Major Arcana. Zero symbolizes a beginning not yet formed, but also limitless possibility. He is like a blank page not yet written on, standing at the entrance to a new life journey with innocence, freedom, curiosity, and youthful courage.\n\nWhen The Fool appears upright, the world is slowly unfolding beneath your feet. You may be about to enter a new phase, begin a new relationship, plan, choice, or direction in life. At this moment, you do not need to be completely bound by past experience. You are allowed to keep the clearest part of yourself, like a child, trusting that the future still holds vast skies and seas, and trusting that you still have the ability to begin again.\n\nThe upright Fool does not promise a road without risk, but it encourages the first step. It reminds you that some answers only appear after you truly begin. Instead of staying trapped in overthinking, carry an open heart and receive the new opportunity that destiny is placing before you.\n\nWhen The Fool appears reversed, it asks you to notice the cliff beneath your feet. You may be too impulsive, too naive, or only focused on distant freedom while ignoring real risk. The small dog in the card may be trying to wake you up, asking you not to disappear entirely into excitement and fantasy. At this moment, listening to different voices, checking your plan again, and confirming your real situation matter more than moving forward blindly.\n\nThe core message of The Fool is this: setting out matters, but staying clear-minded matters too. Keep the heart of a beginner, but also see the road beneath your feet.',
      },
      it: {
        name: 'Il Matto',
        keywords: ['Inizio', 'Liberta', 'Avventura', 'Innocenza', 'Ignoto', 'Ripartenza'],
        daily_upright:
          'Oggi e il momento giusto per aprire un nuovo capitolo, provare, partire e ricominciare, ma nelle decisioni importanti serve comunque lucidita.',
        daily_reversed:
          'Oggi fai attenzione al rischio: non andare avanti alla cieca, ma non restare ferma o fermo solo per paura.',
        reading_upright:
          'Il Matto diritto rappresenta nuovi inizi, liberta, avventura e possibilita ancora non definite. Mostra che sei sulla soglia di una nuova fase. L esperienza passata non deve limitarti del tutto, e molte strade sconosciute possono ancora aprirsi.\n\nQuando appare in una stesa, Il Matto ti incoraggia a fare il primo passo con piu coraggio. Non garantisce stabilita, ma sottolinea la forza dell inizio: alcune risposte compaiono solo dopo che hai davvero iniziato il cammino.',
        reading_reversed:
          'Il Matto rovesciato rappresenta impulsivita, mancanza di preparazione, fuga dalla realta o scarsa chiarezza nel valutare il rischio. Potresti vedere solo la liberta lontana e ignorare il precipizio sotto i piedi.\n\nQuando appare in una stesa, ti chiede di fermarti e confermare la direzione. Il piccolo cane nella carta ricorda di ascoltare anche le voci esterne: non correre in avanti alla cieca, ma non restare bloccata o bloccato solo per paura.',
        detail:
          'Il Matto e la carta numero 0 degli Arcani Maggiori. Lo zero simboleggia un inizio non ancora formato, ma anche una possibilita infinita. E come una pagina bianca non ancora scritta: con innocenza, liberta, curiosita e coraggio giovanile, si trova all inizio di un nuovo viaggio nella vita.\n\nQuando Il Matto appare diritto, il mondo si sta aprendo lentamente sotto i tuoi piedi. Potresti entrare in una nuova fase, iniziare una relazione, un progetto, una scelta o una nuova direzione di vita. In questo momento non devi restare completamente legata o legato all esperienza passata. Puoi mantenere uno spirito limpido, quasi infantile, e credere che il futuro abbia ancora orizzonte e spazio, e che tu abbia ancora la capacita di ricominciare.\n\nIl Matto diritto non promette un cammino privo di rischi, ma incoraggia il primo passo. Ricorda che alcune risposte appaiono solo dopo che hai davvero iniziato. Invece di restare intrappolata o intrappolato nei pensieri, porta con te un cuore aperto e accogli la nuova opportunita che il destino ti mette davanti.\n\nQuando Il Matto appare rovesciato, invita a guardare il precipizio sotto i piedi. Potresti essere troppo impulsiva o impulsivo, troppo ingenua o ingenuo, o vedere solo la liberta lontana ignorando i rischi reali. Il piccolo cane sembra voler richiamare la tua attenzione, per non lasciarti scomparire del tutto nell entusiasmo e nella fantasia. In questo momento ascoltare punti di vista diversi, ricontrollare il piano e capire bene la tua situazione conta piu che andare avanti senza guardare.\n\nIl messaggio centrale del Matto e questo: partire e importante, ma lo e anche restare lucida o lucido. Conserva il cuore di chi inizia, ma guarda con chiarezza la strada sotto i tuoi piedi.',
      },
    },
  },
  {
    id: 'the-magician',
    number: 1,
    name_cn: '魔术师',
    name_en: 'The Magician',
    arcana: 'major',
    suit: '',
    image: getMeaningImage('魔术师'),
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
        keywords: ['Creation', 'Action', 'Will', 'Manifestation', 'Resources', 'Mastery', 'Putting Things into Practice'],
        daily_upright:
          'Today is ideal for turning ideas into action. You already hold useful resources in your hands. The key is to activate and organize them, communicate clearly, and open a new chapter instead of waiting for the perfect moment.',
        daily_reversed:
          'Today asks you to watch for empty fantasy, procrastination, or saying much more than you actually do. Be careful not to fail in the area you usually feel confident in, and stay alert to people who dress up their true motives with pretty words.',
        reading_upright:
          'The Magician upright represents creativity, action, willpower, and manifestation. It shows that you are not unprepared. The tools, resources, or abilities you need are already near you; they simply need to be gathered and used with intention.\n\nWhen it appears in a spread, The Magician reminds you to turn thought into concrete action. This is not merely a card of imagination; it is a card of making things happen. Through clear goals, focused will, and practical effort, you can turn what has existed only in your mind into reality.',
        reading_reversed:
          'The Magician reversed represents misuse of resources, lack of action, manipulation, deception, or having ideas that never truly land. You may possess certain conditions but fail to use them correctly. You may also rely too much on technique or clever language while neglecting real skill and genuine effort.\n\nWhen it appears in a spread, it asks you to check whether you are avoiding execution, or whether you are being misled by a surface display of confidence. The reversed Magician can also point to uneven information, overpromising, or impure motives. At this time, look at the facts. Do not trust beautiful presentation alone, and do not let fantasy replace real movement.',
        detail:
          'The Magician is card 1 of the Major Arcana. Unlike The Fool, who sets out with innocence, The Magician has already arrived at the threshold of action. Before him stand the wand, cup, sword, and pentacle, symbols of fire, water, air, and earth, and also of the will, emotions, thought, and material resources a person can draw upon.\n\nThis card symbolizes creation, practice, will, and manifestation. The Magician is not someone who waits for fate to descend; he is someone who gathers resources and makes things truly happen. One hand points to the sky, one to the earth, as if connecting inspiration with reality: ideas, desires, and possibilities from above must be brought down through concrete action before they can become something tangible.\n\nWhen The Magician appears upright, it usually means you already possess the conditions required to begin. You may still feel uncertain, but that does not mean you are unprepared. You may already have knowledge, experience, connections, tools, or opportunity; they simply have not yet been organized into a clear direction. The Magician reminds you that instead of waiting for perfect timing, you can start now and turn scattered resources into real results.\n\nThis card also emphasizes focus. The Magician s power does not come from random trying; it comes from concentrating attention on one clear aim. It encourages you to speak up, reach out, and actively design your own path. At this stage, your language, plans, and actions carry influence, so it matters even more that you know what you want to create.\n\nWhen The Magician appears reversed, it asks you to notice wasted resources, misused ability, or a gap between expression and action. You may say a lot without truly moving anything forward. You may have the right conditions yet fail to use them because of hesitation, distraction, or lack of planning. It may also point to manipulation, deception, and presentation without substance, warning you not to be seduced by surface confidence and polished promises. There may be talent and resources present, but they are not being truly activated; or someone may look impressive while what stands underneath is performance and deceit.\n\nThe core message of The Magician is this: possibility has already appeared, but it will not turn itself into reality. You need to extend your hand, gather your tools, confirm your aim, and let your will truly enter the world.',
      },
      it: {
        name: 'Il Mago',
        keywords: ['Creazione', 'Azione', 'Volonta', 'Manifestazione', 'Risorse', 'Padronanza', 'Passare alla pratica'],
        daily_upright:
          'Oggi e il momento giusto per trasformare le idee in azione. Hai gia risorse utili tra le mani: la chiave e attivarle, organizzarle, comunicare con chiarezza e aprire un nuovo capitolo invece di aspettare ancora.',
        daily_reversed:
          'Oggi fai attenzione a fantasie vuote, procrastinazione o molte parole senza fatti. Rischi di inciampare proprio in cio che credi di saper gestire bene, e conviene anche diffidare di chi copre le vere intenzioni con parole seducenti.',
        reading_upright:
          'Il Mago diritto rappresenta creativita, azione, volonta e manifestazione. Mostra che non sei priva o privo di preparazione: gli strumenti, le risorse o le capacita necessarie sono gia vicino a te, ma devono essere raccolti e usati consapevolmente.\n\nQuando appare in una stesa, Il Mago ti ricorda di trasformare il pensiero in azione concreta. Non e soltanto una carta di fantasia, ma una carta che fa accadere le cose. Attraverso obiettivi chiari, volonta concentrata e pratica reale, puoi trasformare in realta cio che finora esisteva solo nella mente.',
        reading_reversed:
          'Il Mago rovesciato rappresenta uso scorretto delle risorse, mancanza di azione, manipolazione, inganno, oppure idee che non riescono a prendere davvero forma. Potresti avere determinate condizioni ma non usarle nel modo giusto. Potresti anche fare troppo affidamento sulla tecnica o sulle parole, trascurando la vera capacita e l azione concreta.\n\nQuando appare in una stesa, ti invita a controllare se stai evitando l esecuzione o se sei confusa o confuso da una fiducia solo apparente. Il Mago rovesciato puo anche indicare informazioni sbilanciate, promesse eccessive o motivazioni poco pulite. In questo momento serve guardare i fatti, non soltanto l apparenza, e non lasciare che la fantasia sostituisca il vero avanzamento.',
        detail:
          'Il Mago e la carta numero 1 degli Arcani Maggiori. Diversamente dal Matto, che parte con innocenza, il Mago si trova gia sulla soglia dell azione. Davanti a lui ci sono bastone, coppa, spada e denaro, simboli dei quattro elementi e anche della volonta, delle emozioni, del pensiero e delle risorse materiali che una persona puo mettere in campo.\n\nQuesta carta simboleggia creazione, pratica, volonta e manifestazione. Il Mago non aspetta che il destino scenda dal cielo; raccoglie invece le risorse e fa accadere davvero le cose. Una mano punta verso il cielo e una verso la terra, come a collegare ispirazione e realta: idee, desideri e possibilita hanno bisogno di essere portati a terra tramite azione concreta per diventare qualcosa di tangibile.\n\nQuando il Mago appare diritto, di solito indica che possiedi gia le condizioni necessarie per iniziare. Potresti sentirti ancora incerta o incerto, ma questo non significa essere impreparata o impreparato. Potresti avere gia conoscenze, esperienza, contatti, strumenti o opportunita; devono solo essere organizzati in una direzione chiara. Il Mago ti ricorda che, invece di aspettare il momento perfetto, puoi iniziare e trasformare risorse sparse in risultati reali.\n\nQuesta carta sottolinea anche la concentrazione. Il potere del Mago non nasce da tentativi casuali, ma dal portare l attenzione verso un obiettivo preciso. Ti incoraggia a esprimerti, a prendere iniziativa e a progettare attivamente il tuo percorso. In questo momento parole, piani e azioni hanno impatto, quindi conta ancora di piu sapere cosa desideri creare.\n\nQuando il Mago appare rovesciato, ti chiede di notare risorse sprecate, capacita usate male o uno scarto tra espressione e azione. Potresti parlare molto senza muovere davvero nulla, oppure avere le condizioni giuste ma non usarle per esitazione, distrazione o mancanza di piano. Può anche indicare manipolazione, inganno e immagine senza sostanza. Possono esserci talento e risorse, ma non vengono davvero attivati; oppure qualcuno puo sembrare brillante mentre sotto c e soltanto performance e inganno.\n\nIl messaggio centrale del Mago e questo: la possibilita e gia comparsa, ma non si trasformera da sola in realta. Devi allungare la mano, raccogliere gli strumenti, chiarire l obiettivo e lasciare che la tua volonta entri davvero nel mondo.',
      },
    },
  },
  {
    id: 'the-high-priestess',
    number: 2,
    name_cn: '女祭司',
    name_en: 'The High Priestess',
    arcana: 'major',
    suit: '',
    image: getMeaningImage('女祭司'),
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
    translations: {
      en: {
        name: 'The High Priestess',
        keywords: ['Intuition', 'Secrets', 'The Subconscious', 'Silence', 'Insight', 'Waiting', 'Inner Wisdom'],
        daily_upright:
          'Today is good for slowing down and listening to your intuition. You already hold the wisdom needed to solve the problem; the answer may not be outside you at all.',
        daily_reversed:
          'Today asks you to be careful of judgment clouded by emotion, speculation, or hidden information. Do not rush to conclusions before checking whether you are seeing fact or imagination.',
        reading_upright:
          'The High Priestess upright represents intuition, the subconscious, secrets, and inner wisdom. It shows that the full truth may not have revealed itself yet, and that surface information alone cannot explain the whole situation. At this stage, observing, sensing, and waiting matter more than rushing into action.\n\nWhen it appears in a spread, The High Priestess reminds you to trust your inner perception. You may already have sensed subtle changes, even if you do not yet have hard proof. It does not encourage impulsive questioning or forcing progress; instead it asks you to stay quiet and notice dreams, hunches, silence, and everything that has not been spoken aloud.',
        reading_reversed:
          'The High Priestess reversed represents blocked intuition, exposed secrets, unclear information, or becoming too absorbed in your own speculation. You may feel that something is wrong, yet struggle to tell whether this is clear intuition or anxiety projecting itself.\n\nWhen it appears in a spread, it reminds you not to rely completely on vague feelings. This is a time to reorganize information, confirm facts, and avoid being led by concealment, misunderstanding, or self-deception. The reversed High Priestess can also indicate that repressed truths are starting to rise, asking you to face honestly what you already know and what you truly feel.',
        detail:
          'The High Priestess is card 2 of the Major Arcana. She sits between black and white pillars like a gatekeeper at the border between the visible and the hidden worlds. She does not rush to give answers and does not push herself outward. Instead, she sits in stillness, protecting truths that have not yet been fully revealed.\n\nThis card symbolizes intuition, the subconscious, secrets, silence, and inner wisdom. Unlike The Fool, who begins with innocence, The High Priestess draws her power from stillness. She reminds you that some answers cannot be chased; they can only arise when life becomes quiet enough for you to hear them. You are being asked to notice subtle signals: a strange feeling you cannot name, a recurring dream, words that remain unspoken in a relationship, or hidden motives beneath an event.\n\nWhen The High Priestess appears upright, it usually means that the time for full revelation has not yet come. You may already sense part of the truth, but more clues are still needed. This is not a moment for reckless action, nor for allowing the outside world to drag you forward. The High Priestess calls you back to your inner life, so that you can tell the difference between genuine intuition and passing emotion.\n\nWhen The High Priestess appears reversed, it asks you to notice confused information and truths that have been suppressed. You may be ignoring your intuition, or trusting it so much that you lose contact with reality. It can also suggest that a secret is beginning to surface, or that incomplete information is influencing your judgment. Instead of circling endlessly through guesswork, pause and confirm the facts. Ask yourself what you really know, and what you are afraid to know.\n\nThe core message of The High Priestess is this: not every answer is meant to be forced into the light immediately. Silence is not emptiness; sometimes it is a door. Your task is to grow still before it until you hear the true voice within.',
      },
      it: {
        name: 'La Papessa',
        keywords: ['Intuizione', 'Segreti', 'Subconscio', 'Silenzio', 'Intuizione profonda', 'Attesa', 'Saggezza interiore'],
        daily_upright:
          'Oggi e il momento giusto per rallentare e ascoltare la tua intuizione. Hai gia dentro di te la saggezza necessaria per risolvere cio che ti preoccupa; la risposta potrebbe non trovarsi nelle voci esterne.',
        daily_reversed:
          'Oggi fai attenzione a giudizi influenzati da emozioni, supposizioni o informazioni nascoste. Non trarre conclusioni troppo in fretta: verifica se stai vedendo fatti o immaginazioni.',
        reading_upright:
          'La Papessa diritta rappresenta intuizione, subconscio, segreti e saggezza interiore. Mostra che la verita completa potrebbe non essersi ancora rivelata e che le informazioni di superficie non bastano a spiegare tutto. In questo momento osservare, sentire e aspettare conta piu che agire subito.\n\nQuando appare in una stesa, La Papessa ti invita a fidarti della tua percezione interiore. Potresti avere gia colto piccoli cambiamenti, anche se non possiedi ancora prove chiare. Non incoraggia interrogazioni impulsive o spinte forzate in avanti; chiede invece silenzio, attenzione ai sogni, ai presentimenti, ai segnali nascosti e a tutto cio che non e stato detto.',
        reading_reversed:
          'La Papessa rovesciata rappresenta intuizione bloccata, segreti che emergono, informazioni poco chiare oppure un eccesso di supposizioni personali. Potresti sentire che qualcosa non va, ma non riuscire a distinguere tra intuizione lucida e ansia che si proietta.\n\nQuando appare in una stesa, ricorda di non affidarti ciecamente a sensazioni vaghe. E il momento di rimettere ordine nelle informazioni, verificare i fatti e non lasciarti guidare da omissioni, fraintendimenti o autoinganno. La Papessa rovesciata puo anche indicare che verita represse stanno tornando in superficie e ti chiedono di guardare con onesta cio che sai e cio che senti davvero.',
        detail:
          'La Papessa e la carta numero 2 degli Arcani Maggiori. Siede tra due colonne, nera e bianca, come una custode posta sul confine tra il mondo visibile e quello nascosto. Non corre a dare risposte e non si spinge verso l esterno. Rimane invece immobile, proteggendo una verita che non e ancora pronta a essere svelata del tutto.\n\nQuesta carta simboleggia intuizione, subconscio, segreti, silenzio e saggezza interiore. Diversamente dal Matto, che parte con innocenza, la forza della Papessa nasce dalla quiete. Ricorda che alcune risposte non si ottengono inseguendole: emergono solo quando c e abbastanza silenzio da poterle ascoltare. Invita a notare segnali sottili: una sensazione che non sai nominare, un sogno ricorrente, parole non dette dentro una relazione, o motivazioni nascoste dietro un evento.\n\nQuando la Papessa appare diritta, di solito significa che il momento della piena rivelazione non e ancora arrivato. Forse senti gia una parte della verita, ma servono ancora altri indizi. Non e il tempo di agire in modo impulsivo, ne di lasciarti trascinare dal rumore esterno. La Papessa ti chiama a tornare dentro di te, cosi da distinguere l intuizione autentica dall emozione passeggera.\n\nQuando la Papessa appare rovesciata, ti invita a notare informazioni confuse e verita represse. Potresti ignorare la tua intuizione, oppure affidarti a essa al punto da perdere contatto con la realta. Puo anche indicare che un segreto sta venendo alla luce o che informazioni incomplete stanno influenzando il tuo giudizio. Invece di restare intrappolata o intrappolato nelle supposizioni, fermati e verifica i fatti. Chiediti che cosa sai davvero e che cosa temi di sapere.\n\nIl messaggio centrale della Papessa e questo: non tutte le risposte devono essere inseguite subito. Il silenzio non e vuoto; a volte e una porta. Il tuo compito e sostare davanti a quella porta in quiete, finche la vera voce interiore non si fa sentire.',
      },
    },
  },
  {
    id: 'the-empress',
    number: 3,
    name_cn: '女皇',
    name_en: 'The Empress',
    arcana: 'major',
    suit: '',
    image: getMeaningImage('女皇'),
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
        keywords: ['Abundance', 'Beauty', 'Nourishment', 'Creativity', 'The Senses', 'Mothering', 'Nature', 'Enjoyment'],
        daily_upright:
          'Today is good for treating your body and feelings with kindness. Move closer to beauty, food, nature, and real pleasure. You are allowed to let life become more abundant.',
        daily_reversed:
          'Today asks you to watch for over-giving, exhausting yourself, or turning care for others into neglect of yourself. Also notice indulgence, laziness, or anxiety around appearance and material things.',
        reading_upright:
          'The Empress upright represents abundance, nourishment, creativity, and growth in the material world. It shows that something is entering a stage of gestation and maturity. This may concern relationship, creativity, money, quality of life, the body, or a softer and more stable sense of security.\n\nWhen it appears in a spread, The Empress asks you to welcome your feelings and desires. This is not a card of cold logic, but of life force itself. By caring for the body, improving the environment, expressing beauty, and tending relationship, you allow things to become fuller over time. The Empress can also represent strong attraction and feminine magnetism, suggesting that you have the power to create, attract, and nourish reality.',
        reading_reversed:
          'The Empress reversed represents scarcity, overdependence, blocked creativity, or anxiety around the body, appearance, material conditions, and relationship. You may long for love and safety, yet exhaust yourself inwardly through over-giving, overreaching, or failing to care for your own needs.\n\nWhen it appears in a spread, The Empress reversed asks you to rethink what abundance really means. True abundance is not a beautiful shell forced into place, nor is it a hollow center filled with possessions or attention. It is time to ask whether you have ignored the needs of the body, suppressed creativity, or placed too much of your worth in the approval of others.',
        detail:
          'The Empress is card 3 of the Major Arcana, and she carries the atmosphere of Venus. She symbolizes beauty, love, sensuality, abundance, and creativity. Her power does not come from control or command, but from a natural current of life itself: flowers bloom, fruit ripens, the body feels pleasure, and love and beauty grow where they are nourished.\n\nThe Empress is often seated in soft, fertile nature, surrounded by wheat, forest, water, and the sign of Venus. These symbols all point to richness in the material world: food, the body, the land, wealth, art, love, and everything that can be touched, felt, and enjoyed. She reminds you not to live only in your mind, but also to return to the body, to life, and to real sensation and warmth.\n\nWhen The Empress appears upright, it usually means that something is being nurtured and is slowly maturing. It may show a relationship becoming more intimate, a creative plan beginning to grow, a rise in quality of life, or your rediscovery of beauty and joy. The Empress is not a hurried card. She is more like fertile ground: if you keep tending it, life gradually takes form.\n\nThis card also speaks of strong feminine energy, but not merely physical beauty. It is a fuller state of life: soft, abundant, attractive, able to enjoy and able to create. She knows that beauty is not decoration but power, that the body is not a burden but a doorway into experience, and that material comfort is not vulgar but the flower that blooms once life has become grounded enough to hold it.\n\nWhen The Empress appears reversed, she asks you to notice imbalance hiding beneath abundance. You may be caring too much for others while forgetting to nourish yourself. You may be trapped in anxiety about appearance, money, relationship, or comfort. The reversed Empress can also show blocked creativity: wanting to express or grow, but lacking the right soil.\n\nIt may also point to a state that looks abundant from the outside but feels empty within. You may possess much yet feel little satisfaction. You may look beautiful yet feel no true joy. The question then becomes simple: what does your body need? What does your heart genuinely want to move closer to? Are you nourishing yourself, or only maintaining a shell that appears beautiful?\n\nThe core message of The Empress is this: beauty, love, and abundance all need real nourishment. You are allowed to desire, enjoy, and create texture in your life. But remember that true abundance is not about piling things up. It is about letting life grow safely where you are.',
      },
      it: {
        name: 'L Imperatrice',
        keywords: ['Abbondanza', 'Bellezza', 'Nutrimento', 'Creativita', 'Sensualita', 'Maternita', 'Natura', 'Piacere'],
        daily_upright:
          'Oggi e il momento giusto per trattare con gentilezza il tuo corpo e le tue emozioni. Avvicinati alla bellezza, al cibo, alla natura e alla gioia autentica. Meriti una vita piu ricca.',
        daily_reversed:
          'Oggi fai attenzione a consumarti troppo o a trasformare il prenderti cura degli altri in trascuratezza verso te stessa o te stesso. Nota anche eccessi, pigrizia o ansia per l aspetto e per la sicurezza materiale.',
        reading_upright:
          'L Imperatrice diritta rappresenta abbondanza, nutrimento, creativita e crescita sul piano concreto. Indica che qualcosa sta entrando in una fase di gestazione e maturazione. Può riguardare una relazione, un progetto creativo, il denaro, la qualita della vita, il corpo o un senso di sicurezza piu morbido e stabile.\n\nQuando appare in una stesa, L Imperatrice ti invita ad accogliere desideri e sentimenti. Non e una carta di logica fredda, ma della forza vitale stessa. Curando il corpo, migliorando l ambiente, esprimendo bellezza e coltivando i legami, permetti alla vita di diventare piu piena. L Imperatrice puo anche rappresentare forte attrazione e magnetismo femminile, segnalando che possiedi la capacita di creare, attrarre e nutrire la realta.',
        reading_reversed:
          'L Imperatrice rovesciata rappresenta senso di mancanza, dipendenza eccessiva, creativita bloccata o ansia legata al corpo, all aspetto, alla materia e alle relazioni. Potresti desiderare amore e sicurezza, ma svuotarti interiormente per eccesso di sacrificio, di richiesta o per incapacita di prenderti davvero cura di te.\n\nQuando appare in una stesa, L Imperatrice rovesciata ti invita a ripensare che cosa significhi davvero abbondanza. La vera ricchezza non e un involucro bello mantenuto a forza, ne un vuoto riempito con oggetti o conferme. E il momento di chiederti se stai ignorando i bisogni del corpo, comprimendo la creativita o affidando troppo del tuo valore all approvazione altrui.',
        detail:
          'L Imperatrice e la carta numero 3 degli Arcani Maggiori e porta con se l atmosfera di Venere. Simboleggia bellezza, amore, sensualita, abbondanza e creativita. Il suo potere non nasce dal controllo o dal comando, ma da un flusso naturale di vita: i fiori sbocciano, i frutti maturano, il corpo sente il piacere e amore e bellezza crescono dove ricevono nutrimento.\n\nL Imperatrice e spesso raffigurata immersa in una natura soffice e fertile, circondata da grano, boschi, acqua e simboli venusiani. Tutto questo richiama la ricchezza del mondo materiale: cibo, corpo, terra, benessere, arte, amore, e tutto cio che puo essere toccato, sentito e goduto. Ricorda di non vivere soltanto nella mente, ma di tornare anche al corpo, alla vita, al calore e alla concretezza delle sensazioni.\n\nQuando L Imperatrice appare diritta, di solito significa che qualcosa viene nutrito e sta lentamente maturando. Può indicare una relazione che si fa piu intima, un progetto creativo che comincia a crescere, un miglioramento della qualita della vita, o il ritorno della capacita di sentire bellezza e piacere. L Imperatrice non e una carta frenetica. Assomiglia piu a una terra fertile: se continui a coltivarla, la vita prende forma.\n\nQuesta carta parla anche di una forte energia femminile, ma non soltanto di bellezza esteriore. Indica uno stato di vita piu completo: morbido, ricco, attraente, capace di godere e capace di creare. Sa che la bellezza non e decorazione ma forza, che il corpo non e un peso ma una porta d ingresso all esperienza, e che la materia non e qualcosa di volgare ma il fiore che nasce quando la vita puo finalmente radicarsi.\n\nQuando L Imperatrice appare rovesciata, invita a osservare lo squilibrio nascosto dietro la ricchezza apparente. Potresti prenderti troppo cura degli altri dimenticando te stessa o te stesso. Potresti essere intrappolata o intrappolato nell ansia per l aspetto, il denaro, la relazione o il comfort. L Imperatrice rovesciata può anche segnalare creativita bloccata: voler esprimere o crescere, ma non avere ancora il terreno giusto.\n\nPuò anche indicare una condizione che dall esterno appare abbondante ma dentro si sente vuota. Potresti avere molto eppure non sentirti soddisfatta o soddisfatto. Potresti apparire bella o bello senza provare vera gioia. La domanda allora torna essenziale: di che cosa ha bisogno il tuo corpo? Verso cosa desidera davvero andare il tuo cuore? Ti stai nutrendo davvero, oppure stai solo mantenendo una bella superficie?\n\nIl messaggio centrale dell Imperatrice e questo: bellezza, amore e abbondanza hanno bisogno di vero nutrimento. Hai il diritto di desiderare, godere e creare una vita piena di consistenza. Ma ricorda che la vera abbondanza non e accumulare sempre di piu: e permettere alla vita di crescere con sicurezza dentro di te.',
      },
    },
  },
  {
    id: 'the-emperor',
    number: 4,
    name_cn: '皇帝',
    name_en: 'The Emperor',
    arcana: 'major',
    suit: '',
    image: getMeaningImage('皇帝'),
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
        keywords: ['Authority', 'Order', 'Control', 'Stability', 'Status', 'Rules', 'Responsibility', 'Male Support'],
        daily_upright:
          'Today is good for creating order, setting clear boundaries, and holding the situation steadily in your own hands. You may also receive support from an experienced or influential male figure.',
        daily_reversed:
          'Today asks you to watch for excessive control, stubbornness, or being suppressed by authority. Do not turn principle into tyranny, and do not let rebellion against rules push everything into chaos.',
        reading_upright:
          'The Emperor upright represents authority, order, responsibility, and solid position. It shows that this situation calls for clear rules, firm boundaries, and practical control. Emotion and imagination matter less here than structure, planning, execution, and accountability.\n\nWhen it appears in a spread, The Emperor reminds you to take back command of the situation. You need to set stronger principles, organize resources, make decisions, and accept responsibility for the outcome. It may also symbolize a mature, powerful, well-resourced, or high-status man, appearing as a mentor, leader, father, superior, or male benefactor who offers protection, advice, or practical help.',
        reading_reversed:
          'The Emperor reversed represents unbalanced control, tyranny, rigidity, oppression, or instability in a position of authority. You may be dealing with someone overly harsh, or with rules that demand obedience without reason. It can also show that you are trying so hard to control everything that the situation becomes strained.\n\nWhen it appears in a spread, The Emperor reversed asks you to examine whether power has become distorted. True stability is not maintained through suppression, and true authority is not built on fear. Ask yourself whether you are creating order or merely creating control, and whether you are taking responsibility or hiding insecurity behind hardness.',
        detail:
          'The Emperor is card 4 of the Major Arcana. He symbolizes authority, order, structure, and secure standing in the material world. If The Empress represents fertile land, then The Emperor represents the walls, laws, and throne built upon that land. His power is not soft, but it is stable; not always tender, but capable of keeping the whole structure from collapsing.\n\nThe Emperor is usually shown seated on a hard throne, serious in expression, holding a scepter of power. Unlike The Empress, who allows life to grow through nourishment, he creates order through rule, boundary, and decision. He is less concerned with what is felt than with how something is managed, carried out, and sustained. He represents practical command and the capacity to discipline desire, emotion, and action.\n\nWhen The Emperor appears upright, it usually means that stronger self-control and clearer practical judgment are required. Perhaps the situation can no longer be moved by feeling alone; it needs plan, system, duty, and definite decisions. The Emperor asks you to hold your position firmly and not be easily shaken by outside interference. You need to know where your boundaries are, where your resources are, where the goal is, and what must be carried by you.\n\nThis card also often points to stable social standing, power structures, or a male figure with real influence. He may appear as a father, employer, mentor, elder, or powerful male ally. He may not help in a soft way, but what he brings is often practical support: resources, rules, experience, protection, and steadiness. His help is not emotional comfort; it is what allows things to land in reality.\n\nYet The Emperor also has a clear shadow. When his order swells too far, it becomes tyranny. When his control loses flexibility, it becomes oppression. He can represent a figure who demands obedience but forbids questioning, or your own overly hardened inner stance: fear of disorder leading you to grip everything too tightly, fear of vulnerability covered over with coolness and command.\n\nWhen The Emperor appears reversed, he asks you to notice imbalance in power relations. You may be suppressed by rules, elders, leaders, or male authority; or you may be treating yourself and others with too much hardness. He can also indicate unstable status, lack of responsibility, avoidance of duty, or an attempt to control everything while inner order is already weakening.\n\nThe core message of The Emperor is this: real strength is not keeping everything beneath your feet, but creating order and accepting the responsibility that order requires. Steady your throne, but remember that authority without clarity and boundary becomes a cage.',
      },
      it: {
        name: 'L Imperatore',
        keywords: ['Autorita', 'Ordine', 'Controllo', 'Stabilita', 'Status', 'Regole', 'Responsabilita', 'Aiuto maschile'],
        daily_upright:
          'Oggi e il momento giusto per creare ordine, chiarire i confini e tenere la situazione con fermezza nelle tue mani. Potresti anche ricevere supporto da una figura maschile esperta o autorevole.',
        daily_reversed:
          'Oggi fai attenzione a un eccesso di controllo, alla rigidita o a un autorita che opprime. Non trasformare il principio in tirannia, ma non lasciare nemmeno che la ribellione alle regole faccia perdere il controllo.',
        reading_upright:
          'L Imperatore diritto rappresenta autorita, ordine, responsabilita e posizione stabile. Indica che la situazione richiede regole chiare, confini definiti e controllo sul piano pratico. In questo momento emozione e immaginazione contano meno di struttura, pianificazione, esecuzione e assunzione di responsabilita.\n\nQuando appare in una stesa, L Imperatore ti ricorda di riprendere il comando della situazione. Hai bisogno di principi piu saldi, di risorse organizzate, di decisioni nette e della capacita di sostenere le conseguenze. Può anche simboleggiare un uomo maturo, forte, con risorse o con posizione sociale, che compare come mentore, guida, padre, superiore o benefattore e offre protezione, consiglio o aiuto concreto.',
        reading_reversed:
          'L Imperatore rovesciato rappresenta controllo squilibrato, tirannia, rigidita, oppressione o instabilita nella posizione di autorita. Potresti avere a che fare con una persona troppo dura, oppure con regole che chiedono obbedienza senza ragione. Può anche indicare che stai cercando di controllare tutto in modo cosi serrato da irrigidire l intera situazione.\n\nQuando appare in una stesa, L Imperatore rovesciato ti chiede di osservare se il potere e diventato distorto. La vera stabilita non nasce dalla repressione, e la vera autorita non si fonda sulla paura. Chiediti se stai creando ordine o soltanto controllo, e se stai assumendo responsabilita oppure stai coprendo l insicurezza con durezza.',
        detail:
          'L Imperatore e la carta numero 4 degli Arcani Maggiori. Simboleggia autorita, ordine, struttura e posizione solida nel mondo materiale. Se l Imperatrice rappresenta la terra fertile, allora l Imperatore rappresenta le mura, le leggi e il trono costruiti sopra quella terra. Il suo potere non e morbido, ma e stabile; non sempre e tenero, ma sa sostenere la struttura senza lasciarla crollare.\n\nL Imperatore viene spesso raffigurato seduto su un trono rigido, con sguardo severo e scettro di potere in mano. Diversamente dall Imperatrice, che lascia crescere la vita attraverso il nutrimento, egli crea ordine tramite regola, confine e decisione. Lo interessa meno cio che si prova e di piu il modo in cui qualcosa viene gestito, eseguito e mantenuto. Rappresenta il comando pratico e la capacita di disciplinare desiderio, emozione e azione.\n\nQuando L Imperatore appare diritto, di solito indica che sono necessari maggiore autocontrollo e giudizio pratico piu netto. Forse la situazione non puo piu essere spinta avanti solo dalle sensazioni; servono piano, sistema, dovere e decisioni chiare. L Imperatore ti chiede di occupare saldamente il tuo posto e di non lasciarti scuotere facilmente dall esterno. Devi sapere dove sono i confini, dove sono le risorse, qual e il traguardo e che cosa spetta a te sostenere.\n\nQuesta carta indica spesso anche posizione sociale stabile, strutture di potere o una figura maschile con reale influenza. Puo essere un padre, un datore di lavoro, un mentore, un anziano o un alleato forte. Forse non aiuta in modo tenero, ma quello che porta e supporto concreto: risorse, regole, esperienza, protezione e stabilita. Il suo aiuto non e consolazione emotiva, ma cio che permette alle cose di prendere forma nella realta.\n\nL Imperatore ha pero anche un ombra evidente. Quando il suo ordine si espande troppo, diventa tirannia. Quando il suo controllo perde flessibilita, diventa oppressione. Può rappresentare una figura che pretende obbedienza e vieta il dubbio, oppure una tua parte interiore eccessivamente indurita: la paura del disordine che ti porta a stringere tutto troppo forte, o la paura della vulnerabilita coperta da freddezza e comando.\n\nQuando L Imperatore appare rovesciato, invita a notare gli squilibri nei rapporti di potere. Potresti essere oppressa o oppresso da regole, figure anziane, capi o autorita maschili; oppure potresti trattare te stessa o te stesso e gli altri con troppa durezza. Può anche indicare posizione instabile, mancanza di responsabilita, fuga dal dovere o il tentativo di controllare tutto mentre l ordine interiore si sta gia indebolendo.\n\nIl messaggio centrale dell Imperatore e questo: la vera forza non e tenere tutto sotto i piedi, ma creare ordine e accettare la responsabilita che l ordine richiede. Rendi saldo il tuo trono, ma ricorda che l autorita senza lucidita e confine si trasforma in gabbia.',
      },
    },
  },
  {
    id: 'the-hierophant',
    number: 5,
    name_cn: '教皇',
    name_en: 'The Hierophant',
    arcana: 'major',
    suit: '',
    image: getMeaningImage('教皇'),
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
        keywords: ['Tradition', 'Teaching', 'Faith', 'Rules', 'Institutions', 'Mentor', 'Transmission', 'Spiritual Order', 'Rebellion', 'Inner Voice'],
        daily_upright:
          'Today is good for asking advice from someone experienced, or handling a problem through a mature and proven method. Rules are not always a cage; sometimes they are the handrail that keeps the situation steady.',
        daily_reversed:
          'Today you may want to break away from a rule, expectation, or traditional framework. Listen to your true inner voice, but ask whether you are choosing your own road consciously, or simply resisting for the sake of resistance.',
        reading_upright:
          'The Hierophant upright represents tradition, faith, systems, learning, and spiritual guidance. It suggests that the issue in front of you may need to return to rules, experience, ethics, or a mature structure rather than relying only on personal impulse.\n\nWhen it appears in a spread, The Hierophant encourages you to seek reliable guidance. It may symbolize a teacher, elder, mentor, professional, or a recognized framework such as school, institution, marriage, certification, religion, or socially acknowledged relationship structures. At this time, following a stable rule can actually give you more safety and direction.',
        reading_reversed:
          'The Hierophant reversed represents questioning tradition, rebellion, stepping outside an old framework, or beginning to follow your own inner voice. You may no longer be willing to accept the answer of “this is just how everyone does it,” nor continue letting identity, relationship, social system, or moral standard define you.\n\nWhen it appears in a spread, The Hierophant reversed asks you to reconsider whether the rules in front of you truly protect you or merely discipline you. Is a certain authority genuinely wise, or only using the appearance of correctness as control? It may also show that you are loosening your ties to an inherited system and searching for beliefs that fit you more truthfully. You do not need blind obedience, but you also do not need rebellion for its own sake. Real freedom is not rejecting every rule; it is knowing which ones deserve to remain and which no longer belong to you.',
        detail:
          'The Hierophant is card 5 of the Major Arcana. He sits in a sacred and solemn position like a transmitter between the human world and spiritual order. Unlike The Emperor, whose power is worldly and structural, The Hierophant does not rule land, armies, or thrones. What he holds is faith, knowledge, tradition, and the rules recognized by society.\n\nThis card symbolizes teaching, inheritance, institution, ethics, and spiritual order. It points to methods that have been tested over time: a teacher s instruction, family tradition, educational systems, religious belief, and socially recognized relationship contracts. The Hierophant does not encourage you to figure everything out in isolation. He is more like a voice saying: some roads have already been walked; some questions can be answered through experience and tradition.\n\nWhen The Hierophant appears upright, it usually means that you need to study, consult, or enter a more stable framework. You may need a mentor, a reliable system, a clear method, or a spiritual support that gives you peace. Here, rules are not necessarily shackles. They can also be protection. They give boundaries to confusion and help a lost person understand what the next step should be.\n\nThe Hierophant is also often linked with formal relationship and social recognition: marriage, contracts, admission, exams, certification, belonging to an organization, or a relationship moving into a more clearly defined and traditional form. It emphasizes not temporary passion but stability that is acknowledged, named, and placed into order.\n\nYet The Hierophant also has a shadow. When tradition becomes rigid, teaching can turn into preaching. When rules are made sacred, the individual voice can be pressed down. In reversal, The Hierophant asks you to notice false authority, hollow morality, outdated beliefs, or a system that demands obedience but does not allow thought. You may be trapped by “the right answer” and forget that real wisdom should make you more awake, not more numb.\n\nAt the same time, The Hierophant reversed is not always negative. It can represent rebellion, departure, questioning tradition, and waking up from a fixed framework. You may begin to realize that certain teachings do not fit you, and that certain life paths praised by society are not truly yours. At that point, listening to your inner voice becomes essential: you need to build your own belief instead of merely inheriting someone else s answer.\n\nWhen The Hierophant appears reversed, it can also show that you are stepping away from an old structure and beginning to search for your own road. This may not be easy, because questioning tradition often means losing a certain sense of safety and even being judged as disobedient or difficult. But it reminds you that not everything passed down must be inherited, and not every authority deserves trust. Real belief must pass through your own choice.\n\nThe core message of The Hierophant is this: true tradition should pass on wisdom, not build a prison. You can learn from those who came before you, and you can also re-examine the rules. What matters is knowing what is guiding you and what is taming you. In the end, what you must find is not merely an answer approved by the outside world, but a path you are truly willing to believe in and carry.',
      },
      it: {
        name: 'Il Papa',
        keywords: ['Tradizione', 'Insegnamento', 'Fede', 'Regole', 'Sistema', 'Mentore', 'Trasmissione', 'Ordine spirituale', 'Ribellione', 'Voce interiore'],
        daily_upright:
          'Oggi e il momento giusto per chiedere consiglio a chi ha esperienza o per affrontare un problema seguendo un metodo maturo. Le regole non sono sempre una gabbia: a volte sono il sostegno che ti aiuta a tenere ferma la situazione.',
        daily_reversed:
          'Oggi potresti sentire il bisogno di rompere una regola, un aspettativa o una cornice tradizionale. Ascolta la tua vera voce interiore, ma chiediti anche se stai scegliendo con lucidita la tua strada o se stai semplicemente reagendo per spirito di opposizione.',
        reading_upright:
          'Il Papa diritto rappresenta tradizione, fede, istituzioni, apprendimento e guida spirituale. Indica che la questione presente potrebbe richiedere un ritorno a regole, esperienza, etica o a una struttura matura, invece di affidarsi soltanto all impulso personale.\n\nQuando appare in una stesa, Il Papa ti invita a cercare una guida affidabile. Può simboleggiare un insegnante, un anziano, un mentore, un professionista, oppure una struttura riconosciuta come scuola, istituzione, matrimonio, certificazione, religione o forma di relazione approvata socialmente. In questo momento seguire una regola stabile può offrirti maggiore sicurezza e orientamento.',
        reading_reversed:
          'Il Papa rovesciato rappresenta il dubbio verso la tradizione, la ribellione, l uscita da un vecchio schema, oppure l inizio di un ascolto piu fedele della propria voce interiore. Potresti non voler piu accettare risposte del tipo “si fa cosi perche lo fanno tutti”, ne continuare a lasciarti definire da identita, relazioni, sistemi o standard morali esterni.\n\nQuando appare in una stesa, Il Papa rovesciato ti chiede di domandarti se le regole davanti a te ti stanno davvero proteggendo o se ti stanno soltanto addestrando. Una certa autorita e veramente saggia, oppure usa la facciata del giusto come forma di controllo? Può anche indicare che ti stai sciogliendo da un sistema ereditato per cercare convinzioni piu vere per te. Non serve obbedire ciecamente, ma nemmeno ribellarsi per abitudine. La vera liberta non consiste nel rifiutare ogni regola, ma nel capire quali meritano di restare e quali non appartengono piu al tuo cammino.',
        detail:
          'Il Papa e la carta numero 5 degli Arcani Maggiori. Siede in una posizione sacra e solenne, come una figura che trasmette ordine spirituale tra il mondo umano e quello del significato. Diversamente dall Imperatore, il cui potere e materiale e terreno, Il Papa non governa terre, eserciti o troni. Egli custodisce fede, sapere, tradizione e le regole riconosciute dalla societa.\n\nQuesta carta simboleggia insegnamento, eredita, istituzione, etica e ordine spirituale. Indica metodi che sono stati verificati nel tempo: l insegnamento di un maestro, la tradizione di una famiglia, il sistema scolastico, la fede religiosa e i legami riconosciuti socialmente. Il Papa non ti invita a cercare ogni risposta in totale solitudine. E piu simile a una voce che ricorda: alcune strade sono gia state percorse; alcune domande possono trovare risposta nell esperienza e nella tradizione.\n\nQuando Il Papa appare diritto, di solito significa che hai bisogno di studiare, chiedere consiglio o entrare in una struttura piu stabile. Potresti aver bisogno di un mentore, di un sistema affidabile, di un metodo chiaro o di un sostegno spirituale capace di darti quiete. Qui le regole non sono necessariamente catene. Possono anche essere protezione. Danno confini al caos e aiutano chi e smarrita o smarrito a capire quale possa essere il passo successivo.\n\nIl Papa e spesso legato anche a relazioni formali e a riconoscimento sociale: matrimonio, contratti, ammissioni, esami, certificazioni, appartenenza a un organizzazione o una relazione che entra in una forma piu definita e tradizionale. Sottolinea non la passione momentanea, ma la stabilita che viene riconosciuta, nominata e collocata dentro un ordine.\n\nMa Il Papa possiede anche un ombra. Quando la tradizione diventa rigida, l insegnamento puo trasformarsi in predica. Quando la regola viene sacralizzata, la voce individuale puo essere soffocata. In rovescio, Il Papa ti chiede di notare autorita false, morale vuota, idee superate o sistemi che chiedono obbedienza senza consentire pensiero. Potresti essere intrappolata o intrappolato dalla “risposta giusta” e dimenticare che la vera saggezza dovrebbe renderti piu sveglia o sveglio, non piu addormentata o addormentato.\n\nAllo stesso tempo, Il Papa rovesciato non e sempre negativo. Può rappresentare ribellione, uscita, dubbio verso la tradizione e risveglio da uno schema fisso. Potresti iniziare a capire che certi insegnamenti non fanno per te e che certi percorsi approvati socialmente non sono davvero i tuoi. In quel momento ascoltare la tua voce interiore diventa essenziale: hai bisogno di costruire una tua convinzione, non soltanto di ereditare la risposta di qualcun altro.\n\nQuando Il Papa appare rovesciato, può anche mostrare che ti stai allontanando da una struttura antica per cercare la tua strada. Questo processo non e sempre facile, perche mettere in dubbio la tradizione spesso significa perdere un certo senso di sicurezza e correre il rischio di essere considerata o considerato scomoda o scomodo. Ma la carta ricorda che non tutto cio che viene tramandato deve essere ereditato, e non ogni autorita merita fiducia. La vera fede deve passare attraverso la tua scelta.\n\nIl messaggio centrale del Papa e questo: la vera tradizione dovrebbe trasmettere saggezza, non costruire una prigione. Puoi imparare da chi e venuto prima, e puoi anche rivedere le regole. Cio che conta e capire cosa ti sta guidando e cosa ti sta addomesticando. Alla fine, devi trovare non soltanto una risposta approvata dal mondo esterno, ma la strada che sei davvero disposta o disposto a credere e a portare.',
      },
    },
  },
  {
    id: 'the-lovers',
    number: 6,
    name_cn: '恋人',
    name_en: 'The Lovers',
    arcana: 'major',
    suit: '',
    image: getMeaningImage('恋人'),
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
          'Today is good for honest conversation and for moving closer to people and relationships that let you breathe more freely. What matters is not a brief rush of feeling, but whether you can truly hear one another. You already have the ability to express yourself well.',
        daily_reversed:
          'Today asks you to watch for misunderstanding, avoidance, or clashing values in relationship. Also ask whether you are ignoring your true choice just to keep a connection in place. Poor communication can easily magnify confusion.',
        reading_upright:
          'The Lovers upright represents love, attraction, intimacy, and healthy communication. It suggests that a strong connection may be forming between people, one that is not only emotional, but also built through mutual understanding, responsiveness, and closeness in values.\n\nWhen it appears in a spread, The Lovers often points to an important choice. That choice may not concern romance alone; it can also arise in life direction, partnership, identity, or the desires of the heart. This card asks you not to focus only on sweetness at the surface, but to ask whether the relationship or choice brings you closer to your real self. A good connection does not make you smaller; it helps you become more awake and more whole.',
        reading_reversed:
          'The Lovers reversed represents poor communication, imbalance in relationship, conflict in values, or avoidance of your true feelings when facing a choice. You may feel pulled inside a relationship: part of you longs for connection, while another part quietly senses inequality, restriction, or the inability to express yourself honestly.\n\nWhen it appears in a spread, The Lovers reversed asks you to examine your power of choice inside relationship. Are you compromising too much simply to be loved? Are you staying because of fear, guilt, or habit when you could actually leave? It can also mark an awakening: the realization that love should not become a cage, and intimacy should not demand the loss of your own voice.',
        detail:
          'The Lovers is card 6 of the Major Arcana. It is often understood as the card of love, but its meaning reaches far beyond romance alone. The Lovers concerns connection, communication, choice, and free will inside relationship. Its deeper question is not “Does someone love me?” but “Am I still myself inside this bond?”\n\nIn the card image, two figures stand beneath an angel, as if held in a relationship that is both blessed and illuminated. There is attraction between them, but also honesty; intimacy, but also a truth not yet completely hidden. The beauty of The Lovers is not romance alone, but a state in which people can truly see and respond to one another. It stands for healthy communication, for the willingness to open the heart, and for the most precious part of relationship: I move toward you, but I do not disappear from myself.\n\nWhen The Lovers appears upright, it usually means that an important connection is taking shape. It may be a love relationship, a sincere conversation, a trustworthy partner, or a choice aligned with your values. It reminds you that relationships with real life in them do not depend on passion alone, but also on understanding, respect, and communication. Whether two people can tell the truth, hear one another, and remain close even in difference is what truly matters here.\n\nThis card also often points to choice. You may be standing between two paths: one safer and more acceptable to the outside world, the other closer to your heart. The Lovers reminds you that choice shapes who you become. The person you choose, the kind of relationship you choose, and the way you choose to express love all become part of the person you are making.\n\nAt a deeper level, The Lovers can also represent awakening, especially self-awakening within relationship. It is not only about “finding love,” but about realizing that you have the right to choose, the right to say no, and the courage to leave what is unhealthy. In certain contexts this card can even symbolize a woman waking up from the position of being watched or chosen and reclaiming her own voice. She can love, and she can also leave. She can draw closer, and she can refuse. She can enter relationship, and she can also stop treating relationship as the only possible destiny.\n\nWhen The Lovers appears reversed, it asks you to notice imbalance, misunderstanding, avoidance, and conflict in values. Outwardly things may still seem intimate, but inwardly cracks may already be there. You may be afraid to say what you truly think, or you may be suppressing yourself in order to preserve the relationship. It can also show a choice delayed too long: you already know what you want, but you have not yet admitted it.\n\nThe core message of The Lovers is this: true communication is harmony and deep understanding. Love is not the loss of self, and choice is not surrendering yourself. A relationship worth approaching will make you freer, clearer, and more courageous in becoming whole.',
      },
      it: {
        name: 'Gli Amanti',
        keywords: ['Amore', 'Attrazione', 'Comunicazione', 'Scelta', 'Relazione', 'Valori', 'Risveglio', 'Libero arbitrio'],
        daily_upright:
          'Oggi e un buon giorno per comunicare con sincerita e avvicinarti alle persone e alle relazioni che ti fanno sentire piu aperta o aperto. Cio che conta non e un emozione momentanea, ma la capacita di ascoltarvi davvero. Hai gia gli strumenti per esprimerti bene.',
        daily_reversed:
          'Oggi fai attenzione a malintesi, evitamento o differenze profonde di valori dentro una relazione. Chiediti anche se stai ignorando la tua vera scelta pur di mantenere un legame. Una comunicazione confusa puo aggravare facilmente ogni tensione.',
        reading_upright:
          'Gli Amanti diritti rappresentano amore, attrazione, intimita e buona comunicazione. Indicano che tra persone può nascere una connessione forte, non fatta solo di emozione, ma anche di comprensione reciproca, risposta sincera e vicinanza di valori.\n\nQuando appare in una stesa, questa carta segnala spesso una scelta importante. Non riguarda soltanto la sfera amorosa: può toccare la direzione di vita, una collaborazione, l identita o i desideri del cuore. Ti chiede di non fermarti alla dolcezza superficiale, ma di domandarti se quella relazione o quella scelta ti avvicinano di piu alla tua verita. Una relazione sana non ti rimpicciolisce; ti rende piu lucida o lucido e piu intera o intero.',
        reading_reversed:
          'Gli Amanti rovesciati rappresentano comunicazione difficile, squilibrio relazionale, conflitto di valori o fuga dai propri veri sentimenti di fronte a una scelta. Potresti sentirti tirata o tirato dentro un legame: da una parte desideri connessione, dall altra percepisci mancanza di liberta, disuguaglianza o impossibilita di esprimerti davvero.\n\nQuando appare in una stesa, Gli Amanti rovesciati ti chiedono di esaminare il tuo potere di scelta dentro la relazione. Ti stai sacrificando troppo solo per essere amata o amato? Stai restando per paura, senso di colpa o abitudine, quando in realta potresti andartene? Può anche indicare un risveglio: capire che l amore non dovrebbe diventare una gabbia, e che l intimita non dovrebbe chiederti di rinunciare alla tua voce.',
        detail:
          'Gli Amanti sono la carta numero 6 degli Arcani Maggiori. Vengono spesso associati all amore, ma il loro significato va ben oltre il solo romanticismo. Gli Amanti parlano di connessione, comunicazione, scelta e libero arbitrio dentro la relazione. La domanda profonda non e “qualcuno mi ama?”, ma “in questa relazione resto ancora me stessa o me stesso?”\n\nNell immagine della carta, due figure stanno sotto un angelo, come se fossero immerse in un rapporto benedetto e reso visibile. Tra loro esistono attrazione e sincerita, intimita e una verita non del tutto nascosta. La bellezza degli Amanti non e soltanto il romanticismo, ma la possibilita di vedersi davvero e di rispondersi. La carta rappresenta comunicazione armoniosa, il coraggio di aprire il cuore e la parte piu preziosa del legame: mi avvicino a te, ma non scompaio da me stessa o me stesso.\n\nQuando Gli Amanti appaiono diritti, di solito significa che si sta formando una connessione importante. Può trattarsi di una relazione amorosa, di un dialogo sincero, di un alleato affidabile o di una scelta in sintonia con i tuoi valori. Ricordano che una relazione viva non si regge solo sulla passione, ma anche su comprensione, rispetto e comunicazione. Il punto non e soltanto amarsi, ma riuscire a dire il vero, ascoltarsi e scegliere di restare vicini anche nelle differenze.\n\nQuesta carta richiama spesso anche una scelta. Potresti trovarti tra due direzioni: una piu sicura e piu accettata dall esterno, l altra piu vicina al tuo cuore. Gli Amanti ricordano che ogni scelta modella chi diventi. Chi scegli, che tipo di relazione scegli e come scegli di esprimere l amore diventano parte della persona che stai creando.\n\nA un livello ancora piu profondo, Gli Amanti possono rappresentare un risveglio, soprattutto un risveglio del se dentro la relazione. Non si tratta solo di “incontrare l amore,” ma di accorgerti che hai il diritto di scegliere, di dire no e di uscire da cio che non e sano. In alcuni contesti questa carta puo persino simboleggiare una donna che si risveglia dalla posizione di essere guardata o scelta e riprende la propria voce. Può amare e può anche andarsene. Può avvicinarsi e può rifiutare. Può entrare in una relazione e può anche smettere di trattarla come l unico destino possibile.\n\nQuando Gli Amanti appaiono rovesciati, chiedono di notare squilibrio, incomprensione, evitamento e conflitto di valori. All esterno il legame può sembrare ancora intimo, ma dentro potrebbero gia esserci crepe. Potresti avere paura di dire cio che pensi davvero, oppure comprimere te stessa o te stesso per tenere viva la relazione. Può anche indicare una scelta rimandata troppo a lungo: sai gia che cosa desideri, ma non l hai ancora ammesso.\n\nIl messaggio centrale degli Amanti e questo: la comunicazione autentica e una forma di armonia e comprensione profonda. L amore non e perdere se stessi, e scegliere non significa consegnarsi. Un legame che vale davvero ti rende piu libera o libero, piu lucida o lucido e piu capace di diventare una persona intera.',
      },
    },
  },
  {
    id: 'the-chariot',
    number: 7,
    name_cn: '战车',
    name_en: 'The Chariot',
    arcana: 'major',
    suit: '',
    image: getMeaningImage('战车'),
    keywords: ['胜利', '意志力', '目标', '野心', '控制', '冲突', '前进', '自我掌控'],
    daily_upright:
      '今天适合朝目标推进。即使局面有拉扯和阻力，只要你稳住方向，就有机会靠意志力冲出一条路。',
    daily_reversed:
      '今天要小心失控、急躁或方向混乱。别只顾着往前冲，先确认你是在掌控局面，还是被焦虑和胜负心拖着走。',
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
        daily_upright:
          'Today is good for pushing toward your goal. Even if the situation contains tension and resistance, you still have a chance to carve a way through by holding your direction steady.',
        daily_reversed:
          'Today asks you to watch for loss of control, impatience, or confusion of direction. Do not rush forward blindly before checking whether you are steering the situation or being dragged by anxiety and the need to win.',
        reading_upright:
          'The Chariot upright represents strong willpower, a clear sense of purpose, ambition, and determination to move ahead. It suggests that you are in a phase that requires active breakthrough. Obstacles do exist, but you have enough force to gather a scattered situation and drive it toward the finish line.\n\nWhen it appears in a spread, The Chariot tells you to remain focused and not let outside tension pull you apart. The black and white forces in the image symbolize conflict, contradiction, and desires moving in different directions. The key is not to erase conflict but to harness it through stronger will. When the goal is clear, pressure, competition, ambition, and unease can all become fuel for forward movement.',
        reading_reversed:
          'The Chariot reversed represents loss of direction, weakening will, rash advance, or being pulled apart by inner conflict to the point that forward motion becomes difficult. You may want to win, to arrive quickly, or to prove yourself, but the more impatient you become, the easier it is to lose your path and even be controlled by your own anxiety, competitiveness, or desire for control.\n\nWhen it appears in a spread, The Chariot reversed asks you to check both your goal and your pace. Do you truly know where you are trying to go? Are you moving forward with conviction, or merely afraid to stop? It can also show that external resistance is strong, or that the black and white forces within you have not yet been integrated. This is not the moment to force everything with brute effort. First steady yourself and take hold of the reins again.',
        detail:
          'The Chariot is card 7 of the Major Arcana. It symbolizes victory, willpower, ambition, self-control, and the ability to move toward a chosen goal. It is not a light and effortless kind of luck, but the fierce determination that says, “I will reach the end.” When The Chariot appears, it often means life has entered a phase of action and breakthrough. You cannot remain standing still and wait for the result. You need to take hold of direction yourself.\n\nIn the card image, a warrior stands upon a chariot, often with black and white forces before him. They symbolize conflict, contradiction, divided desire, and the resistance that reality places in different directions. This is what makes The Chariot difficult: you are not moving along a simple, flat road, but advancing through a field of tension. One side may be reason and the other emotion; one side ambition and the other fear; one part of you longs to surge ahead, while another wants to retreat to safety.\n\nFor that reason, The Chariot is not truly about speed; it is about control. It asks you to take divided energy and bind it into one direction through sheer will. You need to know where you are going, and you also need to restrain the impulses that would pull you off course. The victory of The Chariot does not come from a road without difficulty, but from refusing to release the reins in the middle of difficulty.\n\nWhen The Chariot appears upright, it usually means you possess the strength to break through your current condition. You may be facing competition, challenge, travel, examination, career momentum, or any period that demands strong initiative. Here, clarity of purpose matters greatly: once you know where the finish line is, pressure can become fuel and confusion can become a route. The Chariot also carries ambition. It does not want to remain where it is. It wants to win, to arrive, and to prove that destiny can be steered.\n\nYet The Chariot also has a clear shadow. When willpower swells too far, it becomes compulsion, impatience, and control. You may become so fixed on victory that you ignore the body s fatigue, the tension in relationship, or the fear moving underneath. It may look like progress, but in truth you are only being driven by the thought that losing is impossible.\n\nWhen The Chariot appears reversed, it asks you to notice states of loss of control. The problem may be lack of direction, a chaotic plan, or inner conflict so strong that you cannot advance in a stable way. One part of you may want success, while another fears the price of success. One part wants to sprint, while another is dragged by emotion and resistance. In that moment, pushing harder is not always the answer. What is needed is to reorder the path and ask again where you truly wish to arrive.\n\nThe core message of The Chariot is this: the finish line will not come to you on its own. You need purpose, ambition, and the self-command to steer your own force. Real victory is not a road without obstacles, but the power to keep the chariot moving in the direction you have chosen even while black and white forces pull against one another.',
      },
      it: {
        name: 'Il Carro',
        keywords: ['Vittoria', 'Volonta', 'Obiettivo', 'Ambizione', 'Controllo', 'Conflitto', 'Avanzare', 'Autocontrollo'],
        daily_upright:
          'Oggi e il momento giusto per avanzare verso il tuo obiettivo. Anche se ci sono attriti e resistenze, puoi comunque aprirti un passaggio se mantieni ferma la direzione.',
        daily_reversed:
          'Oggi fai attenzione a perdita di controllo, impulsivita o confusione di direzione. Non lanciarti avanti senza chiederti se stai davvero guidando la situazione o se sei trascinata o trascinato da ansia e bisogno di vincere.',
        reading_upright:
          'Il Carro diritto rappresenta forte volonta, obiettivo chiaro, ambizione e decisione di avanzare. Indica che sei in una fase che richiede un vero sfondamento attivo. Gli ostacoli esistono, ma hai abbastanza forza per raccogliere una situazione dispersa e portarla verso il traguardo.\n\nQuando appare in una stesa, Il Carro ti invita a restare concentrata o concentrato e a non lasciarti spezzare dalle pressioni esterne. Le forze nere e bianche dell immagine simboleggiano conflitto, contraddizione e desideri che tirano in direzioni diverse. Il punto non e cancellare il conflitto, ma governarlo con una volonta piu forte. Quando il fine e chiaro, pressione, competizione, ambizione e inquietudine possono diventare carburante per andare avanti.',
        reading_reversed:
          'Il Carro rovesciato rappresenta perdita di direzione, indebolimento della volonta, slancio impulsivo oppure la difficolta di avanzare perche si viene tirati da conflitti interiori. Potresti voler vincere, arrivare in fretta o dimostrare qualcosa, ma piu aumenta l urgenza, piu diventa facile uscire di strada e persino essere controllata o controllato da ansia, competitivita o bisogno di dominio.\n\nQuando appare in una stesa, Il Carro rovesciato ti chiede di controllare insieme obiettivo e ritmo. Sai davvero dove stai cercando di andare? Stai avanzando con decisione o stai solo evitando di fermarti? Può anche indicare che la resistenza esterna e forte, o che le forze nere e bianche dentro di te non sono ancora state integrate. Non e il momento di forzare tutto. Prima devi stabilizzarti e riprendere saldamente le redini.',
        detail:
          'Il Carro e la carta numero 7 degli Arcani Maggiori. Simboleggia vittoria, volonta, ambizione, autocontrollo e la capacita di procedere verso un obiettivo scelto. Non e una fortuna leggera e senza peso, ma la determinazione feroce che dice: “Arrivero fino in fondo.” Quando Il Carro appare, spesso significa che la vita e entrata in una fase di azione e di sfondamento. Non puoi restare immobile ad aspettare il risultato: devi prendere in mano la direzione.\n\nNell immagine, un guerriero sta sul carro, spesso davanti a due forze, una nera e una bianca. Esse simboleggiano conflitto, contraddizione, desideri divisi e le resistenze della realta che tirano da lati diversi. Qui sta la vera difficolta del Carro: non stai avanzando su una strada semplice e piana, ma dentro una tensione continua. Da un lato puo esserci la ragione, dall altro l emozione; da un lato l ambizione, dall altro la paura; una parte di te vuole partire con forza, mentre un altra desidera tornare in un luogo piu sicuro.\n\nPer questo Il Carro non parla davvero di velocita, ma di controllo. Ti chiede di prendere energie divise e di stringerle in una sola direzione attraverso la volonta. Devi sapere dove stai andando, e devi anche trattenere gli impulsi che potrebbero farti uscire dal percorso. La vittoria del Carro non nasce dall assenza di difficolta, ma dal fatto che continui a tenere le redini anche nel mezzo delle difficolta.\n\nQuando Il Carro appare diritto, di solito indica che possiedi la forza per oltrepassare la situazione attuale. Potresti trovarti davanti a competizione, sfida, spostamento, esame, avanzamento professionale o a un periodo che richiede forte iniziativa. Qui la chiarezza dell obiettivo conta moltissimo: se sai dove si trova il traguardo, la pressione può diventare spinta e il caos può trasformarsi in percorso. Il Carro porta anche ambizione. Non vuole restare fermo. Vuole vincere, arrivare e dimostrare che il destino può essere guidato.\n\nMa il Carro ha anche un ombra evidente. Quando la volonta si gonfia troppo, si trasforma in costrizione, fretta e controllo. Potresti essere cosi fissata o fissato con la vittoria da ignorare la stanchezza del corpo, la tensione nelle relazioni o la paura nascosta sotto la superficie. Potrebbe sembrare avanzamento, ma in realta stai solo correndo spinta o spinto dall idea di non potere perdere.\n\nQuando Il Carro appare rovesciato, ti invita a notare situazioni di perdita di controllo. Il problema può essere una direzione poco chiara, un piano confuso o un conflitto interiore cosi forte da impedirti di avanzare in modo stabile. Una parte di te può desiderare il successo, mentre un altra teme il prezzo del successo. Una parte vuole correre, mentre un altra rimane trascinata da emozioni e resistenze. In quel momento, spingere piu forte non e sempre la risposta. Serve piuttosto rimettere ordine nel cammino e chiedersi di nuovo dove si desidera arrivare davvero.\n\nIl messaggio centrale del Carro e questo: il traguardo non verra da te da solo. Hai bisogno di scopo, ambizione e della forza interiore necessaria a guidare la tua energia. La vera vittoria non e una strada senza ostacoli, ma la capacita di continuare a muovere il carro nella direzione scelta anche mentre le forze opposte continuano a tirare.',
      },
    },
  },
  {
    id: 'strength',
    number: 8,
    name_cn: '力量',
    name_en: 'Strength',
    arcana: 'major',
    suit: '',
    image: getMeaningImage('力量'),
    keywords: ['勇气', '温柔', '驯服', '耐心', '内在力量', '自控', '韧性', '以柔克刚', '同情心'],
    daily_upright:
      '今天适合用温柔但坚定的方式处理问题。即使处在压力和痛苦之中，你也有能力保持冷静，把局面慢慢稳住。',
    daily_reversed:
      '今天要小心被情绪、冲动或恐惧牵着走。别急着压抑自己，也别为了照顾别人而过度消耗自己的力量。',
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
        daily_upright:
          'Today is good for handling problems with gentleness and firmness at the same time. Even under pressure and pain, you still have the ability to stay calm and slowly steady the situation.',
        daily_reversed:
          'Today asks you to watch for being led by emotion, impulse, or fear. Do not rush to suppress yourself, but do not drain your strength either by always taking care of everyone else.',
        reading_upright:
          'Strength upright represents courage, patience, inner power, and the wisdom of using softness to guide force. It shows that you are facing strong emotion, desire, fear, or pressure, but that you do not need to meet it only with hardness.\n\nWhen it appears in a spread, Strength asks you to work with the situation in a gentler and steadier way. The lion in the image symbolizes passion, desire, anger, and instinct, yet the woman does not conquer it through violence. She calms it through composure, discipline, love, and compassion. This card reminds you that even in struggle, you still have the ability to stay clear and strong.',
        reading_reversed:
          'Strength reversed represents self-doubt, emotional loss of control, imbalanced desire, or inner strength that feels temporarily weakened. You may feel unable to face fear, or find yourself being driven by anger, anxiety, or impulse even when you want to remain composed.\n\nWhen it appears in a spread, Strength reversed reminds you not to mistake vulnerability for failure. If you only suppress what you feel, it may erupt in a more extreme form later. It also asks you to watch for over-giving. Compassion is precious, but when caring for others always comes at the cost of yourself, your strength is slowly consumed.',
        detail:
          'Strength is card 8 of the Major Arcana. It symbolizes courage, patience, gentle command, and deep inner resilience. Like The Chariot, it concerns control, but in a completely different way. The Chariot uses goal, force, and momentum; Strength uses understanding, calming presence, discipline, and stable inner composure.\n\nIn the card image, a woman quietly holds the jaws of a grown lion. The lion appears fierce and powerful, symbolizing passion, desire, anger, instinct, and life force. None of these energies are inherently bad; they are part of what makes a human being alive. But when they are totally unrestrained, they can also turn destructive and drag us toward ruin.\n\nWhat makes the image remarkable is that the woman does not suppress the lion with violence. She is calm, graceful, and steady, as if she possesses a higher form of sovereignty. Her strength is not brute force. It is self-control, discipline, love, and compassion. She knows how to approach danger, and how to keep danger from devouring her. This is the deepest wisdom of Strength: softness can master what hardness cannot.\n\nWhen Strength appears upright, it usually means you are moving through pressure, pain, or inner struggle, but you have the ability to endure and steady yourself. The outer world may be difficult, and inwardly you may feel fear, anger, frustration, or strong desire. Even so, this card reminds you that you do not have to be carried away by those emotions. You can see them, acknowledge them, and guide them back into a place that can be held.\n\nStrength also represents calm in adversity. Truly strong people are not always the loudest, nor the hardest in appearance. They can face danger without panic, bear pain without being destroyed by it, and hold passion without letting passion burn everything down. Their strength is not coldness, but the ability to remain inwardly still while life is storming around them.\n\nThis card also carries compassion. People embodying Strength are often willing to understand others and to extend a hand when someone is struggling. They are not gentle because they are weak, but because their inner foundation is strong enough to remain soft. Yet compassion also needs boundary. Real kindness should not always be purchased through self-sacrifice, and real strength includes knowing when to protect yourself.\n\nWhen Strength appears reversed, it asks you to notice imbalance in your inner power. You may be doubting yourself, feeling weak, or believing you are not capable of meeting the challenge before you. You may also be controlled by emotion, desire, or fear and lose your usual sense of judgment. It can also signal over-suppression: the outside looks calm, while inside too much unprocessed feeling has already accumulated.\n\nStrength reversed does not mean you are without strength. It means you need to find a different way to be with yourself. Do not focus only on “holding it in” or “defeating it.” Some inner beasts are not solved by killing them. They must first be seen, acknowledged, and then slowly tamed.\n\nThe core message of Strength is this: true power is not conquering everything. It is the choice to remain calm, gentle, and steady in the presence of danger, pain, and desire. You do not need to kill the lion inside you. You need to learn how to hold its leash.',
      },
      it: {
        name: 'La Forza',
        keywords: ['Coraggio', 'Dolcezza', 'Addomesticare', 'Pazienza', 'Forza interiore', 'Autocontrollo', 'Resilienza', 'Vincere con la dolcezza', 'Compassione'],
        daily_upright:
          'Oggi e il momento giusto per affrontare i problemi con dolcezza ma anche con fermezza. Anche sotto pressione e dolore, hai ancora la capacita di restare calma o calmo e di riportare lentamente stabilita nella situazione.',
        daily_reversed:
          'Oggi fai attenzione a lasciarti trascinare da emozioni, impulsi o paure. Non reprimerti in fretta, ma non consumare tutta la tua forza nemmeno prendendoti sempre cura degli altri.',
        reading_upright:
          'La Forza diritta rappresenta coraggio, pazienza, potere interiore e la saggezza di usare la dolcezza per guidare la forza. Indica che stai affrontando emozioni intense, desideri, paure o pressioni, ma che non sei costretta o costretto a rispondere solo con durezza.\n\nQuando appare in una stesa, La Forza ti invita a gestire la situazione in modo piu morbido e stabile. Il leone nella carta simboleggia passione, desiderio, rabbia e istinto, eppure la donna non lo domina con violenza. Lo calma con disciplina, lucidita, amore e compassione. Questa carta ti ricorda che anche nella lotta hai ancora la capacita di restare chiara o chiaro e forte.',
        reading_reversed:
          'La Forza rovesciata rappresenta dubbio di se, perdita di controllo emotivo, squilibrio nel desiderio oppure un potere interiore momentaneamente indebolito. Potresti sentirti incapace di affrontare la paura, oppure trovarti trascinata o trascinato da rabbia, ansia o impulsi proprio mentre vorresti restare calma o calmo.\n\nQuando appare in una stesa, La Forza rovesciata ti ricorda di non confondere la vulnerabilita con il fallimento. Se reprimi soltanto cio che senti, potrebbe esplodere in modo piu violento piu avanti. Ti chiede anche di osservare l eccesso di dedizione agli altri. La compassione e preziosa, ma se il prenderti cura consuma sempre te stessa o te stesso, allora anche la tua forza si esaurisce.',
        detail:
          'La Forza e la carta numero 8 degli Arcani Maggiori. Simboleggia coraggio, pazienza, controllo gentile e profonda resilienza interiore. Come il Carro, parla di controllo, ma in un modo completamente diverso. Il Carro usa obiettivo, spinta e volonta; La Forza usa comprensione, presenza calmante, disciplina e stabilita interiore.\n\nNell immagine, una donna tiene con serenita le fauci di un leone adulto. Il leone appare feroce e potente e rappresenta passione, desiderio, rabbia, istinto e forza vitale. Nessuna di queste energie e cattiva in se: fanno parte di cio che rende viva una persona. Ma se restano del tutto senza guida, possono diventare distruttive e trascinarci verso la rovina.\n\nLa cosa piu affascinante e che la donna non reprime il leone con la violenza. E calma, elegante e stabile, come se possedesse una forma piu alta di sovranita. La sua forza non e brutalita, ma autocontrollo, disciplina, amore e compassione. Sa come avvicinarsi al pericolo, e sa come evitare che il pericolo la divori. Questa e la saggezza piu profonda della carta: la dolcezza può governare cio che la durezza non sa contenere.\n\nQuando La Forza appare diritta, di solito significa che stai attraversando pressione, dolore o lotta interiore, ma possiedi la capacita di reggere e ritrovare equilibrio. Il mondo esterno può essere faticoso, e dentro di te possono vivere paura, rabbia, frustrazione o desideri intensi. Eppure questa carta ti ricorda che non sei obbligata o obbligato a essere trascinata o trascinato da tutto questo. Puoi vederlo, riconoscerlo e riportarlo in uno spazio che riesci a contenere.\n\nLa Forza rappresenta anche calma nelle avversita. Le persone davvero forti non sono sempre quelle che fanno piu rumore, ne quelle che sembrano piu dure. Possono guardare il pericolo senza panico, reggere il dolore senza esserne distrutte, e custodire la passione senza lasciare che essa bruci tutto. La loro forza non e freddezza, ma la capacita di restare interiormente stabili mentre la vita si agita intorno.\n\nQuesta carta porta anche compassione. Chi incarna La Forza e spesso disposto a comprendere gli altri e a tendere una mano quando qualcuno soffre. Non e dolce per debolezza, ma perche ha una base interiore abbastanza solida da permettersi di restare morbida o morbido. Tuttavia anche la compassione richiede confini. La vera bonta non dovrebbe sempre essere pagata con il sacrificio di se, e la vera forza include sapere quando difendersi.\n\nQuando La Forza appare rovesciata, ti invita a notare squilibri nel tuo potere interiore. Potresti dubitare di te, sentirti fragile o convincerti di non essere capace di affrontare cio che hai davanti. Potresti anche essere controllata o controllato da emozioni, desideri o paure al punto da perdere il tuo normale giudizio. Può inoltre indicare eccessiva repressione: fuori tutto sembra calmo, ma dentro si e gia accumulato troppo di cio che non e stato ascoltato.\n\nLa Forza rovesciata non significa che non possiedi forza. Significa che devi trovare un altro modo di stare con te stessa o te stesso. Non cercare solo di “resistere” o di “vincere”. Alcune bestie interiori non si risolvono uccidendole. Vanno prima viste, riconosciute, e poi lentamente addomesticate.\n\nIl messaggio centrale della Forza e questo: il vero potere non consiste nel conquistare tutto. Consiste nello scegliere calma, dolcezza e fermezza di fronte al pericolo, al dolore e al desiderio. Non hai bisogno di uccidere il leone dentro di te. Hai bisogno di imparare a tenerne le redini.',
      },
    },
  },
  {
    id: 'the-hermit',
    number: 9,
    name_cn: '隐士',
    name_en: 'The Hermit',
    arcana: 'major',
    suit: '',
    image: getMeaningImage('隐士'),
    keywords: ['孤独', '智慧', '内省', '寻找', '沉默', '灵魂指引', '独处', '内心声音'],
    daily_upright:
      '今天适合安静下来，减少外界干扰。答案不一定在人群的声音里，也许要在独处中才能被你听见。',
    daily_reversed:
      '今天要小心过度封闭、逃避交流，或在孤独里迷失方向。独处是为了听见自己，不是为了把自己困在黑夜里。',
    reading_upright:
      '隐士正位代表有智慧的孤独、内在探索与精神上的寻找。它说明你正在进入一个需要独处、思考和沉淀的阶段。此时，外界的建议、欲望和喧嚣未必能真正帮助你，你需要暂时与人群拉开距离，去听见更深处的声音。\n\n在牌阵中出现时，隐士提醒你不要急着向外寻找答案。你可能已经走到了某个需要自我确认的路口，真正的方向不能由别人替你决定。隐士手中的灯并不照亮整条路，只照亮脚下一小段，但这已经足够让你继续前行。它象征一种缓慢而清醒的智慧：在黑夜中行走，也仍然相信自己能够找到回家的路。',
    reading_reversed:
      '隐士逆位代表孤立、封闭、迷失，或拒绝面对内心真正的问题。你可能正在逃离人群，也可能正在逃离自己。表面上是在独处，实际上却陷入了过度思考、低落、疏离或无法求助的状态。\n\n在牌阵中出现时，隐士逆位提醒你分辨：你是在主动寻找内在智慧，还是因为失望、害怕或疲惫而把自己封起来？此时未必需要立刻回到热闹之中，但你也不必独自承受所有黑暗。真正的智慧不是永远孤身一人，而是知道什么时候该沉默，什么时候该点灯，什么时候也可以向远处的人求一点火光。',
    detail:
      '隐士是大阿尔卡那的第 9 张牌，象征孤独、智慧、内省与精神上的寻找。他不是被世界遗弃的人，而是主动离开人群的人。因为有些声音太吵，有些欲望太重，有些答案太微弱，只有在足够安静的时候才会出现。\n\n牌面中的隐士通常独自站在黑夜或雪山之上，手中提着一盏灯。他像一个孤独的流浪者，在无意识的黑夜里前行。那盏灯的光并不明亮，无法照亮整个世界，只能照见眼前一小段路。但隐士并不因此慌张，因为他寻找的不是外界的掌声、认同或热闹，而是只有长期孤独才能获得的东西：内心真正的声音。\n\n隐士的孤独不是空洞的孤独，而是有智慧的孤独。他需要暂时与人群脱节，因为人群里有太多声音会覆盖自己：别人的期待、社会的标准、短暂的欲望、关系的拉扯，以及那些看似合理却并不属于他的答案。为了听见自己，他必须离开这些噪音，走进更深的夜里。\n\n当隐士正位出现时，它通常意味着你需要独处、思考和沉淀。你可能正在经历一个不适合立刻行动的阶段，也可能正站在人生某个需要重新确认方向的路口。此时，向外求证未必能给你真正的答案。你需要安静下来，慢慢辨认：什么是别人告诉你的路，什么才是你内心真正愿意走的路。\n\n隐士也代表成熟的智慧。它不是女祭司那种神秘的直觉，也不是教皇那种传统传授的知识。隐士的智慧来自长时间的行走、沉默、失去、观察和自我消化。他知道有些路必须一个人走，有些答案不能被直接赠予，只能在漫长的独处中一点点生长出来。\n\n但隐士也有阴影面。当孤独过度，它可能变成封闭；当内省过度，它可能变成反复咀嚼痛苦。隐士逆位时，你可能不再是在寻找自己，而是在躲避世界；不再是在听见内心，而是在被黑夜困住。你可能拒绝沟通，拒绝求助，甚至把孤独当成唯一安全的地方。\n\n当隐士逆位出现时，它提醒你重新看待自己的独处。真正的独处应该让你更清醒，而不是更麻木；应该让你接近自己，而不是切断所有连接。如果黑夜太深，你不必强迫自己一个人走完。灯光可以来自自己，也可以暂时借自他人。\n\n隐士的核心信息是：有些答案只能在孤独中被听见。你走过黑夜，提着微弱的灯，不是为了远离世界，而是为了找到真正的家。那个家不是某个地点，而是你终于回到自己的内心，回到那个不再被外界声音淹没的自我。',
    translations: {
      en: {
        name: 'The Hermit',
        keywords: ['Solitude', 'Wisdom', 'Introspection', 'Seeking', 'Silence', 'Soul Guidance', 'Being Alone', 'Inner Voice'],
        daily_upright:
          'Today is good for becoming quiet and reducing outside noise. The answer may not be in the voices of the crowd at all; you may hear it only in solitude.',
        daily_reversed:
          'Today asks you to watch for becoming too closed off, avoiding contact, or losing direction inside loneliness. Solitude is meant to help you hear yourself, not trap you in darkness.',
        reading_upright:
          'The Hermit upright represents wise solitude, inner searching, and spiritual seeking. It shows that you are entering a stage that calls for time alone, reflection, and deep settling. Advice, desire, and noise from the outside may not truly help you now. You need to step back from the crowd for a while so you can hear a deeper voice.\n\nWhen it appears in a spread, The Hermit reminds you not to rush outward for answers. You may already have reached a point where direction must be confirmed from within, not decided by someone else. The lamp in the Hermit s hand does not illuminate the whole road; it lights only the next small stretch. Yet that is enough to keep walking. It symbolizes a slow and lucid wisdom: moving through the night while still trusting that you can find the road home.',
        reading_reversed:
          'The Hermit reversed represents isolation, withdrawal, getting lost, or refusing to face what is truly happening inside. You may be moving away from people, but you may also be moving away from yourself. What looks like solitude on the surface may actually be overthinking, heaviness, alienation, or the inability to ask for help.\n\nWhen it appears in a spread, The Hermit reversed asks you to ask whether you are truly seeking inner wisdom, or whether disappointment, fear, or exhaustion have simply caused you to shut yourself away. You may not need to rush back into noise, but neither do you need to carry all darkness alone. True wisdom is not eternal isolation. It is knowing when to remain silent, when to carry your own light, and when it is also allowed to borrow a little light from someone farther away.',
        detail:
          'The Hermit is card 9 of the Major Arcana. He symbolizes solitude, wisdom, introspection, and spiritual searching. He is not someone abandoned by the world, but someone who has chosen to leave the crowd. Some voices are too loud, some desires too heavy, and some answers too subtle to be heard without true quiet.\n\nThe Hermit usually stands alone in darkness or on a snowy height, holding a lamp in his hand. He is like a solitary traveler moving through the night of the unconscious. The lamp does not shine brightly enough to light the entire world; it only reveals the small section directly ahead. Yet The Hermit is not frightened by this, because what he seeks is not applause, approval, or noise from the outside, but something that can be gained only through long solitude: the true voice within.\n\nThe Hermit s solitude is not empty loneliness, but wise loneliness. He needs to step away from the crowd because too many external voices cover over the self: other people s expectations, social standards, temporary desires, relationship tensions, and all the answers that seem reasonable but do not actually belong to him. To hear himself, he must leave those noises behind and enter a deeper night.\n\nWhen The Hermit appears upright, it usually means that you need solitude, reflection, and time to settle. You may be in a phase that is not suitable for immediate action, or standing at a crossroads where your direction must be re-confirmed. Looking outward for proof may not give you the answer you need. You are being asked to become quiet and slowly sort out what path comes from other people and what path your own heart is truly willing to walk.\n\nThe Hermit also represents mature wisdom. It is not the mysterious intuition of The High Priestess, nor the inherited teaching of The Hierophant. The Hermit s wisdom comes from long walking, silence, loss, observation, and inner digestion. He knows that some roads must be walked alone, and some answers cannot simply be handed over; they grow gradually in the space of deep solitude.\n\nYet The Hermit also has a shadow. When solitude grows too heavy, it can become closure. When introspection grows too far, it can become endless chewing on pain. In reversal, The Hermit may no longer be searching for the self, but hiding from the world; no longer listening inwardly, but being trapped by the night. You may refuse communication, reject help, and even treat loneliness as the only safe place left.\n\nWhen The Hermit appears reversed, it asks you to rethink your solitude. Real solitude should make you clearer, not duller; it should bring you closer to yourself, not sever all connection. If the night is too deep, you do not need to force yourself to walk it alone. Light can come from within, and for a while it can also be borrowed from another person.\n\nThe core message of The Hermit is this: some answers can only be heard in solitude. You walk through the night carrying a small lamp not to reject the world, but to find your true home. That home is not a place. It is the return to the self that is no longer drowned out by outside voices.',
      },
      it: {
        name: 'L Eremita',
        keywords: ['Solitudine', 'Saggezza', 'Introspezione', 'Ricerca', 'Silenzio', 'Guida interiore', 'Stare da soli', 'Voce interiore'],
        daily_upright:
          'Oggi e il momento giusto per fare silenzio e ridurre le interferenze esterne. La risposta potrebbe non trovarsi nelle voci della folla, ma emergere solo nella solitudine.',
        daily_reversed:
          'Oggi fai attenzione a chiuderti troppo, a evitare il contatto o a perdere la direzione dentro la solitudine. Stare soli serve per ascoltarsi, non per restare imprigionati nel buio.',
        reading_upright:
          'L Eremita diritto rappresenta solitudine saggia, ricerca interiore e cammino spirituale. Indica che stai entrando in una fase che richiede tempo da sola o da solo, riflessione e sedimentazione profonda. I consigli, i desideri e il rumore esterno potrebbero non esserti davvero utili adesso. Hai bisogno di allontanarti per un po dalla folla per ascoltare una voce piu profonda.\n\nQuando appare in una stesa, L Eremita ti invita a non correre fuori da te in cerca di risposte. Potresti essere arrivata o arrivato a un punto in cui la direzione deve essere confermata dall interno, non decisa da qualcun altro. La lampada che tiene in mano non illumina tutta la strada, ma soltanto un breve tratto davanti a lui. Eppure basta per continuare a camminare. Simboleggia una saggezza lenta e lucida: avanzare nella notte continuando a credere di poter ritrovare la strada di casa.',
        reading_reversed:
          'L Eremita rovesciato rappresenta isolamento, chiusura, smarrimento o rifiuto di affrontare cio che accade davvero dentro di te. Potresti allontanarti dagli altri, ma potresti anche stare fuggendo da te stessa o da te stesso. Quella che in superficie sembra solitudine può essere in realta eccesso di pensiero, malinconia, distanza emotiva o incapacita di chiedere aiuto.\n\nQuando appare in una stesa, L Eremita rovesciato ti invita a chiederti se stai davvero cercando saggezza interiore oppure se delusione, paura o stanchezza ti hanno semplicemente portato a chiuderti. Forse non hai bisogno di tornare subito nel rumore, ma non devi nemmeno portare da sola o da solo tutto il buio. La vera saggezza non e isolamento eterno. E sapere quando tacere, quando portare la propria luce, e quando e lecito prendere un poco di luce anche da qualcuno che si trova piu lontano.',
        detail:
          'L Eremita e la carta numero 9 degli Arcani Maggiori. Simboleggia solitudine, saggezza, introspezione e ricerca spirituale. Non e qualcuno abbandonato dal mondo, ma qualcuno che ha scelto di lasciare la folla. Alcune voci sono troppo forti, alcuni desideri troppo pesanti, e alcune risposte troppo sottili per essere udite senza vero silenzio.\n\nL Eremita viene spesso raffigurato da solo nel buio o su una cima innevata, con una lanterna in mano. E come un viandante solitario che attraversa la notte dell inconscio. La lanterna non e abbastanza forte da illuminare il mondo intero; rivela soltanto il breve tratto immediatamente davanti. Eppure L Eremita non ne e spaventato, perche cio che cerca non e applauso, approvazione o rumore esterno, ma qualcosa che si puo ottenere solo attraverso una lunga solitudine: la vera voce interiore.\n\nLa sua solitudine non e vuota, ma saggia. Ha bisogno di allontanarsi dal gruppo perche troppe voci esterne coprono il se: aspettative altrui, standard sociali, desideri momentanei, tensioni relazionali e tutte quelle risposte che sembrano ragionevoli ma che non gli appartengono davvero. Per ascoltarsi, deve lasciare questi rumori e camminare dentro una notte piu profonda.\n\nQuando L Eremita appare diritto, di solito significa che hai bisogno di solitudine, riflessione e tempo per sedimentare. Potresti trovarti in una fase non adatta all azione immediata, oppure davanti a un bivio in cui la direzione deve essere confermata di nuovo. Cercare fuori prove e approvazione potrebbe non darti la risposta che ti serve. Ti viene chiesto di fare silenzio e distinguere lentamente quale strada ti e stata consegnata dagli altri e quale strada il tuo cuore e davvero disposto a percorrere.\n\nL Eremita rappresenta anche una saggezza matura. Non e l intuizione misteriosa della Papessa, ne l insegnamento ereditato del Papa. La sua saggezza nasce da cammini lunghi, silenzio, perdite, osservazione e lunga digestione interiore. Sa che alcune strade devono essere percorse da soli e che alcune risposte non possono essere consegnate gia pronte; devono crescere lentamente dentro la solitudine.\n\nMa L Eremita possiede anche un ombra. Quando la solitudine diventa troppo pesante, si trasforma in chiusura. Quando l introspezione si spinge troppo oltre, si trasforma in ruminazione del dolore. In rovescio, L Eremita può non stare piu cercando se stesso, ma nascondendosi dal mondo; non stare piu ascoltando la propria interiorita, ma restando intrappolato nella notte. Potresti rifiutare la comunicazione, il sostegno e arrivare perfino a considerare la solitudine come l unico luogo sicuro.\n\nQuando L Eremita appare rovesciato, ti invita a ripensare il tuo stare sola o solo. La vera solitudine dovrebbe renderti piu lucida o lucido, non piu ottusa o ottuso; dovrebbe avvicinarti a te stessa o a te stesso, non recidere ogni legame. Se la notte e troppo profonda, non devi costringerti a percorrerla tutta da sola o da solo. La luce può venire da dentro, ma per un tratto può anche essere presa in prestito da un altra persona.\n\nIl messaggio centrale dell Eremita e questo: alcune risposte si possono udire solo nella solitudine. Attraversi la notte portando una piccola lampada non per respingere il mondo, ma per trovare la tua vera casa. E quella casa non e un luogo: e il ritorno al se che non viene piu sommerso dalle voci esterne.',
      },
    },
  },
  {
    id: 'wheel-of-fortune',
    number: 10,
    name_cn: '命运之轮',
    name_en: 'Wheel of Fortune',
    arcana: 'major',
    suit: '',
    image: getMeaningImage('命运之轮'),
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
          'Today may bring an unexpected turn for the better. Move with the change and pay attention to the opportunity destiny places before you. When life gives you something beautiful, let yourself enjoy it fully; and when you are in a difficult place, remember that things will turn again.',
        daily_reversed:
          'Today luck may not feel as if it is standing on your side, and you may feel followed by misfortune. Rather than trying to control everything, accept that some things are temporarily beyond your reach.',
        reading_upright:
          'Wheel of Fortune upright represents turning points, opportunity, cycles of change, and the movement of fate. It shows that a situation is shifting. You may not be able to control every direction the story takes, but you can feel an old phase loosening and a new phase drawing near.\n\nWhen it appears in a spread, the Wheel of Fortune asks you to pay attention to timing. It may bring good luck, a sudden opportunity, or a turning point in relationship or career, and it may set a stagnant situation back into motion. It is not simply luck falling from the sky, but fate moving you into a new position so you can see roads that were once hidden. What matters now is moving with the current and recognizing the opening that appears inside change.',
        reading_reversed:
          'Wheel of Fortune reversed represents stagnation, repetition, missed timing, or being trapped in a cycle. You may feel as if things keep circling back to the same point, and that even after making effort you continue to be blocked in familiar places.\n\nWhen it appears in a spread, the Wheel of Fortune reversed asks you to observe recurring patterns. Perhaps the problem is not only bad luck, but an old choice, old relationship, old fear, or old habit that keeps returning you to the same place. It can also indicate that timing is not yet ripe and outer conditions are not yet cooperating. Instead of pushing by force, first ask why the wheel has not yet turned forward.',
        detail:
          'Wheel of Fortune is card 10 of the Major Arcana. It symbolizes the turning of fate, the change of cycles, the arrival of opportunity, and the turning points in life that cannot be fully controlled by personal will. It is a large and sweeping card because it reminds us that life is not a straight line, but a wheel that keeps rotating. You rise and you fall. You lose and you meet again. You are pushed from old positions and carried toward new thresholds.\n\nThe true core of this card is not good or bad, but change. When the Wheel of Fortune appears, it usually means one phase is ending and another is beginning. You may not feel fully prepared, yet the situation has already started to move. Something that was stuck may suddenly show signs of turning, while something that felt stable may be disrupted by a new factor. It is as if fate reaches out a hand and lightly turns the wheel, placing you in a different position.\n\nWhen the Wheel appears upright, it usually represents opportunity, luck, turning points, and the ripening of timing. You may encounter unexpected help, a road that suddenly opens, or a long-stalled issue finally beginning to move. This does not necessarily mean everything will instantly become perfect, but it does show that the energy has changed and the situation is no longer standing still. At such a time, your task is to stay alert: opportunity does not remain forever, and what fate offers often arrives with an element of unpredictability.\n\nThe Wheel of Fortune is also tied to cause, effect, and cycles. Many things that look sudden were actually building for a long time. Past choices, effort, failure, waiting, and missed chances can gather into one decisive turn. It reminds you that nothing stays low forever, and nothing remains high forever either. The wheel keeps moving, and what matters is whether you can recognize your place inside the movement.\n\nBut the Wheel of Fortune also carries a harsh honesty: no human being controls everything. You can work, prepare, and plan, yet some outcomes still come from timing, environment, the decisions of others, or plain chance. It reveals that fate does not always unfold according to personal intention. Yet this does not make effort meaningless. Effort gives you the capacity to reach out and grasp opportunity when the wheel brings it within range.\n\nWhen the Wheel appears reversed, it asks you to notice stagnation and repetition. You may be caught in a loop: meeting similar people, living through similar disappointment, falling at the same place again and again. In that moment, the reversed Wheel is not only saying bad luck. It is asking why the pattern keeps returning. Are you still using an old method to meet a new problem? Have you already seen the pattern, yet still expected a different result?\n\nThe reversed Wheel can also mean that the time has not yet come. You may want badly to move something forward, but outer conditions have not aligned, or change is still gathering in the dark and has not yet shown itself. Trying to force the wheel in such a moment will only exhaust you further. Your task is to observe, adjust, wait, and prepare yourself before the next turn arrives.\n\nThe core message of the Wheel of Fortune is this: fate turns, situations change, low places do not stay low forever, and high places do not stay stable forever. You cannot order the wheel to stop where you want, but you can remain awake while it turns. True wisdom is not controlling fate, but recognizing the door that has just opened when fate changes direction.',
      },
      it: {
        name: 'Ruota della Fortuna',
        keywords: ['Destino', 'Svolta', 'Ciclo', 'Opportunita', 'Cambiamento', 'Flusso', 'Causa ed effetto', 'Incontrollabile'],
        daily_upright:
          'Oggi potrebbe arrivare una svolta inattesa. Segui il cambiamento e nota l opportunita che il destino ti sta offrendo. Quando la vita ti regala un momento bello, vivilo pienamente; e quando sei in un punto difficile, ricorda che la ruota tornera a girare.',
        daily_reversed:
          'Oggi potresti sentire che la fortuna non sia dalla tua parte e che la sfortuna continui a seguirti. Invece di voler controllare tutto, prova ad accettare che alcune cose siano, per ora, fuori dal tuo raggio d azione.',
        reading_upright:
          'La Ruota della Fortuna diritta rappresenta svolta, opportunita, cambiamento ciclico e movimento del destino. Mostra che una situazione si sta muovendo. Potresti non poter controllare del tutto la direzione degli eventi, ma puoi sentire che una fase vecchia si sta sciogliendo e che una nuova si sta avvicinando.\n\nQuando appare in una stesa, la Ruota della Fortuna ti invita a prestare attenzione al momento giusto. Puo portare fortuna, opportunita improvvise, svolte in amore o nel lavoro, e rimettere in movimento una situazione ferma. Non e semplicemente fortuna che cade dal cielo, ma il destino che ti sposta in un nuovo punto e ti permette di vedere strade prima invisibili. In questo momento conta seguire il flusso e riconoscere l apertura che nasce nel cambiamento.',
        reading_reversed:
          'La Ruota della Fortuna rovesciata rappresenta stagnazione, ripetizione, occasioni mancate oppure l essere intrappolati in un ciclo. Potresti sentire che tutto ritorna sempre allo stesso punto e che, nonostante gli sforzi, continui a bloccarti negli stessi luoghi.\n\nQuando appare in una stesa, la Ruota della Fortuna rovesciata ti invita a osservare i modelli che ritornano. Forse il problema non e solo la sfortuna, ma una vecchia scelta, una vecchia relazione, una vecchia paura o una vecchia abitudine che continua a riportarti nello stesso posto. Puo anche indicare che il momento non e ancora maturo e che l ambiente esterno non collabora. Invece di forzare, chiediti prima perche la ruota non stia ancora girando in avanti.',
        detail:
          'La Ruota della Fortuna e la carta numero 10 degli Arcani Maggiori. Simboleggia il movimento del destino, il cambio dei cicli, l arrivo delle opportunita e tutte quelle svolte della vita che non possono essere controllate del tutto dalla volonta personale. E una carta ampia e potente, perche ricorda che la vita non e una linea retta, ma una ruota che continua a girare. Si sale e si scende. Si perde e si ritrova. Si viene spinti fuori da vecchi posti e portati verso nuove soglie.\n\nIl cuore di questa carta non e il bene o il male, ma il cambiamento. Quando appare la Ruota della Fortuna, spesso una fase sta finendo e un altra sta iniziando. Forse non ti senti del tutto pronta o pronto, eppure la situazione ha gia iniziato a muoversi. Qualcosa che era fermo puo mostrare all improvviso un varco, mentre qualcosa che sembrava stabile puo essere scosso da un nuovo elemento. E come se il destino allungasse una mano e girasse leggermente la ruota, collocandoti in un punto diverso.\n\nQuando la Ruota appare diritta, rappresenta spesso opportunita, fortuna, svolta e maturazione del tempo. Potresti incontrare un aiuto inatteso, una strada che si apre all improvviso, o vedere finalmente avanzare una questione rimasta ferma troppo a lungo. Questo non significa necessariamente che tutto diventera subito perfetto, ma indica che l energia e cambiata e che la situazione non e piu immobile. In questo momento il compito e restare attenta o attento: le opportunita non restano ferme per sempre, e cio che il destino offre arriva spesso con una parte di imprevedibilita.\n\nLa Ruota della Fortuna e legata anche a causa, effetto e cicli. Molte cose che sembrano improvvise erano in realta in preparazione da molto tempo. Scelte passate, sforzi, fallimenti, attese e occasioni mancate possono convergere in una svolta. La carta ricorda che nulla resta per sempre in basso, e nulla resta per sempre in alto. La ruota continua a girare, e cio che conta davvero e se riesci a riconoscere la tua posizione nel cambiamento.\n\nMa la Ruota della Fortuna porta anche una sincerita dura: nessuno puo controllare tutto. Si puo lavorare, prepararsi e pianificare, ma alcuni risultati dipendono comunque dal momento, dall ambiente, dalle scelte altrui o dal puro caso. Rivela che il destino non si svolge sempre secondo la volonta personale. Tuttavia questo non rende inutile l impegno. L impegno ti da la capacita di afferrare l opportunita quando la ruota la porta alla tua portata.\n\nQuando la Ruota appare rovesciata, ti invita a notare stagnazione e ripetizione. Potresti essere intrappolata o intrappolato in un ciclo: incontri persone simili, vivi delusioni simili, e cadi sempre nello stesso punto. In quel momento la Ruota rovesciata non sta dicendo solo sfortuna. Ti sta chiedendo perche il modello continui a tornare. Stai ancora usando un vecchio metodo per affrontare un problema nuovo? Hai gia riconosciuto il meccanismo, ma continui ad aspettarti un risultato diverso?\n\nLa Ruota rovesciata puo anche indicare che il tempo non e ancora arrivato. Potresti voler spingere qualcosa con forza, ma le condizioni esterne non si sono ancora allineate, oppure il cambiamento si sta preparando nel buio e non si e ancora mostrato. Cercare di forzare la ruota in quel momento ti stanchera soltanto di piu. Il tuo compito e osservare, aggiustare, aspettare, e prepararti prima della prossima rotazione.\n\nIl messaggio centrale della Ruota della Fortuna e questo: il destino gira, le situazioni cambiano, i periodi bassi non restano bassi per sempre, e quelli alti non restano stabili per sempre. Non puoi ordinare alla ruota di fermarsi dove vuoi, ma puoi restare sveglia o sveglio mentre gira. La vera saggezza non e controllare il destino, ma riconoscere la porta che si apre quando la direzione cambia.',
      },
    },
  },
];

const customMeanings = new Map(meaningCards.map((card) => [card.number, card]));

export const tarotMeaningCards = allTarotCards.map((card) => customMeanings.get(card.id) || createPlaceholderMeaning(card));

export function getTarotMeaningCard(cardId) {
  return tarotMeaningCards.find((card) => card.id === cardId) || null;
}

export function findTarotMeaningCard(input) {
  if (!input) return null;

  if (typeof input === 'string') {
    return (
      tarotMeaningCards.find(
        (card) => card.id === input || card.name_cn === input || card.name_en === input,
      ) || null
    );
  }

  if (typeof input.id === 'number') {
    return tarotMeaningCards.find((card) => card.number === input.id) || null;
  }

  const normalizedName = normalizeChineseName(input.name);
  return (
    tarotMeaningCards.find(
      (card) =>
        card.name_cn === normalizedName ||
        card.name_en === input.englishName ||
        card.name_en === input.name,
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
