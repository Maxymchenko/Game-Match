import type {
  BudgetCategory,
  GenreId,
  PlatformId,
  SubscriptionOption,
} from '../../types/preferences';
import pcMonitorIcon from '../../assets/platforms/pc-monitor.svg';
import playstationIcon from '../../assets/platforms/playstation.svg';
import xboxIcon from '../../assets/platforms/xbox.svg';
import nintendoSwitchIcon from '../../assets/platforms/nintendo-switch.svg';
import steamDeckIcon from '../../assets/platforms/steam-deck.svg';
import rpgArtwork from '../../assets/genres/rpg.svg';
import fpsArtwork from '../../assets/genres/fps.svg';
import roguelikeArtwork from '../../assets/genres/roguelike.svg';
import indieArtwork from '../../assets/genres/indie.svg';
import strategyArtwork from '../../assets/genres/strategy.svg';
import adventureArtwork from '../../assets/genres/adventure.svg';

const platformIcons: Record<PlatformId, string> = {
  pc: pcMonitorIcon,
  playstation: playstationIcon,
  xbox: xboxIcon,
  switch: nintendoSwitchIcon,
  'steam-deck': steamDeckIcon,
};

export const platforms: { id: PlatformId; name: string; detail: string; icon: string }[] = [
  { id: 'pc', name: 'PC', detail: 'Steam, Epic Games та інші', icon: platformIcons.pc },
  { id: 'playstation', name: 'PlayStation', detail: 'PS4 та PS5', icon: platformIcons.playstation },
  { id: 'xbox', name: 'Xbox', detail: 'Xbox One та Series X|S', icon: platformIcons.xbox },
  {
    id: 'switch',
    name: 'Nintendo Switch',
    detail: 'Switch та Switch 2',
    icon: platformIcons.switch,
  },
  {
    id: 'steam-deck',
    name: 'Steam Deck',
    detail: 'Твоя бібліотека з собою',
    icon: platformIcons['steam-deck'],
  },
];

export const genres: { id: GenreId; name: string; tagline: string; image: string }[] = [
  { id: 'rpg', name: 'RPG', tagline: 'Твоя роль. Твій світ.', image: rpgArtwork },
  { id: 'fps', name: 'FPS', tagline: 'На шаленій швидкості.', image: fpsArtwork },
  { id: 'roguelike', name: 'Roguelike', tagline: 'Ще одна спроба.', image: roguelikeArtwork },
  { id: 'indie', name: 'Indie', tagline: 'Маленькі відкриття.', image: indieArtwork },
  {
    id: 'strategy',
    name: 'Стратегія',
    tagline: 'Думай на крок вперед.',
    image: strategyArtwork,
  },
  {
    id: 'adventure',
    name: 'Пригоди',
    tagline: 'За межі знайомого.',
    image: adventureArtwork,
  },
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
