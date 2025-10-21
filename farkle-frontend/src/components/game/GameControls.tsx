'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/components/ui/toast';
import { GameStatus } from '@/types/game';

export const GameControls: React.FC = () => {
  const router = useRouter();
  const { 
    gameState, 
    leaveGame, 
    refreshGameState, 
    triggerAITurn, 
    getOpponent 
  } = useGame();
  const { success, error: showError, info } = useToast();
  
  const [showLeaveConfirm, setShowLeaveConfirm] = React.useState(false);
  const [isLeavingGame, setIsLeavingGame] = React.useState(false);
  const [isAIProcessing, setIsAIProcessing] = React.useState(false);

  const opponent = getOpponent();
  // Fix: Check playerName since isAI property is missing from backend
  const isAIPlayer = opponent?.playerName?.includes('AI (') || false;
  const isAIGame = isAIPlayer;
  const isAITurn = opponent?.isCurrentTurn && isAIPlayer;

  // Debug logging for AI turn detection
  console.log('🤖 AI Turn Debug:', {
    opponent: opponent,
    isAIGame,
    isAITurn,
    gameStatus: gameState?.status,
    isAIProcessing,
    allPlayers: gameState?.players
  });
  
  // Raw data logging
  console.log('🤖 Raw Opponent:', JSON.stringify(opponent, null, 2));
  console.log('🤖 Raw Players:', JSON.stringify(gameState?.players, null, 2));

  // ============================================
  // AUTO-TRIGGER AI TURN (FIXED)
  // ============================================
  React.useEffect(() => {
    if (!isAITurn || !opponent || !gameState || isAIProcessing) return;
    if (gameState.status !== GameStatus.InProgress) return;

    console.log('🤖 AI Turn Detected - Starting AI processing...');
    
    const executeAITurn = async () => {
      setIsAIProcessing(true);
      
      try {
        // Wait 1.5 seconds for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        info('🤖 AI is thinking...');
        console.log('🤖 Calling triggerAITurn with playerId:', opponent.playerId);
        
        const result = await triggerAITurn(opponent.playerId);
        
        console.log('✅ AI Turn Result:', result);
        success(`AI scored ${result.pointsScored} points!`);
        
        // Refresh game state after AI turn
        await refreshGameState();
        
      } catch (err) {
        console.error('❌ AI Turn Error:', err);
        showError('AI turn failed. Please refresh the page.');
      } finally {
        setIsAIProcessing(false);
      }
    };

    executeAITurn();
  }, [isAITurn, opponent?.playerId, gameState?.status, isAIProcessing]);

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
      <div className="glass-card rounded-2xl p-6 space-y-4">
        {/* Game Code Display (Multiplayer Only) */}
        {gameState?.gameCode && gameState.status === GameStatus.WaitingForPlayers && !isAIGame && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-xs text-purple-400 mb-2 text-center font-semibold">
              Share this code:
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 rounded-lg p-3 text-center">
                <p className="text-2xl font-mono font-bold text-purple-400 tracking-widest">
                  {gameState.gameCode}
                </p>
              </div>
              <button
                onClick={handleCopyGameCode}
                className="w-12 h-12 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* AI Processing Indicator */}
        {isAIProcessing && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 animate-pulse">
            <div className="flex items-center justify-center gap-3 text-blue-400">
              <div className="spinner w-5 h-5" />
              <span className="font-semibold">AI is thinking...</span>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleRefresh}
            disabled={isAIProcessing}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>

          <button
            onClick={() => setShowLeaveConfirm(true)}
            disabled={isLeavingGame || isAIProcessing}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Leave
          </button>
        </div>

        {/* Game Status Info */}
        <div className="text-center text-xs text-gray-500 pt-3 border-t border-white/10">
          <p>
            Game Status: <span className="font-semibold text-gray-400">{gameState?.status}</span>
          </p>
          {isAIGame && (
            <p className="mt-1 text-blue-400">
              🤖 Playing against AI ({opponent?.playerName})
            </p>
          )}
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-8 max-w-md w-full space-y-6 animate-bounce-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Leave Game?</h3>
              <p className="text-gray-400">
                Are you sure? Your progress will be lost.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveGame}
                disabled={isLeavingGame}
                className="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition-colors text-white font-semibold disabled:opacity-50"
              >
                {isLeavingGame ? 'Leaving...' : 'Leave Game'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameControls;