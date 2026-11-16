import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import giftIcon from '../assets/icons/gift.svg';
import subscriptionIcon from '../assets/icons/subscription.svg';
import walletIcon from '../assets/icons/wallet.svg';
import Button from '../components/Button';
import Layout from '../components/Layout';
import SelectableCard from '../components/SelectableCard';
import { signOut } from '../api/auth';
import { getPreferences, savePreferences } from '../api/preferences';
import { useAuth } from '../hooks/useAuth';
import { useOnboardingStore } from '../store/onboardingStore';
import { useWishlistStore } from '../store/wishlistStore';
import type { BudgetCategory, OnboardingPreferences, PaidPriceLimit } from '../types/preferences';
import {
  budgetCategories,
  genres,
  paidPriceLimits,
  platforms,
  subscriptions,
} from '../features/onboarding/onboardingOptions';

type PreferencesLoadState = {
  userId: string;
  status: 'loading' | 'ready' | 'error';
  preferences: OnboardingPreferences | null;
};

const budgetIcons: Record<BudgetCategory, string> = {
  free: giftIcon,
  subscription: subscriptionIcon,
  paid: walletIcon,
};

function readMetadataText(metadata: unknown, keys: string[]) {
  if (typeof metadata !== 'object' || metadata === null) return undefined;
  const values = metadata as Record<string, unknown>;
  for (const key of keys) {
    const value = values[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function makeInitials(name: string | undefined, email: string | undefined) {
  const source = name || email?.split('@')[0] || '';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toLocaleUpperCase())
    .join('');
}

function formatAccountDate(value: string | undefined) {
  if (!value) return 'Недоступно';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Недоступно';
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getPreferencesValidationError(preferences: OnboardingPreferences) {
  if (preferences.platforms.length === 0) return 'Обери хоча б одну платформу.';
  if (preferences.genres.length === 0) return 'Обери хоча б один жанр.';
  if (preferences.budgetCategories.length === 0) return 'Обери хоча б один спосіб доступу до ігор.';
  if (
    preferences.budgetCategories.includes('subscription') &&
    preferences.subscriptions.length === 0
  ) {
    return 'Для категорії «За підпискою» обери Game Pass або PS Plus.';
  }
  if (preferences.budgetCategories.includes('paid') && preferences.paidPriceLimit === null) {
    return 'Для платних ігор обери ліміт ціни.';
  }
  return null;
}

function AccountPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const user = session?.user;
  const userId = user?.id;
  const [preferencesRetry, setPreferencesRetry] = useState(0);
  const [preferencesLoad, setPreferencesLoad] = useState<PreferencesLoadState | null>(null);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesMessage, setPreferencesMessage] = useState('');
  const [preferencesError, setPreferencesError] = useState('');
  const [accountError, setAccountError] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const setPreferencesInStore = useOnboardingStore((state) => state.setPreferences);
  const resetPreferences = useOnboardingStore((state) => state.resetPreferences);
  const selectedPlatforms = useOnboardingStore((state) => state.platforms);
  const selectedGenres = useOnboardingStore((state) => state.genres);
  const selectedBudgetCategories = useOnboardingStore((state) => state.budgetCategories);
  const selectedSubscriptions = useOnboardingStore((state) => state.subscriptions);
  const paidPriceLimit = useOnboardingStore((state) => state.paidPriceLimit);
  const clearWishlist = useWishlistStore((state) => state.clear);
  const wishlistGames = useWishlistStore((state) => state.games);
  const recentWishlistGames = useMemo(() => wishlistGames.slice(-4).reverse(), [wishlistGames]);

  const currentPreferencesLoad =
    userId && preferencesLoad?.userId === userId ? preferencesLoad : null;
  const preferencesStatus = currentPreferencesLoad?.status ?? 'loading';
  const savedPreferences =
    currentPreferencesLoad?.status === 'ready' ? currentPreferencesLoad.preferences : null;

  useEffect(() => {
    if (authLoading || !userId) return undefined;

    let active = true;
    void getPreferences()
      .then((preferences) => {
        if (!active) return;
        if (preferences) setPreferencesInStore(preferences);
        setPreferencesLoad({ userId, status: 'ready', preferences });
      })
      .catch(() => {
        if (active) setPreferencesLoad({ userId, status: 'error', preferences: null });
      });

    return () => {
      active = false;
    };
  }, [authLoading, preferencesRetry, setPreferencesInStore, userId]);

  if (authLoading) {
    return (
      <main className="account-loading" role="status">
        Перевіряємо сесію…
      </main>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const currentUserId = user.id;
  const email = user.email;
  const displayName = readMetadataText(user.user_metadata, [
    'display_name',
    'full_name',
    'name',
    'username',
  ]);
  const avatarUrl = readMetadataText(user.user_metadata, ['avatar_url', 'picture']);
  const initials = makeInitials(displayName, email) || 'GM';
  const hasAvatar = Boolean(avatarUrl && !avatarLoadFailed);

  async function handleSignOut() {
    setAccountError('');
    setIsSigningOut(true);
    try {
      await signOut();
      resetPreferences();
      clearWishlist();
      navigate('/auth', { replace: true });
    } catch {
      setAccountError('Не вдалося вийти з акаунта. Перевір з’єднання та спробуй ще раз.');
    } finally {
      setIsSigningOut(false);
    }
  }

  function beginEditingPreferences() {
    if (!savedPreferences) return;
    setPreferencesInStore(savedPreferences);
    setPreferencesMessage('');
    setPreferencesError('');
    setIsEditingPreferences(true);
  }

  function cancelEditingPreferences() {
    if (savedPreferences) setPreferencesInStore(savedPreferences);
    setPreferencesMessage('');
    setPreferencesError('');
    setIsEditingPreferences(false);
  }

  async function handleSavePreferences() {
    const draft: OnboardingPreferences = {
      platforms: selectedPlatforms,
      genres: selectedGenres,
      budgetCategories: selectedBudgetCategories,
      subscriptions: selectedSubscriptions,
      paidPriceLimit,
    };
    const validationError = getPreferencesValidationError(draft);
    if (validationError) {
      setPreferencesError(validationError);
      setPreferencesMessage('');
      return;
    }

    setIsSavingPreferences(true);
    setPreferencesError('');
    setPreferencesMessage('');
    try {
      await savePreferences(draft);
      setPreferencesLoad({ userId: currentUserId, status: 'ready', preferences: draft });
      setIsEditingPreferences(false);
      setPreferencesMessage('Ігрові вподобання збережено.');
    } catch {
      setPreferencesError('Не вдалося зберегти вподобання. Перевір з’єднання та спробуй ще раз.');
    } finally {
      setIsSavingPreferences(false);
    }
  }

  function retryPreferences() {
    setPreferencesLoad(null);
    setPreferencesError('');
    setPreferencesRetry((current) => current + 1);
  }

  const savedPlatformLabels = savedPreferences?.platforms.map(
    (id) => platforms.find((platform) => platform.id === id)?.name ?? id,
  );
  const savedGenreLabels = savedPreferences?.genres.map(
    (id) => genres.find((genre) => genre.id === id)?.name ?? id,
  );
  const savedBudgetLabels = savedPreferences
    ? [
        ...savedPreferences.budgetCategories.map(
          (id) => budgetCategories.find((category) => category.id === id)?.name ?? id,
        ),
        ...savedPreferences.subscriptions.map(
          (id) => subscriptions.find((subscription) => subscription.id === id)?.name ?? id,
        ),
        ...(savedPreferences.paidPriceLimit !== null
          ? [
              paidPriceLimits.find((limit) => limit.id === savedPreferences.paidPriceLimit)
                ?.label ?? String(savedPreferences.paidPriceLimit),
            ]
          : []),
      ]
    : undefined;

  return (
    <Layout activePage="account" breadcrumb="Акаунт" showHeaderSearch={false}>
      <motion.main
        className="deck-content account-page"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <div className="account-heading">
          <div>
            <p className="account-heading__eyebrow">ТВІЙ ІГРОВИЙ ПРОСТІР</p>
            <h1>Акаунт</h1>
            <p>Профіль, ігрові вподобання та безпека облікового запису.</p>
          </div>
        </div>

        {accountError ? (
          <p className="account-alert account-alert--error" role="alert">
            {accountError}
          </p>
        ) : null}

        <section className="account-profile-card" aria-labelledby="account-profile-title">
          <div className="account-avatar" aria-hidden="true">
            {hasAvatar ? (
              <img src={avatarUrl} alt="" onError={() => setAvatarLoadFailed(true)} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="account-profile-copy">
            <p className="account-profile-copy__eyebrow">ПРОФІЛЬ ГРАВЦЯ</p>
            <h2 id="account-profile-title">{displayName ?? 'Мій акаунт'}</h2>
            <p className="account-profile-copy__email">{email ?? 'Email не вказаний'}</p>
            <div className="account-profile-meta">
              <span>
                <i className={user.email_confirmed_at ? 'is-confirmed' : ''} aria-hidden="true" />
                {user.email_confirmed_at ? 'Email підтверджено' : 'Email не підтверджено'}
              </span>
              <span>З нами з {formatAccountDate(user.created_at)}</span>
            </div>
          </div>
          <div className="account-profile-actions">
            <Link className="account-secondary-button" to="/auth?mode=forgot">
              <LockIcon /> Відновити пароль
            </Link>
            <button
              className="account-signout-button"
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
            >
              {isSigningOut ? 'Виходимо…' : 'Вийти з акаунта'}
            </button>
          </div>
        </section>

        <p className="account-profile-note">
          Ім’я та аватар відображаються з даних поточної сесії. Редагування профільних полів поки не
          підтримується наявним API.
        </p>

        <div className="account-panels">
          <section
            className="account-card account-preferences"
            aria-labelledby="account-prefs-title"
          >
            <header className="account-card__header">
              <div>
                <p className="account-card__eyebrow">ПІДБІР ІГОР</p>
                <h2 id="account-prefs-title">Ігрові вподобання</h2>
              </div>
              {preferencesStatus === 'ready' && savedPreferences && !isEditingPreferences ? (
                <button
                  className="account-text-button"
                  type="button"
                  onClick={beginEditingPreferences}
                >
                  Редагувати
                </button>
              ) : null}
            </header>

            {preferencesStatus === 'loading' ? (
              <p className="account-state" role="status">
                Завантажуємо вподобання…
              </p>
            ) : preferencesStatus === 'error' ? (
              <div className="account-state account-state--error" role="alert">
                <p>Не вдалося завантажити збережені вподобання.</p>
                <button className="account-text-button" type="button" onClick={retryPreferences}>
                  Спробувати ще раз
                </button>
              </div>
            ) : isEditingPreferences ? (
              <>
                <AccountPreferencesEditor saving={isSavingPreferences} />
                {preferencesError ? (
                  <p className="account-alert account-alert--error" role="alert">
                    {preferencesError}
                  </p>
                ) : null}
                <div className="account-editor-actions">
                  <button
                    className="account-secondary-button"
                    type="button"
                    onClick={cancelEditingPreferences}
                    disabled={isSavingPreferences}
                  >
                    Скасувати
                  </button>
                  <Button
                    type="button"
                    onClick={() => void handleSavePreferences()}
                    disabled={isSavingPreferences}
                  >
                    {isSavingPreferences ? 'Зберігаємо…' : 'Зберегти'}
                  </Button>
                </div>
              </>
            ) : savedPreferences ? (
              <div className="account-preference-summary">
                <PreferenceSummary label="Платформи" values={savedPlatformLabels ?? []} />
                <PreferenceSummary label="Жанри" values={savedGenreLabels ?? []} />
                <PreferenceSummary label="Бюджет" values={savedBudgetLabels ?? []} />
                {preferencesMessage ? (
                  <p className="account-alert account-alert--success" role="status">
                    {preferencesMessage}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="account-state">
                <p>Збережених ігрових уподобань ще немає.</p>
                <Link className="account-text-button" to="/onboarding/platforms">
                  Налаштувати підбір <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </section>

          <section
            className="account-card account-wishlist"
            aria-labelledby="account-wishlist-title"
          >
            <header className="account-card__header">
              <div>
                <p className="account-card__eyebrow">ТВОЯ БІБЛІОТЕКА</p>
                <h2 id="account-wishlist-title">Хочу зіграти</h2>
              </div>
              <span className="account-wishlist-count" aria-label={`${wishlistGames.length} ігор`}>
                {wishlistGames.length}
              </span>
            </header>
            {recentWishlistGames.length ? (
              <ul className="account-recent-games">
                {recentWishlistGames.map((game) => (
                  <li key={game.id}>
                    {game.image ? (
                      <img src={game.image} alt="" loading="lazy" />
                    ) : (
                      <span className="account-recent-games__fallback" aria-hidden="true">
                        {game.title.slice(0, 1)}
                      </span>
                    )}
                    <span className="account-recent-games__copy">
                      <strong>{game.title}</strong>
                      <small>
                        {game.releaseYear ?? 'Рік невідомий'}
                        {game.genres.length ? ` · ${game.genres.slice(0, 1).join('')}` : ''}
                      </small>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="account-state account-wishlist__empty">
                У Wishlist store поки немає завантажених ігор.
              </p>
            )}
            <Link className="account-wishlist-link" to="/wishlist">
              Відкрити Wishlist <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      </motion.main>
    </Layout>
  );
}

function AccountPreferencesEditor({ saving }: { saving: boolean }) {
  const selectedPlatforms = useOnboardingStore((state) => state.platforms);
  const selectedGenres = useOnboardingStore((state) => state.genres);
  const selectedBudgetCategories = useOnboardingStore((state) => state.budgetCategories);
  const selectedSubscriptions = useOnboardingStore((state) => state.subscriptions);
  const paidPriceLimit = useOnboardingStore((state) => state.paidPriceLimit);
  const togglePlatform = useOnboardingStore((state) => state.togglePlatform);
  const toggleGenre = useOnboardingStore((state) => state.toggleGenre);
  const toggleBudgetCategory = useOnboardingStore((state) => state.toggleBudgetCategory);
  const toggleSubscription = useOnboardingStore((state) => state.toggleSubscription);
  const setPaidPriceLimit = useOnboardingStore((state) => state.setPaidPriceLimit);
  const validationMessage = getPreferencesValidationError({
    platforms: selectedPlatforms,
    genres: selectedGenres,
    budgetCategories: selectedBudgetCategories,
    subscriptions: selectedSubscriptions,
    paidPriceLimit,
  });

  return (
    <fieldset className="account-preferences-editor" disabled={saving} aria-busy={saving}>
      <legend className="account-fieldset-legend">Редагування вподобань</legend>

      <section className="account-editor-section" aria-labelledby="account-platforms-title">
        <h3 id="account-platforms-title">Платформи</h3>
        <div className="account-platform-grid">
          {platforms.map((platform) => (
            <SelectableCard
              className="platform-card"
              key={platform.id}
              selected={selectedPlatforms.includes(platform.id)}
              onToggle={() => togglePlatform(platform.id)}
            >
              <span className={`platform-glyph platform-glyph--${platform.id}`} aria-hidden="true">
                <img src={platform.icon} alt="" />
              </span>
              <span className="platform-card__copy">
                <strong>{platform.name}</strong>
                <small>{platform.detail}</small>
              </span>
            </SelectableCard>
          ))}
        </div>
      </section>

      <section className="account-editor-section" aria-labelledby="account-genres-title">
        <h3 id="account-genres-title">Жанри</h3>
        <div className="account-genre-grid">
          {genres.map((genre) => (
            <SelectableCard
              className="genre-card"
              key={genre.id}
              selected={selectedGenres.includes(genre.id)}
              onToggle={() => toggleGenre(genre.id)}
            >
              <img className="genre-card__art" src={genre.image} alt="" loading="lazy" />
              <span className="genre-card__shade" aria-hidden="true" />
              <span className="genre-card__copy">
                <strong>{genre.name}</strong>
                <small>{genre.tagline}</small>
              </span>
            </SelectableCard>
          ))}
        </div>
      </section>

      <section className="account-editor-section" aria-labelledby="account-budget-title">
        <h3 id="account-budget-title">Бюджет і спосіб доступу</h3>
        <div className="account-budget-grid">
          {budgetCategories.map((category) => {
            const selected = selectedBudgetCategories.includes(category.id);
            return (
              <div
                className={`account-budget-choice${selected ? ' is-selected' : ''}`}
                key={category.id}
              >
                <SelectableCard
                  className="account-budget-choice__toggle"
                  selected={selected}
                  onToggle={() => toggleBudgetCategory(category.id)}
                >
                  <span className={`budget-icon budget-icon--${category.icon}`} aria-hidden="true">
                    <img src={budgetIcons[category.id]} alt="" />
                  </span>
                  <strong>{category.name}</strong>
                  <small>{category.detail}</small>
                </SelectableCard>

                {category.id === 'subscription' ? (
                  <div className="subscription-options" aria-label="Сервіси підписки">
                    {subscriptions.map((subscription) => (
                      <button
                        className={`subscription-chip${selectedSubscriptions.includes(subscription.id) ? ' is-selected' : ''}`}
                        type="button"
                        key={subscription.id}
                        aria-pressed={selectedSubscriptions.includes(subscription.id)}
                        disabled={!selected}
                        onClick={() => toggleSubscription(subscription.id)}
                      >
                        {subscription.name}
                      </button>
                    ))}
                  </div>
                ) : null}

                {category.id === 'paid' ? (
                  <div
                    className="price-limits"
                    role="radiogroup"
                    aria-label="Ліміт ціни платної гри"
                  >
                    {paidPriceLimits.map((limit) => (
                      <label
                        className={`price-limit${paidPriceLimit === limit.id ? ' is-selected' : ''}`}
                        key={limit.id}
                      >
                        <input
                          type="radio"
                          name="account-paid-price-limit"
                          value={limit.id}
                          checked={paidPriceLimit === limit.id}
                          disabled={!selected}
                          onChange={() => setPaidPriceLimit(limit.id as PaidPriceLimit)}
                        />
                        <span>{limit.label}</span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {validationMessage ? <p className="account-editor-hint">{validationMessage}</p> : null}
      </section>
    </fieldset>
  );
}

function PreferenceSummary({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="account-preference-row">
      <h3>{label}</h3>
      {values.length ? (
        <div className="account-preference-tags">
          {values.map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
      ) : (
        <p>Не задано</p>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 10V7a4 4 0 1 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default AccountPage;
