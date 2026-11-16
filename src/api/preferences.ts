import type { OnboardingPreferences } from '../types/preferences';
import { requireSupabase } from './supabase';

interface PreferencesRow {
  user_id: string;
  platforms: string[];
  genres: string[];
  budget_categories: string[];
  subscriptions: string[];
  paid_price_limit: string | null;
}

export async function getPreferences(): Promise<OnboardingPreferences | null> {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) return null;

  const { data, error } = await client
    .from('preferences')
    .select('platforms, genres, budget_categories, subscriptions, paid_price_limit')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as Omit<PreferencesRow, 'user_id'>;
  const paidPriceLimit =
    row.paid_price_limit === '500' || row.paid_price_limit === '1500'
      ? (Number(row.paid_price_limit) as 500 | 1500)
      : row.paid_price_limit === 'unlimited'
        ? 'unlimited'
        : null;

  return {
    platforms: row.platforms as OnboardingPreferences['platforms'],
    genres: row.genres as OnboardingPreferences['genres'],
    budgetCategories: row.budget_categories as OnboardingPreferences['budgetCategories'],
    subscriptions: row.subscriptions as OnboardingPreferences['subscriptions'],
    paidPriceLimit,
  };
}

export async function savePreferences(preferences: OnboardingPreferences): Promise<void> {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('Sign in to save your preferences.');

  const { error } = await client.from('preferences').upsert(
    {
      user_id: userData.user.id,
      platforms: preferences.platforms,
      genres: preferences.genres,
      budget_categories: preferences.budgetCategories,
      subscriptions: preferences.subscriptions,
      paid_price_limit:
        preferences.paidPriceLimit === null ? null : String(preferences.paidPriceLimit),
    },
    { onConflict: 'user_id' },
  );

  if (error) throw error;
}
