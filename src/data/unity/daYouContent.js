// Canonical text: https://ctext.org/book-of-changes/da-you/zh
// Retrieved 2026-09-21. Modern summaries are product editorial text, not quotations.
const modern = (zh, en, it) => Object.fromEntries(
  [['zh-CN', zh], ['en', en], ['it', it]].map(([locale, summary]) =>
    [locale, { summary, sourceId: 'bingbing-unity-editorial-v1' }]),
);
const common = { contentVersion: '1.1.0', contentStatus: 'editorial-draft' };
const canonical = (originalText) => ({ originalText, sourceId: 'zhouyi-da-you-ctext' });
export const DA_YOU_CONTENT = {
  ...common, hexagramId: 'hexagram-14',
  canonical: canonical('大有：元亨。'),
  keywordIds: ['resources', 'responsibility', 'restraint'],
  modern: modern(
    '大有讨论的是如何持有和使用已有资源，而不只是获得更多。下乾为健、上离为明，可从行动能力与辨别能力是否相配合来理解。用于现实问题时，可检视手中的能力、支持和责任能否形成可靠的承载；“大有”并不保证职位、收入或某个结果必然保住。',
    'Great Possession concerns how resources are held and used, not merely how more is acquired. Heaven below suggests capacity for action; Fire above suggests discernment. Consider whether ability, support and responsibility can work together. The name does not guarantee a job, income or any particular outcome.',
    'Il Grande Possesso riguarda il modo di custodire e usare le risorse, non soltanto di acquisirne altre. Il Cielo sotto richiama la capacità di agire; il Fuoco sopra, il discernimento. Si può esaminare come capacità, sostegno e responsabilità collaborino. Il nome non garantisce un impiego, un reddito o un risultato preciso.',
  ),
};
const rows = [
  ['初九：无交害，匪咎，艱則无咎。', '尚未卷入损害，不等于可以忽略困难。此爻重在起步时识别风险，保留谨慎，不把暂时无事视为永远无事。', 'Being outside harm does not remove difficulty. At the beginning, recognize risks and avoid treating present safety as permanent.', 'Essere al riparo dal danno non elimina le difficoltà. All’inizio occorre riconoscere i rischi senza scambiare la sicurezza presente per una garanzia permanente.'],
  ['九二：大車以載，有攸往，无咎。', '大车能载重，重点是承载能力与任务相称。推进之前可核对资源、协作和执行能力，而不是只凭愿望接下更多责任。', 'A large wagon carries its load: capacity should match the task. Examine resources, cooperation and execution before taking on more responsibility.', 'Un grande carro sostiene il carico: la capacità deve essere proporzionata al compito. Valuta risorse, collaborazione ed esecuzione prima di assumere altre responsabilità.'],
  ['九三：公用亨于天子，小人弗克。', '此爻把拥有放进更大的共同事务中。资源与成果需要用于共同目标，不能仅按个人占有来处理；这里的“小人”不是对提问者的人格判断。', 'Possession is placed within a larger shared undertaking. Resources and achievements serve common aims rather than private ownership alone; the traditional contrast is not a diagnosis of the reader’s character.', 'Il possesso viene collocato in un’impresa comune più ampia. Risorse e risultati servono obiettivi condivisi, non solo interessi privati; il contrasto tradizionale non è un giudizio sulla persona che legge.'],
  ['九四：匪其彭，无咎。', '已有资源时不以盛大自居，避免夸张和越位。此爻重在辨认自身职责与限度，不必靠展示声势来证明价值。', 'With resources available, avoid displaying excess or overstepping a role. Discern responsibilities and limits rather than using grandeur to prove worth.', 'Quando le risorse sono disponibili, evita l’ostentazione e di oltrepassare il tuo ruolo. Riconosci responsabilità e limiti senza usare la grandiosità per dimostrare valore.'],
  ['六五：厥孚交如，威如；吉。', '以诚信相交，同时保持应有的分寸与权责。信任不是无条件退让，威严也不等于强硬控制；两者需要同时成立。', 'Sincerity is met with trust while appropriate authority remains. Trust is not unconditional yielding, and authority is not coercion; both need proportion.', 'La sincerità incontra fiducia, mantenendo un’autorità adeguata. La fiducia non è cedere senza condizioni e l’autorità non è coercizione: entrambe richiedono misura.'],
  ['上九：自天祐之，吉无不利。', '原文以天祐表达大有至终的有利状态。现代阅读可关注支持如何得以持续，珍惜已有条件；不能把这句吉辞当作无条件成功或免于风险的承诺。', 'The original invokes help from Heaven at the culmination of Great Possession. A modern reading considers how support is sustained; this auspicious wording is not an unconditional promise of success or freedom from risk.', 'Il testo invoca l’aiuto del Cielo al culmine del Grande Possesso. Una lettura moderna considera come mantenere il sostegno; queste parole favorevoli non promettono successo incondizionato né assenza di rischi.'],
];
export const DA_YOU_LINES = rows.map(([text, zh, en, it], index) => ({
  ...common, lineId: `line-14-${index + 1}`, hexagramId: 'hexagram-14',
  hexagramNumber: 14, linePosition: index + 1,
  canonical: canonical(text), modern: modern(zh, en, it),
}));
