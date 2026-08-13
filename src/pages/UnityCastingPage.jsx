import { useEffect, useRef } from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import TarotCard from '../TarotCard';
import { getUnityRoundCards } from '../unityCastingFlow';

function UnityCastingPage({ theme, session, goHome, onReveal, onAdvance, onComplete, error, t }) {
  const shouldReduceMotion = useReducedMotion();
  const timerRef = useRef(null);
  const stageRef = useRef(null);
  const lineLabels = t('unity.lineLabels');
  const cards = getUnityRoundCards(session);
  const lineLabel = lineLabels[session.roundIndex - 1];

  useEffect(() => {
    if (session.revealedCount !== 3 || error) return undefined;
    timerRef.current = window.setTimeout(() => {
      if (session.status === 'completed') onComplete();
      else {
        onAdvance();
        window.requestAnimationFrame(() => stageRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth', block: 'center' }));
      }
    }, shouldReduceMotion ? 180 : 900);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [error, onAdvance, onComplete, session.revealedCount, session.status, shouldReduceMotion]);

  return (
    <div className={`screen-shell page-shell archive-page unity-casting-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button" aria-label={t('unity.backHome')}>
          <X className="w-5 h-5" />
        </button>
        <h1 className="page-title">{t('unity.title')}</h1>
        <div className="page-header-controls"><LanguageSwitcher /></div>
      </header>

      <main ref={stageRef} className="unity-casting-main">
        <section className="unity-casting-heading" aria-labelledby="unity-current-round-title">
          <p>{t('unity.roundProgress', { current: session.roundIndex, total: 6 })}</p>
          <h2 id="unity-current-round-title">{t('unity.roundTitle', { round: session.roundIndex, line: lineLabel })}</h2>
          <blockquote>{session.question}</blockquote>
          <small aria-live="polite">
            {session.revealedCount === 3
              ? session.status === 'completed' ? t('unity.castingComplete') : t('unity.roundComplete')
              : t('unity.revealProgress', { current: session.revealedCount, total: 3 })}
          </small>
          {error ? (
            <div className="unity-casting-error" role="alert">
              <p>{error}</p>
              <button type="button" onClick={onComplete}>{t('unity.retryCalculation')}</button>
            </div>
          ) : null}
        </section>

        <LazyMotion features={domAnimation}>
          <AnimatePresence mode="wait">
            <m.div
              key={session.roundIndex}
              className="unity-casting-card-row"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
            >
              {cards.map((card, cardIndex) => {
                const isRevealed = cardIndex < session.revealedCount;
                const isNext = session.revealedCount === cardIndex;
                return (
                  <button
                    key={card.id}
                    type="button"
                    className={`unity-casting-card-button ${isRevealed ? 'is-revealed' : ''} ${isNext ? 'is-next' : ''}`}
                    disabled={!isNext || session.revealedCount === 3}
                    onClick={() => onReveal(cardIndex)}
                    aria-label={t('unity.revealCardLabel', {
                      round: session.roundIndex,
                      card: cardIndex + 1,
                      state: isRevealed ? t('unity.cardRevealed') : isNext ? t('unity.cardReady') : t('unity.cardLocked'),
                    })}
                  >
                    <TarotCard card={card} isRevealed={isRevealed} size="normal" />
                    <span>{String(cardIndex + 1).padStart(2, '0')}</span>
                  </button>
                );
              })}
            </m.div>
          </AnimatePresence>
        </LazyMotion>
      </main>
    </div>
  );
}

export default UnityCastingPage;
