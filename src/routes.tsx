import { createBrowserRouter, Navigate } from 'react-router-dom';
import BudgetStep from './features/onboarding/BudgetStep';
import GenreStep from './features/onboarding/GenreStep';
import PlatformStep from './features/onboarding/PlatformStep';
import WelcomePage from './pages/WelcomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/welcome" replace />,
  },
  {
    path: '/welcome',
    element: <WelcomePage />,
  },
  {
    path: '/onboarding/platforms',
    element: <PlatformStep />,
  },
  {
    path: '/onboarding/genres',
    element: <GenreStep />,
  },
  {
    path: '/onboarding/budget',
    element: <BudgetStep />,
  },
  {
    path: '*',
    element: <Navigate to="/welcome" replace />,
  },
]);
