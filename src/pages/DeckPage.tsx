import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import DeckFilters from '../features/deck/DeckFilters';
import type { SwipeAction } from '../features/deck/ActionButtons';
import SwipeDeck from '../features/deck/SwipeDeck';
import {
  budgetCategories,
  genres,
  paidPriceLimits,
  platforms,
  subscriptions,
} from '../features/onboarding/onboardingOptions';
import { useRecommendations } from '../hooks/useRecommendations';
import { getLibraryEntries, removeLibraryEntry, saveLibraryEntry } from '../api/library';
import { searchIgdbGames } from '../api/igdb';
import { useOnboardingStore } from '../store/onboardingStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuth } from '../hooks/useAuth';
import type { OnboardingPreferences } from '../types/preferences';
import type { LibraryEntry, LibraryStatus } from '../types/library';

interface DeckHistoryEntry {
  gameId: string;
  action: SwipeAction;
  wasLikedAlready: boolean;
  wasSkippedAlready: boolean;
  wasSuperlikedAlready: boolean;
  previousLibraryStatus: LibraryStatus | null;
  previousWasSuperliked: boolean;
}

interface PersistedLibraryState {
  status: LibraryStatus;
  isSuperlike: boolean;
}

interface DeckLibrarySnapshot {
  userId: string;
  entries: LibraryEntry[];
}

function matchesSelectedPlatform(
  gamePlatforms: string[],
  selected: OnboardingPreferences['platforms'],
) {
  if (!selected.length) return true;
  const names = gamePlatforms.map((name) => name.toLowerCase());
  return selected.some((platform) => {
    if (platform === 'pc') return names.some((name) => /windows|linux|macos|mac os|pc/.test(name));
    if (platform === 'playstation') return names.some((name) => name.includes('playstation'));
    if (platform === 'xbox') return names.some((name) => name.includes('xbox'));
    if (platform === 'switch') return names.some((name) => name.includes('nintendo switch'));
    // IGDB не має окремої платформи Steam Deck: він запускає PC/Steam-ігри.
    return names.some((name) => /windows|linux|macos|mac os|pc/.test(name));
  });
}

