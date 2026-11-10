import type { OnboardingStep } from '../../types/preferences';

interface ProgressBarProps {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
}

const steps: { number: OnboardingStep; label: string }[] = [
  { number: 1, label: 'Платформи' },
  { number: 2, label: 'Жанри' },
  { number: 3, label: 'Бюджет' },
];

function ProgressBar({ currentStep, completedSteps }: ProgressBarProps) {
  return (
    <nav className="progress-nav" aria-label="Прогрес онбордингу">
      {steps.map(({ number, label }) => {
        const isCurrent = currentStep === number;
        const isComplete = completedSteps.includes(number);

        return (
          <div
            className={`progress-step${isCurrent ? ' is-current' : ''}${isComplete ? ' is-complete' : ''}`}
            aria-current={isCurrent ? 'step' : undefined}
            key={number}
          >
            <span className="progress-step__number" aria-hidden="true">
              {isComplete ? (
                <svg viewBox="0 0 16 16" fill="none">
                  <path
                    d="m3.5 8.2 2.8 2.7 6.2-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                `0${number}`
              )}
            </span>
            <span className="progress-step__label">{label}</span>
          </div>
        );
      })}
    </nav>
  );
}

export default ProgressBar;
