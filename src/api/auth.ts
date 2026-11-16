import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { requireSupabase } from './supabase';

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await requireSupabase().auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await requireSupabase().auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut(): Promise<void> {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  return requireSupabase().auth.onAuthStateChange(callback).data.subscription;
}

export type AuthUser = User;
