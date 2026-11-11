import baldursGate3 from '../assets/games/baldurs-gate-3.jpg';
import celeste from '../assets/games/celeste.jpg';
import civilization6 from '../assets/games/civilization-6.jpg';
import counterStrike2 from '../assets/games/counter-strike-2.jpg';
import cyberpunk2077 from '../assets/games/cyberpunk-2077.jpg';
import discoElysium from '../assets/games/disco-elysium.jpg';
import doomEternal from '../assets/games/doom-eternal.jpg';
import eldenRing from '../assets/games/elden-ring.jpg';
import hades from '../assets/games/hades.jpg';
import hollowKnight from '../assets/games/hollow-knight.jpg';
import noMansSky from '../assets/games/no-mans-sky.jpg';
import ori from '../assets/games/ori-and-the-will-of-the-wisps.jpg';
import portal2 from '../assets/games/portal-2.jpg';
import redDeadRedemption2 from '../assets/games/red-dead-redemption-2.jpg';
import residentEvil4 from '../assets/games/resident-evil-4.jpg';
import slayTheSpire from '../assets/games/slay-the-spire.jpg';
import stardewValley from '../assets/games/stardew-valley.jpg';
import subnautica from '../assets/games/subnautica.jpg';
import theWitcher3 from '../assets/games/the-witcher-3.jpg';
import totalWarWarhammer3 from '../assets/games/total-war-warhammer-3.jpg';
import type { Game } from '../types/game';

