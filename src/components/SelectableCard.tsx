import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SelectableCardProps {
  selected: boolean;
  className?: string;
  onToggle: () => void;
  children: ReactNode;
}

function SelectableCard({ selected, className = '', onToggle, children }: SelectableCardProps) {
  return (
    <motion.button
      type="button"
      className={`selectable-card${selected ? ' is-selected' : ''} ${className}`}
      aria-pressed={selected}
      onClick={onToggle}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.16 }}
    >
      {children}
      <span className="selection-check" aria-hidden="true">
        {selected ? (
          <svg viewBox="0 0 16 16" fill="none">
            <path
              d="m3.5 8.2 2.8 2.7 6.2-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
    </motion.button>
  );
}

export default SelectableCard;
