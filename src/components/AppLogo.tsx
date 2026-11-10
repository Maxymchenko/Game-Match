import { Link } from 'react-router-dom';

interface AppLogoProps {
  compact?: boolean;
}

function AppLogo({ compact = false }: AppLogoProps) {
  return (
    <Link className={`app-logo${compact ? ' app-logo--compact' : ''}`} to="/welcome">
      <span className="app-logo__icon" aria-hidden="true">
        <svg viewBox="0 0 28 22" fill="none">
          <path
            d="M8 3.5h12a4 4 0 0 1 3.8 2.8l2.1 6.4a3.4 3.4 0 0 1-5.5 3.6l-3-2.4h-4.8l-3 2.4a3.4 3.4 0 0 1-5.5-3.6l2.1-6.4A4 4 0 0 1 8 3.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 7.5v5m-2.5-2.5h5m7-1h.01M21 11h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span>GameMatch</span>
    </Link>
  );
}

export default AppLogo;
