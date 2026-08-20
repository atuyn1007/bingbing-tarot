const CONTENT_VERSION = '1.0.0';
const EDITOR_SOURCE = 'bingbing-unity-editorial-v1';

const line = (hexagramNumber, linePosition, originalText, sourceId, modern) => Object.freeze({
  lineId: `line-${String(hexagramNumber).padStart(2, '0')}-${linePosition}`,
  hexagramId: `hexagram-${String(hexagramNumber).padStart(2, '0')}`,
  hexagramNumber,
  linePosition,
  contentVersion: CONTENT_VERSION,
  contentStatus: 'development-verified',
  canonical: Object.freeze({ originalText, sourceId }),
  modern: Object.freeze({
    'zh-CN': Object.freeze({ summary: modern['zh-CN'], sourceId: EDITOR_SOURCE }),
    en: Object.freeze({ summary: modern.en, sourceId: EDITOR_SOURCE }),
    it: Object.freeze({ summary: modern.it, sourceId: EDITOR_SOURCE }),
  }),
});

export const UNITY_LINE_TEXTS = Object.freeze([
  line(1, 1, '初九：潛龍，勿用。', 'zhouyi-canonical-ctext', {
    'zh-CN': '力量仍在形成，适合保留能力、观察时机，不急于把尚未成熟的行动推到前台。',
    en: 'The force is still forming; preserve capacity and observe timing rather than pushing an immature action into view.',
    it: 'La forza è ancora in formazione: conviene custodire le capacità e osservare il momento, senza esporre troppo presto un’azione immatura.',
  }),
  line(1, 2, '九二：見龍在田，利見大人。', 'zhouyi-canonical-ctext', {
    'zh-CN': '能力开始进入可见的现实场域，适合通过可靠关系、榜样或协作让它获得位置。',
    en: 'Capacity begins to enter the visible field; reliable relationships, examples, or collaboration can help it find its place.',
    it: 'La capacità entra nel campo visibile; relazioni affidabili, esempi e collaborazione possono aiutarla a trovare il proprio posto.',
  }),
  line(1, 3, '九三：君子終日乾乾，夕惕若，厲，无咎。', 'zhouyi-canonical-ctext', {
    'zh-CN': '推进已来到需要持续用功与反复校验的临界位置；警觉不是停滞，而是防止用力失序。',
    en: 'Progress has reached a threshold that requires sustained effort and repeated checking; vigilance prevents force from losing order.',
    it: 'Il progresso è giunto a una soglia che richiede impegno continuo e verifiche ripetute; la vigilanza evita che la forza perda ordine.',
  }),
  line(1, 4, '九四：或躍在淵，无咎。', 'zhouyi-canonical-ctext', {
    'zh-CN': '此处处在进与退之间，允许试探但不必仓促定型；判断能否进入下一层比单纯加速更重要。',
    en: 'This position lies between advance and retreat; testing is possible without forcing a final form, and judging readiness matters more than speed.',
    it: 'Questa posizione è tra avanzare e arretrare: si può sperimentare senza fissare subito una forma definitiva, valutando la maturità più della velocità.',
  }),
  line(1, 5, '九五：飛龍在天，利見大人。', 'zhouyi-canonical-ctext', {
    'zh-CN': '能力与位置开始相称，重点转向如何承担主位、连接同道，并让影响保持正当与可持续。',
    en: 'Capacity and position begin to correspond; the focus shifts to holding responsibility, meeting peers, and keeping influence legitimate and sustainable.',
    it: 'Capacità e posizione iniziano a corrispondere; l’attenzione passa alla responsabilità, all’incontro con pari e a un’influenza legittima e sostenibile.',
  }),
  line(1, 6, '上九：亢龍有悔。', 'zhouyi-canonical-ctext', {
    'zh-CN': '力量已到极点，继续上推容易失去支持与回旋空间；此处更需要辨认限度并准备收束。',
    en: 'Force has reached an extreme; pressing higher can lose support and room to adjust, so limits and closure require attention.',
    it: 'La forza ha raggiunto l’estremo; spingerla oltre può far perdere sostegno e margine di manovra, perciò occorre riconoscere i limiti e preparare la chiusura.',
  }),

  line(2, 1, '初六：履霜，堅冰至。', 'zhouyi-canonical-ctext', {
    'zh-CN': '细小迹象正在累积，适合在趋势变得坚固之前辨认它，而不是把早期信号视为偶然。',
    en: 'Small signs are accumulating; notice the pattern before it hardens rather than treating early signals as accidental.',
    it: 'Piccoli segnali si stanno accumulando: è utile riconoscere la tendenza prima che si consolidi, senza considerarli casuali.',
  }),
  line(2, 2, '六二：直，方，大，不習无不利。', 'zhouyi-canonical-ctext', {
    'zh-CN': '承载的力量来自正直、清楚和宽广；当基础合乎尺度，回应现实不必依赖额外造作。',
    en: 'Receptive strength comes from being direct, clear, and broad; when the foundation is proportionate, response need not be contrived.',
    it: 'La forza ricettiva nasce da rettitudine, chiarezza e ampiezza; quando la base è proporzionata, la risposta non richiede artifici.',
  }),
  line(2, 3, '六三：含章可貞。或從王事，无成有終。', 'zhouyi-canonical-ctext', {
    'zh-CN': '能力可以暂不争先，而在共同事务中稳定贡献；不占有成果也能使过程得到完成。',
    en: 'Ability need not claim the lead; steady contribution to shared work can bring completion without possessing the result.',
    it: 'La capacità non deve necessariamente primeggiare: un contributo stabile al lavoro comune può portare a compimento senza appropriarsi del risultato.',
  }),
  line(2, 4, '六四：括囊；无咎，无譽。', 'zhouyi-canonical-ctext', {
    'zh-CN': '环境尚不适合充分表达，克制言行可以减少损害；这一位置不以获得赞誉为目标。',
    en: 'The environment does not yet support full expression; restraint can reduce harm, and praise is not the measure of this position.',
    it: 'L’ambiente non sostiene ancora una piena espressione; la misura può ridurre il danno e il riconoscimento non è il criterio di questa posizione.',
  }),
  line(2, 5, '六五：黃裳，元吉。', 'zhouyi-canonical-ctext', {
    'zh-CN': '柔顺处于核心位置时，以含蓄、合度和内在稳定发挥影响，而不是依赖外在张扬。',
    en: 'When receptivity occupies the center, influence works through modesty, proportion, and inner steadiness rather than display.',
    it: 'Quando la ricettività occupa il centro, l’influenza agisce attraverso modestia, misura e stabilità interiore, non attraverso l’ostentazione.',
  }),
  line(2, 6, '上六：龍戰于野，其血玄黃。', 'zhouyi-canonical-ctext', {
    'zh-CN': '承载之力走到极端后会与主导力量发生冲突；需要看见角色边界，避免把顺应推成对抗。',
    en: 'Receptive force at an extreme can conflict with directive force; role boundaries matter so that response does not turn into opposition.',
    it: 'La forza ricettiva portata all’estremo può entrare in conflitto con quella direttiva; occorre riconoscere i confini dei ruoli per evitare che l’adesione diventi opposizione.',
  }),

  line(11, 1, '初九：拔茅茹，以其彙，征吉。', 'zhouyi-canonical-ctext', {
    'zh-CN': '开端并非孤立，彼此相连的条件会被一同带动；行动前应看清自己正在牵动哪些关系。',
    en: 'The beginning is not isolated: connected conditions move together, so action should account for the relationships it draws along.',
    it: 'L’inizio non è isolato: condizioni connesse si muovono insieme, quindi l’azione deve considerare le relazioni che trascina con sé.',
  }),
  line(11, 2, '九二：包荒，用馮河，不遐遺，朋亡，得尚于中行。', 'zhouyi-canonical-ctext', {
    'zh-CN': '通达需要容纳粗疏、跨越困难并顾及远处，同时减少偏私，才能保持中正的协作。',
    en: 'Open flow requires tolerating roughness, crossing difficulty, remembering what is distant, and reducing partiality to preserve balanced cooperation.',
    it: 'Il flusso richiede di accogliere ciò che è grezzo, attraversare le difficoltà, non dimenticare ciò che è lontano e ridurre le parzialità per mantenere una cooperazione equilibrata.',
  }),
  line(11, 3, '九三：无平不陂，无往不復，艱貞无咎。勿恤其孚，于食有福。', 'zhouyi-canonical-ctext', {
    'zh-CN': '顺畅并非永久不变；承认起伏、在困难中守住原则，比假设局面会一直顺利更可靠。',
    en: 'Ease is not permanent; acknowledging cycles and holding principles through difficulty is more reliable than assuming uninterrupted success.',
    it: 'La facilità non è permanente: riconoscere i cicli e mantenere i principi nella difficoltà è più affidabile che presumere un successo continuo.',
  }),
  line(11, 4, '六四：翩翩，不富，以其鄰，不戒以孚。', 'zhouyi-canonical-ctext', {
    'zh-CN': '上下交换不只依赖资源，更依赖真诚回应；关系能够主动靠近时，通达才真正进入外部层面。',
    en: 'Exchange between levels depends not only on resources but on sincere response; flow becomes external when relationships can approach freely.',
    it: 'Lo scambio tra i livelli non dipende solo dalle risorse ma dalla risposta sincera; il flusso diventa concreto quando le relazioni possono avvicinarsi liberamente.',
  }),
  line(11, 5, '六五：帝乙歸妹，以祉元吉。', 'zhouyi-canonical-ctext', {
    'zh-CN': '核心位置通过合宜的联结建立秩序；重点不是单方扩张，而是让关系、责任与名分相互匹配。',
    en: 'The central position establishes order through fitting connection; the emphasis is not unilateral expansion but correspondence among relationship, responsibility, and role.',
    it: 'La posizione centrale crea ordine attraverso un legame appropriato; non conta l’espansione unilaterale, ma la corrispondenza tra relazione, responsabilità e ruolo.',
  }),
  line(11, 6, '上六：城復于隍，勿用師。自邑告命，貞吝。', 'zhouyi-canonical-ctext', {
    'zh-CN': '通达走到终点后结构可能松动；不宜以强力挽回，更适合收缩范围、整顿近处并重新建立秩序。',
    en: 'When open flow reaches its limit, structure can loosen; force is less useful than narrowing scope, restoring local order, and rebuilding foundations.',
    it: 'Quando il flusso aperto raggiunge il limite, la struttura può allentarsi; è più utile restringere il campo, ristabilire l’ordine vicino e ricostruire le basi che usare la forza.',
  }),

  line(12, 1, '初六：拔茅茹以其彙，貞吉。亨。', 'zhouyi-canonical-wikisource', {
    'zh-CN': '阻隔初起时，彼此相连的人与条件会一起退守；守住共同原则比勉强推进更重要。',
    en: 'As blockage begins, connected people and conditions withdraw together; preserving shared principles matters more than forcing progress.',
    it: 'Quando il blocco inizia, persone e condizioni collegate si ritirano insieme; preservare principi comuni conta più che forzare l’avanzamento.',
  }),
  line(12, 2, '六二：包承，小人吉，大人否。亨。', 'zhouyi-canonical-wikisource', {
    'zh-CN': '适应阻滞可能使局部事务维持，但承担更大责任者需要保留原则，不把迁就误当成真正通达。',
    en: 'Accommodation may keep limited affairs functioning, but greater responsibility requires preserving principles rather than mistaking compliance for genuine flow.',
    it: 'L’adattamento può mantenere in funzione questioni limitate, ma una responsabilità maggiore richiede di preservare i principi senza confondere l’accondiscendenza con un vero flusso.',
  }),
  line(12, 3, '六三：包羞。', 'zhouyi-canonical-wikisource', {
    'zh-CN': '阻隔已进入内在压力与失序感，掩盖问题会增加负担；此处先承认局面的不相称。',
    en: 'Blockage has become inner pressure and disorder; concealing the problem adds burden, so the mismatch should first be acknowledged.',
    it: 'Il blocco è diventato pressione interna e disordine; nascondere il problema aumenta il peso, perciò occorre anzitutto riconoscere la dissonanza.',
  }),
  line(12, 4, '九四：有命，无咎，疇離祉。', 'zhouyi-canonical-wikisource', {
    'zh-CN': '转机来自明确职责与可执行的共同依据；当行动不再只凭个人意志，支持才可能重新聚集。',
    en: 'A turn becomes possible through clear responsibility and a shared basis for action; support can gather when action is not merely personal will.',
    it: 'Una svolta diventa possibile attraverso responsabilità chiare e una base comune per agire; il sostegno può riunirsi quando l’azione non dipende solo dalla volontà personale.',
  }),
  line(12, 5, '九五：休否，大人吉。其亡其亡，繫于苞桑。', 'zhouyi-canonical-wikisource', {
    'zh-CN': '阻滞开始缓解，但稳定仍然脆弱；保持危机意识并把基础系牢，才能避免过早松懈。',
    en: 'Blockage begins to ease, but stability remains fragile; awareness of risk and a secured foundation prevent premature relaxation.',
    it: 'Il blocco comincia ad attenuarsi, ma la stabilità resta fragile; consapevolezza del rischio e basi salde evitano un rilassamento prematuro.',
  }),
  line(12, 6, '上九：傾否，先否後喜。', 'zhouyi-canonical-wikisource', {
    'zh-CN': '阻隔走到尽头后存在翻转空间；变化来自原有封闭结构被打破，而不是假装阻碍从未存在。',
    en: 'When blockage reaches its end, reversal becomes possible; change comes from breaking the closed structure, not pretending the obstruction never existed.',
    it: 'Quando il blocco giunge al termine, può rovesciarsi; il cambiamento nasce dalla rottura della struttura chiusa, non dal fingere che l’ostacolo non sia mai esistito.',
  }),
]);

const LINE_BY_IDENTITY = new Map(
  UNITY_LINE_TEXTS.map((item) => [`${item.hexagramNumber}:${item.linePosition}`, item]),
);

export function getUnityLineText(hexagramNumber, linePosition) {
  return LINE_BY_IDENTITY.get(`${Number(hexagramNumber)}:${Number(linePosition)}`) || null;
}
