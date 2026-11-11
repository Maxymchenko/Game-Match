import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLogo from '../components/AppLogo';
import { gameCoverArtworks } from '../assets/gameArtwork';

function WelcomePage() {
  return (
    <motion.main
      className="welcome-page"
      aria-labelledby="welcome-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="welcome-frame">
        <header className="topbar welcome-topbar">
          <AppLogo />
          <span className="topbar-note">
            <span className="topbar-note__icon" aria-hidden="true" />
            Персональний простір гравця на ПК
          </span>
        </header>

        <section className="welcome-hero">
          <div className="welcome-copy">
            <p className="welcome-eyebrow">
              <span aria-hidden="true" />
              ТВОЯ НАСТУПНА ПРИГОДА
            </p>
            <div className="welcome-emblem" aria-hidden="true">
              <span className="welcome-emblem__tile">
                <svg viewBox="0 0 36 28" fill="none">
                  <path
                    d="M10 4h16a4.5 4.5 0 0 1 4.2 3.1l2.3 7.1a3.8 3.8 0 0 1-6.1 4l-3.3-2.7h-10l-3.3 2.7a3.8 3.8 0 0 1-6.1-4L6 7.1A4.5 4.5 0 0 1 10 4Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M11 8v6m-3-3h6m8-1h.01M25 12h.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="welcome-emblem__heart">♥</span>
            </div>
            <h1 id="welcome-title">
              Менше пошуку.
              <br />
              <span>Більше гри.</span>
            </h1>
            <p className="welcome-description">
              Відкривай ігри під свій смак.
              <br />
              Один свайп — і беклог стає планом.
            </p>
            <Link className="button button--primary welcome-cta" to="/onboarding/platforms">
              Знайти свою гру <span aria-hidden="true">→</span>
            </Link>
            <p className="welcome-caption">3 короткі кроки. Жодного зайвого вибору.</p>
          </div>

          <div className="landing-art" role="img" aria-label="Мозаїка з обкладинок відеоігор">
            <div className="cover-mosaic" aria-hidden="true">
              {gameCoverArtworks.map((cover, tile) => (
                <span className="cover-tile" key={cover.title}>
                  <img
                    src={cover.src}
                    alt=""
                    loading={tile < 10 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </span>
              ))}
            </div>
            <div className="landing-art__scrim" />
            <div className="landing-art__badge">
              <span />
              Ігри, які захоплюють саме тебе
            </div>
            <div className="landing-art__caption">
              <h2>Великий світ. Твій наступний матч.</h2>
              <div className="landing-art__chips">
                <span>▣ Твої платформи</span>
                <span>⌁ Твої жанри</span>
                <span>≡ Твій бюджет</span>
              </div>
            </div>
          </div>
        </section>

        <footer className="welcome-footer">
          <span>GameMatch · Знайди свою наступну гру</span>
          <span>
            Твій смак <b>→</b> твоя колода <b>→</b> твоя пригода
          </span>
        </footer>
      </div>
    </motion.main>
  );
}

export default WelcomePage;
