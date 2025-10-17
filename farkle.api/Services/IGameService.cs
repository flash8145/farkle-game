using FarkleGame.API.DTOs;
using FarkleGame.API.Models;

namespace FarkleGame.API.Services
{
    /// <summary>
    /// Interface for game management operations
    /// </summary>
    public interface IGameService
    {
        /// <summary>
        /// Creates a new game with the first player
        /// </summary>
        /// <param name="request">Create game request with player name</param>
        /// <returns>Game creation response with game code</returns>
        Task<CreateGameResponse> CreateGameAsync(CreateGameRequest request);

        /// <summary>
        /// Creates a new game with AI opponent
        /// </summary>
        /// <param name="request">Create game request with player name</param>
        /// <param name="difficulty">AI difficulty level (Easy, Medium, Hard)</param>
        /// <returns>Game creation response with game details</returns>
        Task<CreateGameResponse> CreateGameWithAIAsync(CreateGameRequest request, AIPlayer difficulty);

        /// <summary>
        /// Allows a second player to join an existing game
        /// </summary>
        /// <param name="request">Join game request with game code and player name</param>
        /// <returns>Join game response with player and game information</returns>
        Task<JoinGameResponse> JoinGameAsync(JoinGameRequest request);

        /// <summary>
        /// Rolls dice for the current player
        /// </summary>
        /// <param name="request">Roll dice request</param>
        /// <returns>Dice roll result with scoring information</returns>
        Task<RollDiceResponse> RollDiceAsync(RollDiceRequest request);

        /// <summary>
        /// Banks the current turn score and ends the player's turn
        /// </summary>
        /// <param name="request">Bank points request</param>
        /// <returns>Bank points response with updated scores</returns>
        Task<BankPointsResponse> BankPointsAsync(BankPointsRequest request);

        /// <summary>
        /// Gets the current state of a game
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <returns>Complete game state</returns>
        Task<GameStateResponse> GetGameStateAsync(Guid gameId);

        /// <summary>
        /// Gets a game by its game code
        /// </summary>
        /// <param name="gameCode">Game code</param>
        /// <returns>Game state or null if not found</returns>
        Task<GameStateResponse?> GetGameByCodeAsync(string gameCode);

        /// <summary>
        /// Checks if a player can take action in a game
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="playerId">Player ID</param>
        /// <returns>True if it's the player's turn and game is in progress</returns>
        Task<bool> CanPlayerActAsync(Guid gameId, Guid playerId);

        /// <summary>
        /// Abandons a game (when a player leaves)
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="playerId">Player ID who is leaving</param>
        /// <returns>True if game was abandoned successfully</returns>
        Task<bool> AbandonGameAsync(Guid gameId, Guid playerId);

        /// <summary>
        /// Gets all active games waiting for players
        /// </summary>
        /// <returns>List of games waiting for second player</returns>
        Task<List<GameStateResponse>> GetAvailableGamesAsync();

        /// <summary>
        /// Validates if a game code exists and can accept players
        /// </summary>
        /// <param name="gameCode">Game code</param>
        /// <returns>True if game exists and can accept players</returns>
        Task<bool> ValidateGameCodeAsync(string gameCode);

        /// <summary>
        /// Checks if a player is an AI player
        /// </summary>
        /// <param name="playerId">Player ID to check</param>
        /// <returns>True if player is AI, false otherwise</returns>
        Task<bool> IsAIPlayerAsync(Guid playerId);

        /// <summary>
        /// Triggers AI to take its turn
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="aiPlayerId">AI Player ID</param>
        /// <returns>Result of AI's turn including all rolls and decision</returns>
        Task<AITurnResult> ExecuteAITurnAsync(Guid gameId, Guid aiPlayerId);
    }
}