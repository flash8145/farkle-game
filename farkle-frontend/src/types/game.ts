// ============================================
// ENUMS
// ============================================

/**
 * Represents the current status of a Farkle game session
 */
export enum GameStatus {
  WaitingForPlayers = 'WaitingForPlayers',
  Ready = 'Ready',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Abandoned = 'Abandoned',
  Paused = 'Paused'
}

/**
 * Represents the current status of a player's turn in Farkle
 */
export enum TurnStatus {
  Active = 'Active',
  Farkled = 'Farkled',
  Banked = 'Banked',
  PendingDecision = 'PendingDecision',
  Completed = 'Completed',
  Abandoned = 'Abandoned'
}

/**
 * AI difficulty levels
 */
export enum AIDifficulty {
  Easy = 0,
  Medium = 1,
  Hard = 2
}

// ============================================
// CORE GAME TYPES
// ============================================

/**
 * Player information in game state
 */
export interface Player {
  playerId: string;
  playerName: string;
  totalScore: number;
  currentTurnScore: number;
  isOnBoard: boolean;
  isCurrentTurn: boolean;
  turnOrder: number;
  isConnected: boolean;
  isAI?: boolean;
  aiDifficulty?: AIDifficulty;
}

/**
 * Represents a scoring combination found in a dice roll
 */
export interface ScoringCombination {
  type: string;
  description: string;
  diceValues: number[];
  points: number;
  diceIndices: number[];
}

/**
 * Represents the result of a dice roll with scoring information
 */
export interface DiceRoll {
  diceValues: number[];
  totalPoints: number;
  isFarkle: boolean;
  scoringCombinations: ScoringCombination[];
  scoringDiceIndices: number[];
  remainingDice: number;
  isHotDice: boolean;
  message?: string;
  rolledAt: string;
}

/**
 * Complete game state information
 */
export interface GameState {
  gameId: string;
  gameCode: string;
  status: GameStatus;
  players: Player[];
  currentPlayer: Player | null;
  availableDice: number;
  winner: Player | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  lastActivityAt: string;
}

// ============================================
// API REQUEST TYPES
// ============================================

/**
 * Request to create a new game
 */
export interface CreateGameRequest {
  playerName: string;
}

/**
 * Request to create a new game with AI opponent
 */
export interface CreateAIGameRequest {
  playerName: string;
  aiDifficulty: AIDifficulty;
}

/**
 * Request to join an existing game
 */
export interface JoinGameRequest {
  gameCode: string;
  playerName: string;
}

/**
 * Request model for rolling dice
 */
export interface RollDiceRequest {
  gameId: string;
  playerId: string;
  numberOfDice: number;
  keptDiceIndices?: number[];
}

/**
 * Request to bank points and end turn
 */
export interface BankPointsRequest {
  gameId: string;
  playerId: string;
}

/**
 * Request to abandon a game
 */
export interface AbandonGameRequest {
  gameId: string;
  playerId: string;
}

/**
 * Request to trigger AI turn
 */
