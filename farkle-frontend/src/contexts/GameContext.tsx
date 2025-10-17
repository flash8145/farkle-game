'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  GameState,
  GameAction,
  GameContextState,
  DiceAnimationState,
  CreateGameRequest,
  CreateAIGameRequest,
  JoinGameRequest,
  RollDiceRequest,
  BankPointsRequest,
  AITurnRequest,
  StoredGameSession,
  LocalStorageKeys,
  GameStatus,
} from '@/types/game';
import * as api from '@/lib/api-client';

// ============================================
// INITIAL STATE
// ============================================

const initialDiceAnimationState: DiceAnimationState = {
  isRolling: false,
  isShaking: false,
  scoringIndices: [],
  isHotDice: false,
};

const initialState: GameContextState = {
  gameState: null,
  currentPlayerId: null,
  isLoading: false,
  error: null,
  diceAnimationState: initialDiceAnimationState,
};

// ============================================
// REDUCER
// ============================================

function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return {
        ...state,
        gameState: action.payload,
        error: null,
      };

    case 'SET_CURRENT_PLAYER_ID':
      return {
        ...state,
        currentPlayerId: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'UPDATE_DICE_ANIMATION':
      return {
        ...state,
        diceAnimationState: {
          ...state.diceAnimationState,
          ...action.payload,
        },
      };

    case 'RESET_GAME':
      return {
        ...initialState,
      };

    default:
      return state;
  }
}

// ============================================
// CONTEXT TYPE
// ============================================

interface GameContextType extends GameContextState {
  // Game Actions
  createGame: (playerName: string) => Promise<void>;
  createAIGame: (playerName: string, aiDifficulty: number) => Promise<void>;
  joinGame: (gameCode: string, playerName: string) => Promise<void>;
  rollDice: (numberOfDice?: number) => Promise<void>;
  bankPoints: () => Promise<void>;
  triggerAITurn: (aiPlayerId: string) => Promise<void>;
  refreshGameState: () => Promise<void>;
  leaveGame: () => Promise<void>;
  resetGame: () => void;
  
  // Utility Functions
  isMyTurn: () => boolean;
  getOpponent: () => any | null;
  saveGameSession: () => void;
  loadGameSession: () => StoredGameSession | null;
}

// ============================================
// CREATE CONTEXT
// ============================================

