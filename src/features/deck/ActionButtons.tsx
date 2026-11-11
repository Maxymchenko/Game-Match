interface ActionButtonsProps {
  disabled?: boolean;
  canUndo: boolean;
  onSkip: () => void;
  onLike: () => void;
  onSuperlike: () => void;
  onUndo: () => void;
}

export type SwipeAction = 'skip' | 'like' | 'superlike';

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.8 8.7c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m12 2 2.1 7.1L21 12l-6.9 2.1L12 21l-2.1-6.9L3 12l6.9-2.9L12 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z" fill="currentColor" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 14 4 9l5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 9h8a7 7 0 1 1 0 14h-1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ActionButtons({
  disabled = false,
  canUndo,
  onSkip,
  onLike,
  onSuperlike,
  onUndo,
}: ActionButtonsProps) {
  return (
    <>
      <button
        className="swipe-side-action swipe-side-action--skip"
        type="button"
        aria-label="Пропустити гру"
        onClick={onSkip}
        disabled={disabled}
      >
        <span className="swipe-side-action__icon">
          <CrossIcon />
        </span>
        <span className="swipe-side-action__label">Пропустити</span>
        <kbd>← &nbsp; A</kbd>
      </button>
      <button
        className="swipe-side-action swipe-side-action--like"
        type="button"
        aria-label="Додати гру до списку «Хочу грати»"
        onClick={onLike}
        disabled={disabled}
      >
        <span className="swipe-side-action__icon">
          <HeartIcon />
        </span>
        <span className="swipe-side-action__label">Хочу грати</span>
        <kbd>→ &nbsp; D</kbd>
      </button>

      <div className="swipe-mobile-actions" aria-label="Дії з грою">
        <button
          className="swipe-mobile-action swipe-mobile-action--undo"
          type="button"
          aria-label="Повернути попередню гру"
          onClick={onUndo}
          disabled={disabled || !canUndo}
        >
          <UndoIcon />
          <span>Назад</span>
        </button>
        <button
          className="swipe-mobile-action swipe-mobile-action--skip"
          type="button"
          aria-label="Пропустити гру"
          onClick={onSkip}
          disabled={disabled}
        >
          <CrossIcon />
          <span>Пропустити</span>
        </button>
        <button
          className="swipe-mobile-action swipe-mobile-action--superlike"
          type="button"
          aria-label="Суперлайк: додати до списку «Хочу грати»"
          onClick={onSuperlike}
          disabled={disabled}
        >
          <SparkleIcon />
          <span>Зберегти</span>
        </button>
        <button
          className="swipe-mobile-action swipe-mobile-action--like"
          type="button"
          aria-label="Додати гру до списку «Хочу грати»"
          onClick={onLike}
          disabled={disabled}
        >
          <HeartIcon />
          <span>Хочу грати</span>
        </button>
      </div>
    </>
  );
}

export default ActionButtons;
