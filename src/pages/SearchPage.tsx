import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../features/search/SearchBar';
import { useRecommendations } from '../hooks/useRecommendations';
import { useWishlistStore } from '../store/wishlistStore';
import type { Game } from '../types/game';

type PriceCategory = 'free' | 'subscription' | 'paid';
type SortOption = 'popular' | 'rating' | 'year' | 'title';
type FilterMenu = 'platform' | 'genre' | 'year' | 'rating' | 'price';

const platformOptions = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Steam Deck'];
const genrePriority = ['RPG', 'FPS', 'Roguelike', 'Indie', 'Стратегія', 'Пригоди'];
const priceOptions: { id: PriceCategory; label: string }[] = [
  { id: 'free', label: 'Безкоштовні · демо' },
  { id: 'subscription', label: 'За підпискою · демо' },
  { id: 'paid', label: 'Платні · демо' },
];
const ratingOptions = [70, 80, 85, 90, 95];

// Demo classifications only: the catalog does not contain actual store prices.
const demoPriceCategories: Record<string, PriceCategory> = {
  'counter-strike-2': 'free',
  'resident-evil-4': 'subscription',
  hades: 'subscription',
  'hollow-knight': 'subscription',
  'ori-and-the-will-of-the-wisps': 'subscription',
};

const platformAliases: Record<string, string[]> = {
  PC: ['pc'],
  PlayStation: ['playstation', 'ps4', 'ps5', 'ps'],
  Xbox: ['xbox'],
  'Nintendo Switch': ['nintendo switch', 'switch'],
  'Steam Deck': ['steam deck'],
};

const priceLabel = (category: PriceCategory) =>
  priceOptions.find((option) => option.id === category)?.label ?? category;

function toggleValue(selected: string[], value: string): string[] {
  return selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value];
}

function matchesPlatform(game: Game, platform: string) {
  const aliases = platformAliases[platform] ?? [platform.toLocaleLowerCase()];
  return game.platforms.some((gamePlatform) => {
    const normalized = gamePlatform.toLocaleLowerCase();
    return aliases.some((alias) => normalized.includes(alias));
  });
}

function normalizePlatformLabel(platform: string) {
  const normalized = platform.toLocaleLowerCase();
  if (normalized === 'playstation') return 'PS';
  if (normalized === 'nintendo switch') return 'Switch';
  return platform;
}

