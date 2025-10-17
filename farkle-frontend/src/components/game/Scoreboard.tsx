'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useGame } from '@/contexts/GameContext';
import { Player } from '@/types/game';

// ============================================
// SCOREBOARD COMPONENT
// ============================================

export const Scoreboard: React.FC = () => {
  const { gameState, currentPlayerId } = useGame();

  if (!gameState) {
    return null;
  }

  const players = gameState.players.sort((a, b) => a.turnOrder - b.turnOrder);
  const currentPlayer = players.find(p => p.playerId === currentPlayerId);
  const opponent = players.find(p => p.playerId !== currentPlayerId);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Scoreboard</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Player */}
        {currentPlayer && (
          <PlayerScoreCard
            player={currentPlayer}
            isCurrentUser={true}
            isCurrentTurn={currentPlayer.isCurrentTurn}
          />
        )}

        {/* VS Divider */}
        <div className="flex items-center justify-center">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent w-full" />
          <span className="px-4 text-sm font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
            VS
          </span>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent w-full" />
        </div>

        {/* Opponent */}
        {opponent && (
          <PlayerScoreCard
            player={opponent}
            isCurrentUser={false}
            isCurrentTurn={opponent.isCurrentTurn}
          />
        )}

        {/* Game Progress */}
        <GameProgress players={players} />
      </CardContent>
    </Card>
  );
};

// ============================================
// PLAYER SCORE CARD
// ============================================

interface PlayerScoreCardProps {
  player: Player;
  isCurrentUser: boolean;
  isCurrentTurn: boolean;
}

const PlayerScoreCard: React.FC<PlayerScoreCardProps> = ({
  player,
  isCurrentUser,
  isCurrentTurn,
}) => {
  const borderColor = isCurrentUser
    ? 'border-purple-500'
    : 'border-gray-300 dark:border-gray-600';
  
  const bgColor = isCurrentUser
    ? 'bg-purple-50 dark:bg-purple-900/20'
    : 'bg-gray-50 dark:bg-gray-800/50';

  const turnIndicatorColor = isCurrentTurn
    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
    : 'bg-gray-300 dark:bg-gray-600';

  return (
    <div className={`border-2 ${borderColor} ${bgColor} rounded-lg p-4 transition-all duration-300 ${isCurrentTurn ? 'ring-2 ring-green-500/50 shadow-lg' : ''}`}>
      {/* Player Name and Turn Indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${turnIndicatorColor} ${isCurrentTurn ? 'animate-pulse' : ''}`} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {player.playerName}
            {isCurrentUser && (
              <span className="text-xs font-normal text-purple-600 dark:text-purple-400">(You)</span>
            )}
            {player.isAI && (
              <span className="text-xs font-normal text-blue-600 dark:text-blue-400">
                <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7H7v6h6V7z" />
                  <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </h3>
        </div>
        
        {isCurrentTurn && (
          <span className="px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-full animate-pulse">
            TURN
          </span>
        )}
      </div>

      {/* Score Display */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Score */}
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Score</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {player.totalScore.toLocaleString()}
          </p>
        </div>

        {/* Turn Score */}
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Turn Score</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            +{player.currentTurnScore}
          </p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {/* On Board Status */}
        {player.isOnBoard ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            On Board
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Need 500 pts
          </span>
        )}

        {/* Connection Status */}
        {!player.isAI && (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
            player.isConnected
              ? 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30'
              : 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {player.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================
// GAME PROGRESS
// ============================================

interface GameProgressProps {
  players: Player[];
}

const GameProgress: React.FC<GameProgressProps> = ({ players }) => {
  const winningScore = 10000;
  const maxScore = Math.max(...players.map(p => p.totalScore), winningScore);
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
        <span>Progress to 10,000</span>
        <span className="font-semibold">Goal: {winningScore.toLocaleString()}</span>
      </div>

      <div className="space-y-2">
        {players.map((player) => {
          const percentage = Math.min((player.totalScore / winningScore) * 100, 100);
          const isLeading = player.totalScore === Math.max(...players.map(p => p.totalScore)) && player.totalScore > 0;

          return (
            <div key={player.playerId}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {player.playerName}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isLeading
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default Scoreboard;