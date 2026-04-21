const artworkMap = {};

function registerArtwork(names, path) {
  names.forEach((name) => {
    artworkMap[name] = path;
  });
}

const numberVariants = [
  ['1', '一', 'ACE'],
  ['2', '二'],
  ['3', '三'],
  ['4', '四'],
  ['5', '五'],
  ['6', '六'],
  ['7', '七'],
  ['8', '八'],
  ['9', '九'],
  ['10', '十'],
];

function registerSuit(suit) {
  numberVariants.forEach((variants) => {
    const fileSuffix = variants[0] === '1' ? 'ACE' : variants[0];
    registerArtwork(
      variants.map((variant) => `${suit}${variant}`),
      `/cards/waite-cn/${suit}${fileSuffix}.jpg`,
    );
  });

  registerArtwork([`${suit}侍从`, `${suit}侍者`, `${suit}侍卫`], `/cards/waite-cn/${suit}侍卫.jpg`);
  registerArtwork([`${suit}骑士`], `/cards/waite-cn/${suit}骑士.jpg`);
  registerArtwork([`${suit}皇后`, `${suit}王后`], `/cards/waite-cn/${suit}王后.jpg`);
  registerArtwork([`${suit}国王`], `/cards/waite-cn/${suit}国王.jpg`);
}

registerArtwork(['愚者'], '/cards/waite-cn/00愚者.jpg');
registerArtwork(['魔术师'], '/cards/waite-cn/01魔术师.jpg');
registerArtwork(['女祭司', '女祭祀'], '/cards/waite-cn/02女祭祀.jpg');
registerArtwork(['女皇', '皇后'], '/cards/waite-cn/03皇后.jpg');
registerArtwork(['皇帝'], '/cards/waite-cn/04皇帝.jpg');
registerArtwork(['教皇'], '/cards/waite-cn/05教皇.jpg');
registerArtwork(['恋人'], '/cards/waite-cn/06恋人.jpg');
registerArtwork(['战车'], '/cards/waite-cn/07战车.jpg');
registerArtwork(['力量'], '/cards/waite-cn/08力量.jpg');
registerArtwork(['隐者', '隐士'], '/cards/waite-cn/09隐士.jpg');
registerArtwork(['命运之轮'], '/cards/waite-cn/10命运之轮.jpg');
registerArtwork(['正义'], '/cards/waite-cn/11正义.jpg');
registerArtwork(['倒吊人'], '/cards/waite-cn/12倒吊人.jpg');
registerArtwork(['死亡', '死神'], '/cards/waite-cn/13死神.jpg');
registerArtwork(['节制'], '/cards/waite-cn/14节制.jpg');
registerArtwork(['恶魔'], '/cards/waite-cn/15恶魔.jpg');
registerArtwork(['塔', '高塔'], '/cards/waite-cn/16高塔.jpg');
registerArtwork(['星星'], '/cards/waite-cn/17星星.jpg');
registerArtwork(['月亮'], '/cards/waite-cn/18月亮.jpg');
registerArtwork(['太阳'], '/cards/waite-cn/19太阳.jpg');
registerArtwork(['审判'], '/cards/waite-cn/20审判.jpg');
registerArtwork(['世界'], '/cards/waite-cn/21世界.jpg');

registerSuit('权杖');
registerSuit('圣杯');
registerSuit('宝剑');
registerSuit('星币');

export function getCardArtwork(card) {
  if (!card?.name) return null;
  return artworkMap[card.name] || null;
}
