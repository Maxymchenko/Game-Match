import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useOnboardingStore } from '../store/onboardingStore';
import { useWishlistStore } from '../store/wishlistStore';
import type { OnboardingPreferences } from '../types/preferences';

interface DeckHistoryEntry {
  gameId: string;
  action: SwipeAction;
  wasLikedAlready: boolean;
  wasSkippedAlready: boolean;
  wasSuperlikedAlready: boolean;
}

function DeckPage() {
  const allGames = useRecommendations();
  const selectedPlatforms = useOnboardingStore((state) => state.platforms);
  const selectedGenres = useOnboardingStore((state) => state.genres);
  const selectedBudgetCategories = useOnboardingStore((state) => state.budgetCategories);
  const selectedSubscriptions = useOnboardingStore((state) => state.subscriptions);
  const paidPriceLimit = useOnboardingStore((state) => state.paidPriceLimit);
  const likedGames = useWishlistStore((state) => state.games);
  const superlikedIds = useWishlistStore((state) => state.superlikedIds);
  const addGame = useWishlistStore((state) => state.addGame);
  const restoreGameState = useWishlistStore((state) => state.restoreGameState);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [skippedGames, setSkippedGames] = useState<(typeof allGames)[number][]>([]);
  const [history, setHistory] = useState<DeckHistoryEntry[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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

  const visibleGames = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return allGames;

    return allGames.filter((game) =>
      [game.title, game.description, ...game.genres, ...game.platforms]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [allGames, searchQuery]);

  const handleAction = useCallback(
    (action: SwipeAction) => {
      const game = visibleGames[currentIndex];
      if (!game) return;
      const wasLikedAlready = likedGames.some((item) => item.id === game.id);
      const wasSkippedAlready = skippedGames.some((item) => item.id === game.id);
      const wasSuperlikedAlready = superlikedIds.includes(game.id);

      if (action === 'skip') {
        setSkippedGames((previous) =>
          previous.some((item) => item.id === game.id) ? previous : [...previous, game],
        );
      } else {
        addGame(game, action === 'superlike');
      }

      setHistory((previous) => [
        ...previous,
        { gameId: game.id, action, wasLikedAlready, wasSkippedAlready, wasSuperlikedAlready },
      ]);
      setCurrentIndex((previous) => previous + 1);
    },
    [addGame, currentIndex, likedGames, skippedGames, superlikedIds, visibleGames],
  );

  const handleUndo = useCallback(() => {
    const lastAction = history.at(-1);
    const game = lastAction && allGames.find((item) => item.id === lastAction.gameId);
    if (!lastAction || !game) return;

    setHistory((previous) => previous.slice(0, -1));
    setCurrentIndex((previous) => Math.max(0, previous - 1));

    if (lastAction.action === 'skip') {
      if (!lastAction.wasSkippedAlready) {
        setSkippedGames((previous) => previous.filter((item) => item.id !== game.id));
      }
    } else {
      restoreGameState(game, lastAction.wasLikedAlready, lastAction.wasSuperlikedAlready);
    }
  }, [allGames, history, restoreGameState]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentIndex(0);
    setHistory([]);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setHistory([]);
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
      searchLabel="Знайти гру в локальній колоді"
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

        <div className="deck-session-status" aria-live="polite">
          <span>{history.length} переглянуто</span>
          <span>{likedGames.length} хочеш зіграти</span>
          <span>{skippedGames.length} пропущено</span>
          {superlikedIds.length ? <span>{superlikedIds.length} суперлайк</span> : null}
          <span className="deck-session-status__demo">Демо-дані</span>
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
            <p>Налаштування з онбордингу, збережені локально у Zustand.</p>
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
