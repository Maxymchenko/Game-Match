import { requireSupabase } from './supabase';
import type { Game } from '../types/game';
import type { IgdbGame } from '../types/igdb';

async function invokeIgdb(
  body: { mode: 'popular'; offset?: number } | { mode: 'search'; search: string },
) {
  const { data, error } = await requireSupabase().functions.invoke<IgdbGame[]>('igdb', {
    body,
  });

  if (error) throw error;
  return data ?? [];
}

function toGame(game: IgdbGame): Game {
  const rawCover = game.cover?.url;
  const image = rawCover
    ? (rawCover.startsWith('//') ? `https:${rawCover}` : rawCover).replace(
        '/t_thumb/',
        '/t_cover_big/',
      )
    : undefined;

  return {
    id: String(game.id),
    igdbId: game.id,
    title: game.name,
    image,
    releaseYear: game.first_release_date
      ? new Date(game.first_release_date * 1000).getUTCFullYear()
      : undefined,
    rating: game.aggregated_rating,
    platforms: game.platforms?.map((platform) => platform.name) ?? [],
    genres: game.genres?.map((genre) => genre.name) ?? [],
    themes: game.themes?.map((theme) => theme.name) ?? [],
    keywords: game.keywords?.map((keyword) => keyword.name) ?? [],
    playerPerspectives: game.player_perspectives?.map((perspective) => perspective.name) ?? [],
    description: game.summary?.trim() || 'Опис цієї гри поки недоступний.',
  };
}

export async function getRecommendedGames(offset = 0): Promise<Game[]> {
  const games = await invokeIgdb({ mode: 'popular', offset });
  return games.map(toGame);
}

export async function searchIgdbGames(search: string): Promise<Game[]> {
  const normalizedSearch = search.trim();
  if (!normalizedSearch) return [];
  if (normalizedSearch.length > 100) {
    throw new Error('Search text must be 100 characters or fewer.');
  }

  const games = await invokeIgdb({ mode: 'search', search: normalizedSearch });
  return games.map(toGame);
}
