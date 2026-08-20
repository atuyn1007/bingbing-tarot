const SCHEMA_VERSION = '3.0';
const ROUND_POSITIONS = ['initial', 'second', 'third', 'fourth', 'fifth', 'top'];
const TAROT_CARD_IDS = new Set(Array.from({ length: 78 }, (_, index) => index));
const CASTING_PHASES = new Set(['selecting', 'revealing', 'roundComplete']);

function shuffleAndOrient(cards, random) {
  const deck = cards.map((card) => ({ ...card }));
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck.map((card) => ({ ...card, isReversed: random() < 0.5 }));
}

function getCompletedCardIds(session) {
  return new Set(
    (session?.completedRounds || []).flatMap((round) => (
      Array.isArray(round?.tarotCards) ? round.tarotCards.map((card) => card?.id) : []
    )),
  );
}

function cardsMatch(leftCards, rightCards) {
  return leftCards.length === rightCards.length && leftCards.every((card, index) => (
    card?.id === rightCards[index]?.id
    && card?.isReversed === rightCards[index]?.isReversed
  ));
}

export function createUnityCastingSession(cards, options = {}) {
  if (!Array.isArray(cards) || cards.length !== 78) {
    throw new Error('Unity casting requires the complete 78-card tarot deck.');
  }
  if (new Set(cards.map((card) => card?.id)).size !== 78) {
    throw new Error('Unity casting requires 78 unique tarot cards.');
  }
  const random = options.random || Math.random;
  const timestamp = options.now || new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    status: 'casting',
    phase: 'selecting',
    ownerId: String(options.ownerId || 'anonymous'),
    question: String(options.question || '').trim(),
    locale: options.locale || 'zh-CN',
    deck: shuffleAndOrient(cards, random),
    roundIndex: 1,
    selectedCardIds: [],
    currentRoundCards: [],
    revealedCount: 0,
    completedRounds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function getRemainingUnityCards(session) {
  if (!session || !Array.isArray(session.deck)) return [];
  const completedCardIds = getCompletedCardIds(session);
  return session.deck.filter((card) => !completedCardIds.has(card.id));
}

export function getUnityRoundCards(session, roundIndex = session?.roundIndex) {
  if (!session || roundIndex < 1 || roundIndex > 6) return [];
  if (roundIndex === session.roundIndex && Array.isArray(session.currentRoundCards)) {
    return session.currentRoundCards;
  }
  return session.completedRounds?.[roundIndex - 1]?.tarotCards || [];
}

export function toggleUnityCardSelection(session, cardId, now = new Date().toISOString()) {
  if (!session || session.status !== 'casting' || session.phase !== 'selecting') return session;
  const normalizedCardId = Number(cardId);
  const availableIds = new Set(getRemainingUnityCards(session).map((card) => card.id));
  if (!availableIds.has(normalizedCardId)) return session;

  const selectedCardIds = session.selectedCardIds || [];
  if (selectedCardIds.includes(normalizedCardId)) {
    return {
      ...session,
      selectedCardIds: selectedCardIds.filter((id) => id !== normalizedCardId),
      updatedAt: now,
    };
  }
  if (selectedCardIds.length >= 3) return session;
  return {
    ...session,
    selectedCardIds: [...selectedCardIds, normalizedCardId],
    updatedAt: now,
  };
}

export function confirmUnityRoundSelection(session, now = new Date().toISOString()) {
  if (
    !session
    || session.status !== 'casting'
    || session.phase !== 'selecting'
    || session.selectedCardIds?.length !== 3
  ) return session;

  const availableCards = new Map(getRemainingUnityCards(session).map((card) => [card.id, card]));
  const currentRoundCards = session.selectedCardIds.map((cardId) => availableCards.get(cardId));
  if (currentRoundCards.some((card) => !card)) return session;
  return {
    ...session,
    phase: 'revealing',
    currentRoundCards,
    revealedCount: 0,
    updatedAt: now,
  };
}

export function revealNextUnityCard(session, cardIndex, now = new Date().toISOString()) {
  if (
    !session
    || session.status !== 'casting'
    || session.phase !== 'revealing'
    || cardIndex !== session.revealedCount
    || cardIndex < 0
    || cardIndex > 2
  ) return session;

  const revealedCount = session.revealedCount + 1;
  if (revealedCount < 3) {
    return { ...session, revealedCount, updatedAt: now };
  }

  const completedRounds = [...session.completedRounds, {
    roundIndex: session.roundIndex,
    lineIndex: session.roundIndex,
    linePosition: ROUND_POSITIONS[session.roundIndex - 1],
    tarotCards: session.currentRoundCards,
  }];
  return {
    ...session,
    phase: 'roundComplete',
    revealedCount,
    completedRounds,
    status: completedRounds.length === 6 ? 'completed' : 'casting',
    updatedAt: now,
  };
}

export function advanceUnityRound(session, now = new Date().toISOString()) {
  if (
    !session
    || session.status !== 'casting'
    || session.phase !== 'roundComplete'
    || session.revealedCount !== 3
    || session.roundIndex >= 6
  ) return session;
  return {
    ...session,
    phase: 'selecting',
    roundIndex: session.roundIndex + 1,
    selectedCardIds: [],
    currentRoundCards: [],
    revealedCount: 0,
    updatedAt: now,
  };
}

export function isUnityCastingComplete(session) {
  return Boolean(
    session
    && session.status === 'completed'
    && session.phase === 'roundComplete'
    && session.completedRounds.length === 6,
  );
}

export function validateUnityCastingSession(session, ownerId) {
  if (!session || session.schemaVersion !== SCHEMA_VERSION) return false;
  if (session.ownerId !== String(ownerId || 'anonymous')) return false;
  if (!CASTING_PHASES.has(session.phase)) return false;
  if (!Array.isArray(session.deck) || session.deck.length !== 78) return false;
  if (new Set(session.deck.map((card) => card?.id)).size !== 78) return false;
  if (session.deck.some((card) => !TAROT_CARD_IDS.has(card?.id) || typeof card?.isReversed !== 'boolean')) return false;
  if (!Number.isInteger(session.roundIndex) || session.roundIndex < 1 || session.roundIndex > 6) return false;
  if (!Array.isArray(session.selectedCardIds) || session.selectedCardIds.length > 3) return false;
  if (new Set(session.selectedCardIds).size !== session.selectedCardIds.length) return false;
  if (!Array.isArray(session.currentRoundCards)) return false;
  if (!Number.isInteger(session.revealedCount) || session.revealedCount < 0 || session.revealedCount > 3) return false;
  if (!Array.isArray(session.completedRounds) || session.completedRounds.length > 6) return false;

  const deckById = new Map(session.deck.map((card) => [card.id, card]));
  const completedIds = new Set();
  for (let index = 0; index < session.completedRounds.length; index += 1) {
    const round = session.completedRounds[index];
    if (
      round?.roundIndex !== index + 1
      || round?.lineIndex !== index + 1
      || round?.linePosition !== ROUND_POSITIONS[index]
      || !Array.isArray(round?.tarotCards)
      || round.tarotCards.length !== 3
    ) return false;
    for (const card of round.tarotCards) {
      const deckCard = deckById.get(card?.id);
      if (!deckCard || completedIds.has(card.id) || !cardsMatch([card], [deckCard])) return false;
      completedIds.add(card.id);
    }
  }

  if (session.selectedCardIds.some((cardId) => !deckById.has(cardId))) return false;
  const expectedCompletedCount = session.phase === 'roundComplete'
    ? session.roundIndex
    : session.roundIndex - 1;
  if (session.completedRounds.length !== expectedCompletedCount) return false;

  if (session.phase === 'selecting') {
    if (session.status !== 'casting' || session.currentRoundCards.length !== 0 || session.revealedCount !== 0) return false;
    if (session.selectedCardIds.some((cardId) => completedIds.has(cardId))) return false;
  } else {
    if (session.selectedCardIds.length !== 3 || session.currentRoundCards.length !== 3) return false;
    const selectedCards = session.selectedCardIds.map((cardId) => deckById.get(cardId));
    if (!cardsMatch(session.currentRoundCards, selectedCards)) return false;
    if (session.phase === 'revealing') {
      if (session.status !== 'casting' || session.revealedCount > 2) return false;
      if (session.selectedCardIds.some((cardId) => completedIds.has(cardId))) return false;
    } else {
      if (session.revealedCount !== 3) return false;
      const completedRoundCards = session.completedRounds[session.roundIndex - 1]?.tarotCards || [];
      if (!cardsMatch(session.currentRoundCards, completedRoundCards)) return false;
    }
  }

  if (session.status === 'completed') {
    return session.roundIndex === 6 && session.phase === 'roundComplete' && session.completedRounds.length === 6;
  }
  return session.status === 'casting' && session.completedRounds.length < 6;
}
