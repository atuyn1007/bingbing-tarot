import { useMemo } from 'react';
import { getUnitySupplement } from '../../unitySupplement';
import { UNITY_SOURCES } from '../../data/unity/sources';

function Source({ canonical, t }) {
  const source = UNITY_SOURCES[canonical?.sourceId];
  return source?.referenceUrl ? <a href={source.referenceUrl} target="_blank" rel="noreferrer">{t('unity.supplementSource')}</a> : null;
}
function Texts({ knowledge, t }) {
  return <>
    <section className="unity-canonical-text"><h4>{t('unity.canonicalText')}</h4><blockquote>{knowledge.canonical?.originalText || t('unity.knowledgeUnavailable')}</blockquote><Source canonical={knowledge.canonical} t={t} /></section>
    <section className="unity-modern-summary"><h4>{knowledge.modern?.kind === 'general-reference' ? knowledge.modern.title : t('unity.modernSummary')}</h4><p>{knowledge.modern?.summary || t('unity.knowledgeUnavailable')}</p></section>
  </>;
}
export default function UnitySupplement({ calculation, language, t }) {
  const reading = useMemo(() => getUnitySupplement(calculation, language), [calculation, language]);
  const names = t('unity.hexagramNames');
  const traditional = t('unity.traditionalLineNames');
  const movingIndexes = new Set(reading.focus.movingLines.map(line => line.lineIndex));
  const renderLine = (line) => <article key={line.lineId} className={`unity-moving-line-record ${line.isMoving ? 'is-moving' : ''}`}>
    <h4>{traditional[line.polarity][line.lineIndex - 1]}</h4>
    <p>{t('unity.polarityLabels')[line.polarity]} · {t('unity.lineTypeLabels')[line.lineType]} · {t(line.isMoving ? 'unity.movingState' : 'unity.staticState')}</p>
    {line.isMoving ? <p>{t('unity.lineTypeLabels')[line.lineType]} → {t('unity.polarityLabels')[line.changedPolarity]}</p> : null}
    <Texts knowledge={line} t={t} />
  </article>;
  return <section className="unity-supplement" aria-labelledby="unity-supplement-title">
    <h2 id="unity-supplement-title">{t('unity.supplementTitle')}</h2>
    <h3>{t('unity.primaryHexagram')} · {names[calculation.primaryHexagram.number - 1]}</h3>
    <Texts knowledge={reading.primary} t={t} />
    <div className="unity-hexagram-keywords">{reading.primary.keywords.map((item) => <span key={item.keywordId}>{item.label}</span>)}</div>
    {movingIndexes.size ? <>
      <h3>{t('unity.movingLines')}</h3>
      {reading.lines.filter(line => movingIndexes.has(line.lineIndex)).map(renderLine)}
    </> : <p>{t('unity.noMovingLinesDescription')}</p>}
    {reading.changed ? <>
      <h3>{t('unity.changedHexagram')} · {names[calculation.changedHexagram.number - 1]}</h3>
      <p>{t('unity.changedHexagramHelp')}</p>
      <Texts knowledge={reading.changed} t={t} />
    </> : null}
    {movingIndexes.size < 6 ? <details>
      <summary>{t('unity.sixLineReading')}</summary>
      {reading.lines.filter(line => !movingIndexes.has(line.lineIndex)).map(renderLine)}
    </details> : null}
  </section>;
}
