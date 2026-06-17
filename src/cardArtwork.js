const MAJOR_FILENAMES = new Map([
  [0, '00愚者.jpg'],
  [1, '01魔术师.jpg'],
  [2, '02女祭祀.jpg'],
  [3, '03皇后.jpg'],
  [4, '04皇帝.jpg'],
  [5, '05教皇.jpg'],
  [6, '06恋人.jpg'],
  [7, '07战车.jpg'],
  [8, '08力量.jpg'],
  [9, '09隐士.jpg'],
  [10, '10命运之轮.jpg'],
  [11, '11正义.jpg'],
  [12, '12倒吊人.jpg'],
  [13, '13死神.jpg'],
  [14, '14节制.jpg'],
  [15, '15恶魔.jpg'],
  [16, '16高塔.jpg'],
  [17, '17星星.jpg'],
  [18, '18月亮.jpg'],
  [19, '19太阳.jpg'],
  [20, '20审判.jpg'],
  [21, '21世界.jpg'],
]);

const SUIT_PREFIXES = {
  wands: '权杖',
  cups: '圣杯',
  swords: '宝剑',
  pentacles: '星币',
};

const ENGLISH_SUIT_TO_KEY = {
  Wands: 'wands',
  Cups: 'cups',
  Swords: 'swords',
  Pentacles: 'pentacles',
};

const COURT_FILE_NAMES = {
  Page: '侍卫',
  Knight: '骑士',
  Queen: '王后',
  King: '国王',
};

const CHINESE_DIGITS = {
  一: '1',
  二: '2',
  三: '3',
  四: '4',
  五: '5',
  六: '6',
  七: '7',
  八: '8',
  九: '9',
  十: '10',
};

const MAJOR_NAME_TO_FILE = new Map([
  ['愚人', '00愚者.jpg'],
  ['愚者', '00愚者.jpg'],
  ['魔术师', '01魔术师.jpg'],
  ['女祭司', '02女祭祀.jpg'],
  ['女祭祀', '02女祭祀.jpg'],
  ['女皇', '03皇后.jpg'],
  ['皇后', '03皇后.jpg'],
  ['皇帝', '04皇帝.jpg'],
  ['教皇', '05教皇.jpg'],
  ['恋人', '06恋人.jpg'],
  ['战车', '07战车.jpg'],
  ['力量', '08力量.jpg'],
  ['隐士', '09隐士.jpg'],
  ['命运之轮', '10命运之轮.jpg'],
  ['正义', '11正义.jpg'],
  ['倒吊人', '12倒吊人.jpg'],
  ['死神', '13死神.jpg'],
  ['死亡', '13死神.jpg'],
  ['节制', '14节制.jpg'],
  ['恶魔', '15恶魔.jpg'],
  ['高塔', '16高塔.jpg'],
  ['塔', '16高塔.jpg'],
  ['星星', '17星星.jpg'],
  ['月亮', '18月亮.jpg'],
  ['太阳', '19太阳.jpg'],
  ['审判', '20审判.jpg'],
  ['世界', '21世界.jpg'],
]);

function toAssetPath(filename) {
  return filename ? `/cards/waite-cn/${filename}` : '';
}

function normalizeName(name) {
  return String(name || '')
    .replace(/\s+/g, '')
    .replace('女祭司', '女祭祀')
    .replace('女皇', '皇后')
    .replace('死亡', '死神');
}

function getMinorFilenameFromEnglishName(englishName) {
  const match = String(englishName || '').match(
    /^(Ace|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Page|Knight|Queen|King) of (Wands|Cups|Swords|Pentacles)$/,
  );
  if (!match) return '';

  const [, rank, suitName] = match;
  const suitKey = ENGLISH_SUIT_TO_KEY[suitName];
  const prefix = SUIT_PREFIXES[suitKey];
  if (!prefix) return '';

  if (rank === 'Ace') return `${prefix}ACE.jpg`;
  if (COURT_FILE_NAMES[rank]) return `${prefix}${COURT_FILE_NAMES[rank]}.jpg`;

  const numberMap = {
    Two: '2',
    Three: '3',
    Four: '4',
    Five: '5',
    Six: '6',
    Seven: '7',
    Eight: '8',
    Nine: '9',
    Ten: '10',
  };

  return `${prefix}${numberMap[rank]}.jpg`;
}

function getMinorFilenameFromChineseName(name) {
  const normalized = normalizeName(name);
  const suit = Object.values(SUIT_PREFIXES).find((prefix) => normalized.startsWith(prefix));
  if (!suit) return '';

  const rawRank = normalized.slice(suit.length);
  if (!rawRank) return '';

  if (rawRank === 'ACE' || rawRank === 'Ace' || rawRank === 'ace' || rawRank === '一') {
    return `${suit}ACE.jpg`;
  }

  if (rawRank in CHINESE_DIGITS) {
    return `${suit}${CHINESE_DIGITS[rawRank]}.jpg`;
  }

  if (/^\d+$/.test(rawRank)) {
    return `${suit}${rawRank}.jpg`;
  }

  if (rawRank === '侍者' || rawRank === '侍从' || rawRank === '侍卫') {
    return `${suit}侍卫.jpg`;
  }

  if (rawRank === '骑士') {
    return `${suit}骑士.jpg`;
  }

  if (rawRank === '皇后' || rawRank === '王后') {
    return `${suit}王后.jpg`;
  }

  if (rawRank === '国王') {
    return `${suit}国王.jpg`;
  }

  return '';
}

export function getCardArtwork(card) {
  if (!card) return '';

  const byEnglishName = getMinorFilenameFromEnglishName(card.englishName);
  if (byEnglishName) return toAssetPath(byEnglishName);

  const byChineseName = getMinorFilenameFromChineseName(normalizeName(card.name));
  if (byChineseName) return toAssetPath(byChineseName);

  if (typeof card.id === 'number' && MAJOR_FILENAMES.has(card.id)) {
    return toAssetPath(MAJOR_FILENAMES.get(card.id));
  }

  const normalizedName = normalizeName(card.name);
  if (MAJOR_NAME_TO_FILE.has(normalizedName)) {
    return toAssetPath(MAJOR_NAME_TO_FILE.get(normalizedName));
  }

  return '';
}
