import { create } from 'zustand';
import type {
  BudgetCategory,
  GenreId,
  OnboardingPreferences,
  PaidPriceLimit,
  PlatformId,
  SubscriptionOption,
} from '../types/preferences';

interface OnboardingStore extends OnboardingPreferences {
  togglePlatform: (platform: PlatformId) => void;
  toggleGenre: (genre: GenreId) => void;
  toggleBudgetCategory: (category: BudgetCategory) => void;
  toggleSubscription: (subscription: SubscriptionOption) => void;
  setPaidPriceLimit: (limit: PaidPriceLimit) => void;
  resetPreferences: () => void;
}

const initialPreferences: OnboardingPreferences = {
  platforms: [],
  genres: [],
  budgetCategories: [],
  subscriptions: [],
  paidPriceLimit: null,
};

function toggleValue<Value>(values: Value[], value: Value): Value[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  ...initialPreferences,
  togglePlatform: (platform) =>
    set((state) => ({ platforms: toggleValue(state.platforms, platform) })),
  toggleGenre: (genre) => set((state) => ({ genres: toggleValue(state.genres, genre) })),
  toggleBudgetCategory: (category) =>
    set((state) => {
      const isSelected = state.budgetCategories.includes(category);

      return {
        budgetCategories: toggleValue(state.budgetCategories, category),
        subscriptions: isSelected && category === 'subscription' ? [] : state.subscriptions,
        paidPriceLimit: isSelected && category === 'paid' ? null : state.paidPriceLimit,
      };
    }),
  toggleSubscription: (subscription) =>
    set((state) => ({ subscriptions: toggleValue(state.subscriptions, subscription) })),
  setPaidPriceLimit: (limit) => set({ paidPriceLimit: limit }),
  resetPreferences: () => set(initialPreferences),
}));
