const createCard = (id, name, englishName) => ({
  id,
  name,
  englishName,
});

const majorArcanaDefinitions = [
  ['愚人', 'The Fool'],
  ['魔术师', 'The Magician'],
  ['女祭司', 'The High Priestess'],
  ['女皇', 'The Empress'],
  ['皇帝', 'The Emperor'],
  ['教皇', 'The Hierophant'],
  ['恋人', 'The Lovers'],
  ['战车', 'The Chariot'],
  ['力量', 'Strength'],
  ['隐士', 'The Hermit'],
  ['命运之轮', 'Wheel of Fortune'],
  ['正义', 'Justice'],
  ['倒吊人', 'The Hanged Man'],
  ['死神', 'Death'],
  ['节制', 'Temperance'],
  ['恶魔', 'The Devil'],
  ['高塔', 'The Tower'],
  ['星星', 'The Star'],
  ['月亮', 'The Moon'],
  ['太阳', 'The Sun'],
  ['审判', 'Judgement'],
  ['世界', 'The World'],
];

const minorSuitDefinitions = [
  ['权杖', 'Wands'],
  ['圣杯', 'Cups'],
  ['宝剑', 'Swords'],
  ['星币', 'Pentacles'],
];

const minorRanks = [
  ['一', 'Ace'],
  ['二', 'Two'],
  ['三', 'Three'],
  ['四', 'Four'],
  ['五', 'Five'],
  ['六', 'Six'],
  ['七', 'Seven'],
  ['八', 'Eight'],
  ['九', 'Nine'],
  ['十', 'Ten'],
  ['侍从', 'Page'],
  ['骑士', 'Knight'],
  ['皇后', 'Queen'],
  ['国王', 'King'],
];

const fallbackUprightKeywords = ['清晰', '觉察', '机会'];
const fallbackReversedKeywords = ['停顿', '提醒', '调整'];

const majorCards = majorArcanaDefinitions.map(([name, englishName], id) => createCard(id, name, englishName));

const minorCards = minorSuitDefinitions.flatMap(([prefixCn, suitEn], suitIndex) =>
  minorRanks.map(([rankCn, rankEn], rankIndex) => {
    const id = 22 + suitIndex * minorRanks.length + rankIndex;
    return createCard(id, `${prefixCn}${rankCn}`, `${rankEn} of ${suitEn}`);
  }),
);

const cardCatalog = [...majorCards, ...minorCards];
const cardById = new Map(cardCatalog.map((card) => [card.id, card]));

export const allTarotCards = cardCatalog;
export const majorArcana = allTarotCards.slice(0, 22);
export const wands = allTarotCards.slice(22, 36);
export const cups = allTarotCards.slice(36, 50);
export const swords = allTarotCards.slice(50, 64);
export const pentacles = allTarotCards.slice(64, 78);

export function getCardData(id) {
  const matched = cardById.get(id);
  if (!matched) {
    return {
      name: '未知牌面',
      englishName: 'Unknown Card',
      keywords: '',
      uprightKeywords: fallbackUprightKeywords,
      reversedKeywords: fallbackReversedKeywords,
      upright: '这张牌的正位牌意暂未记录。',
      reversed: '这张牌的逆位牌意暂未记录。',
    };
  }

  return {
    ...matched,
    keywords: fallbackUprightKeywords.join(' / '),
    uprightKeywords: fallbackUprightKeywords,
    reversedKeywords: fallbackReversedKeywords,
    upright: `${matched.name}正位牌意暂未记录。`,
    reversed: `${matched.name}逆位牌意暂未记录。`,
  };
}

export function getCardTitle(card) {
  if (!card) return '未知牌面 / Unknown Card';

  const resolved =
    typeof card.id === 'number'
      ? getCardData(card.id)
      : allTarotCards.find((item) => item.name === card.name) || getCardData(undefined);

  return `${card.name || resolved.name} / ${resolved.englishName}`;
}

export function getCardDisplayNames(card) {
  if (!card) {
    return { chineseName: '未知牌面', englishName: 'Unknown Card' };
  }

  const resolved =
    typeof card.id === 'number'
      ? getCardData(card.id)
      : allTarotCards.find((item) => item.name === card.name) || getCardData(undefined);

  return {
    chineseName: card.name || resolved.name,
    englishName: resolved.englishName,
  };
}

export function getCardReading(card) {
  const resolved =
    typeof card?.id === 'number'
      ? getCardData(card.id)
      : allTarotCards.find((item) => item.name === card?.name)
        ? getCardData(allTarotCards.find((item) => item.name === card?.name).id)
        : getCardData(undefined);

  return card?.isReversed ? resolved.reversed : resolved.upright;
}

export function drawRandomCard() {
  const randomIndex = Math.floor(Math.random() * allTarotCards.length);
  const card = allTarotCards[randomIndex];
  return {
    ...card,
    isReversed: Math.random() > 0.5,
  };
}

export function drawThreeCards() {
  const deck = [...allTarotCards];
  const cards = [];

  while (cards.length < 3 && deck.length > 0) {
    const randomIndex = Math.floor(Math.random() * deck.length);
    const [card] = deck.splice(randomIndex, 1);
    cards.push({
      ...card,
      isReversed: Math.random() > 0.5,
    });
  }

  return cards;
}
