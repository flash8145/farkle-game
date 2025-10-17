'use client';

import * as React from 'react';

// ============================================
// TYPES
// ============================================

export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface DiceProps {
  value: DiceValue;
  isRolling?: boolean;
  isScoring?: boolean;
  isHotDice?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ============================================
// DICE COMPONENT
// ============================================

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling = false,
  isScoring = false,
  isHotDice = false,
  isSelected = false,
  onClick,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const dotSizeStyles = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const baseStyles = 'rounded-lg border-2 transition-all duration-300 cursor-pointer relative';
  
  const normalStyles = 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:shadow-lg';
  const scoringStyles = 'bg-green-50 dark:bg-green-900/20 border-green-500 ring-4 ring-green-500/50';
  const hotDiceStyles = 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 ring-4 ring-yellow-500/50 animate-hot-pulse';
  const selectedStyles = 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 ring-4 ring-purple-500/50';
  const disabledStyles = 'opacity-50 cursor-not-allowed';

  const getStateStyles = () => {
    if (disabled) return disabledStyles;
    if (isHotDice) return hotDiceStyles;
    if (isSelected) return selectedStyles;
    if (isScoring) return scoringStyles;
    return normalStyles;
  };

  const animationClass = isRolling ? 'animate-dice-roll' : '';

  return (
    <div
      className={`${baseStyles} ${sizeStyles[size]} ${getStateStyles()} ${animationClass} ${className}`}
      onClick={!disabled && onClick ? onClick : undefined}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Dice showing ${value}`}
      aria-pressed={isSelected}
      aria-disabled={disabled}
    >
      {/* Dice Dots */}
      <div className="w-full h-full p-2 flex items-center justify-center">
        <DiceDots value={value} size={dotSizeStyles[size]} />
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Hot Dice Indicator */}
      {isHotDice && (
        <div className="absolute -top-2 -right-2 text-yellow-500">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

// ============================================
// DICE DOTS COMPONENT
// ============================================

interface DiceDotsProps {
  value: DiceValue;
  size: string;
}

const DiceDots: React.FC<DiceDotsProps> = ({ value, size }) => {
  const dotClass = `${size} rounded-full bg-gray-900 dark:bg-white`;

  const layouts: Record<DiceValue, React.ReactNode> = {
    1: (
      <div className="w-full h-full flex items-center justify-center">
        <div className={dotClass} />
      </div>
    ),
    2: (
      <div className="w-full h-full flex items-center justify-between">
        <div className={dotClass} />
        <div className={dotClass} />
      </div>
    ),
    3: (
      <div className="w-full h-full flex flex-col justify-between">
        <div className="flex justify-start">
          <div className={dotClass} />
        </div>
        <div className="flex justify-center">
          <div className={dotClass} />
        </div>
        <div className="flex justify-end">
          <div className={dotClass} />
        </div>
      </div>
    ),
    4: (
      <div className="w-full h-full grid grid-cols-2 gap-2">
        <div className={dotClass} />
        <div className={dotClass} />
        <div className={dotClass} />
        <div className={dotClass} />
      </div>
    ),
    5: (
      <div className="w-full h-full grid grid-cols-2 gap-2">
        <div className={dotClass} />
        <div className={dotClass} />
        <div className="col-span-2 flex justify-center">
          <div className={dotClass} />
        </div>
        <div className={dotClass} />
        <div className={dotClass} />
      </div>
    ),
    6: (
      <div className="w-full h-full grid grid-cols-2 gap-2">
        <div className={dotClass} />
        <div className={dotClass} />
        <div className={dotClass} />
        <div className={dotClass} />
        <div className={dotClass} />
        <div className={dotClass} />
      </div>
    ),
  };

  return layouts[value];
};

// ============================================
// DICE PLACEHOLDER (for empty slots)
// ============================================

interface DicePlaceholderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DicePlaceholder: React.FC<DicePlaceholderProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  return (
    <div
      className={`${sizeStyles[size]} rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 ${className}`}
      aria-hidden="true"
    />
  );
};

// ============================================
// DICE GROUP (Container for multiple dice)
// ============================================

interface DiceGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const DiceGroup: React.FC<DiceGroupProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap gap-3 justify-center ${className}`}>
      {children}
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default Dice;