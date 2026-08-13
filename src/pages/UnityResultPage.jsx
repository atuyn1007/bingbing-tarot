import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import TarotCard from '../TarotCard';
import { useI18n } from '../i18n';

function HexagramGlyph({ pattern, label }) {
  return (
    <div className="unity-result-hexagram-glyph" role="img" aria-label={label}>
      {[...pattern].reverse().map((polarity, index) => (
        <span key={`${polarity}-${index}`} className={`unity-result-line is-${polarity}`} />
      ))}
    </div>
  );
}

function HexagramRecord({ title, hexagram, names, t }) {
  const name = names[hexagram.number - 1];
  return (
    <article className="unity-result-hexagram-record">
      <p>{title}</p>
      <HexagramGlyph pattern={hexagram.linePatternBottomToTop} label={t('unity.hexagramGlyphLabel', { number: hexagram.number, name })} />
      <strong>{String(hexagram.number).padStart(2, '0')}</strong>
      <h3>{name}</h3>
    </article>
  );
}

function UnityResultPage({ theme, result, goHome, t }) {
  const { language } = useI18n();
  const [nameArchive, setNameArchive] = useState(null);
  const lineLabels = t('unity.lineLabels');
  const names = t('unity.hexagramNames');
  const movingText = result.movingLineIndexes.length
    ? result.movingLineIndexes.map((index) => lineLabels[index - 1]).join(' · ')
    : t('unity.noMovingLines');

  useEffect(() => {
    let active = true;
    import('../cardMeanings.js').then((module) => {
      if (active) setNameArchive(module);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const getLocalizedCardName = (card) => {
    if (language === 'zh-CN') return card.name;
    if (!nameArchive) return card.englishName;
    const localized = nameArchive.getLocalizedMeaningCard(
      nameArchive.findTarotMeaningCard({ id: card.cardId }),
      language,
    );
    return localized?.displayName || card.englishName;
  };

  return (
    <div className={`screen-shell page-shell archive-page unity-result-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button" aria-label={t('unity.backHome')}><X className="w-5 h-5" /></button>
        <h1 className="page-title">{t('unity.resultTitle')}</h1>
        <div className="page-header-controls"><LanguageSwitcher /></div>
      </header>

      <main className="unity-result-main">
        <section className="unity-result-question">
          <p>{t('unity.resultArchiveLabel')}</p>
          <blockquote>{result.question}</blockquote>
        </section>

        <div className="unity-result-layout">
          <section className="unity-result-tarot-panel" aria-label={t('unity.tarotArchiveTitle')}>
            <div className="unity-result-section-head"><span>01</span><h2>{t('unity.tarotArchiveTitle')}</h2></div>
            <div className="unity-result-tarot-grid">
              {result.rounds.map((round) => (
                <article key={round.roundIndex} className="unity-result-round-record">
                  <div className="unity-result-round-head">
                    <div><small>{t('unity.roundProgress', { current: round.roundIndex, total: 6 })}</small><h3>{lineLabels[round.roundIndex - 1]}</h3></div>
                    <strong>{round.threeCardValues.join(' + ')} = {round.lineValue}</strong>
                  </div>
                  <div className="unity-result-round-cards">
                    {round.tarotCards.map((card) => (
                      <div key={card.cardId} className="unity-result-card-record">
                        <TarotCard card={{ id: card.cardId, name: card.name, englishName: card.englishName, isReversed: card.isReversed }} isRevealed size="small" />
                        <p>{getLocalizedCardName(card)}</p>
                        <small>{card.isReversed ? t('common.orientationReversed') : t('common.orientationUpright')}</small>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="unity-result-structure-panel">
            <div className="unity-result-section-head"><span>02</span><h2>{t('unity.hexagramStructureTitle')}</h2></div>
            <HexagramRecord title={t('unity.primaryHexagram')} hexagram={result.primaryHexagram} names={names} t={t} />
            <section className="unity-result-moving-lines">
              <p>{t('unity.movingLines')}</p>
              <strong>{movingText}</strong>
            </section>
            <HexagramRecord title={t('unity.changedHexagram')} hexagram={result.changedHexagram} names={names} t={t} />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default UnityResultPage;
