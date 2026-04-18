import { allTarotCards } from './data';
import { supabase } from './supabaseClient';

export const TAROT_CARD_NAMES = allTarotCards.map((card) => card.name);

export async function saveTarotHistory(cardName, isUpright) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('tarot_history').insert({
    user_id: user?.id || null,
    card_name: cardName,
    is_upright: isUpright,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    card_name: cardName,
    is_upright: isUpright,
    position_label: isUpright ? '正位' : '逆位',
  };
}

export async function drawCardAndSave() {
  const randomIndex = Math.floor(Math.random() * TAROT_CARD_NAMES.length);
  const cardName = TAROT_CARD_NAMES[randomIndex];
  const isUpright = Math.random() < 0.5;

  return saveTarotHistory(cardName, isUpright);
}
