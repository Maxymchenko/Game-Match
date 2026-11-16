export type LibraryStatus =
  'skipped' | 'saved' | 'want_to_play' | 'playing' | 'completed' | 'owned';

export interface LibraryEntry {
  id: string;
  user_id: string;
  igdb_game_id: number;
  status: LibraryStatus;
  is_superlike: boolean;
  created_at: string;
  updated_at: string;
}
