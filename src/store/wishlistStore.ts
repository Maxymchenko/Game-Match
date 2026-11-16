


import { create } from 'zustand';
import type { Game } from '../types/game';

interface WishlistState {
  games: Game[];
  superlikedIds: string[];
  addGame: (game: Game, isSuperlike: boolean) => void;
  removeGame: (gameId: string) => void;
  restoreGameState: (game: Game, wasLiked: boolean, wasSuperliked: boolean) => void;
  replaceGames: (games: Game[], superlikedIds: string[]) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()((set) => ({
      games: [],
      superlikedIds: [],
      addGame: (game, isSuperlike) =>
        set((state) => ({
          games: state.games.some((item) => item.id === game.id)
            ? state.games
            : [...state.games, game],
          superlikedIds:
            isSuperlike && !state.superlikedIds.includes(game.id)
              ? [...state.superlikedIds, game.id]
              : state.superlikedIds,
        })),
      removeGame: (gameId) =>
        set((state) => ({
          games: state.games.filter((game) => game.id !== gameId),
          superlikedIds: state.superlikedIds.filter((id) => id !== gameId),
        })),
      replaceGames: (games, superlikedIds) => set({ games, superlikedIds }),
      clear: () => set({ games: [], superlikedIds: [] }),
      restoreGameState: (game, wasLiked, wasSuperliked) =>
        set((state) => {
          const gamesWithoutTarget = state.games.filter((item) => item.id !== game.id);
          const superlikesWithoutTarget = state.superlikedIds.filter((id) => id !== game.id);

          return {
            games: wasLiked ? [...gamesWithoutTarget, game] : gamesWithoutTarget,
            superlikedIds: wasSuperliked
              ? [...superlikesWithoutTarget, game.id]
              : superlikesWithoutTarget,
          };
        }),
    }));
