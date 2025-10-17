import {
  CreateGameRequest,
  CreateGameResponse,
  CreateAIGameRequest,
  JoinGameRequest,
  JoinGameResponse,
  RollDiceRequest,
  RollDiceResponse,
  BankPointsRequest,
  BankPointsResponse,
  GameStateResponse,
  AITurnRequest,
  AITurnResponse,
  AbandonGameRequest,
  ApiError,
} from '@/types/game';
import { env } from './env';

/**
 * Base API URL - Loaded from environment variables
 */
const API_BASE_URL = env.apiUrl;

// ============================================
// API CONFIGURATION
// ============================================

/**
 * Base API URL - Update this to match your backend URL
 */
//const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5186/api';

/**
 * Default headers for API requests
 */
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * Enable detailed logging for debugging
 */
const ENABLE_DEBUG_LOGGING = true;

// ============================================
// LOGGING UTILITIES
// ============================================

/**
 * Logs API request details
 */
function logRequest(method: string, url: string, body?: any) {
  if (!ENABLE_DEBUG_LOGGING) return;
  
  console.group(`🚀 API Request: ${method} ${url}`);
  console.log('📍 Full URL:', url);
  console.log('⏰ Timestamp:', new Date().toISOString());
  if (body) {
    console.log('📦 Request Body:', body);
  }
  console.groupEnd();
}

/**
 * Logs API response details
 */
function logResponse(method: string, url: string, status: number, data: any) {
  if (!ENABLE_DEBUG_LOGGING) return;
  
  console.group(`✅ API Response: ${method} ${url}`);
  console.log('📊 Status:', status);
  console.log('📦 Response Data:', data);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.groupEnd();
}

/**
 * Logs API error details
 */
function logError(method: string, url: string, error: any) {
  console.group(`❌ API Error: ${method} ${url}`);
  console.error('🔴 Error Type:', error.constructor.name);
  console.error('📍 Full URL:', url);
  console.error('⏰ Timestamp:', new Date().toISOString());
  
  if (error.statusCode) {
    console.error('📊 Status Code:', error.statusCode);
  }
  
  if (error.error) {
    console.error('💬 Error Message:', error.error);
  }
  
  if (error.details) {
    console.error('📋 Error Details:', error.details);
  }
  
  console.error('🔍 Full Error Object:', error);
  console.groupEnd();
}

// ============================================
// HTTP REQUEST WRAPPER
// ============================================

/**
 * Makes an HTTP request with enhanced error handling and logging
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';

  // Log request
  logRequest(method, url, options.body);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...DEFAULT_HEADERS,
        ...options.headers,
      },
    });

    // Try to parse response body
    let data: any = null;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        console.error('📄 Response Text:', await response.text());
      }
    } else {
      // Not JSON, try to get as text
      const textData = await response.text();
      console.warn('⚠️ Response is not JSON. Content-Type:', contentType);
      console.warn('📄 Response Text:', textData);
    }

    // Handle non-OK responses
    if (!response.ok) {
      const error: ApiError = {
        error: data?.error || data?.title || response.statusText || 'An error occurred',
        statusCode: response.status,
        details: data,
      };
      
      // Enhanced error messages based on status code
      switch (response.status) {
        case 400:
          error.error = `Bad Request: ${error.error}`;
          break;
        case 401:
          error.error = `Unauthorized: ${error.error}`;
          break;
        case 403:
          error.error = `Forbidden: ${error.error}`;
          break;
        case 404:
          error.error = `Not Found: ${error.error}`;
          break;
        case 500:
          error.error = `Server Error: ${error.error}`;
          break;
        case 0:
          error.error = 'Network Error: Unable to connect to the server. Check if the API is running.';
          break;
      }
      
      logError(method, url, error);
      throw error;
    }

    // Log successful response
    logResponse(method, url, response.status, data);

    return data as T;
  } catch (error) {
    // Network or other errors
    if ((error as ApiError).statusCode !== undefined) {
      // Already an ApiError, re-throw it
      throw error;
    }

    // Network error or fetch failed
    const apiError: ApiError = {
      error: error instanceof Error ? error.message : 'Network error occurred',
      statusCode: 0,
      details: {
        originalError: error,
        url: url,
        method: method,
      }
    };

    // Check for specific network errors
    if (error instanceof TypeError) {
      if (error.message.includes('Failed to fetch')) {
        apiError.error = 'Network Error: Unable to connect to the API server. Please ensure:\n' +
                        '1. The API is running at ' + API_BASE_URL + '\n' +
                        '2. CORS is properly configured\n' +
                        '3. Your internet connection is active';
      }
    }

    logError(method, url, apiError);
    throw apiError;
  }
}

// ============================================
// GAME API ENDPOINTS
// ============================================

/**
 * Creates a new multiplayer game
 */
