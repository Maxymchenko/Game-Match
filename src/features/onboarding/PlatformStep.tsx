import SelectableCard from '../../components/SelectableCard';
import OnboardingPage from '../../pages/OnboardingPage';
import { useOnboardingStore } from '../../store/onboardingStore';
import { platforms as platformOptions } from './onboardingOptions';

function PlatformStep() {
  const selectedPlatforms = useOnboardingStore((state) => state.platforms);
  const togglePlatform = useOnboardingStore((state) => state.togglePlatform);

  return (
    <OnboardingPage
      step={1}
      title="Де ти граєш?"
      description="Обери свої платформи. Покажемо ігри, які справді можна запустити."
      backTo="/welcome"
      continueTo="/onboarding/genres"
      continueLabel="Далі: жанри"
      canContinue={selectedPlatforms.length > 0}
    >
      <p className="selection-hint">МОЖНА ОБРАТИ КІЛЬКА</p>
      <div className="platform-grid">
        {platformOptions.map((platform) => (
          <SelectableCard
            className="platform-card"
            key={platform.id}
            selected={selectedPlatforms.includes(platform.id)}
            onToggle={() => togglePlatform(platform.id)}
          >
            <span className={`platform-glyph platform-glyph--${platform.id}`} aria-hidden="true">
              <img src={platform.icon} alt="" />
            </span>
            <span className="platform-card__copy">
              <strong>{platform.name}</strong>
              <small>{platform.detail}</small>
            </span>
          </SelectableCard>
        ))}
        <div className="platform-note">
          <span className="platform-note__sparkle" aria-hidden="true">
            ✦
          </span>
          <div>
            <strong>Одна колода для всіх платформ</strong>
            <p>Улюблені ігри та платформи завжди поруч.</p>
          </div>
        </div>
      </div>
    </OnboardingPage>
  );
}

export default PlatformStep;
