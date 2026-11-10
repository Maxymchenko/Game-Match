import type {
  BudgetCategory,
  GenreId,
  PlatformId,
  SubscriptionOption,
} from '../../types/preferences';

export const platforms: { id: PlatformId; name: string; detail: string; symbol: string }[] = [
  { id: 'pc', name: 'PC', detail: 'Steam, Epic Games та інші', symbol: 'PC' },
  { id: 'playstation', name: 'PlayStation', detail: 'PS4 та PS5', symbol: 'PS' },
  { id: 'xbox', name: 'Xbox', detail: 'Xbox One та Series X|S', symbol: 'X' },
  { id: 'switch', name: 'Nintendo Switch', detail: 'Switch та Switch 2', symbol: 'NS' },
  { id: 'steam-deck', name: 'Steam Deck', detail: 'Твоя бібліотека з собою', symbol: 'SD' },
];

export const genres: { id: GenreId; name: string; tagline: string; art: string }[] = [
  { id: 'rpg', name: 'RPG', tagline: 'Твоя роль. Твій світ.', art: 'rpg' },
  { id: 'fps', name: 'FPS', tagline: 'На віртій швидкості.', art: 'fps' },
  { id: 'roguelike', name: 'Roguelike', tagline: 'Ще одна спроба.', art: 'roguelike' },
  { id: 'indie', name: 'Indie', tagline: 'Маленькі відкриття.', art: 'indie' },
  { id: 'strategy', name: 'Стратегія', tagline: 'Думай на крок вперед.', art: 'strategy' },
  { id: 'adventure', name: 'Пригоди', tagline: 'За межі знайомого.', art: 'adventure' },
];

export const budgetCategories: {
  id: BudgetCategory;
  name: string;
  detail: string;
  icon: string;
}[] = [
  { id: 'free', name: 'Безкоштовні', detail: 'Free-to-play — без покупки гри', icon: 'gift' },
  {
    id: 'subscription',
    name: 'За підпискою',
    detail: 'Game Pass, PS Plus та інші каталоги',
    icon: 'subscription',
  },
  { id: 'paid', name: 'Платні ігри', detail: 'Разова покупка. Твій ліміт на гру:', icon: 'wallet' },
];

export const subscriptions: { id: SubscriptionOption; name: string }[] = [
  { id: 'game-pass', name: 'Game Pass' },
  { id: 'ps-plus', name: 'PS Plus' },
];

export const paidPriceLimits = [
  { id: 500, label: 'До 500 ₴' },
  { id: 1500, label: 'До 1 500 ₴' },
  { id: 'unlimited', label: 'Без ліміту' },
] as const;