export interface AITurnRequest {
  gameId: string;
  aiPlayerId: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Response after creating a game
 */
export interface CreateGameResponse {
  gameId: string;
  gameCode: string;
  playerId: string;
  playerName: string;
  status: string;
  message: string;
  createdAt: string;
}

/**
 * Basic player information
 */
export interface PlayerInfo {
  playerId: string;
  playerName: string;
  totalScore: number;
  isConnected: boolean;
}

/**
 * Response after joining a game
 */
export interface JoinGameResponse {
  gameId: string;
  gameCode: string;
  playerId: string;
  playerName: string;
  turnOrder: number;
  status: string;
  isYourTurn: boolean;
  message: string;
  opponent: PlayerInfo | null;
}

/**
 * Response model for dice roll result
 */
export interface RollDiceResponse {
  roll: DiceRoll | null;
  currentTurnScore: number;
  totalScore: number;
  diceAvailableForNextRoll: number;
  turnEnded: boolean;
  canContinue: boolean;
  shouldBank: boolean;
  message?: string;
  gameOver: boolean;
  winnerId?: string;
}

/**
 * Response after banking points
 */
export interface BankPointsResponse {
  pointsBanked: number;
  newTotalScore: number;
  isOnBoard: boolean;
  hasWon: boolean;
  nextPlayerId: string;
  nextPlayerName: string;
  message: string;
  gameStatus: string;
}

/**
 * Information about a single AI dice roll
 */
export interface AIRollInfo {
  diceValues: number[];
  points: number;
  isFarkle: boolean;
  isHotDice: boolean;
  message: string;
}

/**
 * Response after AI takes its turn
 */
export interface AITurnResponse {
  summary: string;
  pointsScored: number;
  newTotalScore: number;
  farkled: boolean;
  gameWon: boolean;
  rollCount: number;
  rolls: AIRollInfo[];
  gameStatus: string;
  gameState: GameState | null;
}

/**
 * Complete game state response
 */
export interface GameStateResponse {
  gameId: string;
  gameCode: string;
  status: string;
  players: Player[];
  currentPlayer: Player | null;
  availableDice: number;
  winner: Player | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  lastActivityAt: string;
}

// ============================================
// GAME RULES & CONSTANTS
// ============================================

/**
 * Game rules and scoring constants
 */
export const GameRules = {
  TOTAL_DICE: 6,
  WINNING_SCORE: 10000,
  MINIMUM_SCORE_TO_GET_ON_BOARD: 500,
  MAX_PLAYERS: 2,
  
  // Scoring
  SINGLE_ONE_POINTS: 100,
  SINGLE_FIVE_POINTS: 50,
  THREE_ONES_POINTS: 1000,
  THREE_OF_A_KIND_MULTIPLIER: 100,
  FOUR_OF_A_KIND_MULTIPLIER: 2,
  FIVE_OF_A_KIND_MULTIPLIER: 3,
  SIX_OF_A_KIND_MULTIPLIER: 4,
  STRAIGHT_POINTS: 1500,
  THREE_PAIRS_POINTS: 1500,
  TWO_TRIPLETS_POINTS: 2500,
  
  // Settings
  TURN_TIMEOUT_SECONDS: 120,
  HOT_DICE_ENABLED: true
} as const;

// ============================================
// UI STATE TYPES
// ============================================

/**
 * Dice animation state
 */
export interface DiceAnimationState {
  isRolling: boolean;
  isShaking: boolean;
  scoringIndices: number[];
  isHotDice: boolean;
}

/**
 * Toast notification type
 */
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

/**
 * Game context state
 */
export interface GameContextState {
  gameState: GameState | null;
  currentPlayerId: string | null;
  isLoading: boolean;
  error: string | null;
  diceAnimationState: DiceAnimationState;
}

/**
 * Game action types for reducer
 */
export type GameAction =
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'SET_CURRENT_PLAYER_ID'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_DICE_ANIMATION'; payload: Partial<DiceAnimationState> }
  | { type: 'RESET_GAME' };

// ============================================
// API ERROR TYPES
// ============================================

/**
 * API error response
 */
export interface ApiError {
  error: string;
  statusCode?: number;
  details?: any;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Dice value (1-6)
 */
export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Game mode
 */
export type GameMode = 'multiplayer' | 'ai';

/**
 * Player type
 */
export type PlayerType = 'human' | 'ai';

/**
 * Score change animation
 */
export interface ScoreChange {
  id: string;
  amount: number;
  type: 'add' | 'subtract';
  timestamp: number;
}

// ============================================
// FORM TYPES
// ============================================

/**
 * Create game form data
 */
export interface CreateGameFormData {
  playerName: string;
  mode: GameMode;
  aiDifficulty?: AIDifficulty;
}

/**
 * Join game form data
 */
export interface JoinGameFormData {
  gameCode: string;
  playerName: string;
}

// ============================================
// LOCAL STORAGE TYPES
// ============================================

/**
 * Stored game session
 */
export interface StoredGameSession {
  gameId: string;
  playerId: string;
  playerName: string;
  gameCode: string;
  timestamp: number;
}

/**
 * Local storage keys
 */
export const LocalStorageKeys = {
  GAME_SESSION: 'farkle_game_session',
  PLAYER_NAME: 'farkle_player_name',
  THEME: 'farkle_theme'
} as const;

// ============================================
// WEBSOCKET/SIGNALR TYPES (for future use)
// ============================================

/**
 * SignalR connection state
 */
export enum ConnectionState {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Reconnecting = 'Reconnecting',
  Failed = 'Failed'
}

/**
 * SignalR message types
 */
export interface SignalRMessage {
  type: 'GameUpdated' | 'PlayerJoined' | 'PlayerLeft' | 'TurnChanged' | 'GameEnded';
  data: any;
  timestamp: string;
}

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Type guard to check if player is AI
 */
export function isAIPlayer(player: Player): boolean {
  return player.isAI === true;
}

/**
 * Type guard to check if game is in progress
 */
export function isGameInProgress(gameState: GameState): boolean {
  return gameState.status === GameStatus.InProgress;
}

/**
 * Type guard to check if game is completed
 */
export function isGameCompleted(gameState: GameState): boolean {
  return gameState.status === GameStatus.Completed;
}

/**
 * Type guard to check if it's player's turn
 */
export function isPlayerTurn(player: Player, currentPlayer: Player | null): boolean {
  return currentPlayer !== null && player.playerId === currentPlayer.playerId;
}