const DEFAULT_VISIBLE_BACK_COUNT = 12;

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
  const visibleBackCount = Math.min(DEFAULT_VISIBLE_BACK_COUNT, deck.length);

  return {
    phase: 'shuffling',
    cardCount: normalizedCount,
    deck,
    visibleBacks: Array.from({ length: visibleBackCount }, (_, index) => index),
    selectedBacks: [],
    drawnCards: [],
    revealedCards: [],
    allRevealed: false,
  };
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

  if (session.selectedBacks.length >= session.cardCount) return session;

  return {
    ...session,
    selectedBacks: [...session.selectedBacks, backIndex],
  };
}

export function confirmBackSelection(session) {
  if (!session || session.phase !== 'selecting' || session.selectedBacks.length !== session.cardCount) {
    return session;
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
