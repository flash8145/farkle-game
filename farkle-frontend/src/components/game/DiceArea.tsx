'use client';

import * as React from 'react';
import { Dice, DiceGroup, DicePlaceholder } from './Dice';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useGame } from '@/contexts/GameContext';
import { DiceValue, ScoringCombination } from '@/types/game';

// ============================================
// DICE AREA COMPONENT
// ============================================

export const DiceArea: React.FC = () => {
  const { gameState, currentPlayerId, rollDice, bankPoints, isMyTurn, diceAnimationState, isLoading } = useGame();

  const [lastRoll, setLastRoll] = React.useState<number[]>([]);
  const [currentTurnScore, setCurrentTurnScore] = React.useState(0);
  const [scoringCombinations, setScoringCombinations] = React.useState<ScoringCombination[]>([]);
  const [message, setMessage] = React.useState<string>('');

  const currentPlayer = gameState?.players.find(p => p.playerId === currentPlayerId);
  const canRoll = isMyTurn() && !isLoading;
  const canBank = isMyTurn() && currentPlayer && currentPlayer.currentTurnScore > 0 && !isLoading;

  const handleRoll = async () => {
    try {
      await rollDice();
      // Game context will update state automatically
    } catch (error) {
      console.error('Roll dice error:', error);
    }
  };

  const handleBank = async () => {
    try {
      await bankPoints();
      setLastRoll([]);
      setCurrentTurnScore(0);
      setScoringCombinations([]);
      setMessage('');
    } catch (error) {
      console.error('Bank points error:', error);
    }
  };

  // Update local state when game state changes
  React.useEffect(() => {
    if (currentPlayer) {
      setCurrentTurnScore(currentPlayer.currentTurnScore);
    }
  }, [currentPlayer]);

  const availableDice = gameState?.availableDice || 6;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">
          {isMyTurn() ? (
            <span className="text-gradient-purple">Your Turn!</span>
          ) : (
            <span className="text-muted-foreground">Opponent's Turn</span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Turn Score Display */}
        {currentTurnScore > 0 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Turn Score</p>
            <p className="text-4xl font-bold text-gradient-gold animate-pulse">
              {currentTurnScore} pts
            </p>
          </div>
        )}

        {/* Dice Display */}
        <div className="min-h-[120px] flex items-center justify-center">
          {lastRoll.length > 0 ? (
            <DiceGroup>
              {lastRoll.map((value, index) => (
                <Dice
                  key={index}
                  value={value as DiceValue}
                  isRolling={diceAnimationState.isRolling}
                  isScoring={diceAnimationState.scoringIndices.includes(index)}
                  isHotDice={diceAnimationState.isHotDice}
                  disabled={!isMyTurn()}
                  size="lg"
                />
              ))}
            </DiceGroup>
          ) : (
            <DiceGroup>
              {Array.from({ length: availableDice }).map((_, index) => (
                <DicePlaceholder key={index} size="lg" />
              ))}
            </DiceGroup>
          )}
        </div>

        {/* Scoring Combinations */}
        {scoringCombinations.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
              Scoring Combinations:
            </p>
            <ul className="space-y-1">
              {scoringCombinations.map((combo, index) => (
                <li key={index} className="text-sm text-green-700 dark:text-green-300">
                  {combo.description} - <span className="font-bold">{combo.points} pts</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={handleRoll}
            disabled={!canRoll}
            isLoading={isLoading && diceAnimationState.isRolling}
            className="flex-1"
          >
            {isLoading && diceAnimationState.isRolling ? (
              'Rolling...'
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9a1 1 0 000 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V8a1 1 0 10-2 0v1H8z" />
                </svg>
                Roll Dice ({availableDice})
              </>
            )}
          </Button>

          <Button
            variant="success"
            size="lg"
            onClick={handleBank}
            disabled={!canBank}
            isLoading={isLoading && !diceAnimationState.isRolling}
            className="flex-1"
          >
            {isLoading && !diceAnimationState.isRolling ? (
              'Banking...'
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Bank Points
              </>
            )}
          </Button>
        </div>

        {/* Available Dice Indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <span>
            {availableDice} {availableDice === 1 ? 'die' : 'dice'} available
          </span>
        </div>

        {/* Hot Dice Notification */}
        {diceAnimationState.isHotDice && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-4 text-center animate-bounce-in">
            <p className="text-lg font-bold flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              HOT DICE! Roll all 6 again!
            </p>
          </div>
        )}

        {/* Not Your Turn Message */}
        {!isMyTurn() && gameState?.currentPlayer && (
          <div className="text-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Waiting for <span className="font-semibold text-purple-600 dark:text-purple-400">
                {gameState.currentPlayer.playerName}
              </span> to finish their turn...
            </p>
          </div>
        )}

        {/* Game Instructions */}
        {!currentPlayer?.isOnBoard && currentTurnScore > 0 && currentTurnScore < 500 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500 rounded-lg p-3">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
              ⚠️ You need at least 500 points to get on the board!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// EXPORTS
// ============================================

export default DiceArea;