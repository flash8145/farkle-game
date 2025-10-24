'use client';

import * as React from 'react';
import { DiceValue } from '@/types/game';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/components/ui/toast-notification';
import { GameStatus } from '@/types/game';

// ============================================
// DICE COMPONENT
// ============================================

interface DiceProps {
  value: DiceValue;
  isRolling?: boolean;
  isScoring?: boolean;
  isHotDice?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Dice: React.FC<DiceProps> = ({
  value,
  isRolling = false,
  isScoring = false,
  isHotDice = false,
  size = 'lg',
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        rounded-xl border-2 bg-white dark:bg-slate-800 
        flex items-center justify-center p-3
        transition-all duration-300
        ${isRolling ? 'animate-dice-roll' : ''}
        ${isScoring ? 'ring-4 ring-green-500/50 border-green-500' : 'border-slate-600'}
        ${isHotDice ? 'ring-4 ring-amber-500 border-amber-500 animate-hot-pulse' : ''}
      `}
    >
      <DiceDots value={value} size={dotSizeClasses[size]} />
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
  const dotClass = `${size} rounded-full bg-slate-900 dark:bg-white`;

  const layouts: Record<DiceValue, React.ReactNode> = {
    1: (
      <div className="w-full h-full flex items-center justify-center">
        <div className={dotClass} />
      </div>
    ),
    2: (
      <div className="w-full h-full flex items-center justify-between px-2">
        <div className={dotClass} />
        <div className={dotClass} />
      </div>
    ),
    3: (
      <div className="w-full h-full flex flex-col justify-between py-1">
        <div className="flex justify-start pl-2">
          <div className={dotClass} />
        </div>
        <div className="flex justify-center">
          <div className={dotClass} />
        </div>
        <div className="flex justify-end pr-2">
          <div className={dotClass} />
        </div>
      </div>
    ),
    4: (
      <div className="w-full h-full grid grid-cols-2 gap-2 p-2">
        <div className={dotClass} />
        <div className={dotClass} />
        <div className={dotClass} />
        <div className={dotClass} />
      </div>
    ),
    5: (
      <div className="w-full h-full grid grid-cols-2 gap-2 p-2">
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
      <div className="w-full h-full grid grid-cols-2 gap-2 p-2">
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
// DICE PLACEHOLDER
// ============================================

const DicePlaceholder: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'lg' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        rounded-xl border-2 border-dashed border-slate-600 
        bg-slate-800/30
      `}
    />
  );
};

// ============================================
// MAIN DICE AREA COMPONENT
// ============================================

export default function DiceArea() {
  const { 
    gameState, 
    rollDice, 
    bankPoints, 
    isMyTurn,
    diceAnimationState,
    isLoading 
  } = useGame();
  const { addToast } = useToast();

  // Get current player
  const currentPlayer = gameState?.players.find(p => p.isCurrentTurn);
  const myTurnScore = currentPlayer?.currentTurnScore || 0;
  const availableDice = gameState?.availableDice || 6;

  // Get dice values from animation state or use placeholders
  const hasRolledDice = diceAnimationState.diceValues.length > 0;
  const diceValues = hasRolledDice 
    ? diceAnimationState.diceValues 
    : Array(availableDice).fill(1);
  
  // Use actual rolled dice count, not availableDice when we have rolled dice
  const diceToRender = hasRolledDice ? diceAnimationState.diceValues.length : availableDice;

  // Debug logging
  console.log('🎲 DiceArea Render:', {
    availableDice,
    hasRolledDice,
    diceValuesLength: diceAnimationState.diceValues.length,
    diceToRender,
    diceValues,
    animationState: diceAnimationState,
    isMyTurn: isMyTurn(),
  });

  const handleRoll = async () => {
    if (!isMyTurn()) {
      addToast({ type: 'error', title: 'Not Your Turn', message: 'Wait for your turn to roll!' });
      return;
    }

    try {
      await rollDice(availableDice);
      addToast({ type: 'success', title: 'Dice Rolled!', message: 'Good luck with your roll!' });
    } catch (err) {
      console.error('Roll error:', err);
      addToast({ type: 'error', title: 'Roll Failed', message: 'Failed to roll dice. Please try again.' });
    }
  };

  const handleBank = async () => {
    if (!isMyTurn()) {
      addToast({ type: 'error', title: 'Not Your Turn', message: 'Wait for your turn to bank points!' });
      return;
    }

    if (myTurnScore === 0) {
      addToast({ type: 'warning', title: 'No Points', message: 'You need to score points before banking!' });
      return;
    }

    try {
      await bankPoints();
      addToast({ type: 'success', title: 'Points Banked!', message: `Successfully banked ${myTurnScore} points!` });
    } catch (err) {
      console.error('Bank error:', err);
      addToast({ type: 'error', title: 'Banking Failed', message: 'Failed to bank points. Please try again.' });
    }
  };

  const canRoll = isMyTurn() && gameState?.status === GameStatus.InProgress && !isLoading;
  const canBank = isMyTurn() && myTurnScore > 0 && !isLoading;

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
          {isMyTurn() ? "Your Turn!" : "Opponent's Turn"}
        </h2>
        {myTurnScore > 0 && (
          <p className="text-4xl md:text-5xl font-black text-gradient-gold animate-pulse">
            +{myTurnScore} pts
          </p>
        )}
      </div>

      {/* Dice Display */}
      <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap min-h-[100px]">
        {diceToRender > 0 ? (
          Array.from({ length: diceToRender }).map((_, index) => {
            const diceValue = (diceValues[index] || 1) as DiceValue;
            return (
              <Dice
                key={index}
                value={diceValue}
                isRolling={diceAnimationState.isRolling}
                isScoring={diceAnimationState.scoringIndices.includes(index)}
                isHotDice={diceAnimationState.isHotDice}
                size="lg"
              />
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg">No dice available</p>
          </div>
        )}
      </div>

      {/* Scoring Info */}
      {diceAnimationState.scoringIndices.length > 0 && !diceAnimationState.isRolling && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center animate-fade-in">
          <p className="text-green-400 font-semibold">
            ✅ {diceAnimationState.scoringIndices.length} scoring dice!
          </p>
        </div>
      )}

      {/* Hot Dice Indicator */}
      {diceAnimationState.isHotDice && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center animate-pulse">
          <p className="text-amber-400 font-semibold">
            🔥 HOT DICE! All dice scored - Roll again with 6 dice!
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {isMyTurn() && (
        <div className="flex gap-3 md:gap-4">
          <button
            onClick={handleRoll}
            disabled={!canRoll || diceAnimationState.isRolling}
            className="btn-premium flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {diceAnimationState.isRolling ? (
              <>
                <div className="spinner w-5 h-5 mr-2" />
                Rolling...
              </>
            ) : (
              <>
                🎲 Roll Dice ({availableDice})
              </>
            )}
          </button>

          <button
            onClick={handleBank}
            disabled={!canBank || diceAnimationState.isRolling}
            className="btn-premium bg-gradient-to-r from-green-600 to-emerald-600 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💰 Bank Points
          </button>
        </div>
      )}

      {/* Available Dice Indicator */}
      <div className="text-center text-sm text-gray-400">
        🎲 {availableDice} dice available
      </div>
    </div>
  );
}