function SearchPage() {
  const games = useRecommendations();
  const wishlistGames = useWishlistStore((state) => state.games);
  const addGame = useWishlistStore((state) => state.addGame);
  const removeGame = useWishlistStore((state) => state.removeGame);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterRowRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [yearFrom, setYearFrom] = useState<number | null>(null);
  const [yearTo, setYearTo] = useState<number | null>(null);
  const [minimumRating, setMinimumRating] = useState<number | null>(null);
  const [priceCategory, setPriceCategory] = useState<PriceCategory | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('popular');
  const [openFilter, setOpenFilter] = useState<FilterMenu | null>(null);
  const [isAllFiltersOpen, setIsAllFiltersOpen] = useState(false);

  const genres = useMemo(() => {
    const available = new Set(games.flatMap((game) => game.genres));
    const preferred = genrePriority.filter((genre) => available.has(genre));
    const remaining = [...available]
      .filter((genre) => !genrePriority.includes(genre))
      .sort((first, second) => first.localeCompare(second, 'uk'));
    return [...preferred, ...remaining];
  }, [games]);

  const filteredGames = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    const filtered = games.filter((game) => {
      const matchesQuery =
        !query ||
        [game.title, game.description, ...game.genres, ...game.platforms]
          .join(' ')
          .toLocaleLowerCase()
          .includes(query);
      const matchesPlatforms =
        !selectedPlatforms.length ||
        selectedPlatforms.some((platform) => matchesPlatform(game, platform));
      const matchesGenres =
        !selectedGenres.length || selectedGenres.some((genre) => game.genres.includes(genre));
      const matchesYears =
        (yearFrom === null || game.releaseYear >= yearFrom) &&
        (yearTo === null || game.releaseYear <= yearTo);
      const matchesRating = minimumRating === null || (game.metacriticScore ?? -1) >= minimumRating;
      const matchesPrice =
        priceCategory === null || (demoPriceCategories[game.id] ?? 'paid') === priceCategory;

      return (
        matchesQuery &&
        matchesPlatforms &&
        matchesGenres &&
        matchesYears &&
        matchesRating &&
        matchesPrice
      );
    });

    return filtered.sort((first, second) => {
      if (sortOption === 'rating' || sortOption === 'popular') {
        const ratingDifference = (second.metacriticScore ?? -1) - (first.metacriticScore ?? -1);
        if (ratingDifference !== 0) return ratingDifference;
        if (sortOption === 'popular') return second.releaseYear - first.releaseYear;
      }
      if (sortOption === 'year') return second.releaseYear - first.releaseYear;
      if (sortOption === 'title') return first.title.localeCompare(second.title, 'uk');
      return first.title.localeCompare(second.title, 'uk');
    });
  }, [
    games,
    minimumRating,
    priceCategory,
    searchQuery,
    selectedGenres,
    selectedPlatforms,
    sortOption,
    yearFrom,
    yearTo,
  ]);

  const wishlistIds = useMemo(() => new Set(wishlistGames.map((game) => game.id)), [wishlistGames]);

  const activeChips: { id: string; label: string; onRemove: () => void }[] = [
    ...selectedPlatforms.map((platform) => ({
      id: `platform-${platform}`,
      label: platform,
      onRemove: () =>
        setSelectedPlatforms((current) => current.filter((item) => item !== platform)),
    })),
    ...selectedGenres.map((genre) => ({
      id: `genre-${genre}`,
      label: genre,
      onRemove: () => setSelectedGenres((current) => current.filter((item) => item !== genre)),
    })),
    ...(yearFrom !== null || yearTo !== null
      ? [
          {
            id: 'years',
            label: `${yearFrom ?? 'Будь-який'}–${yearTo ?? 'теперішній'}`,
            onRemove: () => {
              setYearFrom(null);
              setYearTo(null);
            },
          },
        ]
      : []),
    ...(minimumRating !== null
      ? [
          {
            id: 'rating',
            label: `Metacritic ${minimumRating}+`,
            onRemove: () => setMinimumRating(null),
          },
        ]
      : []),
    ...(priceCategory
      ? [
          {
            id: 'price',
            label: priceLabel(priceCategory),
            onRemove: () => setPriceCategory(null),
          },
        ]
      : []),
  ];

  function clearFilters() {
    setSearchQuery('');
    setSelectedPlatforms([]);
    setSelectedGenres([]);
    setYearFrom(null);
    setYearTo(null);
    setMinimumRating(null);
    setPriceCategory(null);
    setOpenFilter(null);
  }

  function handleSearchEscape() {
    if (searchQuery) {
      setSearchQuery('');
      return;
    }
    setOpenFilter(null);
    setIsAllFiltersOpen(false);
  }

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isTextEntry =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest('input, textarea, select, [contenteditable="true"]'));

      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyK') {
        if (isTextEntry && target !== searchInputRef.current) return;
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (event.key === 'Escape' && !event.defaultPrevented) {
        setOpenFilter(null);
        setIsAllFiltersOpen(false);
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    function closeFilterMenu(event: PointerEvent) {
      if (event.target instanceof Node && !filterRowRef.current?.contains(event.target)) {
        setOpenFilter(null);
      }
    }

    document.addEventListener('pointerdown', closeFilterMenu);
    return () => document.removeEventListener('pointerdown', closeFilterMenu);
  }, []);

  return (
    <Layout activePage="search" breadcrumb="Пошук" showHeaderSearch={false}>
      <main className="deck-content search-page">
        <div className="search-page__heading">
          <h1>Пошук ігор</h1>
          <p>Знайди гру за назвою, жанром або платформою.</p>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          onEscape={handleSearchEscape}
          inputRef={searchInputRef}
        />

        <div className="search-filter-area" ref={filterRowRef}>
          <div className="search-filter-row">
            <FilterControl
              label="Платформа"
              icon={<MonitorIcon />}
              activeCount={selectedPlatforms.length}
              isOpen={openFilter === 'platform'}
              onToggle={() =>
                setOpenFilter((current) => (current === 'platform' ? null : 'platform'))
              }
            >
              <CheckboxGroup
                label="Платформи"
                options={platformOptions}
                selected={selectedPlatforms}
                onToggle={(platform) =>
                  setSelectedPlatforms((current) => toggleValue(current, platform))
                }
              />
            </FilterControl>
            <FilterControl
              label="Жанр"
              icon={<TagIcon />}
              activeCount={selectedGenres.length}
              isOpen={openFilter === 'genre'}
              onToggle={() => setOpenFilter((current) => (current === 'genre' ? null : 'genre'))}
            >
              <CheckboxGroup
                label="Жанри"
                options={genres}
                selected={selectedGenres}
                onToggle={(genre) => setSelectedGenres((current) => toggleValue(current, genre))}
              />
            </FilterControl>
            <FilterControl
              label="Рік виходу"
              icon={<CalendarIcon />}
              activeCount={yearFrom !== null || yearTo !== null ? 1 : 0}
              isOpen={openFilter === 'year'}
              onToggle={() => setOpenFilter((current) => (current === 'year' ? null : 'year'))}
            >
              <YearRangeFields
                yearFrom={yearFrom}
                yearTo={yearTo}
                setYearFrom={setYearFrom}
                setYearTo={setYearTo}
              />
            </FilterControl>
            <FilterControl
              label="Рейтинг"
              icon={<StarIcon />}
              activeCount={minimumRating === null ? 0 : 1}
              isOpen={openFilter === 'rating'}
              onToggle={() => setOpenFilter((current) => (current === 'rating' ? null : 'rating'))}
            >
              <RatingSelect value={minimumRating} onChange={setMinimumRating} />
            </FilterControl>
            <FilterControl
              label="Ціна"
              icon={<CoinsIcon />}
              activeCount={priceCategory ? 1 : 0}
              isOpen={openFilter === 'price'}
              onToggle={() => setOpenFilter((current) => (current === 'price' ? null : 'price'))}
            >
              <PriceSelect value={priceCategory} onChange={setPriceCategory} />
              <p className="search-filter__note">Категорії ціни — локальні демонстраційні дані.</p>
            </FilterControl>
            <button
              className={`search-all-filters${isAllFiltersOpen ? ' is-active' : ''}`}
              type="button"
              onClick={() => {
                setOpenFilter(null);
                setIsAllFiltersOpen(true);
              }}
            >
              <SlidersIcon />
              Усі фільтри
            </button>
          </div>

          {activeChips.length ? (
            <div className="search-active-filters" aria-label="Активні фільтри">
              {activeChips.map((chip) => (
                <button
                  className="search-filter-chip"
                  key={chip.id}
                  type="button"
                  onClick={chip.onRemove}
                >
                  <span>{chip.label}</span>
                  <span aria-hidden="true">×</span>
                </button>
              ))}
              <button className="search-clear-filters" type="button" onClick={clearFilters}>
                Очистити всі
              </button>
            </div>
          ) : null}
        </div>

        <div className="search-results-toolbar">
          <p aria-live="polite">
            Знайдено <strong>{filteredGames.length}</strong>{' '}
            {filteredGames.length === 1 ? 'гру' : 'ігор'}
          </p>
          <span className="search-results-toolbar__divider" aria-hidden="true" />
          <label className="search-sort">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 4v15m0 0-3-3m3 3 3-3M17 20V5m0 0-3 3m3-3 3 3"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <select
              aria-label="Сортувати результати"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as SortOption)}
            >
              <option value="popular">Рекомендовані</option>
              <option value="rating">За рейтингом</option>
              <option value="year">За роком виходу</option>
              <option value="title">За назвою</option>
            </select>
            <span className="search-sort__chevron" aria-hidden="true">
              ⌄
            </span>
          </label>
        </div>

        {filteredGames.length ? (
          <ul className="game-search-grid" aria-label="Результати пошуку">
            {filteredGames.map((game) => {
              const isSaved = wishlistIds.has(game.id);
              return (
                <li className="game-search-card" key={game.id}>
                  <img
                    className="game-search-card__cover"
                    src={game.image}
                    alt={`Обкладинка ${game.title}`}
                  />
                  <div className="game-search-card__content">
                    <h2>{game.title}</h2>
                    <p className="game-search-card__year">
                      {game.releaseYear} <span aria-hidden="true">•</span>{' '}
                      {game.genres.slice(0, 2).join(', ')}
                    </p>
                    {game.metacriticScore !== undefined ? (
                      <div className="game-search-card__rating">
                        <b>{game.metacriticScore}</b>
                        <span>Metacritic</span>
                      </div>
                    ) : null}
                    <div className="game-search-card__platforms" aria-label="Платформи">
                      {game.platforms.slice(0, 3).map((platform) => (
                        <span key={platform}>{normalizePlatformLabel(platform)}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    className={`game-search-card__save${isSaved ? ' is-saved' : ''}`}
                    type="button"
                    aria-label={
                      isSaved
                        ? `Видалити ${game.title} зі списку «Хочу грати»`
                        : `Додати ${game.title} до списку «Хочу грати»`
                    }
                    aria-pressed={isSaved}
                    onClick={() => (isSaved ? removeGame(game.id) : addGame(game, false))}
                  >
                    <HeartIcon filled={isSaved} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <section className="search-empty-state" aria-live="polite">
            <span className="search-empty-state__icon" aria-hidden="true">
              <SearchGlyph />
            </span>
            <h2>Ігор не знайдено</h2>
            <p>Зміни пошуковий запит або послаб фільтри, щоб побачити більше ігор.</p>
            <button
              className="deck-button deck-button--primary"
              type="button"
              onClick={clearFilters}
            >
              Очистити фільтри
            </button>
          </section>
        )}
      </main>

      {isAllFiltersOpen ? (
        <div
          className="deck-overlay search-filter-overlay"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setIsAllFiltersOpen(false)
          }
        >
          <section
            className="search-filter-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-filter-dialog-title"
          >
            <button
              className="deck-dialog__close"
              type="button"
              aria-label="Закрити фільтри"
              onClick={() => setIsAllFiltersOpen(false)}
            >
              ×
            </button>
            <p className="deck-dialog__eyebrow">УТОЧНИ ПОШУК</p>
            <h2 id="search-filter-dialog-title">Усі фільтри</h2>
            <div className="search-filter-dialog__grid">
              <CheckboxGroup
                label="Платформи"
                options={platformOptions}
                selected={selectedPlatforms}
                onToggle={(platform) =>
                  setSelectedPlatforms((current) => toggleValue(current, platform))
                }
              />
              <CheckboxGroup
                label="Жанри"
                options={genres}
                selected={selectedGenres}
                onToggle={(genre) => setSelectedGenres((current) => toggleValue(current, genre))}
              />
              <YearRangeFields
                yearFrom={yearFrom}
                yearTo={yearTo}
                setYearFrom={setYearFrom}
                setYearTo={setYearTo}
              />
              <RatingSelect value={minimumRating} onChange={setMinimumRating} />
              <div>
                <PriceSelect value={priceCategory} onChange={setPriceCategory} />
                <p className="search-filter__note">Демонстраційні категорії, не фактичні ціни.</p>
              </div>
            </div>
            <div className="search-filter-dialog__actions">
              <button className="search-clear-filters" type="button" onClick={clearFilters}>
                Очистити всі
              </button>
              <button
                className="deck-button deck-button--primary"
                type="button"
                onClick={() => setIsAllFiltersOpen(false)}
              >
                Показати {filteredGames.length} {filteredGames.length === 1 ? 'гру' : 'ігор'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </Layout>
  );
}

function FilterControl({
  label,
  icon,
  activeCount,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  icon: ReactNode;
  activeCount: number;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className={`search-filter${isOpen ? ' is-open' : ''}`}>
      <button
        className="search-filter__trigger"
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        {icon}
        <span>{label}</span>
        {activeCount > 0 ? <b>{activeCount}</b> : null}
        <svg className="search-filter__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {isOpen ? <div className="search-filter__panel">{children}</div> : null}
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="search-checkbox-group">
      <legend>{label}</legend>
      {options.map((option) => (
        <label className="search-checkbox-option" key={option}>
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => onToggle(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </fieldset>
  );
}

function YearRangeFields({
  yearFrom,
  yearTo,
  setYearFrom,
  setYearTo,
}: {
  yearFrom: number | null;
  yearTo: number | null;
  setYearFrom: (year: number | null) => void;
  setYearTo: (year: number | null) => void;
}) {
  return (
    <fieldset className="search-year-range">
      <legend>Рік виходу</legend>
      <label>
        <span>Від</span>
        <input
          type="number"
          min="1970"
          max="2026"
          placeholder="Будь-який"
          value={yearFrom ?? ''}
          onChange={(event) => setYearFrom(event.target.value ? Number(event.target.value) : null)}
        />
      </label>
      <label>
        <span>До</span>
        <input
          type="number"
          min="1970"
          max="2026"
          placeholder="Теперішній"
          value={yearTo ?? ''}
          onChange={(event) => setYearTo(event.target.value ? Number(event.target.value) : null)}
        />
      </label>
    </fieldset>
  );
}

function RatingSelect({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (rating: number | null) => void;
}) {
  return (
    <label className="search-select-field">
      <span>Мінімальний Metacritic</span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
      >
        <option value="">Будь-який рейтинг</option>
        {ratingOptions.map((rating) => (
          <option key={rating} value={rating}>
            {rating}+
          </option>
        ))}
      </select>
    </label>
  );
}

function PriceSelect({
  value,
  onChange,
}: {
  value: PriceCategory | null;
  onChange: (category: PriceCategory | null) => void;
}) {
  return (
    <label className="search-select-field">
      <span>Ціна · локальне демо</span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange((event.target.value || null) as PriceCategory | null)}
      >
        <option value="">Усі категорії</option>
        {priceOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function MonitorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 21h8m-4-4v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m20 13-7 7L3 10V4h6l11 9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M7 3v4m10-4v4M3 10h18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CoinsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 6v5c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 11v5c0 1.7 3.6 3 8 3 1.5 0 2.9-.2 4-.5m4-2.5v-5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M16.5 19.5c.7.8 1.4 1 2.2 1 1.1 0 1.8-.5 1.8-1.2 0-1.9-4-1-4-3.1 0-.7.7-1.2 1.8-1.2.7 0 1.3.2 1.9.7M18.3 14v6.8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6h6m4 0h6M4 12h2m4 0h10M4 18h8m4 0h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="12" cy="6" r="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="14" cy="18" r="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
      <path
        d="M20.8 8.7c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default SearchPage;
