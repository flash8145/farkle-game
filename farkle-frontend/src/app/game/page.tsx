'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import { useToast } from '@/components/ui/toast';
import { GameStatus, Player } from '@/types/game';

import DiceArea from '@/components/game/DiceArea';
import Scoreboard from '@/components/game/Scoreboard';
import GameControls from '@/components/game/GameControls';
import { CompactGameCode } from '@/components/game/GameCodeDisplay';

// ============================================
// MAIN GAME PAGE
// ============================================

export default function GamePage() {
  const router = useRouter();
  const { 
    gameState, 
    currentPlayerId, 
    isLoading, 
    error,
    refreshGameState,
    getOpponent,
    isMyTurn
  } = useGame();
  const { success, error: showError, info } = useToast();

  const [showWinnerModal, setShowWinnerModal] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [lastGameStatus, setLastGameStatus] = React.useState<GameStatus | null>(null);

  // Polling interval for game state updates
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Get opponent player
  const opponent = getOpponent();
  const isAIGame = opponent?.isAI || false;
  const isAITurn = opponent?.isCurrentTurn && opponent?.isAI;

  // ============================================
  // REDIRECT IF NO GAME
  // ============================================
  React.useEffect(() => {
    if (!gameState && !isLoading) {
      showError('No active game found');
      router.push('/');
    }
  }, [gameState, isLoading, router, showError]);

  // ============================================
  // POLLING FOR GAME STATE UPDATES
  // ============================================
  React.useEffect(() => {
    if (!gameState) return;

    // Start polling every 2 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        await refreshGameState();
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [gameState, refreshGameState]);

  // AI turn is now handled in GameControls component

  // ============================================
  // DETECT GAME COMPLETION
  // ============================================
  React.useEffect(() => {
    if (!gameState) return;

    // Check if game just completed
    if (
      gameState.status === GameStatus.Completed && 
      lastGameStatus !== GameStatus.Completed
    ) {
      setLastGameStatus(GameStatus.Completed);
      
      // Show winner modal after a short delay
      setTimeout(() => {
        setShowWinnerModal(true);
        
        // Show confetti if current player won
        if (gameState.winner?.playerId === currentPlayerId) {
          setShowConfetti(true);
          success('🎉 Congratulations! You won!');
        }
      }, 1000);
    } else if (gameState.status !== GameStatus.Completed) {
      setLastGameStatus(gameState.status);
    }
  }, [gameState, lastGameStatus, currentPlayerId, success]);

  // ============================================
  // LOADING STATE
  // ============================================
  if (!gameState && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="spinner w-16 h-16 mx-auto" />
          <p className="text-xl text-gray-300">Loading game...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Game Not Found</h2>
          <p className="text-gray-400">
            {error || 'Unable to load game. Please try again.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-premium w-full"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // WAITING FOR PLAYERS
  // ============================================
  if (gameState.status === GameStatus.WaitingForPlayers) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Waiting Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-white">Waiting for Player</h1>
            <p className="text-gray-400">Share the game code below with a friend</p>
          </div>

          {/* Game Code Card */}
          <div className="glass-card rounded-3xl p-8 text-center space-y-6">
            <div>
              <p className="text-sm text-gray-400 mb-3">Game Code</p>
              <div className="game-code text-6xl mb-6">
                {gameState.gameCode}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(gameState.gameCode);
                  success('Game code copied!');
                }}
                className="btn-premium flex-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Code
              </button>
              <button
                onClick={() => router.push('/')}
                className="btn-premium bg-gradient-to-r from-red-600 to-red-500"
              >
                Cancel Game
              </button>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-gray-400">
              <span>Waiting for player</span>
              <span className="animate-pulse">.</span>
              <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN GAME SCREEN
  // ============================================
  return (
    <>
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl md:text-3xl font-black text-white">Farkle Game</h1>
            </div>

            {/* Game Code (for multiplayer) */}
            {!isAIGame && (
              <CompactGameCode gameCode={gameState.gameCode} />
            )}
          </div>

          {/* Game Layout - 2 Column Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Scoreboard + Controls */}
            <div className="space-y-6">
              <Scoreboard />
              <GameControls />
            </div>

            {/* Right Column - Dice Area */}
            <div className="lg:col-span-2">
              <DiceArea />
            </div>
          </div>

          {/* Turn Indicator */}
          {gameState.status === GameStatus.InProgress && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
              {isMyTurn() ? (
                <div className="turn-glow glass-card px-6 py-3 rounded-full">
                  <p className="text-white font-bold flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    Your Turn
                  </p>
                </div>
              ) : (
                <div className="glass-card px-6 py-3 rounded-full">
                  <p className="text-gray-400 font-semibold flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-500 rounded-full" />
                    {opponent?.playerName || 'Opponent'}&apos;s Turn

                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Winner Modal */}
      {showWinnerModal && gameState.winner && (
        <WinnerModal
          winner={gameState.winner}
          isCurrentPlayer={gameState.winner.playerId === currentPlayerId}
          onClose={() => setShowWinnerModal(false)}
          onPlayAgain={() => router.push('/')}
        />
      )}

      {/* Confetti Effect */}
      {showConfetti && <ConfettiEffect />}
    </>
  );
}

// ============================================
// WINNER MODAL COMPONENT
// ============================================

interface WinnerModalProps {
  winner: Player;
  isCurrentPlayer: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
}

function WinnerModal({ winner, isCurrentPlayer, onClose, onPlayAgain }: WinnerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-3xl w-full max-w-md p-8 text-center space-y-6 animate-bounce-in">
        {/* Trophy Icon */}
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl glow-gold">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>

        {/* Winner Text */}
        <div>
          {isCurrentPlayer ? (
            <>
              <h2 className="winner-text mb-2">YOU WIN!</h2>
              <p className="text-xl text-gray-300">Congratulations! 🎉</p>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-black text-white mb-2">Game Over</h2>
              <p className="text-xl text-gray-300">{winner.playerName} wins!</p>
            </>
          )}
        </div>

        {/* Final Score */}
        <div className="bg-white/5 rounded-2xl p-6">
          <p className="text-sm text-gray-400 mb-2">Final Score</p>
          <p className="text-5xl font-black text-gradient-gold">
            {winner.totalScore.toLocaleString()}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button onClick={onPlayAgain} className="btn-premium w-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Play Again
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CONFETTI EFFECT
// ============================================

function ConfettiEffect() {
  const colors = ['#7C3AED', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="confetti absolute w-3 h-3 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-20px',
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}