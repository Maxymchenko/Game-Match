import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function AuthGate({ children }: { children?: ReactNode }) {
  const { session, loading, error } = useAuth();

  if (loading) {
    return (
      <main className="auth-page">
        <p className="auth-loading">Перевіряємо сесію…</p>
      </main>
    );
  }

  if (error || !session) {
    return <Navigate to="/auth" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default AuthGate;
