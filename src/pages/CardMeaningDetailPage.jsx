import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getLocalizedMeaningCard, getTarotMeaningCard, tarotMeaningCards } from '../cardMeanings.js';

const zhCNLabels = {
  backToList: '返回列表',
  detailEyebrow: '牌意详情',
  detailTitle: '塔罗牌详情',
  cardLabel: '塔罗牌',
  numberLabel: '编号',
  keywordsLabel: '关键词',
  noKeywords: '暂时还没有关键词。',
  detailLabel: '牌意详解',
  inProgress: '内容整理中',
  missingTitle: '未找到这张牌',
  coreLabel: '核心牌意',
  uprightLabel: '正位',
  reversedLabel: '逆位',
  guidanceLabel: '给你的指引',
  extendedLabel: '延伸阅读',
  sectionNavigationLabel: '章节导览',
  previousLabel: '上一张牌',
  nextLabel: '下一张牌',
};

const archiveLabels = {
  en: { coreLabel: 'Core Meaning', uprightLabel: 'Upright', reversedLabel: 'Reversed', guidanceLabel: 'Guidance', extendedLabel: 'Extended Reading', sectionNavigationLabel: 'Sections', previousLabel: 'Previous card', nextLabel: 'Next card' },
  it: { coreLabel: 'Significato centrale', uprightLabel: 'Diritto', reversedLabel: 'Rovescio', guidanceLabel: 'Guida', extendedLabel: 'Lettura estesa', sectionNavigationLabel: 'Sezioni', previousLabel: 'Carta precedente', nextLabel: 'Carta successiva' },
};

const SECTION_ICONS = ['✦', '☉', '☾', '✧', '◌'];

function toRoman(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return '--';
  if (number === 0) return '0';
  const table = [['M', 1000], ['CM', 900], ['D', 500], ['CD', 400], ['C', 100], ['XC', 90], ['L', 50], ['XL', 40], ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]];
  let remaining = number;
  return table.reduce((result, [glyph, amount]) => {
    while (remaining >= amount) {
      result += glyph;
      remaining -= amount;
    }
    return result;
  }, '');
}

function MeaningParagraphs({ value }) {
  if (!value) return null;

  return value.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>);
}

