import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import type { Game } from '../../types/game';
import type { SwipeAction } from './ActionButtons';

interface GameCardProps {
  game: Game;
  swipeDirection: -1 | 1;
  onSwipe: (action: SwipeAction) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: (direction: -1 | 1) => ({
    x: direction * (window.innerWidth + 360),
    opacity: 0,
    scale: 0.94,
    rotate: direction * 12,
    transition: { duration: 0.32, ease: 'easeIn' as const },
  }),
};

function GameCard({ game, swipeDirection, onSwipe }: GameCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-320, 320], [-9, 9]);

  function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const threshold = Math.max(105, window.innerWidth * 0.13);

    if (info.offset.x > threshold || info.velocity.x > 720) {
      onSwipe('like');
      return;
    }

    if (info.offset.x < -threshold || info.velocity.x < -720) {
      onSwipe('skip');
      return;
    }

    void animate(x, 0, { type: 'spring', stiffness: 360, damping: 30 });
  }

  return (
    <motion.article
      className="deck-game-card"
      role="group"
      aria-label={`Гра ${game.title}`}
      drag="x"
      dragMomentum={false}
      dragElastic={0.18}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      custom={swipeDirection}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ type: 'spring', stiffness: 260, damping: 27 }}
    >
      <img className="deck-game-card__image" src={game.image} alt="" draggable={false} />
      <div className="deck-game-card__scrim" aria-hidden="true" />
      <span className="deck-game-card__badge">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="m10 1.5 1.8 5.1 5.2 1.8-5.2 1.8-1.8 5.2-1.8-5.2L3 8.4l5.2-1.8L10 1.5Z"
            fill="currentColor"
          />
          <path
            d="m16.2 12.8.9 2.3 2.3.9-2.3.8-.9 2.4-.8-2.4-2.4-.8 2.4-.9.8-2.3Z"
            fill="currentColor"
          />
        </svg>
        Під твій смак
      </span>

      <div className="deck-game-card__content">
        <div className="deck-game-card__intro">
          <h2>{game.title}</h2>
          <p className="deck-game-card__year">
            {game.releaseYear}
            {game.id === 'resident-evil-4' ? ' (або 2005 для оригінальної версії)' : ''}
          </p>
          <p className="deck-game-card__description">{game.description}</p>
        </div>

        <div className="deck-game-card__facts">
          <div className="deck-fact deck-fact--score">
            {game.metacriticScore ? (
              <span className="deck-fact__score-value">{game.metacriticScore}</span>
            ) : (
              <span className="deck-fact__score-empty">—</span>
            )}
            <span className="deck-fact__copy">
              <strong>{game.metacriticScore ? 'Metacritic' : 'Оцінка'}</strong>
              <small>{game.metacriticScore ? 'зі 100 балів' : 'ще не має'}</small>
            </span>
          </div>
          <div className="deck-fact">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
              <path d="M12 7v5l3.2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M3 19h6m6 0h6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <span className="deck-fact__copy">
              <strong>{game.playtimeHours ? `~${game.playtimeHours} год` : 'Час різний'}</strong>
              <small>Основний сюжет</small>
            </span>
          </div>
        </div>

        <div className="deck-game-card__tags" aria-label="Платформи та жанри">
          {game.platforms.map((platform) => (
            <span key={platform}>{platform}</span>
          ))}
          {game.genres.map((genre) => (
            <span key={genre}>{genre}</span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export default GameCard;
