'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '../ui/toast';
import { GameStatus } from '@/types/game';

// ============================================
// GAME CONTROLS COMPONENT
// ============================================

export const GameControls: React.FC = () => {
  const router = useRouter();
  const { gameState, leaveGame, refreshGameState, triggerAITurn, getOpponent } = useGame();
  const { success, error: showError } = useToast();
  
  const [showLeaveConfirm, setShowLeaveConfirm] = React.useState(false);
  const [isLeavingGame, setIsLeavingGame] = React.useState(false);

  const opponent = getOpponent();
  const isAIGame = opponent?.isAI || false;
  const isAITurn = opponent?.isCurrentTurn && opponent?.isAI;

  // Auto-trigger AI turn when it's AI's turn
  React.useEffect(() => {
    if (isAITurn && opponent && gameState?.status === GameStatus.InProgress) {
      const timer = setTimeout(async () => {
        try {
          await triggerAITurn(opponent.playerId);
        } catch (err) {
          console.error('AI turn error:', err);
        }
      }, 1500); // 1.5 second delay for better UX

      return () => clearTimeout(timer);
    }
  }, [isAITurn, opponent, gameState?.status, triggerAITurn]);

  const handleLeaveGame = async () => {
    try {
      setIsLeavingGame(true);
      await leaveGame();
      success('You left the game');
      router.push('/');
    } catch (err) {
      showError('Failed to leave game');
      setIsLeavingGame(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshGameState();
      success('Game state refreshed');
    } catch (err) {
      showError('Failed to refresh game state');
    }
  };

  const handleCopyGameCode = () => {
    if (gameState?.gameCode) {
      navigator.clipboard.writeText(gameState.gameCode);
      success('Game code copied to clipboard!');
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardContent className="p-4 space-y-3">
          {/* Game Code Display */}
          {gameState?.gameCode && gameState.status === GameStatus.WaitingForPlayers && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 rounded-lg p-4">
              <p className="text-xs text-purple-700 dark:text-purple-300 mb-2 text-center font-semibold">
                Share this code with your friend:
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-mono font-bold text-purple-600 dark:text-purple-400 tracking-widest">
                    {gameState.gameCode}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleCopyGameCode}
                  className="flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </Button>
              </div>
            </div>
          )}

          {/* AI Turn Indicator */}
          {isAITurn && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-500 rounded-lg p-3 animate-pulse">
              <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
                <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7H7v6h6V7z" />
                  <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">AI is thinking...</span>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="md"
              onClick={handleRefresh}
              className="w-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>

            {/* Leave Game Button */}
            <Button
              variant="danger"
              size="md"
              onClick={() => setShowLeaveConfirm(true)}
              disabled={isLeavingGame}
              className="w-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Leave
            </Button>
          </div>

          {/* Game Status Info */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p>
              Game Status: <span className="font-semibold text-gray-700 dark:text-gray-300">
                {gameState?.status}
              </span>
            </p>
            {isAIGame && (
              <p className="mt-1">
                🤖 Playing against AI ({opponent?.playerName})
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <ConfirmLeaveModal
          onConfirm={handleLeaveGame}
          onCancel={() => setShowLeaveConfirm(false)}
          isLoading={isLeavingGame}
        />
      )}
    </>
  );
};

// ============================================
// CONFIRM LEAVE MODAL
// ============================================

interface ConfirmLeaveModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ConfirmLeaveModal: React.FC<ConfirmLeaveModalProps> = ({
  onConfirm,
  onCancel,
  isLoading,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-md animate-bounce-in">
        <CardContent className="p-6 space-y-4">
          {/* Icon */}
          <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Title */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Leave Game?
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to leave this game? Your progress will be lost and the game will be abandoned.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={onConfirm}
              isLoading={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Leaving...' : 'Leave Game'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default GameControls;