import type { OnboardingPreferences } from '../../types/preferences';
import {
  budgetCategories,
  genres,
  paidPriceLimits,
  platforms,
  subscriptions,
} from '../onboarding/onboardingOptions';

interface DeckFiltersProps {
  preferences: OnboardingPreferences;
  onOpen: () => void;
}

function getLabels<Value extends string>(
  selected: Value[],
  options: { id: Value; name: string }[],
  fallback: string,
) {
  const labels = selected
    .map((id) => options.find((option) => option.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  if (!labels.length) return fallback;
  return labels.length > 1 ? `${labels[0]} +${labels.length - 1}` : labels[0];
}

function DeckFilters({ preferences, onOpen }: DeckFiltersProps) {
  const budgetNames = preferences.budgetCategories
    .map((id) => budgetCategories.find((option) => option.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const selectedSubscriptions = preferences.subscriptions
    .map((id) => subscriptions.find((option) => option.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const priceLimit = paidPriceLimits.find(
    (option) => option.id === preferences.paidPriceLimit,
  )?.label;
  const budgetLabel = budgetNames.length
    ? [budgetNames.join(' + '), ...selectedSubscriptions, priceLimit].filter(Boolean).join(' · ')
    : 'Будь-який бюджет';

  return (
    <section className="deck-filter-bar" aria-label="Твої фільтри колоди">
      <div className="deck-filter-bar__chips">
        <span className="deck-filter-chip">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M5 4.5h10v7H5zM8 14.5h4m-2-3v3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          {getLabels(preferences.platforms, platforms, 'Усі платформи')}
        </span>
        <span className="deck-filter-chip">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="m3 9 6-6h7v7l-6 6L3 9Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="12.5" cy="7.5" r="1" fill="currentColor" />
          </svg>
          {getLabels(preferences.genres, genres, 'Усі жанри')}
        </span>
        <span className="deck-filter-chip">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="7" cy="5" r="1.8" fill="#171925" stroke="currentColor" strokeWidth="1.4" />
            <circle
              cx="13"
              cy="10"
              r="1.8"
              fill="#171925"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <circle cx="8" cy="15" r="1.8" fill="#171925" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          {budgetLabel}
        </span>
      </div>
      <button className="deck-filter-button" type="button" onClick={onOpen}>
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M3 5h14M3 10h14M3 15h14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M7 3v4m6 1v4m-4 2v4"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
        </svg>
        Усі фільтри
      </button>
    </section>
  );
}

export default DeckFilters;