export async function createGame(
  request: CreateGameRequest
): Promise<CreateGameResponse> {
  return apiRequest<CreateGameResponse>('/game/create', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Creates a new game with AI opponent
 */
export async function createAIGame(
  request: CreateAIGameRequest
): Promise<CreateGameResponse> {
  return apiRequest<CreateGameResponse>('/game/create-ai', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Joins an existing game using a game code
 */
export async function joinGame(
  request: JoinGameRequest
): Promise<JoinGameResponse> {
  return apiRequest<JoinGameResponse>('/game/join', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Rolls dice for the current player
 */
export async function rollDice(
  request: RollDiceRequest
): Promise<RollDiceResponse> {
  return apiRequest<RollDiceResponse>('/game/roll', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Banks current turn points and ends the turn
 */
export async function bankPoints(
  request: BankPointsRequest
): Promise<BankPointsResponse> {
  return apiRequest<BankPointsResponse>('/game/bank', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Gets the current state of a game by ID
 */
export async function getGameState(gameId: string): Promise<GameStateResponse> {
  return apiRequest<GameStateResponse>(`/game/${gameId}`, {
    method: 'GET',
  });
}

/**
 * Gets a game by its game code
 */
export async function getGameByCode(
  gameCode: string
): Promise<GameStateResponse> {
  return apiRequest<GameStateResponse>(`/game/code/${gameCode}`, {
    method: 'GET',
  });
}

/**
 * Validates if a game code exists and can accept players
 */
export async function validateGameCode(
  gameCode: string
): Promise<{ isValid: boolean; gameCode: string }> {
  return apiRequest<{ isValid: boolean; gameCode: string }>(
    `/game/validate/${gameCode}`,
    {
      method: 'GET',
    }
  );
}

/**
 * Gets list of available games waiting for players
 */
export async function getAvailableGames(): Promise<GameStateResponse[]> {
  return apiRequest<GameStateResponse[]>('/game/available', {
    method: 'GET',
  });
}

/**
 * Checks if a player can take action in a game
 */
export async function canPlayerAct(
  gameId: string,
  playerId: string
): Promise<{ canAct: boolean }> {
  return apiRequest<{ canAct: boolean }>(`/game/can-act/${gameId}/${playerId}`, {
    method: 'GET',
  });
}

/**
 * Abandons a game (when a player leaves)
 */
export async function abandonGame(
  request: AbandonGameRequest
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/game/abandon', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Triggers AI to take its turn
 */
export async function triggerAITurn(
  request: AITurnRequest
): Promise<AITurnResponse> {
  return apiRequest<AITurnResponse>('/game/ai-turn', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Formats an API error for display
 */
export function formatApiError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const apiError = error as ApiError;
    return apiError.error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Checks if the API is reachable
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    console.log('🏥 Checking API health...');
    await getAvailableGames();
    console.log('✅ API is healthy!');
    return true;
  } catch (error) {
    console.error('❌ API health check failed:', error);
    return false;
  }
}

/**
 * Gets the API base URL (useful for debugging)
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

/**
 * Tests API connection with detailed diagnostics
 */
export async function testApiConnection(): Promise<{
  success: boolean;
  apiUrl: string;
  message: string;
  details?: any;
}> {
  console.group('🧪 Testing API Connection');
  console.log('📍 API Base URL:', API_BASE_URL);
  
  try {
    // Test 1: Simple GET request
    console.log('🔍 Test 1: Fetching available games...');
    const games = await getAvailableGames();
    
    console.log('✅ API Connection Successful!');
    console.log('📊 Available Games:', games.length);
    console.groupEnd();
    
    return {
      success: true,
      apiUrl: API_BASE_URL,
      message: 'API connection successful',
      details: { gamesCount: games.length }
    };
  } catch (error) {
    console.error('❌ API Connection Failed');
    console.error('🔍 Error Details:', error);
    console.groupEnd();
    
    return {
      success: false,
      apiUrl: API_BASE_URL,
      message: formatApiError(error),
      details: error
    };
  }
}

// ============================================
// POLLING UTILITIES (for game state updates)
// ============================================

/**
 * Polls game state at regular intervals
 */
export class GameStatePoller {
  private intervalId: NodeJS.Timeout | null = null;
  private gameId: string;
  private callback: (state: GameStateResponse) => void;
  private intervalMs: number;

  constructor(
    gameId: string,
    callback: (state: GameStateResponse) => void,
    intervalMs: number = 2000
  ) {
    this.gameId = gameId;
    this.callback = callback;
    this.intervalMs = intervalMs;
  }

  /**
   * Starts polling
   */
  start(): void {
    if (this.intervalId) {
      return; // Already polling
    }

    // Initial fetch
    this.poll();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.poll();
    }, this.intervalMs);
  }

  /**
   * Stops polling
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Performs a single poll
   */
  private async poll(): Promise<void> {
    try {
      const state = await getGameState(this.gameId);
      this.callback(state);
    } catch (error) {
      console.error('Polling error:', error);
      // Optionally stop polling on error
      // this.stop();
    }
  }

  /**
   * Changes the polling interval
   */
  setInterval(intervalMs: number): void {
    this.intervalMs = intervalMs;
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }
}

// ============================================
// RETRY LOGIC (for unreliable connections)
// ============================================

/**
 * Retries an API request with exponential backoff
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        typeof error.statusCode === 'number' &&
        error.statusCode >= 400 &&
        error.statusCode < 500
      ) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.log(`⏳ Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ============================================
// EXPORTS
// ============================================

export default {
  createGame,
  createAIGame,
  joinGame,
  rollDice,
  bankPoints,
  getGameState,
  getGameByCode,
  validateGameCode,
  getAvailableGames,
  canPlayerAct,
  abandonGame,
  triggerAITurn,
  formatApiError,
  checkApiHealth,
  getApiBaseUrl,
  testApiConnection,
  GameStatePoller,
  retryRequest,
};