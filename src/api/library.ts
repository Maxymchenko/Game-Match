import type { LibraryEntry, LibraryStatus } from '../types/library';
import { requireSupabase } from './supabase';

export async function getLibraryEntries(status?: LibraryStatus): Promise<LibraryEntry[]> {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) return [];

  let query = client
    .from('library_entries')
    .select('id, user_id, igdb_game_id, status, is_superlike, created_at, updated_at')
    .eq('user_id', userData.user.id)
    .order('updated_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as LibraryEntry[];
}

export async function saveLibraryEntry(
  igdbGameId: number,
  status: LibraryStatus,
  isSuperlike = false,
): Promise<void> {
  if (!Number.isSafeInteger(igdbGameId) || igdbGameId <= 0) {
    throw new Error('A valid IGDB game ID is required.');
  }

  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('Sign in to save games to your library.');

  const { error } = await client.from('library_entries').upsert(
    {
      user_id: userData.user.id,
      igdb_game_id: igdbGameId,
      status,
      is_superlike: isSuperlike,
    },
    { onConflict: 'user_id,igdb_game_id' },
  );
  if (error) throw error;
}

export async function removeLibraryEntry(igdbGameId: number): Promise<void> {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('Sign in to edit your library.');

  const { error } = await client
    .from('library_entries')
    .delete()
    .eq('user_id', userData.user.id)
    .eq('igdb_game_id', igdbGameId);
  if (error) throw error;
}
