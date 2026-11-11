import { useState } from 'react';
import giftIcon from '../../assets/icons/gift.svg';
import subscriptionIcon from '../../assets/icons/subscription.svg';
import walletIcon from '../../assets/icons/wallet.svg';
import OnboardingPage from '../../pages/OnboardingPage';
import { useOnboardingStore } from '../../store/onboardingStore';
import type { BudgetCategory } from '../../types/preferences';
import { budgetCategories, paidPriceLimits, subscriptions } from './onboardingOptions';

const budgetIcons: Record<BudgetCategory, string> = {
  free: giftIcon,
  subscription: subscriptionIcon,
  paid: walletIcon,
};

function BudgetStep() {
  const [isComplete, setIsComplete] = useState(false);
  const selectedCategories = useOnboardingStore((state) => state.budgetCategories);
  const selectedSubscriptions = useOnboardingStore((state) => state.subscriptions);
  const paidPriceLimit = useOnboardingStore((state) => state.paidPriceLimit);
  const toggleBudgetCategory = useOnboardingStore((state) => state.toggleBudgetCategory);
  const toggleSubscription = useOnboardingStore((state) => state.toggleSubscription);
  const setPaidPriceLimit = useOnboardingStore((state) => state.setPaidPriceLimit);

  const hasSubscriptionCategory = selectedCategories.includes('subscription');
  const hasPaidCategory = selectedCategories.includes('paid');
  const canFinish =
    selectedCategories.length > 0 &&
    (!hasSubscriptionCategory || selectedSubscriptions.length > 0) &&
    (!hasPaidCategory || paidPriceLimit !== null);

  return (
    <OnboardingPage
      step={3}
      title="Гра на твій бюджет"
      description="Обери зручні способи доступу. Хороший матч не має бути дорогим."
      backTo="/onboarding/genres"
      continueLabel={isComplete ? 'Готово' : 'Почати свайпати'}
      canContinue={canFinish && !isComplete}
      onComplete={() => setIsComplete(true)}
    >
      <p className="selection-hint">МОЖНА ПОЄДНУВАТИ</p>
      <div className="budget-grid">
        {budgetCategories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);

          return (
            <article className={`budget-card${isSelected ? ' is-selected' : ''}`} key={category.id}>
              <button
                type="button"
                className="budget-card__choose"
                aria-pressed={isSelected}
                onClick={() => {
                  setIsComplete(false);
                  toggleBudgetCategory(category.id);
                }}
              >
                <span className={`budget-icon budget-icon--${category.icon}`} aria-hidden="true">
                  <img src={budgetIcons[category.id]} alt="" />
                </span>
                <span className="budget-card__check" aria-hidden="true">
                  {isSelected ? '✓' : ''}
                </span>
                <strong>{category.name}</strong>
                <small>{category.detail}</small>
              </button>

              {category.id === 'free' ? (
                <p className="budget-card__value">
                  0 <span>₴</span>
                </p>
              ) : null}

              {category.id === 'subscription' ? (
                <div className="subscription-options" aria-label="Сервіси підписки">
                  {subscriptions.map((subscription) => {
                    const selected = selectedSubscriptions.includes(subscription.id);

                    return (
                      <button
                        className={`subscription-chip${selected ? ' is-selected' : ''}`}
                        type="button"
                        key={subscription.id}
                        aria-pressed={selected}
                        disabled={!isSelected}
                        onClick={() => {
                          setIsComplete(false);
                          toggleSubscription(subscription.id);
                        }}
                      >
                        {subscription.name}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {category.id === 'paid' ? (
                <div className="price-limits" role="radiogroup" aria-label="Ліміт ціни платної гри">
                  {paidPriceLimits.map((limit) => (
                    <label
                      className={`price-limit${paidPriceLimit === limit.id ? ' is-selected' : ''}`}
                      key={limit.id}
                    >
                      <input
                        type="radio"
                        name="paid-price-limit"
                        value={limit.id}
                        checked={paidPriceLimit === limit.id}
                        disabled={!isSelected}
                        onChange={() => {
                          setIsComplete(false);
                          setPaidPriceLimit(limit.id);
                        }}
                      />
                      <span>{limit.label}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="budget-warning" role="note">
        <span aria-hidden="true">◇</span>
        <p>
          Це твої вподобання. Фактичні ціни та доступність у підписках залежать від джерела даних.
        </p>
      </div>

      <div className="deck-preview" aria-live="polite">
        <span>ТВОЯ КОЛОДА</span>
        <p>
          {selectedCategories.length
            ? budgetCategories
                .filter((category) => selectedCategories.includes(category.id))
                .map((category) => category.name)
                .join(' · ')
            : 'Обери спосіб доступу'}
          {selectedSubscriptions.length
            ? `  |  ${subscriptions
                .filter((subscription) => selectedSubscriptions.includes(subscription.id))
                .map((subscription) => subscription.name)
                .join(' · ')}`
            : ''}
          {paidPriceLimit !== null
            ? `  |  ${paidPriceLimits.find((limit) => limit.id === paidPriceLimit)?.label ?? ''}`
            : ''}
        </p>
      </div>

      {isComplete ? (
        <div className="completion-message" role="status">
          <span aria-hidden="true">✓</span>
          <div>
            <strong>Твій профіль готовий</strong>
            <p>
              Підбір ігор з’явиться тут, коли буде підключено каталог. Твої вподобання збережені.
            </p>
          </div>
        </div>
      ) : null}
    </OnboardingPage>
  );
}

export default BudgetStep;
