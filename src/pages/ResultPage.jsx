import { LazyMotion, domAnimation, m } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import CardStyleToggle from '../components/CardStyleToggle';
import SpreadCards from '../components/SpreadCards';

function ResultPage({
  theme,
  cardStyle,
  setCardStyle,
  goHome,
  t,
  isHumanMode,
  activeSpread,
  userQuestion,
  choiceOptions,
  drawnCards,
  spreadForCards,
  isRevealing,
  readingComplete,
  readingLead,
  readingBody,
  onOpenHumanRequest,
}) {
  const readingParagraphs = readingBody.split('\n\n').filter(Boolean);
  const expectedPositionCount = spreadForCards.positions.length;
  const readingCards = readingParagraphs[0] || '';
  const readingPositions = readingParagraphs.slice(1, expectedPositionCount + 1);
  const readingSummary = readingParagraphs.length > expectedPositionCount + 1 ? readingParagraphs.at(-1) : '';
  const readingCursor = <span className="reading-cursor">|</span>;
  const getReadingSectionTitle = (index) => {
    const isChoiceA = index === 0 || index === 2;
    const isChoiceB = index === 1 || index === 3;
    if (spreadForCards.key === 'choice' && (isChoiceA || isChoiceB)) {
      const option = isChoiceA ? choiceOptions.choiceA : choiceOptions.choiceB;
      return `${isChoiceA ? 'A' : 'B'}｜${option || t(isChoiceA ? 'drawing.choiceOptionAFallback' : 'drawing.choiceOptionBFallback')}`;
    }

    return spreadForCards.positions[index]?.title || t('drawing.spreadLabelFallback', { index: index + 1 });
  };

  return (
    <div className={`screen-shell page-shell archive-page result-archive-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button">
          <X className="w-5 h-5" />
        </button>
        <h1 className="page-title">{t('drawing.resultTitle')}</h1>
        <div className="page-header-controls">
          <LanguageSwitcher />
          <CardStyleToggle cardStyle={cardStyle} onChange={setCardStyle} t={t} />
        </div>
      </header>

      <main className="page-content reading-page-content">
        <div className="reading-layout">
          <section className="reading-question-card">
            <p className="eyebrow">{isHumanMode ? t('drawing.humanTitle') : activeSpread.name}</p>
            <p className="reading-question-text">{`"${userQuestion}"`}</p>
          </section>

          <SpreadCards
            cards={drawnCards}
            spread={spreadForCards}
            cardStyle={cardStyle}
            isRevealed={isRevealing}
            choiceOptions={choiceOptions}
            t={t}
          />

          {readingComplete && (
            <LazyMotion features={domAnimation}>
              <m.section className="reading-result-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <p className="reading-result-lead">{readingLead}</p>
                <div className="reading-paper-stack">
                  {readingCards && (
                    <section className="reading-paper-section reading-paper-section-cards">
                      <h2 className="reading-paper-title">{t('drawing.cardsSectionTitle')}</h2>
                      <div className="reading-paper-divider" aria-hidden="true" />
                      <p className="reading-paper-copy">
                        {readingCards}
                        {readingPositions.length === 0 && !readingSummary && readingCursor}
                      </p>
                    </section>
                  )}
                  {readingPositions.map((paragraph, index) => (
                    <section key={`${getReadingSectionTitle(index)}-${index}`} className="reading-paper-section">
                      <h2 className="reading-paper-title">{getReadingSectionTitle(index)}</h2>
                      <div className="reading-paper-divider" aria-hidden="true" />
                      <p className="reading-paper-copy">
                        {paragraph}
                        {index === readingPositions.length - 1 && !readingSummary && readingCursor}
                      </p>
                    </section>
                  ))}
                  {readingSummary && (
                    <section className="reading-paper-section reading-paper-section-summary">
                      <h2 className="reading-paper-title">{t('drawing.summarySectionTitle')}</h2>
                      <div className="reading-paper-divider" aria-hidden="true" />
                      <p className="reading-paper-copy">
                        {readingSummary}
                        {readingCursor}
                      </p>
                    </section>
                  )}
                </div>

                <div className="reading-actions">
                  <button type="button" onClick={onOpenHumanRequest} className="primary-button">
                    <MessageCircle className="w-5 h-5" />
                    {isHumanMode ? t('humanRequest.sendReadingButton') : t('drawing.sendToReader')}
                  </button>
                  <button type="button" onClick={goHome} className="secondary-button">
                    {t('drawing.backHome')}
                  </button>
                </div>
              </m.section>
            </LazyMotion>
          )}
        </div>
      </main>
    </div>
  );
}

export default ResultPage;
