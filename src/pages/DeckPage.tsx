import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLogo from '../components/AppLogo';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedGames, setLikedGames] = useState<(typeof allGames)[number][]>([]);
  const [skippedGames, setSkippedGames] = useState<(typeof allGames)[number][]>([]);
  const [superlikedIds, setSuperlikedIds] = useState<string[]>([]);
  const [history, setHistory] = useState<DeckHistoryEntry[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
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
        setLikedGames((previous) =>
          previous.some((item) => item.id === game.id) ? previous : [...previous, game],
        );

        if (action === 'superlike') {
          setSuperlikedIds((previous) =>
            previous.includes(game.id) ? previous : [...previous, game.id],
          );
        }
      }

      setHistory((previous) => [
        ...previous,
        { gameId: game.id, action, wasLikedAlready, wasSkippedAlready, wasSuperlikedAlready },
      ]);
      setCurrentIndex((previous) => previous + 1);
    },
    [currentIndex, likedGames, skippedGames, superlikedIds, visibleGames],
  );

  const handleUndo = useCallback(() => {
    const lastAction = history.at(-1);
    const game = lastAction && allGames.find((item) => item.id === lastAction.gameId);
    if (!lastAction || !game) return;

    setHistory((previous) => previous.slice(0, -1));
    setCurrentIndex((previous) => Math.max(0, previous - 1));

    if (lastAction.action === 'skip' && !lastAction.wasSkippedAlready) {
      setSkippedGames((previous) => previous.filter((item) => item.id !== game.id));
    } else if (lastAction.action !== 'skip' && !lastAction.wasLikedAlready) {
      setLikedGames((previous) => previous.filter((item) => item.id !== game.id));
    }

    if (lastAction.action === 'superlike' && !lastAction.wasSuperlikedAlready) {
      setSuperlikedIds((previous) => previous.filter((id) => id !== game.id));
    }
  }, [allGames, history]);

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
    setIsWishlistOpen(false);
    setIsNotificationsOpen(false);
  }, []);

  const isPanelOpen = isFiltersOpen || isWishlistOpen || isNotificationsOpen;

  useEffect(() => {
    if (!isPanelOpen) return undefined;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closePanels();
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [closePanels, isPanelOpen]);

  return (
    <div className="deck-app">
      <aside className="deck-sidebar" aria-label="Основна навігація">
        <div className="deck-sidebar__brand">
          <AppLogo />
        </div>
        <p className="deck-sidebar__kicker">ТВІЙ ІГРОВИЙ ПРОСТІР</p>
        <nav className="deck-nav">
          <Link className="deck-nav__item is-active" to="/deck" aria-current="page">
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
            <i aria-hidden="true" />
          </Link>
          <span className="deck-nav__item" aria-disabled="true">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="m16 16 4.3 4.3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span>Пошук</span>
          </span>
          <button className="deck-nav__item" type="button" onClick={() => setIsWishlistOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.7L6 21V4.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            <span>Хочу грати</span>
          </button>
          <span className="deck-nav__item" aria-disabled="true">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M4.5 20a7.5 7.5 0 0 1 15 0v1h-15v-1Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            <span>Профіль</span>
          </span>
        </nav>

        <div className="deck-sidebar__bottom">
          <div className="deck-sidebar-promo">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="4"
                width="18"
                height="13"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M8 21h8m-4-4v4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <strong>Твій світ PC-рейтингу</strong>
            <p>Улюблені ігри та платформи завжди поруч.</p>
          </div>
          <div className="deck-user">
            <span className="deck-avatar" aria-hidden="true">
              GM
            </span>
            <span>
              <strong>Гравець GameMatch</strong>
              <small>Твій ігровий простір</small>
            </span>
          </div>
        </div>
      </aside>

      <div className="deck-workspace">
        <header className="deck-topbar">
          <div className="deck-breadcrumb">
            <span>Мій простір</span>
            <i>/</i>
            <strong>Колода</strong>
          </div>
          <div className="deck-topbar__mobile-brand">
            <AppLogo compact />
          </div>
          <div className="deck-topbar__tools">
            <label className="deck-search">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="m13.2 13.2 4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="search"
                placeholder="Знайти гру..."
                aria-label="Знайти гру в локальній колоді"
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
              />
            </label>
            <button
              className="deck-icon-button deck-notification-trigger"
              type="button"
              aria-label="Сповіщення"
              aria-expanded={isNotificationsOpen}
              onClick={() => {
                setIsNotificationsOpen((open) => !open);
                setIsFiltersOpen(false);
                setIsWishlistOpen(false);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 13h4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="deck-avatar deck-avatar--top" aria-label="Профіль гравця">
              GM
            </span>
          </div>
          <div className="deck-topbar__mobile-actions">
            <button
              type="button"
              onClick={() => setIsWishlistOpen(true)}
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
            </button>
            <span className="deck-avatar deck-avatar--top" aria-label="Профіль гравця">
              GM
            </span>
          </div>
        </header>

        <main className="deck-content">
          <div className="deck-heading-row">
            <div>
              <p className="deck-heading-eyebrow">ДЛЯ ТЕБЕ</p>
              <h1>Для тебе</h1>
              <p className="deck-heading-description">
                Знайди свою наступну гру. Один вибір — ближче до пригоди.
              </p>
            </div>
            <button
              className="deck-wishlist-button"
              type="button"
              aria-label={`Відкрити список «Хочу зіграти», ${likedGames.length} ігор`}
              onClick={() => setIsWishlistOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M20.8 8.7c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
              Хочу зіграти <b>{likedGames.length}</b>
            </button>
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
      </div>

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

      {isWishlistOpen ? (
        <div
          className="deck-overlay"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setIsWishlistOpen(false)}
        >
          <section
            className="deck-dialog deck-dialog--wishlist"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deck-wishlist-title"
          >
            <button
              className="deck-dialog__close"
              type="button"
              aria-label="Закрити список"
              onClick={() => setIsWishlistOpen(false)}
            >
              ×
            </button>
            <p className="deck-dialog__eyebrow">ТВОЯ КОЛОДА</p>
            <h2 id="deck-wishlist-title">
              Хочу зіграти <span>{likedGames.length}</span>
            </h2>
            <p>Список працює локально у цьому прототипі та не надсилається на сервер.</p>
            {likedGames.length ? (
              <ul className="deck-wishlist-list">
                {likedGames.map((game) => (
                  <li key={game.id}>
                    <img src={game.image} alt="" />
                    <span>
                      <strong>{game.title}</strong>
                      <small>
                        {game.releaseYear} · {game.genres.join(' · ')}
                      </small>
                    </span>
                    {superlikedIds.includes(game.id) ? <b aria-label="Суперлайк">✦</b> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="deck-wishlist-empty">
                Поки порожньо. Натисни на серце, щоб зберегти гру.
              </div>
            )}
          </section>
        </div>
      ) : null}

      {isNotificationsOpen ? (
        <div
          className="deck-overlay deck-overlay--notice"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setIsNotificationsOpen(false)
          }
        >
          <section
            className="deck-dialog deck-dialog--notice"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deck-notice-title"
          >
            <button
              className="deck-dialog__close"
              type="button"
              aria-label="Закрити сповіщення"
              onClick={() => setIsNotificationsOpen(false)}
            >
              ×
            </button>
            <p className="deck-dialog__eyebrow">СПОВІЩЕННЯ</p>
            <h2 id="deck-notice-title">Поки тихо</h2>
            <p>Нові ігри з’являтимуться тут у наступних версіях GameMatch.</p>
          </section>
        </div>
      ) : null}
    </div>
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
