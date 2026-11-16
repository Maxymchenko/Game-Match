import type { KeyboardEvent, Ref } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onEscape: () => void;
  inputRef: Ref<HTMLInputElement>;
}

function SearchBar({ value, onChange, onClear, onEscape, inputRef }: SearchBarProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onEscape();
    }
  }

  return (
    <div className="game-search" role="search">
      <svg className="game-search__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="10.8" cy="10.8" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        value={value}
        placeholder="Введи назву гри..."
        aria-label="Пошук за назвою, жанром або платформою"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <kbd className="game-search__shortcut" aria-label="Ctrl плюс K">
        <span>Ctrl</span>
        <span>K</span>
      </kbd>
      <button
        className="game-search__clear"
        type="button"
        aria-label="Очистити пошук"
        onClick={onClear}
        disabled={!value}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m6 6 12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default SearchBar;
