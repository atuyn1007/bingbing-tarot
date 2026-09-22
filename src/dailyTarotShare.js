import { getCardArtwork } from './cardArtwork.js';
import { loadArtwork } from './monthlyTarotShare.js';

export function getDailyShareData({ card, dateKey, name, summary, keywords = [] }) {
  return { artwork: getCardArtwork(card), dateKey, name: name || card.name,
    isReversed: Boolean(card.isReversed), summary: String(summary || ''), keywords: [...keywords] };
}

export function wrapShareText(text, measure, width) {
  return String(text).split('\n').flatMap(paragraph => {
    const lines = []; let line = '';
    for (const char of paragraph) {
      if (line && measure(line + char) > width) { lines.push(line); line = ''; }
      line += char;
    }
    lines.push(line); return lines;
  });
}

export async function renderDailyTarotShare({ data, t, signal }) {
  const image = await loadArtwork(data.artwork, signal);
  await document.fonts?.ready;
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  let ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.font = '30px serif';
  const measure = value => ctx.measureText(value).width;
  const names = wrapShareText(data.name, measure, 880);
  const tags = wrapShareText(data.keywords.join(' · '), measure, 880);
  const lines = wrapShareText(data.summary, measure, 880);
  canvas.height = 1100 + (names.length + tags.length + lines.length) * 48;
  ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0b1712'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#8e7744'; ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, 1024, canvas.height - 56);
  ctx.strokeRect(38, 38, 1004, canvas.height - 76);
  ctx.textAlign = 'center'; ctx.fillStyle = '#c4a666'; ctx.font = '32px serif';
  ctx.fillText(t('archive.daily'), 540, 110);
  ctx.font = '26px serif'; ctx.fillText(data.dateKey, 540, 162);
  const scale = Math.min(360 / image.naturalWidth, 570 / image.naturalHeight);
  ctx.save(); ctx.translate(540, 505);
  if (data.isReversed) ctx.rotate(Math.PI);
  ctx.drawImage(image, -image.naturalWidth * scale / 2, -image.naturalHeight * scale / 2, image.naturalWidth * scale, image.naturalHeight * scale);
  ctx.restore();
  ctx.fillStyle = '#eee3cc'; ctx.font = '30px serif';
  let y = 860;
  for (const line of names) { ctx.fillText(line, 540, y); y += 48; }
  ctx.fillStyle = '#c4a666';
  ctx.fillText(t(data.isReversed ? 'common.orientationReversed' : 'common.orientationUpright'), 540, y); y += 60;
  for (const line of tags) { ctx.fillText(line, 540, y); y += 48; }
  y += 24; ctx.fillStyle = '#eee3cc'; ctx.textAlign = 'left';
  for (const line of lines) { ctx.fillText(line, 100, y); y += 48; }
  ctx.textAlign = 'center'; ctx.fillStyle = '#c4a666'; ctx.font = '24px serif';
  ctx.fillText(t('common.appName'), 540, canvas.height - 70);
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Export failed')), 'image/png'));
}
