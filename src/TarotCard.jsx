import { getCardDisplayNames } from './data';

const TarotCard = ({ card, isRevealed, size = 'normal' }) => {
  const sizeClasses = size === 'small' ? 'w-24 h-36' : 'w-24 h-36 sm:w-32 sm:h-48 lg:w-36 lg:h-56';
  const { chineseName, englishName } = getCardDisplayNames(card);

  return (
    <div className={`${sizeClasses} relative tarot-card-frame`}>
      {!isRevealed && (
        <div className="absolute inset-0 rounded-[1.6rem] border border-black/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),_rgba(224,214,198,0.72)_45%,_rgba(111,86,53,0.88)_100%)] shadow-[0_22px_45px_rgba(60,42,23,0.18)]">
          <div className="absolute inset-3 rounded-[1.2rem] border border-white/45" />
          <div className="absolute inset-6 rounded-full border border-white/25" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm">
              ✦
            </div>
          </div>
        </div>
      )}

      {isRevealed && (
        <div className="absolute inset-0 overflow-hidden rounded-[1.6rem] border border-stone-900/10 bg-[linear-gradient(160deg,_rgba(255,252,246,1)_0%,_rgba(246,237,224,1)_100%)] p-3 shadow-[0_24px_48px_rgba(93,66,33,0.16)]">
          <div className="absolute inset-3 rounded-[1.2rem] border border-stone-800/10" />
          <div
            className="relative flex h-full flex-col items-center justify-center rounded-[1.15rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(245,237,226,0.86)_52%,_rgba(229,213,191,0.92)_100%)] px-3 text-center"
            style={{ transform: card.isReversed ? 'rotate(180deg)' : 'none', transformOrigin: 'center center' }}
          >
            <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-stone-500">Tarot</p>
            <div className="tarot-card-name">
              <span>{chineseName}</span>
              <small>{englishName}</small>
            </div>
            <p className="mt-4 text-xs tracking-[0.28em] text-stone-500">{card.isReversed ? '逆位' : '正位'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarotCard;
