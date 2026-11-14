import { createBrowserRouter, Navigate } from 'react-router-dom';
import BudgetStep from './features/onboarding/BudgetStep';
import GenreStep from './features/onboarding/GenreStep';
import PlatformStep from './features/onboarding/PlatformStep';
import DeckPage from './pages/DeckPage';
import WelcomePage from './pages/WelcomePage';
import WishlistPage from './pages/WishlistPage';

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
    path: '/deck',
    element: <DeckPage />,
  },
  {
    path: '/wishlist',
    element: <WishlistPage />,
  },
  {
    path: '*',
    element: <Navigate to="/welcome" replace />,
  },
]);
