const SCHEMA_VERSION = '2.0';
const ROUND_POSITIONS = ['initial', 'second', 'third', 'fourth', 'fifth', 'top'];
const TAROT_CARD_IDS = new Set(Array.from({ length: 78 }, (_, index) => index));

function shuffleAndOrient(cards, random) {
  const deck = cards.map((card) => ({ ...card }));
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck.slice(0, 18).map((card) => ({ ...card, isReversed: random() < 0.5 }));
}

export function createUnityCastingSession(cards, options = {}) {
  if (!Array.isArray(cards) || cards.length < 18) throw new Error('Unity casting requires at least 18 tarot cards.');
  const random = options.random || Math.random;
  const timestamp = options.now || new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    status: 'casting',
    ownerId: String(options.ownerId || 'anonymous'),
    question: String(options.question || '').trim(),
    locale: options.locale || 'zh-CN',
    cards: shuffleAndOrient(cards, random),
    roundIndex: 1,
    revealedCount: 0,
    completedRounds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function getUnityRoundCards(session, roundIndex = session?.roundIndex) {
  if (!session || roundIndex < 1 || roundIndex > 6) return [];
  return session.cards.slice((roundIndex - 1) * 3, roundIndex * 3);
}

export function revealNextUnityCard(session, cardIndex, now = new Date().toISOString()) {
  if (!session || session.status !== 'casting' || cardIndex !== session.revealedCount || cardIndex < 0 || cardIndex > 2) return session;
  const revealedCount = session.revealedCount + 1;
  const completedRounds = revealedCount === 3
    ? [...session.completedRounds, {
      roundIndex: session.roundIndex,
      lineIndex: session.roundIndex,
      linePosition: ROUND_POSITIONS[session.roundIndex - 1],
      tarotCards: getUnityRoundCards(session),
    }]
    : session.completedRounds;
  return {
    ...session,
    revealedCount,
    completedRounds,
    status: completedRounds.length === 6 ? 'completed' : session.status,
    updatedAt: now,
  };
}

export function advanceUnityRound(session, now = new Date().toISOString()) {
  if (!session || session.status !== 'casting' || session.revealedCount !== 3 || session.roundIndex >= 6) return session;
  return { ...session, roundIndex: session.roundIndex + 1, revealedCount: 0, updatedAt: now };
}

export function isUnityCastingComplete(session) {
  return Boolean(session && session.status === 'completed' && session.completedRounds.length === 6);
}

export function validateUnityCastingSession(session, ownerId) {
  if (!session || session.schemaVersion !== SCHEMA_VERSION) return false;
  if (session.ownerId !== String(ownerId || 'anonymous')) return false;
  if (!Array.isArray(session.cards) || session.cards.length !== 18) return false;
  if (new Set(session.cards.map((card) => card?.id)).size !== 18) return false;
  if (session.cards.some((card) => !TAROT_CARD_IDS.has(card?.id) || typeof card?.isReversed !== 'boolean')) return false;
  if (!Number.isInteger(session.roundIndex) || session.roundIndex < 1 || session.roundIndex > 6) return false;
  if (!Number.isInteger(session.revealedCount) || session.revealedCount < 0 || session.revealedCount > 3) return false;
  if (!Array.isArray(session.completedRounds) || session.completedRounds.length > 6) return false;
  const expectedCompleted = session.roundIndex - 1 + (session.revealedCount === 3 ? 1 : 0);
  if (session.completedRounds.length !== expectedCompleted) return false;
  for (let index = 0; index < session.completedRounds.length; index += 1) {
    const round = session.completedRounds[index];
    const expectedCards = session.cards.slice(index * 3, index * 3 + 3);
    if (
      round?.roundIndex !== index + 1
      || round?.lineIndex !== index + 1
      || round?.linePosition !== ROUND_POSITIONS[index]
      || !Array.isArray(round?.tarotCards)
      || round.tarotCards.length !== 3
      || round.tarotCards.some((card, cardIndex) => (
        card?.id !== expectedCards[cardIndex]?.id
        || card?.isReversed !== expectedCards[cardIndex]?.isReversed
      ))
    ) return false;
  }
  return session.status === 'casting' || (session.status === 'completed' && session.completedRounds.length === 6);
}
