import { useCallback, useEffect, useRef, useState } from 'react';
import { getRecommendedGames } from '../api/igdb';
import type { Game } from '../types/game';

interface RecommendationsState {
  games: Game[];
  loading: boolean;
  error: string | null;
}

const PAGE_SIZE = 40;
const MAX_OFFSET = 500;

export function useRecommendations() {
  const offsetRef = useRef(0);
  const seenIdsRef = useRef(new Set<number>());
  const [state, setState] = useState<RecommendationsState>({
    games: [],
    loading: true,
    error: null,
  });

  const refresh = useCallback(async (
    nextBatch = false,
    matches: (game: Game) => boolean = () => true,
  ) => {
    let nextOffset = nextBatch
      ? (offsetRef.current + PAGE_SIZE > MAX_OFFSET ? 0 : offsetRef.current + PAGE_SIZE)
      : offsetRef.current;
    setState((previous) => ({ ...previous, loading: true, error: null }));

    try {
      const selectedGames: Game[] = [];
      let pagesChecked = 0;
      let wrapped = false;

      while (selectedGames.length < PAGE_SIZE && pagesChecked <= MAX_OFFSET / PAGE_SIZE) {
        const page = await getRecommendedGames(nextOffset);
        if (page.length === 0) {
          if (nextOffset !== 0 && !wrapped) {
            nextOffset = 0;
            wrapped = true;
            continue;
          }
          break;
        }

        for (const game of page) {
          const alreadySeen = seenIdsRef.current.has(game.igdbId);
          seenIdsRef.current.add(game.igdbId);
          if ((!nextBatch || !alreadySeen) && matches(game)) selectedGames.push(game);
        }

        offsetRef.current = nextOffset;
        pagesChecked += 1;
        nextOffset += PAGE_SIZE;

        if (nextOffset > MAX_OFFSET) {
          if (wrapped) break;
          nextOffset = 0;
          wrapped = true;
        }
      }

      // On initial load show the first fetched page; on restart show only unseen matches.
      const games = nextBatch ? selectedGames : selectedGames.slice(0, PAGE_SIZE);
      offsetRef.current = nextOffset;
      setState({ games, loading: false, error: null });
      return games;
    } catch (error) {
      setState((previous) => ({
        ...previous,
        loading: false,
        error: error instanceof Error ? error.message : 'Не вдалося завантажити каталог IGDB.',
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
