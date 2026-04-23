const artworkMap = {};

const MINOR_NUMBER_VARIANTS = [
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

const MAJOR_ARTWORKS = [
  [['愚者'], '/cards/waite-cn/00愚者.jpg'],
  [['魔术师'], '/cards/waite-cn/01魔术师.jpg'],
  [['女祭司', '女祭祀'], '/cards/waite-cn/02女祭祀.jpg'],
  [['女皇', '皇后'], '/cards/waite-cn/03皇后.jpg'],
  [['皇帝'], '/cards/waite-cn/04皇帝.jpg'],
  [['教皇'], '/cards/waite-cn/05教皇.jpg'],
  [['恋人'], '/cards/waite-cn/06恋人.jpg'],
  [['战车'], '/cards/waite-cn/07战车.jpg'],
  [['力量'], '/cards/waite-cn/08力量.jpg'],
  [['隐者', '隐士'], '/cards/waite-cn/09隐士.jpg'],
  [['命运之轮'], '/cards/waite-cn/10命运之轮.jpg'],
  [['正义'], '/cards/waite-cn/11正义.jpg'],
  [['倒吊人'], '/cards/waite-cn/12倒吊人.jpg'],
  [['死亡', '死神'], '/cards/waite-cn/13死神.jpg'],
  [['节制'], '/cards/waite-cn/14节制.jpg'],
  [['恶魔'], '/cards/waite-cn/15恶魔.jpg'],
  [['塔', '高塔'], '/cards/waite-cn/16高塔.jpg'],
  [['星星'], '/cards/waite-cn/17星星.jpg'],
  [['月亮'], '/cards/waite-cn/18月亮.jpg'],
  [['太阳'], '/cards/waite-cn/19太阳.jpg'],
  [['审判'], '/cards/waite-cn/20审判.jpg'],
  [['世界'], '/cards/waite-cn/21世界.jpg'],
];

function registerArtwork(names, path) {
  names.forEach((name) => {
    artworkMap[name] = path;
  });
}

function registerMinorSuit(suit) {
  MINOR_NUMBER_VARIANTS.forEach((variants) => {
    const fileSuffix = variants[0] === '1' ? 'ACE' : variants[0];
    registerArtwork(
      variants.map((variant) => `${suit}${variant}`),
      `/cards/waite-cn/${suit}${fileSuffix}.jpg`,
    );
  });

  registerArtwork(
    [`${suit}侍从`, `${suit}侍者`, `${suit}侍卫`],
    `/cards/waite-cn/${suit}侍卫.jpg`,
  );
  registerArtwork([`${suit}骑士`], `/cards/waite-cn/${suit}骑士.jpg`);
  registerArtwork([`${suit}皇后`, `${suit}王后`], `/cards/waite-cn/${suit}王后.jpg`);
  registerArtwork([`${suit}国王`], `/cards/waite-cn/${suit}国王.jpg`);
}

MAJOR_ARTWORKS.forEach(([names, path]) => registerArtwork(names, path));
['权杖', '圣杯', '宝剑', '星币'].forEach(registerMinorSuit);

export function getCardArtwork(card) {
  if (!card?.name) return null;
  return artworkMap[card.name] || null;
}
