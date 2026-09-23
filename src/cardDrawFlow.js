function shuffleCards(cards, random) {
  const deck = cards.map((card) => ({ ...card }));

  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }

  return deck.map((card) => ({
    ...card,
    isReversed: random() < 0.5,
  }));
}

export function createDrawSession(cards, cardCount, random = Math.random) {
  const normalizedCount = Math.max(1, Math.min(Number(cardCount) || 1, cards.length));
  const deck = shuffleCards(cards, random);

  return {
    phase: 'shuffling',
    cardCount: normalizedCount,
    deck,
    visibleBacks: Array.from({ length: deck.length }, (_, index) => index),
    selectedBacks: [],
    drawnCards: [],
    revealedCards: [],
    allRevealed: false,
  };
}

// Catalogue IDs are stable: major 0–21, wands 22–35, cups 36–49,
// swords 50–63, pentacles 64–77. Back indexes always address the frozen deck.
const SEASONAL_RANGES = [[0, 21], [50, 63], [22, 35], [36, 49], [64, 77]];

export function createSeasonalDrawSession(cards, random = Math.random) {
  if (cards.length !== 78 || new Set(cards.map(card => card.id)).size !== 78
    || cards.some(card => !Number.isInteger(card.id) || card.id < 0 || card.id > 77)) {
    throw new Error('Seasonal draw requires a complete, unique 78-card deck');
  }
  const session = createDrawSession(cards, 5, random);
  const groups = SEASONAL_RANGES.map(([first, last]) => session.visibleBacks.filter(index => (
    session.deck[index].id >= first && session.deck[index].id <= last
  )));
  return { ...session, groups, groupIndex: 0, visibleBacks: groups[0] };
}

export function completeShuffle(session) {
  if (!session || session.phase !== 'shuffling') return session;
  return { ...session, phase: 'selecting' };
}

export function toggleBackSelection(session, backIndex) {
  if (!session || session.phase !== 'selecting' || !session.visibleBacks.includes(backIndex)) {
    return session;
  }

  if (session.selectedBacks.includes(backIndex)) {
    return {
      ...session,
      selectedBacks: session.selectedBacks.filter((index) => index !== backIndex),
    };
  }

  if (session.selectedBacks.length >= (session.groups ? 1 : session.cardCount)) return session;

  return {
    ...session,
    selectedBacks: [...session.selectedBacks, backIndex],
  };
}

export function confirmBackSelection(session) {
  if (!session || session.phase !== 'selecting' || session.selectedBacks.length !== (session.groups ? 1 : session.cardCount)) {
    return session;
  }

  if (session.groups) {
    const drawnCards = [...session.drawnCards, session.deck[session.selectedBacks[0]]];
    const groupIndex = session.groupIndex + 1;
    const complete = groupIndex === session.groups.length;
    return {
      ...session,
      phase: complete ? 'revealing' : 'shuffling',
      groupIndex: complete ? session.groupIndex : groupIndex,
      visibleBacks: complete ? [] : session.groups[groupIndex],
      selectedBacks: [],
      drawnCards,
      revealedCards: [],
      allRevealed: false,
    };
  }

  return {
    ...session,
    phase: 'revealing',
    drawnCards: session.selectedBacks.map((backIndex) => session.deck[backIndex]),
    revealedCards: [],
    allRevealed: false,
  };
}

export function getConfirmedDrawForPersistence(session, lastPersistedCards) {
  if (
    !session
    || session.phase !== 'revealing'
    || session.drawnCards.length === 0
    || session.drawnCards === lastPersistedCards
  ) {
    return null;
  }

  return session.drawnCards;
}

export function createDrawPersistenceCoordinator() {
  const pendingByReading = new Map();

  return {
    run(readingId, operation) {
      const pending = pendingByReading.get(readingId);
      if (pending) return pending;

      let operationPromise;
      try {
        operationPromise = Promise.resolve(operation());
      } catch (error) {
        operationPromise = Promise.reject(error);
      }

      const trackedPromise = operationPromise.finally(() => {
        if (pendingByReading.get(readingId) === trackedPromise) {
          pendingByReading.delete(readingId);
        }
      });
      pendingByReading.set(readingId, trackedPromise);
      return trackedPromise;
    },
  };
}

export function revealSelectedCard(session, cardIndex) {
  if (
    !session ||
    session.phase !== 'revealing' ||
    !session.drawnCards[cardIndex] ||
    session.revealedCards.includes(cardIndex)
  ) {
    return session;
  }

  const revealedCards = [...session.revealedCards, cardIndex].sort((left, right) => left - right);
  return {
    ...session,
    revealedCards,
    allRevealed: revealedCards.length === session.drawnCards.length,
  };
}

export function revealAllSelectedCards(session) {
  if (!session || session.phase !== 'revealing') return session;

  return {
    ...session,
    revealedCards: session.drawnCards.map((_, index) => index),
    allRevealed: session.drawnCards.length > 0,
  };
}

export function openStructuredReading(session) {
  if (!session || session.phase !== 'revealing' || !session.allRevealed) return session;
  return { ...session, phase: 'reading' };
}
