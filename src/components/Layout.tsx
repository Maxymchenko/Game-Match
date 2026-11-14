import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import AppLogo from './AppLogo';
import BottomNav from './BottomNav';

interface LayoutProps {
  activePage: 'deck' | 'wishlist';
  breadcrumb: string;
  children: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchLabel?: string;
  mobileActions?: ReactNode;
  notificationOpen?: boolean;
  onNotificationOpenChange?: (open: boolean) => void;
}

function Layout({
  activePage,
  breadcrumb,
  children,
  searchValue = '',
  onSearchChange,
  searchLabel = 'Знайти гру',
  mobileActions,
  notificationOpen,
  onNotificationOpenChange,
}: LayoutProps) {
  const [internalNotificationOpen, setInternalNotificationOpen] = useState(false);
  const isNotificationsOpen = notificationOpen ?? internalNotificationOpen;

  const changeNotificationOpen = useCallback(
    (open: boolean) => {
      if (notificationOpen === undefined) setInternalNotificationOpen(open);
      onNotificationOpenChange?.(open);
    },
    [notificationOpen, onNotificationOpenChange],
  );

  useEffect(() => {
    if (!isNotificationsOpen) return undefined;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') changeNotificationOpen(false);
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [changeNotificationOpen, isNotificationsOpen]);

  return (
    <div className="deck-app">
      <aside className="deck-sidebar" aria-label="Основна навігація">
        <div className="deck-sidebar__brand">
          <AppLogo />
        </div>
        <p className="deck-sidebar__kicker">ТВІЙ ІГРОВИЙ ПРОСТІР</p>
        <nav className="deck-nav">
          <Link
            className={`deck-nav__item${activePage === 'deck' ? ' is-active' : ''}`}
            to="/deck"
            aria-current={activePage === 'deck' ? 'page' : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 4h10l4 5-9 11L3 9l4-5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="m3 9 9 4 9-4M8 4l4 9 4-9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span>Колода</span>
            {activePage === 'deck' ? <i aria-hidden="true" /> : null}
          </Link>
          <span className="deck-nav__item" aria-disabled="true">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="m16 16 4.3 4.3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span>Пошук</span>
          </span>
          <Link
            className={`deck-nav__item${activePage === 'wishlist' ? ' is-active' : ''}`}
            to="/wishlist"
            aria-current={activePage === 'wishlist' ? 'page' : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.7L6 21V4.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            <span>Хочу грати</span>
            {activePage === 'wishlist' ? <i aria-hidden="true" /> : null}
          </Link>
          <span className="deck-nav__item" aria-disabled="true">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M4.5 20a7.5 7.5 0 0 1 15 0v1h-15v-1Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            <span>Профіль</span>
          </span>
        </nav>

        <div className="deck-sidebar__bottom">
          <div className="deck-sidebar-promo">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="4"
                width="18"
                height="13"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M8 21h8m-4-4v4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <strong>Твій світ PC-рейтингу</strong>
            <p>Улюблені ігри та платформи завжди поруч.</p>
          </div>
          <div className="deck-user">
            <span className="deck-avatar" aria-hidden="true">
              GM
            </span>
            <span>
              <strong>Гравець GameMatch</strong>
              <small>Твій ігровий простір</small>
            </span>
          </div>
        </div>
      </aside>

      <div className="deck-workspace">
        <header className="deck-topbar">
          <div className="deck-breadcrumb">
            <span>Мій простір</span>
            <i>/</i>
            <strong>{breadcrumb}</strong>
          </div>
          <div className="deck-topbar__mobile-brand">
            <AppLogo compact />
          </div>
          <div className="deck-topbar__tools">
            <label className="deck-search">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="m13.2 13.2 4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="search"
                placeholder="Знайти гру..."
                aria-label={searchLabel}
                value={searchValue}
                onChange={(event) => onSearchChange?.(event.target.value)}
              />
            </label>
            <button
              className="deck-icon-button deck-notification-trigger"
              type="button"
              aria-label="Сповіщення"
              aria-expanded={isNotificationsOpen}
              onClick={() => changeNotificationOpen(!isNotificationsOpen)}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 13h4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="deck-avatar deck-avatar--top" aria-label="Профіль гравця">
              GM
            </span>
          </div>
          <div className="deck-topbar__mobile-actions">
            {mobileActions}
            <span className="deck-avatar deck-avatar--top" aria-label="Профіль гравця">
              GM
            </span>
          </div>
        </header>
        {children}
      </div>
      <BottomNav activePage={activePage} />

      {isNotificationsOpen ? (
        <div
          className="deck-overlay deck-overlay--notice"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && changeNotificationOpen(false)
          }
        >
          <section
            className="deck-dialog deck-dialog--notice"
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-notice-title"
          >
            <button
              className="deck-dialog__close"
              type="button"
              aria-label="Закрити сповіщення"
              onClick={() => changeNotificationOpen(false)}
            >
              ×
            </button>
            <p className="deck-dialog__eyebrow">СПОВІЩЕННЯ</p>
            <h2 id="app-notice-title">Поки тихо</h2>
            <p>Нові ігри з’являтимуться тут у наступних версіях GameMatch.</p>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default Layout;
