import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLogo from '../components/AppLogo';
import Button from '../components/Button';
import ProgressBar from '../features/onboarding/ProgressBar';
import {
  budgetCategories,
  genres,
  paidPriceLimits,
  platforms,
  subscriptions,
} from '../features/onboarding/onboardingOptions';
import { useOnboardingStore } from '../store/onboardingStore';
import type { OnboardingStep } from '../types/preferences';

interface OnboardingPageProps {
  step: OnboardingStep;
  title: string;
  description: string;
  children: ReactNode;
  backTo: string;
  continueTo?: string;
  continueLabel: string;
  canContinue?: boolean;
  onComplete?: () => void;
}

function OnboardingPage({
  step,
  title,
  description,
  children,
  backTo,
  continueTo,
  continueLabel,
  canContinue = true,
  onComplete,
}: OnboardingPageProps) {
  const navigate = useNavigate();
  const selectedPlatforms = useOnboardingStore((state) => state.platforms);
  const selectedGenres = useOnboardingStore((state) => state.genres);
  const selectedBudgetCategories = useOnboardingStore((state) => state.budgetCategories);
  const selectedSubscriptions = useOnboardingStore((state) => state.subscriptions);
  const paidPriceLimit = useOnboardingStore((state) => state.paidPriceLimit);

  const platformLabels = selectedPlatforms.map(
    (id) => platforms.find((platform) => platform.id === id)?.name ?? id,
  );
  const genreLabels = selectedGenres.map(
    (id) => genres.find((genre) => genre.id === id)?.name ?? id,
  );
  const budgetLabels = selectedBudgetCategories.map(
    (id) => budgetCategories.find((category) => category.id === id)?.name ?? id,
  );
  const subscriptionLabels = selectedSubscriptions.map(
    (id) => subscriptions.find((subscription) => subscription.id === id)?.name ?? id,
  );
  const priceLabel = paidPriceLimits.find((limit) => limit.id === paidPriceLimit)?.label;
  const completedSteps: OnboardingStep[] = [];

  if (selectedPlatforms.length > 0) completedSteps.push(1);
  if (selectedGenres.length > 0) completedSteps.push(2);
  if (
    selectedBudgetCategories.length > 0 &&
    (!selectedBudgetCategories.includes('subscription') || selectedSubscriptions.length > 0) &&
    (!selectedBudgetCategories.includes('paid') || paidPriceLimit !== null)
  ) {
    completedSteps.push(3);
  }

  const selectedForStep =
    step === 1
      ? `${selectedPlatforms.length} ${selectedPlatforms.length === 1 ? 'платформу' : 'платформи'}`
      : step === 2
        ? `${selectedGenres.length} ${selectedGenres.length === 1 ? 'жанр' : 'жанрів'}`
        : `${selectedBudgetCategories.length} ${selectedBudgetCategories.length === 1 ? 'категорію' : 'категорії'}`;

  function handleContinue() {
    if (!canContinue) return;
    if (continueTo) {
      navigate(continueTo);
      return;
    }
    onComplete?.();
  }

  return (
    <motion.main
      className="onboarding-page"
      aria-labelledby="onboarding-title"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="onboarding-frame">
        <header className="topbar">
          <AppLogo />
          <span className="topbar-note">
            <span className="topbar-note__icon" aria-hidden="true" />
            Твій ігровий простір на ПК
          </span>
        </header>

        <ProgressBar currentStep={step} completedSteps={completedSteps} />

        <div className="onboarding-body">
          <aside className="preference-sidebar" aria-label="Підсумок уподобань">
            <div className="sidebar-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <path
                  d="M9 7h14a4 4 0 0 1 3.8 2.8l2 6.4a3.3 3.3 0 0 1-5.3 3.5l-3-2.4h-9l-3 2.4a3.3 3.3 0 0 1-5.3-3.5l2-6.4A4 4 0 0 1 9 7Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M10 10v5m-2.5-2.5h5m8-.5h.01M23 14h.01"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="sidebar-kicker">ТВОЇ ВПОДОБАННЯ · {step}/3</p>
            <h2>
              Твій смак.
              <br />
              Твоя колода.
            </h2>
            <p className="sidebar-description">3 короткі кроки. Жодного зайвого вибору.</p>

            <div className="sidebar-summary">
              <section className="summary-item">
                <div className="summary-item__heading">
                  <span
                    className={`summary-status${selectedPlatforms.length ? ' is-complete' : ''}`}
                    aria-hidden="true"
                  />
                  <h3>Платформи</h3>
                </div>
                <p>{platformLabels.length ? platformLabels.join(' · ') : 'Де ти граєш'}</p>
              </section>
              <section className="summary-item">
                <div className="summary-item__heading">
                  <span
                    className={`summary-status${selectedGenres.length ? ' is-complete' : ''}`}
                    aria-hidden="true"
                  />
                  <h3>Жанри</h3>
                </div>
                <p>{genreLabels.length ? genreLabels.join(' · ') : 'Що тебе захоплює'}</p>
              </section>
              <section className="summary-item">
                <div
                  className={`summary-status${completedSteps.includes(3) ? ' is-complete' : ''}`}
                  aria-hidden="true"
                />
                <div>
                  <h3>Бюджет</h3>
                  <p>
                    {budgetLabels.length ? budgetLabels.join(' · ') : 'Зручний доступ'}
                    {subscriptionLabels.length ? ` · ${subscriptionLabels.join(', ')}` : ''}
                    {priceLabel ? ` · ${priceLabel}` : ''}
                  </p>
                </div>
              </section>
            </div>

            <p className="sidebar-footnote">Вибір зберігається під час онбордингу.</p>
          </aside>

          <section className="step-content">
            <div className="step-heading">
              <p className="step-heading__eyebrow">КРОК 0{step} · 03</p>
              <h1 id="onboarding-title">{title}</h1>
              <p>{description}</p>
            </div>

            {children}

            <footer className="step-footer">
              <div className="step-footer__summary" aria-live="polite">
                <strong>Обрано {selectedForStep}</strong>
                <span>Уподобання можна буде змінити пізніше.</span>
              </div>
              <div className="step-footer__actions">
                <Link className="button button--quiet" to={backTo}>
                  <span aria-hidden="true">←</span> Назад
                </Link>
                <Button disabled={!canContinue} onClick={handleContinue}>
                  {continueLabel}
                  <span aria-hidden="true">→</span>
                </Button>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </motion.main>
  );
}

export default OnboardingPage;
