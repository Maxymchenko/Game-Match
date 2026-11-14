import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import WishlistList from '../features/library/WishlistList';
import { useWishlistStore } from '../store/wishlistStore';

function WishlistPage() {
  const games = useWishlistStore((state) => state.games);
  const superlikedIds = useWishlistStore((state) => state.superlikedIds);
  const removeGame = useWishlistStore((state) => state.removeGame);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return games;

    return games.filter((game) =>
      [game.title, game.description, ...game.platforms, ...game.genres]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [games, searchQuery]);

  return (
    <Layout
      activePage="wishlist"
      breadcrumb="Хочу зіграти"
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchLabel="Знайти гру у списку бажань"
    >
      <main className="deck-content wishlist-page">
        <div className="wishlist-heading">
          <div>
            <p className="wishlist-heading__eyebrow">ТВОЯ БІБЛІОТЕКА</p>
            <h1>Хочу зіграти</h1>
            <p>Ігри, які чекають на твій вільний вечір.</p>
          </div>
          <output
            className="wishlist-heading__count"
            aria-label={`${games.length} збережених ігор`}
          >
            {games.length}
          </output>
        </div>

        {games.length === 0 ? (
          <section className="wishlist-empty" aria-live="polite">
            <span className="wishlist-empty__icon" aria-hidden="true">
              ♡
            </span>
            <h2>Тут поки порожньо</h2>
            <p>Зберігай цікаві ігри в колоді, і вони з’являться у цьому списку.</p>
            <Link className="deck-button deck-button--primary" to="/deck">
              Перейти до колоди
            </Link>
          </section>
        ) : filteredGames.length ? (
          <WishlistList games={filteredGames} superlikedIds={superlikedIds} onRemove={removeGame} />
        ) : (
          <section className="wishlist-empty wishlist-empty--search" aria-live="polite">
            <h2>Нічого не знайдено</h2>
            <p>Спробуй іншу назву гри, платформу або жанр.</p>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default WishlistPage;
