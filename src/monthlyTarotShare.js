import { getMonthCalendarDays } from './dateUtils.js';
import { getCardArtwork } from './cardArtwork.js';

// Select only the visible month's saved cards; never create readings.
export function getMonthlyShareDays(month, history) {
  return getMonthCalendarDays(month).map((day) => ({
    ...day,
    card: day.type === 'day' ? history?.[day.dateKey] || null : null,
  }));
}

export function loadArtwork(src, signal) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const finish = (error) => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      img.onload = img.onerror = null;
      if (error) { img.src = ''; reject(error); } else resolve(img);
    };
    const abort = () => finish(new DOMException('Aborted', 'AbortError'));
    const timer = setTimeout(() => finish(new Error('Artwork timeout')), 15000);
    img.onload = () => finish();
    img.onerror = () => finish(new Error('Artwork unavailable'));
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) { abort(); return; }
    img.src = src;
  });
}

export async function renderMonthlyTarotShare({ month, history, locale, t, signal }) {
  const days = getMonthlyShareDays(month, history);
  // Sequential loading bounds decoded image memory on mobile.
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  const rows = Math.ceil(days.length / 7);
  canvas.height = 400 + rows * 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#0b1712'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#8e7744'; ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);
  ctx.textAlign = 'center'; ctx.fillStyle = '#c4a666';
  ctx.font = '24px serif'; ctx.fillText(t('calendar.englishTitle'), 700, 100);
  ctx.fillStyle = '#eee3cc'; ctx.font = '52px serif';
  ctx.fillText(new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(month), 700, 175);
  ctx.font = '26px serif'; ctx.fillText(t('calendar.shareCaption'), 700, 230);
  t('calendar.weekdays').forEach((label, index) => {
    ctx.fillStyle = '#c4a666'; ctx.fillText(label, 130 + index * 190, 292);
  });
  for (const [index, day] of days.entries()) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (day.type !== 'day') continue;
    const x = 50 + index % 7 * 190;
    const y = 320 + Math.floor(index / 7) * 300;
    ctx.strokeStyle = '#534b32'; ctx.strokeRect(x, y, 160, 278);
    ctx.fillStyle = '#c4a666'; ctx.font = '23px serif'; ctx.fillText(String(day.day).padStart(2, '0'), x + 80, y + 29);
    if (!day.card) continue;
    const src = getCardArtwork(day.card);
    if (!src) throw new Error('Artwork unavailable');
    // Draw the exact saved orientation; keep the label upright.
    const img = await loadArtwork(src, signal);
    ctx.save(); ctx.translate(x + 80, y + 143);
    if (day.card.isReversed) ctx.rotate(Math.PI);
    const scale = Math.min(126 / img.naturalWidth, 198 / img.naturalHeight);
    ctx.drawImage(img, -img.naturalWidth * scale / 2, -img.naturalHeight * scale / 2, img.naturalWidth * scale, img.naturalHeight * scale);
    ctx.restore();
    ctx.fillStyle = '#eee3cc'; ctx.font = '19px serif';
    ctx.fillText(t(day.card.isReversed ? 'calendar.reversed' : 'calendar.upright'), x + 80, y + 265, 148);
  }
  ctx.fillStyle = '#c4a666'; ctx.font = '23px serif';
  ctx.fillText("bingbing’s tarot", 700, canvas.height - 40);
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Export failed')), 'image/png'));
}
