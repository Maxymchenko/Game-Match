import { Link } from 'react-router-dom';
import { useWishlistStore } from '../store/wishlistStore';

interface BottomNavProps {
  activePage: 'deck' | 'search' | 'wishlist' | 'account';
}

function BottomNav({ activePage }: BottomNavProps) {
  const wishlistCount = useWishlistStore((state) => state.games.length);

  return (
    <nav className="deck-mobile-nav" aria-label="Мобільна навігація">
      <Link
        className={`deck-mobile-nav__item${activePage === 'search' ? ' is-active' : ''}`}
        to="/search"
        aria-current={activePage === 'search' ? 'page' : undefined}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4.3 4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span>Пошук</span>
      </Link>
      <Link
        className={`deck-mobile-nav__item${activePage === 'deck' ? ' is-active' : ''}`}
        to="/deck"
        aria-current={activePage === 'deck' ? 'page' : undefined}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 4h10l4 5-9 11L3 9l4-5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="m3 9 9 4 9-4M8 4l4 9 4-9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <span>Колода</span>
      </Link>
      <Link
        className={`deck-mobile-nav__item${activePage === 'wishlist' ? ' is-active' : ''}`}
        to="/wishlist"
        aria-current={activePage === 'wishlist' ? 'page' : undefined}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.7L6 21V4.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        <span>Хочу грати{wishlistCount > 0 ? ` · ${wishlistCount}` : ''}</span>
      </Link>
      <Link
        className={`deck-mobile-nav__item${activePage === 'account' ? ' is-active' : ''}`}
        to="/account"
        aria-current={activePage === 'account' ? 'page' : undefined}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M4.5 20a7.5 7.5 0 0 1 15 0v1h-15v-1Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        <span>Акаунт</span>
      </Link>
    </nav>
  );
}

export default BottomNav;
