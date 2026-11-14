import type { Game } from '../../types/game';

interface WishlistListProps {
  games: Game[];
  superlikedIds: string[];
  onRemove: (gameId: string) => void;
}

function WishlistList({ games, superlikedIds, onRemove }: WishlistListProps) {
  return (
    <ul className="wishlist-grid" aria-label="Ігри зі списку «Хочу зіграти»">
      {games.map((game) => (
        <li className="wishlist-card" key={game.id}>
          <img className="wishlist-card__image" src={game.image} alt={`Обкладинка ${game.title}`} />
          <div className="wishlist-card__content">
            <div className="wishlist-card__meta-row">
              <span className="wishlist-card__status">ХОЧУ ЗІГРАТИ</span>
              {superlikedIds.includes(game.id) ? (
                <span className="wishlist-card__superlike" aria-label="Суперлайк">
                  ✦
                </span>
              ) : null}
            </div>
            <h2>{game.title}</h2>
            <p className="wishlist-card__details">
              <span>{game.platforms.join(' · ')}</span>
              {game.genres.length ? <span>{game.genres.join(' · ')}</span> : null}
            </p>
            <button
              className="wishlist-card__remove"
              type="button"
              onClick={() => onRemove(game.id)}
              aria-label={`Видалити ${game.title} зі списку «Хочу зіграти»`}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Видалити</span>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default WishlistList;
