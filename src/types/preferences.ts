export type PlatformId = 'pc' | 'playstation' | 'xbox' | 'switch' | 'steam-deck';

export type GenreId = 'rpg' | 'fps' | 'roguelike' | 'indie' | 'strategy' | 'adventure';

export type BudgetCategory = 'free' | 'subscription' | 'paid';

export type SubscriptionOption = 'game-pass' | 'ps-plus';

export type PaidPriceLimit = 500 | 1500 | 'unlimited';

export type OnboardingStep = 1 | 2 | 3;

export interface OnboardingPreferences {
  platforms: PlatformId[];
  genres: GenreId[];
  budgetCategories: BudgetCategory[];
  subscriptions: SubscriptionOption[];
  paidPriceLimit: PaidPriceLimit | null;
}
