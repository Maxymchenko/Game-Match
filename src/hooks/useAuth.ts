import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getCurrentSession, onAuthStateChange } from '../api/auth';
import { isSupabaseConfigured } from '../api/supabase';

interface AuthState {
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: isSupabaseConfigured,
    error: null,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;
    getCurrentSession()
      .then((session) => {
        if (active) setState({ session, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            session: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Unable to load session.',
          });
        }
      });

    const subscription = onAuthStateChange((_event, session) => {
      if (active) setState({ session, loading: false, error: null });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
