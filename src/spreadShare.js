import { getCardArtwork } from './cardArtwork.js';
import { loadArtwork } from './monthlyTarotShare.js';
import { wrapShareText } from './dailyTarotShare.js';

// Read-only projection of an existing result. No draw or calculation imports.
export function getSpreadShareData({ cards = [], spread, question = '', calculation, choiceOptions, language, t }) {
  const cardData = (card, position) => ({ id: card.cardId ?? card.id, name: card.name,
    englishName: card.englishName, isReversed: Boolean(card.isReversed), position });
  if (calculation) return {
    key: 'unity', title: t('spreads.unity').name, question: calculation.question || '', language,
    rows: [...calculation.rounds].sort((a, b) => b.lineIndex - a.lineIndex).map(round =>
      round.tarotCards.map((card, i) => cardData(card, `${t('unity.lineLabels')[round.lineIndex - 1]} · ${i + 1}`))),
  };
  const items = cards.map((card, i) => cardData(card, spread.positions?.[i]?.title || t('drawing.spreadLabelFallback', { index: i + 1 })));
  const layouts = {
    three: [[0,1,2]], triangle: [[0,null,1],[null,2,null]],
    choice: [[0,4,1],[2,null,3]], seasons: [[null,4,null],[2,0,1],[null,3,null]],
  };
  return { key: spread.key, title: spread.name, question, language,
    options: spread.key === 'choice' ? [`A · ${choiceOptions?.choiceA || t('drawing.choiceOptionAFallback')}`, `B · ${choiceOptions?.choiceB || t('drawing.choiceOptionBFallback')}`] : [],
    rows: (layouts[spread.key] || layouts.three).map(row => row.map(i => i === null ? null : items[i])),
  };
}

export async function renderSpreadShare({ data, t, signal }) {
  if (!data?.rows?.flat().some(Boolean)) throw new Error('Empty spread');
  const abort = () => { if (signal?.aborted) throw new DOMException('Aborted', 'AbortError'); };
  abort();
  await document.fonts?.ready;
  abort();
  const archive = data.language === 'it' ? await import('./cardMeanings.js') : null;
  const name = card => archive
    ? archive.getLocalizedMeaningCard(archive.findTarotMeaningCard(card), 'it')?.displayName || card.name
    : data.language === 'en' ? card.englishName || card.name : card.name;
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.font = '28px serif';
  const wrap = (text, width) => wrapShareText(text, value => ctx.measureText(value).width, width);
  const title = wrap(data.title, 1040);
  const question = wrap(data.question, 1040);
  const options = (data.options || []).flatMap(option => wrap(option, 1040));
  const top = 120 + title.length * 42 + (question.length + options.length) * 36;
  const rows = data.rows.map(row => row.map(card => card && ({ ...card, label: name(card),
    labels: [...wrap(card.position, 300), ...wrap(name(card), 300), t(card.isReversed ? 'common.orientationReversed' : 'common.orientationUpright')] })));
  const heights = rows.map(row => 420 + Math.max(...row.map(card => card ? card.labels.length : 0)) * 34);
  canvas.height = top + heights.reduce((a,b) => a+b, 0) + 110;
  ctx.fillStyle = '#0b1712'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#8e7744'; ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, 1148, canvas.height - 52);
  ctx.strokeRect(36, 36, 1128, canvas.height - 72);
  ctx.textAlign = 'center'; ctx.font = '28px serif';
  let y = 88;
  ctx.fillStyle = '#c4a666';
  for (const line of title) { ctx.fillText(line, 600, y); y += 42; }
  ctx.fillStyle = '#eee3cc';
  for (const line of [...question, ...options]) { ctx.fillText(line, 600, y); y += 36; }
  y = top;
  for (let r = 0; r < rows.length; r++) {
    for (let col = 0; col < 3; col++) {
      const card = rows[r][col];
      if (!card) continue;
      abort();
      const img = await loadArtwork(getCardArtwork(card), signal);
      abort();
      const x = 240 + col * 360;
      const scale = Math.min(225 / img.naturalWidth, 360 / img.naturalHeight);
      ctx.save(); ctx.translate(x, y + 180);
      if (card.isReversed) ctx.rotate(Math.PI);
      ctx.drawImage(img, -img.naturalWidth * scale / 2, -img.naturalHeight * scale / 2, img.naturalWidth * scale, img.naturalHeight * scale);
      ctx.restore();
      ctx.fillStyle = '#eee3cc';
      card.labels.forEach((line, i) => ctx.fillText(line, x, y + 398 + i * 34));
    }
    y += heights[r];
  }
  ctx.fillStyle = '#c4a666'; ctx.fillText(t('common.appName'), 600, canvas.height - 62);
  abort();
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    if (signal?.aborted) reject(new DOMException('Aborted', 'AbortError'));
    else if (blob) resolve(blob); else reject(new Error('Export failed'));
  }, 'image/png'));
}
