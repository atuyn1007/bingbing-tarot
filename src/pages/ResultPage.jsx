import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { Home, MessageCircle, RotateCcw, X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import CardStyleToggle from '../components/CardStyleToggle';
import SpreadCards from '../components/SpreadCards';
import ReadingOverview from '../components/ReadingOverview';
import ReadingCardSection from '../components/ReadingCardSection';
import IntegratedReadingSection from '../components/IntegratedReadingSection';

function ChoiceComparison({ comparison, t }) {
  if (!comparison) return null;

  return (
    <section className="choice-reading-comparison" aria-labelledby="choice-comparison-title">
      <p className="eyebrow">{t('reading.choiceEyebrow')}</p>
      <h2 id="choice-comparison-title">{t('reading.choiceTitle')}</h2>
      <p className="choice-reading-intro">{t('reading.choiceIntro')}</p>
      <div className="choice-reading-columns">
        {[comparison.optionA, comparison.optionB].map((option, index) => (
          <article key={index === 0 ? 'comparison-a' : 'comparison-b'} className="choice-reading-option archive-reading-sheet">
            <span className="archive-paper-index">{index === 0 ? 'A' : 'B'}</span>
            <h3>{option.label}</h3>
            <dl>
              <div>
                <dt>{t('reading.choiceCurrentLabel')}</dt>
                <dd>{option.current.cardName} · {option.current.positionTitle}</dd>
              </div>
              <div>
                <dt>{t('reading.choiceDevelopmentLabel')}</dt>
                <dd>{option.development.cardName} · {option.development.positionTitle}</dd>
              </div>
              <div>
                <dt>{t('reading.choiceAdvantageLabel')}</dt>
                <dd>{option.advantage}</dd>
              </div>
              <div>
                <dt>{t('reading.choiceRiskLabel')}</dt>
                <dd>{option.risk}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <article className="choice-reading-self archive-reading-sheet">
        <span className="archive-paper-index">05</span>
        <p className="eyebrow">{t('reading.choiceSelfEyebrow')}</p>
        <h3>{comparison.self.positionTitle} · {comparison.self.cardName}</h3>
        <p>{comparison.self.concern}</p>
      </article>
    </section>
  );
}

function ResultPage({
  theme,
  cardStyle,
  setCardStyle,
  goHome,
  t,
  isHumanMode,
  userQuestion,
  choiceOptions,
  drawnCards,
  spreadForCards,
  reading,
  onOpenHumanRequest,
  onRedraw,
}) {
  const shouldReduceMotion = useReducedMotion();
  const readingCards = Array.isArray(reading?.cards) ? reading.cards : [];
  const keywordsByCardId = new Map(readingCards.map((section) => [section.cardId, section.keywords]));

  return (
    <div className={`screen-shell page-shell archive-page result-archive-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button" aria-label={t('drawing.backHome')}>
          <X className="w-5 h-5" />
        </button>
        <h1 className="page-title">{t('drawing.resultTitle')}</h1>
        <div className="page-header-controls">
          <LanguageSwitcher />
          <CardStyleToggle cardStyle={cardStyle} onChange={setCardStyle} t={t} />
        </div>
      </header>

      <main className="page-content reading-page-content">
        <div className="reading-layout structured-reading-layout">
          <section className="reading-question-card">
            <p className="eyebrow">{isHumanMode ? t('drawing.humanTitle') : spreadForCards.name}</p>
            <h2>{t('reading.questionTitle')}</h2>
            <p className="reading-question-text">{`“${userQuestion}”`}</p>
          </section>

          <section className="reading-full-spread" aria-labelledby="reading-spread-title">
            <p className="eyebrow">{t('reading.spreadEyebrow')}</p>
            <h2 id="reading-spread-title">{t('reading.spreadTitle')}</h2>
            <SpreadCards
              cards={drawnCards}
              spread={spreadForCards}
              cardStyle={cardStyle}
              isRevealed
              showOrientation
              getCardKeywords={(card) => keywordsByCardId.get(card.id) || []}
              choiceOptions={choiceOptions}
              t={t}
            />
          </section>

          <LazyMotion features={domAnimation}>
            <ReadingOverview overview={reading.overview} t={t} />

            <ChoiceComparison comparison={reading.choiceComparison} t={t} />

            <m.section
              className="reading-card-files"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.28, delay: 0.08 }}
              aria-labelledby="reading-card-files-title"
            >
              <p className="eyebrow">{t('reading.cardsEyebrow')}</p>
              <h2 id="reading-card-files-title">{t('reading.cardsTitle')}</h2>
              <div className="reading-card-files-list">
                {readingCards.map((section) => (
                  <ReadingCardSection key={`${section.cardId}-${section.positionIndex}`} section={section} t={t} />
                ))}
              </div>
            </m.section>

            <IntegratedReadingSection reading={reading} t={t} />
          </LazyMotion>

          <p className="reading-disclaimer">{reading.disclaimer}</p>

          <div className="reading-actions structured-reading-actions">
            <button type="button" onClick={onOpenHumanRequest} className="primary-button">
              <MessageCircle className="w-5 h-5" />
              {isHumanMode ? t('humanRequest.sendReadingButton') : t('drawing.sendToReader')}
            </button>
            <button type="button" onClick={onRedraw} className="secondary-button">
              <RotateCcw className="w-5 h-5" />
              {t('drawing.redraw')}
            </button>
            <button type="button" onClick={goHome} className="secondary-button">
              <Home className="w-5 h-5" />
              {t('drawing.backHome')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ResultPage;