const GameContext = createContext<GameContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // ============================================
  // LOCAL STORAGE HELPERS
  // ============================================

  const saveGameSession = () => {
    if (state.gameState && state.currentPlayerId) {
      const session: StoredGameSession = {
        gameId: state.gameState.gameId,
        playerId: state.currentPlayerId,
        playerName: state.gameState.players.find(p => p.playerId === state.currentPlayerId)?.playerName || '',
        gameCode: state.gameState.gameCode,
        timestamp: Date.now(),
      };
      localStorage.setItem(LocalStorageKeys.GAME_SESSION, JSON.stringify(session));
    }
  };

  const loadGameSession = (): StoredGameSession | null => {
    const sessionStr = localStorage.getItem(LocalStorageKeys.GAME_SESSION);
    if (sessionStr) {
      try {
        return JSON.parse(sessionStr);
      } catch {
        return null;
      }
    }
    return null;
  };

  const clearGameSession = () => {
    localStorage.removeItem(LocalStorageKeys.GAME_SESSION);
  };

  // ============================================
  // GAME ACTIONS
  // ============================================

  const createGame = async (playerName: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const request: CreateGameRequest = { playerName };
      const response = await api.createGame(request);

      dispatch({ type: 'SET_CURRENT_PLAYER_ID', payload: response.playerId });

      // Fetch full game state
      await refreshGameState(response.gameId);
      
      saveGameSession();
    } catch (error) {
      const errorMsg = api.formatApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createAIGame = async (playerName: string, aiDifficulty: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const request: CreateAIGameRequest = { playerName, aiDifficulty };
      const response = await api.createAIGame(request);

      dispatch({ type: 'SET_CURRENT_PLAYER_ID', payload: response.playerId });

      // Fetch full game state
      await refreshGameState(response.gameId);
      
      saveGameSession();
    } catch (error) {
      const errorMsg = api.formatApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const joinGame = async (gameCode: string, playerName: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const request: JoinGameRequest = { gameCode, playerName };
      const response = await api.joinGame(request);

      dispatch({ type: 'SET_CURRENT_PLAYER_ID', payload: response.playerId });

      // Fetch full game state
      await refreshGameState(response.gameId);
      
      saveGameSession();
    } catch (error) {
      const errorMsg = api.formatApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const rollDice = async (numberOfDice?: number) => {
    if (!state.gameState || !state.currentPlayerId) {
      dispatch({ type: 'SET_ERROR', payload: 'Game not initialized' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Start dice animation
      dispatch({
        type: 'UPDATE_DICE_ANIMATION',
        payload: { isRolling: true, isShaking: true },
      });

      const diceCount = numberOfDice || state.gameState.availableDice;

      const request: RollDiceRequest = {
        gameId: state.gameState.gameId,
        playerId: state.currentPlayerId,
        numberOfDice: diceCount,
      };

      const response = await api.rollDice(request);

      // Update dice animation with results
      if (response.roll) {
        dispatch({
          type: 'UPDATE_DICE_ANIMATION',
          payload: {
            isRolling: false,
            isShaking: false,
            scoringIndices: response.roll.scoringDiceIndices,
            isHotDice: response.roll.isHotDice,
          },
        });
      }

      // Refresh game state
      await refreshGameState(state.gameState.gameId);
    } catch (error) {
      const errorMsg = api.formatApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      
      // Reset animation on error
      dispatch({
        type: 'UPDATE_DICE_ANIMATION',
        payload: { isRolling: false, isShaking: false },
      });
      
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const bankPoints = async () => {
    if (!state.gameState || !state.currentPlayerId) {
      dispatch({ type: 'SET_ERROR', payload: 'Game not initialized' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const request: BankPointsRequest = {
        gameId: state.gameState.gameId,
        playerId: state.currentPlayerId,
      };

      await api.bankPoints(request);

      // Reset dice animation
      dispatch({
        type: 'UPDATE_DICE_ANIMATION',
        payload: initialDiceAnimationState,
      });

      // Refresh game state
      await refreshGameState(state.gameState.gameId);
    } catch (error) {
      const errorMsg = api.formatApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const triggerAITurn = async (aiPlayerId: string) => {
    if (!state.gameState) {
      dispatch({ type: 'SET_ERROR', payload: 'Game not initialized' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const request: AITurnRequest = {
        gameId: state.gameState.gameId,
        aiPlayerId,
      };

      const response = await api.triggerAITurn(request);

      // Update game state with AI turn results
      if (response.gameState) {
        dispatch({ type: 'SET_GAME_STATE', payload: response.gameState as GameState });
      } else {
        // Fallback: refresh game state
        await refreshGameState(state.gameState.gameId);
      }
    } catch (error) {
      const errorMsg = api.formatApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshGameState = async (gameId?: string) => {
    const targetGameId = gameId || state.gameState?.gameId;
    
    if (!targetGameId) {
      return;
    }

    try {
      const gameState = await api.getGameState(targetGameId);
      dispatch({ type: 'SET_GAME_STATE', payload: gameState as GameState });
    } catch (error) {
      const errorMsg = api.formatApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw error;
    }
  };

  const leaveGame = async () => {
    if (state.gameState && state.currentPlayerId) {
      try {
        await api.abandonGame({
          gameId: state.gameState.gameId,
          playerId: state.currentPlayerId,
        });
      } catch (error) {
        console.error('Error leaving game:', error);
      }
    }
    
    clearGameSession();
    dispatch({ type: 'RESET_GAME' });
  };

  const resetGame = () => {
    clearGameSession();
    dispatch({ type: 'RESET_GAME' });
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const isMyTurn = (): boolean => {
    if (!state.gameState || !state.currentPlayerId) {
      return false;
    }

    const currentPlayer = state.gameState.players.find(
      p => p.playerId === state.currentPlayerId
    );

    return currentPlayer?.isCurrentTurn || false;
  };

  const getOpponent = () => {
    if (!state.gameState || !state.currentPlayerId) {
      return null;
    }

    return state.gameState.players.find(
      p => p.playerId !== state.currentPlayerId
    ) || null;
  };

  // ============================================
  // AUTO-LOAD SESSION ON MOUNT
  // ============================================

  useEffect(() => {
    const session = loadGameSession();
    if (session) {
      // Try to restore session
      dispatch({ type: 'SET_CURRENT_PLAYER_ID', payload: session.playerId });
      refreshGameState(session.gameId).catch(() => {
        // Session expired or invalid
        clearGameSession();
      });
    }
  }, []);

  // ============================================
  // AUTO-SAVE SESSION ON STATE CHANGE
  // ============================================

  useEffect(() => {
    if (state.gameState && state.currentPlayerId) {
      saveGameSession();
    }
  }, [state.gameState, state.currentPlayerId]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const contextValue: GameContextType = {
    ...state,
    createGame,
    createAIGame,
    joinGame,
    rollDice,
    bankPoints,
    triggerAITurn,
    refreshGameState,
    leaveGame,
    resetGame,
    isMyTurn,
    getOpponent,
    saveGameSession,
    loadGameSession,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// ============================================
// CUSTOM HOOK
// ============================================

export function useGame() {
  const context = useContext(GameContext);
  
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
}

// ============================================
// EXPORTS
// ============================================

export default GameContext;