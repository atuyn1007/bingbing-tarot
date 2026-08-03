import { m, useReducedMotion } from 'framer-motion';

function ReadingOverview({ overview, t }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.section
      className="reading-overview archive-reading-sheet"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36 }}
      aria-labelledby="reading-overview-title"
    >
      <span className="archive-paper-index">02</span>
      <p className="eyebrow">{t('reading.overviewEyebrow')}</p>
      <h2 id="reading-overview-title">{t('reading.overviewTitle')}</h2>
      <p>{overview}</p>
    </m.section>
  );
}

export default ReadingOverview;
