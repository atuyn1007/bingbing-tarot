import { allTarotCards } from './data';
import { supabase } from './supabaseClient';

export const TAROT_CARD_NAMES = allTarotCards.map((card) => card.name);

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user?.id || null;
}

export async function saveTarotHistory(cardName, isUpright) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('tarot_history')
    .insert({
      user_id: userId,
      card_name: cardName,
      is_upright: isUpright,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    card_name: data.card_name,
    is_upright: data.is_upright,
    position_label: data.is_upright ? '正位' : '逆位',
  };
}

export async function saveSpreadHistoryRecord(question, spreadName, cards) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('请先登录后再同步抽牌记录。');
  }

  const cardSummary = (cards || [])
    .map((card) => `${card?.name || '未知牌面'}${card?.isReversed ? '（逆位）' : ''}`)
    .join('、');

  const { data, error } = await supabase
    .from('tarot_history')
    .insert({
      user_id: userId,
      card_name: `${spreadName}｜${String(question || '').trim()}｜${cardSummary}`,
      is_upright: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function drawCardAndSave() {
  const randomIndex = Math.floor(Math.random() * TAROT_CARD_NAMES.length);
  const cardName = TAROT_CARD_NAMES[randomIndex];
  const isUpright = Math.random() < 0.5;

  return saveTarotHistory(cardName, isUpright);
}
