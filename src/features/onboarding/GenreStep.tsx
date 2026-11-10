import SelectableCard from '../../components/SelectableCard';
import OnboardingPage from '../../pages/OnboardingPage';
import { useOnboardingStore } from '../../store/onboardingStore';
import { genres as genreOptions } from './onboardingOptions';

function GenreStep() {
  const selectedGenres = useOnboardingStore((state) => state.genres);
  const toggleGenre = useOnboardingStore((state) => state.toggleGenre);

  return (
    <OnboardingPage
      step={2}
      title="Що тебе захоплює?"
      description="Великі світи чи короткі забіги? Обери жанри, до яких хочеться повертатись."
      backTo="/onboarding/platforms"
      continueTo="/onboarding/budget"
      continueLabel="Далі: бюджет"
      canContinue={selectedGenres.length > 0}
    >
      <p className="selection-hint">ОБИРАЙ УСЕ, ЩО ПОДОБАЄТЬСЯ</p>
      <div className="genre-grid">
        {genreOptions.map((genre) => (
          <SelectableCard
            className={`genre-card genre-card--${genre.art}`}
            key={genre.id}
            selected={selectedGenres.includes(genre.id)}
            onToggle={() => toggleGenre(genre.id)}
          >
            <span className="genre-card__art" aria-hidden="true" />
            <span className="genre-card__shade" aria-hidden="true" />
            <span className="genre-card__copy">
              <strong>{genre.name}</strong>
              <small>{genre.tagline}</small>
            </span>
          </SelectableCard>
        ))}
      </div>
    </OnboardingPage>
  );
}

export default GenreStep;
