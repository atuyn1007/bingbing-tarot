import { useId } from 'react';
import { resolveIntegratedReading } from '../readingEngine';

function IntegratedReadingSection({ reading, t, className = '' }) {
  const headingId = useId();
  const integratedReading = resolveIntegratedReading(reading, t);
  const hasContent = Boolean(integratedReading.summary || integratedReading.paragraphs.length > 0);

  if (!hasContent) return null;

  return (
    <section
      className={`reading-integrated archive-reading-sheet ${className}`.trim()}
      aria-labelledby={headingId}
    >
      <p className="eyebrow">{t('reading.integratedEyebrow')}</p>
      <h2 id={headingId}>{integratedReading.title}</h2>
      {integratedReading.summary ? (
        <p className="reading-integrated-summary">{integratedReading.summary}</p>
      ) : null}
      {integratedReading.paragraphs.length > 0 ? (
        <div className="reading-integrated-paragraphs">
          {integratedReading.paragraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph}`}>{paragraph}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default IntegratedReadingSection;
