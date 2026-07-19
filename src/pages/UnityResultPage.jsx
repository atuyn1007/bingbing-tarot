import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Archive, ArrowRight, X } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getCardArtwork } from '../cardArtwork';

const revealTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] };

function HexagramGlyph({ pattern }) {
  return (
    <div className="unity-hexagram-glyph" aria-label="Hexagram line pattern">
      {[...pattern].reverse().map((polarity, index) => (
        <span key={`${polarity}-${index}`} className={`unity-hexagram-line is-${polarity}`} />
      ))}
    </div>
  );
}

function UnityResultPage({ theme, goHome, t, unityReading, onOpenHistory }) {
  const hasMovingLines = unityReading.movingLineIndexes.length > 0;
  const movingLines = hasMovingLines ? unityReading.movingLineIndexes.join(', ') : t('drawing.unityNoMovingLines');

  return (
    <div className={`screen-shell page-shell archive-page result-archive-page unity-result-page theme-${theme}`}>
      <header className="page-header">
        <button type="button" onClick={goHome} className="icon-button"><X className="w-5 h-5" /></button>
        <h1 className="page-title">{t('drawing.unityResultTitle')}</h1>
        <div className="page-header-controls"><LanguageSwitcher /></div>
      </header>

      <main className="page-content reading-page-content unity-result-content">
        <LazyMotion features={domAnimation}>
          <div className="unity-result-layout">
            <m.section className="reading-question-card unity-result-overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={revealTransition}>
              <p className="eyebrow">01 · CASTING OVERVIEW</p>
              <p className="unity-result-spread-name">{unityReading.spread.name}</p>
              <p className="reading-question-text">{`“${unityReading.question.text}”`}</p>
              <dl className="unity-overview-meta">
                <div><dt>ROUNDS</dt><dd>{unityReading.spread.roundCount}</dd></div>
                <div><dt>TAROT</dt><dd>{unityReading.spread.totalCardCount}</dd></div>
                <div><dt>METHOD</dt><dd>3 · 2 · 1</dd></div>
              </dl>
              <button type="button" className="unity-history-entry" onClick={onOpenHistory}><Archive aria-hidden="true" />历史记录</button>
            </m.section>

            <m.section className="reading-paper-section unity-hexagram-section" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...revealTransition, delay: 0.08 }}>
              <p className="unity-section-index">02 · HEXAGRAM EVOLUTION</p>
              <h2 className="reading-paper-title">{t('drawing.unityStructureTitle')}</h2>
              <div className="reading-paper-divider" aria-hidden="true" />
              <div className="unity-hexagram-evolution">
                <article className="unity-hexagram-record"><p>{t('drawing.unityPrimaryHexagram')}</p><HexagramGlyph pattern={unityReading.primaryHexagram.linePatternBottomToTop} /><strong>{String(unityReading.primaryHexagram.number).padStart(2, '0')}</strong></article>
                {hasMovingLines && <div className="unity-evolution-arrow" aria-label="Changes into"><ArrowRight aria-hidden="true" /><span>CHANGE</span></div>}
                {hasMovingLines && <article className="unity-hexagram-record"><p>{t('drawing.unityChangedHexagram')}</p><HexagramGlyph pattern={unityReading.changedHexagram.linePatternBottomToTop} /><strong>{String(unityReading.changedHexagram.number).padStart(2, '0')}</strong></article>}
              </div>
            </m.section>

            <m.section className="reading-paper-section unity-moving-lines" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...revealTransition, delay: 0.14 }}>
              <p className="unity-section-index">03 · MOVING LINES</p><h2 className="reading-paper-title">{t('drawing.unityMovingLines')}</h2><div className="reading-paper-divider" aria-hidden="true" />
              <p className="unity-moving-lines-value">{movingLines}</p>
              <p className="unity-moving-lines-note">{hasMovingLines ? 'The changing positions are retained below in their original casting order.' : 'No changing positions were produced in this casting.'}</p>
            </m.section>

            <section className="unity-lines-section">
              <div className="unity-lines-heading"><p className="unity-section-index">04 / 05 · LINE DERIVATION &amp; TAROT GROUPS</p><h2>{t('drawing.unityRoundsTitle')}</h2></div>
              <div className="unity-line-card-list">
                {unityReading.rounds.map((round, index) => (
                  <m.article key={round.roundIndex} className="reading-paper-section unity-line-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...revealTransition, delay: 0.2 + index * 0.07 }}>
                    <div className="unity-line-card-head"><div><p className="unity-line-order">LINE {String(round.lineIndex).padStart(2, '0')}</p><h3>{round.lineLabel}</h3></div><div className="unity-line-state"><span className={`unity-line-symbol is-${round.linePolarity}`} aria-hidden="true" /><strong>{round.lineValue}</strong><small>{round.isMoving ? 'MOVING' : 'STILL'}</small></div></div>
                    <div className="reading-paper-divider" aria-hidden="true" />
                    <div className="unity-tarot-group">
                      {round.tarotCards.map((card) => {
                        const artwork = getCardArtwork(card);
                        return <article key={card.drawIndex} className="unity-tarot-card-record"><div className="unity-tarot-card-artwork">{artwork ? <img src={artwork} alt={card.name} className={card.orientation === 'reversed' ? 'is-reversed' : ''} /> : <span>✦</span>}</div><p>{card.name}</p><small>{card.orientation} · {card.coinValue}</small></article>;
                      })}
                    </div>
                  </m.article>
                ))}
              </div>
            </section>

            <m.section className="reading-paper-section unity-future-section" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...revealTransition, delay: 0.64 }}><p className="unity-section-index">06 · SYNTHESIS</p><h2 className="reading-paper-title">综合解析</h2><div className="reading-paper-divider" aria-hidden="true" /><p>AI 综合解读 · 易经原文 · <em>Coming Soon</em></p></m.section>
            <m.section className="reading-paper-section unity-future-section" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...revealTransition, delay: 0.7 }}><p className="unity-section-index">07 · ARCHIVE</p><h2 className="reading-paper-title">保存 / 分享</h2><div className="reading-paper-divider" aria-hidden="true" /><p>历史记录 · 分享图片 · <em>Coming Soon</em></p></m.section>
            <details className="unity-json-record"><summary>{t('drawing.unityJsonResult')}</summary><pre className="unity-json-output">{JSON.stringify(unityReading, null, 2)}</pre></details>
          </div>
        </LazyMotion>
      </main>
    </div>
  );
}

export default UnityResultPage;
