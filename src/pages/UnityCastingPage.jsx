import { useEffect, useState } from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import TarotCardSelector from '../components/TarotCardSelector';
import TarotCard from '../TarotCard';
import { deriveUnityLine } from '../unityAlgorithm';
import { getLocalizedUnityCardName } from '../unityCardLocalization';
import { getRemainingUnityCards, getUnityRoundCards } from '../unityCastingFlow';

function UnityCastingPage({
  theme,
  session,
  goHome,
  onToggleSelection,
  onConfirmSelection,
  onReveal,
  onAdvance,
  onComplete,
  error,
  language,
  t,
}) {
  const shouldReduceMotion = useReducedMotion();
  const [meaningArchive, setMeaningArchive] = useState(null);
  const lineLabels = t('unity.lineLabels');
  const lineTypeLabels = t('unity.lineTypeLabels');
  const polarityLabels = t('unity.polarityLabels');
  const lineLabel = lineLabels[session.roundIndex - 1];
  const remainingCards = getRemainingUnityCards(session);
  const roundCards = getUnityRoundCards(session);
  const lineResult = session.phase === 'roundComplete' ? deriveUnityLine(roundCards) : null;
  const remainingSelections = Math.max(0, 3 - session.selectedCardIds.length);
  const isFinalRound = session.roundIndex === 6;

  useEffect(() => {
    if (language !== 'it' || meaningArchive) return undefined;
    let active = true;
    import('../cardMeanings.js').then((module) => {
      if (active) setMeaningArchive(module);
    }).catch(() => {});
    return () => { active = false; };
  }, [language, meaningArchive]);

  const selectorLabels = {
    dragHint: t('unity.selectionHint'),
    groupLabel: t('unity.selectionDeckLabel', { count: remainingCards.length }),
    cardAria: ({ index, isSelected, remaining }) => t('unity.selectionCardLabel', {
      index,
      state: isSelected ? t('drawing.selectedState') : t('drawing.unselectedState'),
      remaining,
    }),
    confirm: t('unity.confirmLine'),
    incomplete: t('unity.selectMoreCards', { count: remainingSelections }),
  };

  return (
    <div className={`screen-shell page-shell archive-page unity-casting-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button" aria-label={t('unity.backHome')}>
          <X className="w-5 h-5" />
        </button>
        <h1 className="page-title">{t('unity.title')}</h1>
        <div className="page-header-controls"><LanguageSwitcher /></div>
      </header>

      <main className="unity-casting-main">
        <section className="unity-casting-heading" aria-labelledby="unity-current-round-title">
          <p>{t('unity.roundProgress', { current: session.roundIndex, total: 6 })}</p>
          <h2 id="unity-current-round-title">{t('unity.roundTitle', { round: session.roundIndex, line: lineLabel })}</h2>
          <blockquote>{session.question}</blockquote>
          <small aria-live="polite">
            {session.phase === 'selecting'
              ? t('unity.selectionProgress', { selected: session.selectedCardIds.length, total: 3 })
              : session.phase === 'revealing'
                ? t('unity.revealProgress', { current: session.revealedCount, total: 3 })
                : isFinalRound ? t('unity.castingComplete') : t('unity.roundComplete')}
          </small>
          {error ? (
            <div className="unity-casting-error" role="alert">
              <p>{error}</p>
              <button type="button" onClick={onComplete}>{t('unity.retryCalculation')}</button>
            </div>
          ) : null}
        </section>

        <LazyMotion features={domAnimation}>
          <AnimatePresence mode="wait" initial={false}>
            {session.phase === 'selecting' ? (
              <m.section
                key={`selecting-${session.roundIndex}`}
                className="unity-casting-selector"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
                aria-label={t('unity.selectionDeckLabel', { count: remainingCards.length })}
              >
                <div className="unity-casting-stats" aria-live="polite">
                  <span>{t('unity.remainingPool', { count: remainingCards.length })}</span>
                  <span>{t('unity.selectionProgress', { selected: session.selectedCardIds.length, total: 3 })}</span>
                </div>
                <TarotCardSelector
                  visibleBacks={remainingCards.map((card) => card.id)}
                  selectedBacks={session.selectedCardIds}
                  cardCount={3}
                  onToggleBack={onToggleSelection}
                  onConfirmSelection={onConfirmSelection}
                  shouldReduceMotion={shouldReduceMotion}
                  showProgress={false}
                  labels={selectorLabels}
                  t={t}
                />
              </m.section>
            ) : (
              <m.section
                key={`reveal-${session.roundIndex}`}
                className="unity-casting-reveal-stage"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
              >
                <p className="unity-reveal-instruction">{t('unity.revealInstruction')}</p>
                <div className="unity-casting-card-row">
                  {roundCards.map((card, cardIndex) => {
                    const isRevealed = cardIndex < session.revealedCount;
                    const isNext = session.phase === 'revealing' && session.revealedCount === cardIndex;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        className={`unity-casting-card-button ${isRevealed ? 'is-revealed' : ''} ${isNext ? 'is-next' : ''}`}
                        disabled={!isNext}
                        onClick={() => onReveal(cardIndex)}
                        aria-label={t('unity.revealCardLabel', {
                          round: session.roundIndex,
                          card: cardIndex + 1,
                          state: isRevealed ? t('unity.cardRevealed') : isNext ? t('unity.cardReady') : t('unity.cardLocked'),
                        })}
                      >
                        <TarotCard card={card} isRevealed={isRevealed} size="normal" />
                        <span className="unity-casting-card-order">{String(cardIndex + 1).padStart(2, '0')}</span>
                        {isRevealed ? (
                          <span className="unity-casting-card-caption">
                            <strong>{getLocalizedUnityCardName(card, language, meaningArchive)}</strong>
                            <small>{card.isReversed ? t('unity.reversed') : t('unity.upright')}</small>
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {lineResult ? (
                  <m.div
                    className="unity-line-result"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    aria-live="polite"
                  >
                    <p>{t('unity.lineResult')}</p>
                    <strong>{lineResult.lineValue}</strong>
                    <div>
                      <span>{lineTypeLabels[lineResult.lineType]}</span>
                      <span>{polarityLabels[lineResult.linePolarity]}</span>
                      <span>{lineResult.isMoving ? t('unity.movingState') : t('unity.stillState')}</span>
                    </div>
                    <button
                      type="button"
                      className="primary-button unity-next-line-button"
                      onClick={isFinalRound ? onComplete : onAdvance}
                    >
                      {isFinalRound ? t('unity.viewHexagram') : t('unity.enterNextLine')}
                    </button>
                  </m.div>
                ) : null}
              </m.section>
            )}
          </AnimatePresence>
        </LazyMotion>
      </main>
    </div>
  );
}

export default UnityCastingPage;
