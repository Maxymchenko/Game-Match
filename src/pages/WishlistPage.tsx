



import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import WishlistList from '../features/library/WishlistList';
import { removeLibraryEntry } from '../api/library';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuth } from '../hooks/useAuth';
import { getLibraryEntries } from '../api/library';
import { useRecommendations } from '../hooks/useRecommendations';

function WishlistPage() {
  const recommendations = useRecommendations();
  const { session } = useAuth();
  const games = useWishlistStore((state) => state.games);
  const replaceGames = useWishlistStore((state) => state.replaceGames);
  const clearWishlist = useWishlistStore((state) => state.clear);
  const [isLoading, setIsLoading] = useState(true);
  const superlikedIds = useWishlistStore((state) => state.superlikedIds);
  const removeGame = useWishlistStore((state) => state.removeGame);
  const [libraryError, setLibraryError] = useState('');

  useEffect(() => {
    clearWishlist();
    if (!session?.user.id) return;
    let active = true;
    void getLibraryEntries('want_to_play').then((entries) => {
      if (!active) return;
      const gamesById = new Map(recommendations.games.map((game) => [game.igdbId, game]));
      const savedGames = entries.map((entry) => gamesById.get(entry.igdb_game_id)).filter((game): game is NonNullable<typeof game> => Boolean(game));
      const superlikes = entries.filter((entry) => entry.is_superlike).map((entry) => String(entry.igdb_game_id));
      replaceGames(savedGames, savedGames.filter((game) => superlikes.includes(String(game.igdbId))).map((game) => game.id));
    }).catch((error: unknown) => {
      if (active) setLibraryError(error instanceof Error ? error.message : 'Не вдалося завантажити список.');
    }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [clearWishlist, recommendations.games, replaceGames, session?.user.id]);

  async function handleRemove(gameId: string) {
    const game = games.find((item) => item.id === gameId);
    if (!game) return;
    removeGame(gameId);
    setLibraryError('');
    try {
      await removeLibraryEntry(game.igdbId);
    } catch (error) {
      setLibraryError(error instanceof Error ? `Не вдалося видалити гру з хмари: ${error.message}` : 'Не вдалося синхронізувати видалення.');
    }
  }
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
        {libraryError ? <p className="auth-message auth-message--error" role="alert">{libraryError}</p> : null}
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

        {isLoading || recommendations.loading ? <p role="status">Завантажуємо твою бібліотеку…</p> : games.length === 0 ? (
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
          <WishlistList games={filteredGames} superlikedIds={superlikedIds} onRemove={handleRemove} />
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