function CardMeaningDetailPage({ theme, t, language, cardId, onBack, onOpenCard }) {
  const [activeSection, setActiveSection] = useState('core');
  const sectionRefs = useRef({});
  const text = language === 'zh-CN'
    ? zhCNLabels
    : {
        backToList: t('meanings.backToList'),
        detailEyebrow: t('meanings.detailEyebrow'),
        detailTitle: t('meanings.detailTitle'),
        cardLabel: t('meanings.cardLabel'),
        numberLabel: t('meanings.numberLabel'),
        keywordsLabel: t('meanings.keywordsLabel'),
        noKeywords: t('meanings.noKeywords'),
        detailLabel: t('meanings.detailLabel'),
        inProgress: t('meanings.inProgress'),
        missingTitle: t('meanings.missingTitle'),
        ...(archiveLabels[language] || archiveLabels.en),
      };

  const card = getTarotMeaningCard(cardId);
  const localizedCard = getLocalizedMeaningCard(card, language);
  const title = localizedCard?.displayName || text.missingTitle;
  const subtitle = localizedCard?.secondaryName || '';
  const hasKeywords = Array.isArray(localizedCard?.displayKeywords) && localizedCard.displayKeywords.length > 0;
  const hasUpright = Boolean(localizedCard?.displayReadingUpright);
  const hasReversed = Boolean(localizedCard?.displayReadingReversed);
  const detailParagraphs = useMemo(
    () => (localizedCard?.displayDetail || '').split('\n\n').filter(Boolean),
    [localizedCard?.displayDetail],
  );
  const coreMeaning = detailParagraphs[0] || '';
  const guidanceMeaning = detailParagraphs.length > 1 ? detailParagraphs.at(-1) : coreMeaning;
  const extendedMeaning = detailParagraphs.length > 2
    ? detailParagraphs.slice(1, -1).join('\n\n')
    : localizedCard?.displayDetail || '';
  const currentIndex = tarotMeaningCards.findIndex((item) => item.id === card?.id);
  const previousCard = currentIndex >= 0 ? tarotMeaningCards[(currentIndex - 1 + tarotMeaningCards.length) % tarotMeaningCards.length] : null;
  const nextCard = currentIndex >= 0 ? tarotMeaningCards[(currentIndex + 1) % tarotMeaningCards.length] : null;
  const previousLocalized = getLocalizedMeaningCard(previousCard, language);
  const nextLocalized = getLocalizedMeaningCard(nextCard, language);
  const sections = [
    { id: 'core', label: text.coreLabel, value: coreMeaning || localizedCard?.displayDetail, className: 'archive-sheet-core' },
    { id: 'upright', label: text.uprightLabel, value: hasUpright ? localizedCard.displayReadingUpright : '', className: 'archive-sheet-upright' },
    { id: 'reversed', label: text.reversedLabel, value: hasReversed ? localizedCard.displayReadingReversed : '', className: 'archive-sheet-reversed' },
    { id: 'guidance', label: text.guidanceLabel, value: guidanceMeaning, className: 'archive-sheet-guidance' },
    { id: 'extended', label: text.extendedLabel, value: extendedMeaning, className: 'archive-sheet-extended' },
  ];

  useEffect(() => {
    const updateActiveSection = () => {
      const readingLine = window.innerWidth <= 900 ? 170 : Math.min(260, window.innerHeight * .34);
      let currentSection = sections[0].id;
      sections.forEach(({ id }) => {
        if ((sectionRefs.current[id]?.getBoundingClientRect().top ?? Infinity) <= readingLine) currentSection = id;
      });
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 80) {
        currentSection = sections.at(-1).id;
      }
      setActiveSection(currentSection);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.dataset?.section) setActiveSection(visible[0].target.dataset.section);
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: [0, .15, .35, .6] },
    );
    sections.forEach(({ id }) => {
      const node = sectionRefs.current[id];
      if (node) observer.observe(node);
    });
    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [cardId, language]);

  const scrollToSection = (sectionId) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const openAdjacentCard = (targetCard) => {
    if (!targetCard || !onOpenCard) return;
    onOpenCard(targetCard.id);
    setActiveSection('core');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className={`screen-shell page-shell archive-page meaning-detail-archive-page theme-${theme}`}>
      <div className="archive-background-chart" aria-hidden="true"><span /><span /><span /></div>

      <header className="page-header archive-detail-topbar">
        <button type="button" onClick={onBack} className="back-link-button">
          <ArrowLeft className="w-5 h-5" />
          <span>{text.backToList}</span>
        </button>
        <div className="archive-topbar-mark" aria-hidden="true">
          <span>✦</span><p>ARCANA ARCHIVE</p><i />
        </div>
        <div className="page-header-controls">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="page-content meanings-page-content archive-detail-layout">
        <aside className="archive-card-stage">
          <div className="archive-stage-coordinates archive-stage-coordinates-top" aria-hidden="true">RA 18h 03m<br />DEC −20° 36′</div>
          <div className="archive-stage-coordinates archive-stage-coordinates-bottom" aria-hidden="true">ECLIPTIC<br />113° 24′</div>
          <div className="archive-moon-phases" aria-hidden="true"><i>●</i><i>◐</i><i>○</i><i>◑</i><i>●</i></div>
          <span className="archive-orbit archive-orbit-one" />
          <span className="archive-orbit archive-orbit-two" />
          <span className="archive-card-sun" />
          <span className="archive-stage-star archive-stage-star-one" aria-hidden="true">✦</span>
          <span className="archive-stage-star archive-stage-star-two" aria-hidden="true">✧</span>
          {card?.image ? (
            <div className="meaning-detail-artwork-shell">
              <img src={card.image} alt={title} className="meaning-detail-artwork" />
            </div>
          ) : null}
          <p className="meaning-detail-number">
            <span>{text.numberLabel}</span>
            <strong>{card?.number ?? '--'}</strong>
          </p>
        </aside>

        <article className="meaning-detail-card">
          <header className="archive-detail-heading">
            <p className="eyebrow">{text.cardLabel} · CELESTIAL CATALOGUE</p>
            <div className="archive-title-line">
              <h2 className="meaning-detail-name">{title}</h2>
              <span className="archive-card-number">{toRoman(card?.number)}</span>
            </div>
            {subtitle ? <p className="meaning-detail-subtitle"><span>{subtitle}</span><i /> <small>THE ARCANA MANUSCRIPT</small></p> : null}
            {hasKeywords ? (
              <div className="meaning-keyword-list" aria-label={text.keywordsLabel}>
                {localizedCard.displayKeywords.map((keyword) => <span key={keyword} className="meaning-keyword-chip">{keyword}</span>)}
              </div>
            ) : null}
          </header>

          <div className="archive-paper-stack">
            {sections.map((section, index) => (
              <section
                id={`meaning-${section.id}`}
                key={section.id}
                ref={(node) => { sectionRefs.current[section.id] = node; }}
                data-section={section.id}
                className={`meaning-detail-section archive-paper-sheet ${section.className}`}
              >
                <span className="archive-sheet-fold" aria-hidden="true" />
                <span className="archive-sheet-folio" aria-hidden="true">FOLIO 0{index + 1}</span>
                <h3><span>{SECTION_ICONS[index]}</span>{section.label}<small>{['ESSENTIA', 'RECTUS', 'INVERSUS', 'ORACULUM', 'APPENDIX'][index]}</small></h3>
                <div className="meaning-detail-copy">
                  {section.value ? <MeaningParagraphs value={section.value} /> : <p>{text.inProgress}</p>}
                </div>
              </section>
            ))}
          </div>
        </article>

        <nav className="archive-section-guide" aria-label={text.sectionNavigationLabel}>
          <p>{text.sectionNavigationLabel}<small>INDEX / 目录</small></p>
          <div className="archive-section-guide-line">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={activeSection === section.id ? 'is-active' : ''}
                onClick={() => scrollToSection(section.id)}
              >
                <i aria-hidden="true" />
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </main>

      <footer className="archive-card-pagination">
        <button type="button" onClick={() => openAdjacentCard(previousCard)} className="archive-page-turn archive-page-turn-previous">
          <ArrowLeft aria-hidden="true" />
          {previousCard?.image ? <img src={previousCard.image} alt="" /> : null}
          <span><small>{text.previousLabel} · {toRoman(previousCard?.number)}</small><strong>{previousCard?.name_cn}</strong><em>{previousCard?.name_en || previousLocalized?.displayName}</em></span>
        </button>
        <div className="archive-pagination-astrolabe" aria-hidden="true"><i /><span>◉</span><b>AS ABOVE · SO BELOW</b></div>
        <button type="button" onClick={() => openAdjacentCard(nextCard)} className="archive-page-turn archive-page-turn-next">
          <span><small>{text.nextLabel} · {toRoman(nextCard?.number)}</small><strong>{nextCard?.name_cn}</strong><em>{nextCard?.name_en || nextLocalized?.displayName}</em></span>
          {nextCard?.image ? <img src={nextCard.image} alt="" /> : null}
          <ArrowRight aria-hidden="true" />
        </button>
      </footer>
    </div>
  );
}

export default CardMeaningDetailPage;
