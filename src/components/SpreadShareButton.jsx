import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { useI18n } from '../i18n';
import { getSpreadShareData, renderSpreadShare } from '../spreadShare';
import DailyShareModal from './modals/DailyShareModal';

export default function SpreadShareButton({ cards, spread, question, calculation, choiceOptions }) {
  const { t, language } = useI18n();
  const [data, setData] = useState(null);
  return <>
    <button type="button" className="secondary-button" onClick={() => setData(getSpreadShareData({ cards, spread, question, calculation, choiceOptions, language, t }))}>
      <Share2 className="w-5 h-5" aria-hidden="true" />{t('reading.shareSpread')}
    </button>
    {data ? <DailyShareModal data={data} t={t} onClose={() => setData(null)} renderImage={renderSpreadShare} titleKey="reading.shareSpread" filename={`bingbing-${data.key}.png`} /> : null}
  </>;
}