// Static frontend fixtures for the deck prototype; no API or recommendation logic is used.
const demoGames: Game[] = [
  {
    id: 'resident-evil-4',
    title: 'Resident Evil 4',
    image: residentEvil4,
    releaseYear: 2023,
    metacriticScore: 93,
    playtimeHours: 16,
    platforms: ['PC', 'PS5', 'Steam Deck'],
    genres: ['Екшен', 'Survival horror'],
    description: 'Леон вирушає до віддаленого селища, щоб знайти зниклу доньку президента.',
  },
  {
    id: 'elden-ring',
    title: 'ELDEN RING',
    image: eldenRing,
    releaseYear: 2022,
    metacriticScore: 96,
    playtimeHours: 59,
    platforms: ['PC', 'PS5', 'Xbox'],
    genres: ['RPG', 'Пригоди'],
    description: 'Відкритий фентезійний світ, загадкові персонажі та складні битви.',
  },
  {
    id: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    image: baldursGate3,
    releaseYear: 2023,
    metacriticScore: 96,
    playtimeHours: 75,
    platforms: ['PC', 'PS5', 'Xbox'],
    genres: ['RPG', 'Стратегія'],
    description: 'Створи загін, приймай складні рішення та зміни долю Забутих Королівств.',
  },
  {
    id: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    image: cyberpunk2077,
    releaseYear: 2020,
    metacriticScore: 86,
    playtimeHours: 26,
    platforms: ['PC', 'PS5', 'Xbox'],
    genres: ['RPG', 'Екшен'],
    description: 'Досліджуй Найт-Сіті й шукай власний шлях у світі майбутнього.',
  },
  {
    id: 'red-dead-redemption-2',
    title: 'Red Dead Redemption 2',
    image: redDeadRedemption2,
    releaseYear: 2019,
    metacriticScore: 97,
    playtimeHours: 50,
    platforms: ['PC', 'PlayStation', 'Xbox'],
    genres: ['Пригоди', 'Екшен'],
    description: 'Подорож Диким Заходом, де кожен вибір має наслідки.',
  },
  {
    id: 'the-witcher-3',
    title: 'The Witcher 3: Wild Hunt',
    image: theWitcher3,
    releaseYear: 2015,
    metacriticScore: 93,
    playtimeHours: 52,
    platforms: ['PC', 'PS5', 'Xbox', 'Nintendo Switch'],
    genres: ['RPG', 'Пригоди'],
    description: 'Вирушай на пошуки Цірі у великому світі, повному чудовиськ і таємниць.',
  },
  {
    id: 'hades',
    title: 'Hades',
    image: hades,
    releaseYear: 2020,
    metacriticScore: 93,
    playtimeHours: 22,
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    genres: ['Roguelike', 'Екшен'],
    description: 'Повторюй спроби втечі з підземного світу й знайомся з богами Олімпу.',
  },
  {
    id: 'hollow-knight',
    title: 'Hollow Knight',
    image: hollowKnight,
    releaseYear: 2017,
    metacriticScore: 90,
    playtimeHours: 27,
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    genres: ['Пригоди', 'Indie'],
    description: 'Досліджуй руїни підземного королівства, намальованого вручну.',
  },
  {
    id: 'stardew-valley',
    title: 'Stardew Valley',
    image: stardewValley,
    releaseYear: 2016,
    metacriticScore: 89,
    playtimeHours: 53,
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    genres: ['Indie', 'RPG'],
    description: 'Віднови ферму, познайомся із сусідами та облаштуй життя в долині.',
  },
  {
    id: 'celeste',
    title: 'Celeste',
    image: celeste,
    releaseYear: 2018,
    metacriticScore: 91,
    playtimeHours: 8,
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    genres: ['Indie', 'Пригоди'],
    description: 'Допоможи Мадлен піднятися на гору й подолати власні сумніви.',
  },
  {
    id: 'slay-the-spire',
    title: 'Slay the Spire',
    image: slayTheSpire,
    releaseYear: 2019,
    metacriticScore: 89,
    playtimeHours: 12,
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    genres: ['Roguelike', 'Стратегія'],
    description: 'Збирай колоду й прокладай новий маршрут крізь мінливу вежу.',
  },
  {
    id: 'disco-elysium',
    title: 'Disco Elysium: The Final Cut',
    image: discoElysium,
    releaseYear: 2019,
    metacriticScore: 91,
    playtimeHours: 24,
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    genres: ['RPG', 'Пригоди'],
    description: 'Розслідуй справу у місті, де навіть твої думки ведуть діалог.',
  },
  {
    id: 'portal-2',
    title: 'Portal 2',
    image: portal2,
    releaseYear: 2011,
    metacriticScore: 95,
    playtimeHours: 8,
    platforms: ['PC', 'PlayStation', 'Xbox'],
    genres: ['Пригоди', 'Indie'],
    description: 'Розв’язуй просторові головоломки за допомогою портальної гармати.',
  },
  {
    id: 'counter-strike-2',
    title: 'Counter-Strike 2',
    image: counterStrike2,
    releaseYear: 2023,
    platforms: ['PC'],
    genres: ['FPS', 'Стратегія'],
    description: 'Командні раунди, точність і тактика у класичному змагальному шутері.',
  },
  {
    id: 'doom-eternal',
    title: 'DOOM Eternal',
    image: doomEternal,
    releaseYear: 2020,
    metacriticScore: 88,
    playtimeHours: 15,
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    genres: ['FPS', 'Екшен'],
    description: 'Проривайся крізь демонічні орди у швидкому науково-фантастичному шутері.',
  },
  {
    id: 'total-war-warhammer-3',
    title: 'Total War: WARHAMMER III',
    image: totalWarWarhammer3,
    releaseYear: 2022,
    metacriticScore: 86,
    playtimeHours: 33,
    platforms: ['PC'],
    genres: ['Стратегія', 'RPG'],
    description: 'Керуй фракцією на глобальній мапі й веди армії у масштабні битви.',
  },
  {
    id: 'civilization-6',
    title: "Sid Meier's Civilization VI",
    image: civilization6,
    releaseYear: 2016,
    metacriticScore: 88,
    playtimeHours: 23,
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    genres: ['Стратегія'],
    description: 'Розвивай цивілізацію крізь епохи та визначай майбутнє свого народу.',
  },
  {
    id: 'ori-and-the-will-of-the-wisps',
    title: 'Ori and the Will of the Wisps',
    image: ori,
    releaseYear: 2020,
    metacriticScore: 88,
    playtimeHours: 11,
    platforms: ['PC', 'Xbox', 'Nintendo Switch'],
    genres: ['Пригоди', 'Indie'],
    description: 'Допоможи маленькому духу знайти дорогу крізь мальовничий ліс.',
  },
  {
    id: 'subnautica',
    title: 'Subnautica',
    image: subnautica,
    releaseYear: 2018,
    metacriticScore: 87,
    playtimeHours: 30,
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    genres: ['Пригоди', 'Survival'],
    description: 'Досліджуй океан чужої планети та шукай спосіб повернутися додому.',
  },
  {
    id: 'no-mans-sky',
    title: "No Man's Sky",
    image: noMansSky,
    releaseYear: 2016,
    metacriticScore: 83,
    playtimeHours: 30,
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    genres: ['Пригоди', 'Survival'],
    description: 'Відкривай планети, збирай ресурси й обирай власний шлях у космосі.',
  },
];

export function useRecommendations(): Game[] {
  return demoGames;
}