function matchesSelectedGenre(
  game: { genres: string[]; themes?: string[]; keywords?: string[]; playerPerspectives?: string[] },
  selected: OnboardingPreferences['genres'],
) {
  if (!selected.length) return true;
  const genres = game.genres.map((name) => name.toLowerCase());
  const themes = (game.themes ?? []).map((name) => name.toLowerCase());
  const keywords = (game.keywords ?? []).map((name) => name.toLowerCase());
  const perspectives = (game.playerPerspectives ?? []).map((name) => name.toLowerCase());

  return selected.some((genre) => {
    if (genre === 'rpg') return genres.includes('role-playing (rpg)');
    if (genre === 'fps') return genres.includes('shooter') && perspectives.includes('first person');
    if (genre === 'roguelike') {
      return [...genres, ...themes, ...keywords].some((name) =>
        /roguelike|rogue-like|roguelite|rogue-lite/.test(name),
      );
    }
    if (genre === 'indie') {
      return genres.includes('indie') || keywords.includes('indie') || themes.includes('indie');
    }
    if (genre === 'strategy') return genres.includes('strategy');
    if (genre === 'adventure') return genres.includes('adventure');
    return false;
  });
}
function DeckPage() {
  const recommendations = useRecommendations();
  const { session } = useAuth();
  const allGames = recommendations.games;
  const selectedPlatforms = useOnboardingStore((state) => state.platforms);
  const selectedGenres = useOnboardingStore((state) => state.genres);
  const selectedBudgetCategories = useOnboardingStore((state) => state.budgetCategories);
  const selectedSubscriptions = useOnboardingStore((state) => state.subscriptions);
  const paidPriceLimit = useOnboardingStore((state) => state.paidPriceLimit);
  const likedGames = useWishlistStore((state) => state.games);
  const superlikedIds = useWishlistStore((state) => state.superlikedIds);
  const addGame = useWishlistStore((state) => state.addGame);
  const removeGame = useWishlistStore((state) => state.removeGame);
  const restoreGameState = useWishlistStore((state) => state.restoreGameState);
  const replaceGames = useWishlistStore((state) => state.replaceGames);
  const clearWishlist = useWishlistStore((state) => state.clear);
  const [libraryError, setLibraryError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof allGames>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [skippedGames, setSkippedGames] = useState<(typeof allGames)[number][]>([]);
  const [history, setHistory] = useState<DeckHistoryEntry[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [librarySnapshot, setLibrarySnapshot] = useState<DeckLibrarySnapshot | null>(null);
  const libraryStateRef = useRef(new Map<number, PersistedLibraryState>());
  const userId = session?.user.id;
  const libraryEntries =
    librarySnapshot && librarySnapshot.userId === userId ? librarySnapshot.entries : null;
  const isLibraryLoading = Boolean(userId && libraryEntries === null);

  const preferences = useMemo<OnboardingPreferences>(
    () => ({
      platforms: selectedPlatforms,
      genres: selectedGenres,
      budgetCategories: selectedBudgetCategories,
      subscriptions: selectedSubscriptions,
      paidPriceLimit,
    }),
    [
      selectedPlatforms,
      selectedGenres,
      selectedBudgetCategories,
      selectedSubscriptions,
      paidPriceLimit,
    ],
  );

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) return undefined;

    let active = true;
    const timeout = window.setTimeout(() => {
      void searchIgdbGames(query)
        .then((games) => {
          if (active) setSearchResults(games);
        })
        .catch((error: unknown) => {
          if (active) {
            setSearchError(
              error instanceof Error ? error.message : 'Не вдалося виконати пошук в IGDB.',
            );
            setSearchResults([]);
          }
        })
        .finally(() => {
          if (active) setIsSearchLoading(false);
        });
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [searchQuery]);

  useEffect(() => {
    let active = true;
    clearWishlist();
    libraryStateRef.current.clear();
    if (!userId) return undefined;

    void getLibraryEntries()
      .then((entries) => {
        if (!active) return;
        libraryStateRef.current = new Map(
          entries.map((entry) => [
            entry.igdb_game_id,
            { status: entry.status, isSuperlike: entry.is_superlike },
          ]),
        );
        setLibrarySnapshot({ userId, entries });
        setLibraryError('');
      })
      .catch((error: unknown) => {
        if (!active) return;
        libraryStateRef.current.clear();
        setLibrarySnapshot({ userId, entries: [] });
        setLibraryError(
          error instanceof Error ? error.message : 'Не вдалося завантажити твою бібліотеку.',
        );
      });

    return () => {
      active = false;
    };
  }, [clearWishlist, userId]);

  useEffect(() => {
    if (!libraryEntries) return;

    const gamesByIgdbId = new Map(allGames.map((game) => [game.igdbId, game]));
    const wantedEntries = libraryEntries.filter((entry) => entry.status === 'want_to_play');
    const savedGames = wantedEntries
      .map((entry) => gamesByIgdbId.get(entry.igdb_game_id))
      .filter((game): game is (typeof allGames)[number] => Boolean(game));
    const superlikedIds = new Set(
      wantedEntries.filter((entry) => entry.is_superlike).map((entry) => entry.igdb_game_id),
    );

    replaceGames(
      savedGames,
      savedGames.filter((game) => superlikedIds.has(game.igdbId)).map((game) => game.id),
    );
  }, [allGames, libraryEntries, replaceGames]);

  const visibleGames = useMemo(() => {
    const sourceGames = searchQuery.trim() ? searchResults : allGames;
    const libraryIds = new Set((libraryEntries ?? []).map((entry) => entry.igdb_game_id));
    return sourceGames.filter(
      (game) =>
        (searchQuery.trim() || !libraryIds.has(game.igdbId)) &&
        matchesSelectedPlatform(game.platforms, selectedPlatforms) &&
        matchesSelectedGenre(game, selectedGenres),
    );
  }, [allGames, libraryEntries, searchQuery, searchResults, selectedPlatforms, selectedGenres]);

  const handleAction = useCallback(
    (action: SwipeAction) => {
      const game = visibleGames[currentIndex];
      if (!game) return;
      const previousLibraryState = libraryStateRef.current.get(game.igdbId) ?? null;
      const wasLikedAlready =
        likedGames.some((item) => item.id === game.id) ||
        previousLibraryState?.status === 'want_to_play';
      const wasSkippedAlready =
        skippedGames.some((item) => item.id === game.id) ||
        previousLibraryState?.status === 'skipped';
      const wasSuperlikedAlready =
        superlikedIds.includes(game.id) ||
        (previousLibraryState?.status === 'want_to_play' && previousLibraryState.isSuperlike);
      const previousLibraryStatus =
        previousLibraryState?.status ?? (wasLikedAlready ? 'want_to_play' : null);
      const previousWasSuperliked = previousLibraryState?.isSuperlike ?? wasSuperlikedAlready;
      const nextLibraryStatus = action === 'skip' ? 'skipped' : 'want_to_play';

      libraryStateRef.current.set(game.igdbId, {
        status: nextLibraryStatus,
        isSuperlike: action === 'superlike',
      });

      if (action === 'skip') {
        setSkippedGames((previous) =>
          previous.some((item) => item.id === game.id) ? previous : [...previous, game],
        );
        if (wasLikedAlready) removeGame(game.id);
      } else {
        setSkippedGames((previous) => previous.filter((item) => item.id !== game.id));
        if (wasLikedAlready) removeGame(game.id);
        addGame(game, action === 'superlike');
      }
      setLibraryError('');
      void saveLibraryEntry(game.igdbId, nextLibraryStatus, action === 'superlike').catch(
        (error: unknown) => {
          setLibraryError(
            error instanceof Error
              ? `Не вдалося зберегти гру: ${error.message}`
              : 'Не вдалося зберегти гру в Supabase.',
          );
        },
      );

      setHistory((previous) => [
        ...previous,
        {
          gameId: game.id,
          action,
          wasLikedAlready,
          wasSkippedAlready,
          wasSuperlikedAlready,
          previousLibraryStatus,
          previousWasSuperliked,
        },
      ]);
      setCurrentIndex((previous) => previous + 1);
    },
    [addGame, currentIndex, likedGames, removeGame, skippedGames, superlikedIds, visibleGames],
  );

  const handleUndo = useCallback(() => {
    const lastAction = history.at(-1);
    const game =
      lastAction && [...allGames, ...searchResults].find((item) => item.id === lastAction.gameId);
    if (!lastAction || !game) return;

    setHistory((previous) => previous.slice(0, -1));
    setCurrentIndex((previous) => Math.max(0, previous - 1));

    if (lastAction.previousLibraryStatus === 'skipped') {
      setSkippedGames((previous) =>
        previous.some((item) => item.id === game.id) ? previous : [...previous, game],
      );
    } else {
      setSkippedGames((previous) => previous.filter((item) => item.id !== game.id));
    }

    const wasPreviouslyLiked = lastAction.previousLibraryStatus === 'want_to_play';
    restoreGameState(
      game,
      wasPreviouslyLiked,
      wasPreviouslyLiked && lastAction.previousWasSuperliked,
    );

    if (lastAction.previousLibraryStatus) {
      libraryStateRef.current.set(game.igdbId, {
        status: lastAction.previousLibraryStatus,
        isSuperlike: lastAction.previousWasSuperliked,
      });
      void saveLibraryEntry(
        game.igdbId,
        lastAction.previousLibraryStatus,
        lastAction.previousWasSuperliked,
      ).catch((error: unknown) => {
        setLibraryError(
          error instanceof Error
            ? `Не вдалося скасувати дію: ${error.message}`
            : 'Не вдалося скасувати дію в Supabase.',
        );
      });
    } else {
      libraryStateRef.current.delete(game.igdbId);
      void removeLibraryEntry(game.igdbId).catch((error: unknown) => {
        setLibraryError(
          error instanceof Error
            ? `Не вдалося скасувати дію: ${error.message}`
            : 'Не вдалося скасувати дію в Supabase.',
        );
      });
    }
  }, [allGames, history, restoreGameState, searchResults]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setIsSearchLoading(Boolean(value.trim()));
    setSearchError(null);
    if (!value.trim()) setSearchResults([]);
    setCurrentIndex(0);
    setHistory([]);
  };

  const handleRestart = async () => {
    // У режимі пошуку просто повторно показуємо результати пошуку.
    if (searchQuery.trim()) {
      setCurrentIndex(0);
      setHistory([]);
      setSkippedGames([]);
      return;
    }

    // Завантажуємо наступні ігри, але пропускаємо ті, що не відповідають фільтрам.
    const nextGames = await recommendations.refresh(
      true,
      (game) =>
        matchesSelectedPlatform(game.platforms, selectedPlatforms) &&
        matchesSelectedGenre(game, selectedGenres),
    );
    if (!nextGames) return;
    setCurrentIndex(0);
    setHistory([]);
    setSkippedGames([]);
  };

  const closePanels = useCallback(() => {
    setIsFiltersOpen(false);
    setIsNotificationsOpen(false);
  }, []);

  const isPanelOpen = isFiltersOpen || isNotificationsOpen;

  useEffect(() => {
    if (!isPanelOpen) return undefined;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closePanels();
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [closePanels, isPanelOpen]);

  return (
    <Layout
      activePage="deck"
      breadcrumb="Колода"
      searchValue={searchQuery}
      onSearchChange={handleSearchChange}
      searchLabel="Шукати гру в каталозі IGDB"
      notificationOpen={isNotificationsOpen}
      onNotificationOpenChange={setIsNotificationsOpen}
      mobileActions={
        <Link
          className="deck-mobile-wishlist-link"
          to="/wishlist"
          aria-label={`Хочу грати: ${likedGames.length}`}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20.8 8.7c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z"
              stroke="currentColor"
              strokeWidth="1.7"
            />
          </svg>
          <span>{likedGames.length}</span>
        </Link>
      }
    >
      <main className="deck-content">
        <div className="deck-heading-row">
          <div>
            <p className="deck-heading-eyebrow">ДЛЯ ТЕБЕ</p>
            <h1>Для тебе</h1>
            <p className="deck-heading-description">
              Знайди свою наступну гру. Один вибір — ближче до пригоди.
            </p>
          </div>
          <Link
            className="deck-wishlist-button"
            to="/wishlist"
            aria-label={`Відкрити список «Хочу зіграти», ${likedGames.length} ігор`}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M20.8 8.7c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
            Хочу зіграти <b>{likedGames.length}</b>
          </Link>
        </div>

        <DeckFilters preferences={preferences} onOpen={() => setIsFiltersOpen(true)} />

        {isLibraryLoading ? (
          <p className="deck-session-status" role="status">
            Завантажуємо твою бібліотеку…
          </p>
        ) : !searchQuery.trim() && recommendations.loading ? (
          <p className="deck-session-status" role="status">
            Завантажуємо каталог ігор з IGDB…
          </p>
        ) : !searchQuery.trim() && recommendations.error ? (
          <div className="deck-empty-state" role="alert">
            <h2>Не вдалося завантажити каталог IGDB</h2>
            <p>{recommendations.error}</p>
            <button
              className="deck-button deck-button--primary"
              type="button"
              onClick={() => void recommendations.refresh()}
            >
              Спробувати ще раз
            </button>
          </div>
        ) : searchQuery.trim() && isSearchLoading ? (
          <p className="deck-session-status" role="status">
            Шукаємо ігри в IGDB…
          </p>
        ) : searchError ? (
          <div className="deck-empty-state" role="alert">
            <h2>Помилка пошуку IGDB</h2>
            <p>{searchError}</p>
            <button
              className="deck-button deck-button--primary"
              type="button"
              onClick={() => handleSearchChange('')}
            >
              Очистити пошук
            </button>
          </div>
        ) : (
          <SwipeDeck
            games={visibleGames}
            currentIndex={currentIndex}
            canUndo={history.length > 0}
            isPaused={isPanelOpen}
            onAction={handleAction}
            onUndo={handleUndo}
            onRestart={handleRestart}
            onClearSearch={() => handleSearchChange('')}
          />
        )}

        {libraryError ? (
          <p className="auth-message auth-message--error" role="alert">
            {libraryError}
          </p>
        ) : null}
        <div className="deck-session-status" aria-live="polite">
          <span>{history.length} переглянуто</span>
          <span>{likedGames.length} хочеш зіграти</span>
          <span>{skippedGames.length} пропущено</span>
          {superlikedIds.length ? <span>{superlikedIds.length} суперлайк</span> : null}
          <span>Джерело ігор: IGDB</span>
        </div>
      </main>

      {isFiltersOpen ? (
        <div
          className="deck-overlay"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setIsFiltersOpen(false)}
        >
          <section
            className="deck-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deck-filters-title"
          >
            <button
              className="deck-dialog__close"
              type="button"
              aria-label="Закрити фільтри"
              onClick={() => setIsFiltersOpen(false)}
            >
              ×
            </button>
            <p className="deck-dialog__eyebrow">ТВІЙ ВИБІР</p>
            <h2 id="deck-filters-title">Уподобання колоди</h2>
            <p>Уподобання завантажені з твого профілю.</p>
            <FilterPreference
              label="Платформи"
              value={formatOptionLabels(selectedPlatforms, platforms)}
            />
            <FilterPreference label="Жанри" value={formatOptionLabels(selectedGenres, genres)} />
            <FilterPreference
              label="Бюджет"
              value={formatOptionLabels(selectedBudgetCategories, budgetCategories)}
            />
            <FilterPreference
              label="Підписки"
              value={formatOptionLabels(selectedSubscriptions, subscriptions)}
            />
            <FilterPreference
              label="Ліміт платної гри"
              value={
                paidPriceLimit === null
                  ? 'Не вибрано'
                  : (paidPriceLimits.find((limit) => limit.id === paidPriceLimit)?.label ??
                    'Не вибрано')
              }
            />
            <button
              className="deck-button deck-button--primary deck-dialog__done"
              type="button"
              onClick={() => setIsFiltersOpen(false)}
            >
              Готово
            </button>
          </section>
        </div>
      ) : null}
    </Layout>
  );
}

function FilterPreference({ label, value }: { label: string; value: string }) {
  return (
    <div className="deck-preference-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatOptionLabels<Value extends string>(
  selected: Value[],
  options: { id: Value; name: string }[],
) {
  if (!selected.length) return 'Не вибрано';
  return selected.map((id) => options.find((option) => option.id === id)?.name ?? id).join(', ');
}

export default DeckPage;
