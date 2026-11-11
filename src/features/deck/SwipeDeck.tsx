import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Game } from '../../types/game';
import ActionButtons from './ActionButtons';
import type { SwipeAction } from './ActionButtons';
import GameCard from './GameCard';

interface SwipeDeckProps {
  games: Game[];
  currentIndex: number;
  canUndo: boolean;
  isPaused?: boolean;
  onAction: (action: SwipeAction) => void;
  onUndo: () => void;
  onRestart: () => void;
  onClearSearch: () => void;
}

function SwipeDeck({
  games,
  currentIndex,
  canUndo,
  isPaused = false,
  onAction,
  onUndo,
  onRestart,
  onClearSearch,
}: SwipeDeckProps) {
  const activeGame = games[currentIndex];
  const [swipeDirection, setSwipeDirection] = useState<-1 | 1>(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const busyRef = useRef(false);

  const requestSwipe = useCallback(
    (action: SwipeAction) => {
      if (!activeGame || busyRef.current) return;

      busyRef.current = true;
      setSwipeDirection(action === 'skip' ? -1 : 1);
      setIsAnimating(true);
      onAction(action);
    },
    [activeGame, onAction],
  );

  const requestUndo = useCallback(() => {
    if (!canUndo || busyRef.current) return;

    busyRef.current = true;
    setSwipeDirection(1);
    setIsAnimating(true);
    onUndo();
  }, [canUndo, onUndo]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isEditing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest('input, textarea, select, [contenteditable="true"]'));

      if (isPaused || isEditing || event.repeat || event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
        event.preventDefault();
        requestSwipe('skip');
      } else if (event.code === 'KeyD' || event.code === 'ArrowRight') {
        event.preventDefault();
        requestSwipe('like');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, requestSwipe]);

  const visiblePosition = games.length ? Math.min(currentIndex + 1, games.length) : 0;
  const activeDot = games.length ? Math.min(4, Math.floor((currentIndex / games.length) * 5)) : -1;

  return (
    <>
      {activeGame || isAnimating ? (
        <section className="deck-stage" aria-label="Колода ігор">
          {activeGame ? (
            <ActionButtons
              disabled={isAnimating}
              canUndo={canUndo}
              onSkip={() => requestSwipe('skip')}
              onLike={() => requestSwipe('like')}
              onSuperlike={() => requestSwipe('superlike')}
              onUndo={requestUndo}
            />
          ) : null}
          <div className="deck-card-stack">
            {games[currentIndex + 2] ? (
              <div
                className="deck-card-stack__back deck-card-stack__back--far"
                aria-hidden="true"
              />
            ) : null}
            {games[currentIndex + 1] ? (
              <div
                className="deck-card-stack__back deck-card-stack__back--near"
                aria-hidden="true"
              />
            ) : null}
            <AnimatePresence
              initial={false}
              custom={swipeDirection}
              onExitComplete={() => {
                busyRef.current = false;
                setIsAnimating(false);
              }}
              mode="sync"
            >
              {activeGame ? (
                <GameCard
                  key={activeGame.id}
                  game={activeGame}
                  swipeDirection={swipeDirection}
                  onSwipe={requestSwipe}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </section>
      ) : null}

      {!activeGame && !isAnimating && (
        <section className="deck-empty-state" aria-live="polite">
          <span className="deck-empty-state__symbol" aria-hidden="true">
            {games.length ? '✓' : '⌕'}
          </span>
          <h2>{games.length ? 'Це всі ігри в колоді' : 'За цим запитом ігор немає'}</h2>
          <p>
            {games.length
              ? 'Переглянь уподобані ігри або почни перегляд колоди ще раз.'
              : 'Спробуй іншу назву або очисть пошук.'}
          </p>
          <button
            className="deck-button deck-button--primary"
            type="button"
            onClick={games.length ? onRestart : onClearSearch}
          >
            {games.length ? 'Почати знову' : 'Очистити пошук'}
          </button>
        </section>
      )}

      {activeGame ? (
        <div className="deck-progress" aria-label={`Гра ${visiblePosition} з ${games.length}`}>
          <div className="deck-progress__dots" aria-hidden="true">
            {Array.from({ length: 5 }, (_, dot) => (
              <span className={dot === activeDot ? 'is-active' : ''} key={dot} />
            ))}
          </div>
          <span>
            {visiblePosition} з {games.length}
          </span>
        </div>
      ) : null}
    </>
  );
}

export default SwipeDeck;
