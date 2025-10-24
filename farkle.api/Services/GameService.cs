using Microsoft.EntityFrameworkCore;
using FarkleGame.API.Data;
using FarkleGame.API.DTOs;
using FarkleGame.API.Models;
using FarkleGame.Core.Entities;
using FarkleGame.Core.Enums;
using FarkleGame.Core.Constants;

namespace FarkleGame.API.Services
{
    public class GameService : IGameService
    {
        private readonly FarkleDbContext _context;
        private readonly IDiceService _diceService;
        private readonly IAIPlayerService _aiPlayerService;
        private readonly ILogger<GameService> _logger;

        public GameService(
            FarkleDbContext context,
            IDiceService diceService,
            IAIPlayerService aiPlayerService,
            ILogger<GameService> logger)
        {
            _context = context;
            _diceService = diceService;
            _aiPlayerService = aiPlayerService;
            _logger = logger;
        }

        public async Task<CreateGameResponse> CreateGameAsync(CreateGameRequest request)
        {
            try
            {
                var game = new Game();

                var player = new Player
                {
                    PlayerName = request.PlayerName,
                    GameId = game.GameId,
                    TurnOrder = 1,
                    IsCurrentTurn = false,
                    IsAI = false
                };

                game.Players.Add(player);
                _context.Games.Add(game);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Game created: {game.GameCode} by player {player.PlayerName}");

                return new CreateGameResponse
                {
                    GameId = game.GameId,
                    GameCode = game.GameCode,
                    PlayerId = player.PlayerId,
                    PlayerName = player.PlayerName,
                    Status = game.Status.ToString(),
                    Message = $"Game created! Share code '{game.GameCode}' with another player to start.",
                    CreatedAt = game.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating game");
                throw;
            }
        }

        public async Task<CreateGameResponse> CreateGameWithAIAsync(CreateGameRequest request, AIPlayer difficulty)
        {
            try
            {
                var game = new Game();

                // Create human player
                var humanPlayer = new Player
                {
                    PlayerName = request.PlayerName,
                    GameId = game.GameId,
                    TurnOrder = 1,
                    IsCurrentTurn = false,
                    IsAI = false
                };

                // Create AI player
                var aiPlayer = new Player
                {
                    PlayerName = $"AI ({difficulty})",
                    GameId = game.GameId,
                    TurnOrder = 2,
                    IsCurrentTurn = false,
                    IsAI = true,
                    AIDifficulty = (int)difficulty,
                    ConnectionId = "AI_PLAYER"
                };

                game.Players.Add(humanPlayer);
                game.Players.Add(aiPlayer);

                _context.Games.Add(game);
                await _context.SaveChangesAsync();

                // Start the game immediately
                game = await _context.Games
                    .Include(g => g.Players)
                    .FirstOrDefaultAsync(g => g.GameId == game.GameId);

                game!.StartGame();
                await _context.SaveChangesAsync();

                _logger.LogInformation($"AI game created: {game.GameCode} - {humanPlayer.PlayerName} vs AI ({difficulty})");

                return new CreateGameResponse
                {
                    GameId = game.GameId,
                    GameCode = game.GameCode,
                    PlayerId = humanPlayer.PlayerId,
                    PlayerName = humanPlayer.PlayerName,
                    Status = game.Status.ToString(),
                    Message = $"Game started! You're playing against AI ({difficulty}). You go first!",
                    CreatedAt = game.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating AI game");
                throw;
            }
        }

        public async Task<JoinGameResponse> JoinGameAsync(JoinGameRequest request)
        {
            try
            {
                var game = await _context.Games
                    .Include(g => g.Players)
                    .FirstOrDefaultAsync(g => g.GameCode == request.GameCode.ToUpper());

                if (game == null)
                    throw new InvalidOperationException("Game not found. Please check the game code.");

                if (!game.CanAcceptPlayers())
                    throw new InvalidOperationException("Game is full or already started.");

                var player = new Player
                {
                    PlayerName = request.PlayerName,
                    GameId = game.GameId,
                    TurnOrder = 2,
                    IsCurrentTurn = false,
                    IsAI = false
                };

                _context.Players.Add(player);
                await _context.SaveChangesAsync();

                game = await _context.Games
                    .Include(g => g.Players)
                    .FirstOrDefaultAsync(g => g.GameId == game.GameId);

                if (game == null)
                    throw new InvalidOperationException("Game not found after player add.");

                game.StartGame();
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Player {player.PlayerName} joined game {game.GameCode}");

                var opponent = game.Players.FirstOrDefault(p => p.PlayerId != player.PlayerId);

                return new JoinGameResponse
                {
                    GameId = game.GameId,
                    GameCode = game.GameCode,
                    PlayerId = player.PlayerId,
                    PlayerName = player.PlayerName,
                    TurnOrder = player.TurnOrder,
                    Status = game.Status.ToString(),
                    IsYourTurn = player.IsCurrentTurn,
                    Message = $"Joined game! {opponent?.PlayerName} goes first.",
                    Opponent = opponent != null ? new PlayerInfo
                    {
                        PlayerId = opponent.PlayerId,
                        PlayerName = opponent.PlayerName,
                        TotalScore = opponent.TotalScore,
                        IsConnected = opponent.IsConnected
                    } : null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error joining game with code {request.GameCode}");
                throw;
            }
        }

        public async Task<RollDiceResponse> RollDiceAsync(RollDiceRequest request)
        {
            try
            {
                var game = await _context.Games
                    .Include(g => g.Players)
                    .Include(g => g.Turns)
                    .FirstOrDefaultAsync(g => g.GameId == request.GameId);

                if (game == null)
                    throw new InvalidOperationException("Game not found.");

                if (game.Status != GameStatus.InProgress)
                    throw new InvalidOperationException("Game is not in progress. Waiting for second player to join.");

                var player = game.Players.FirstOrDefault(p => p.PlayerId == request.PlayerId);
                if (player == null)
                    throw new InvalidOperationException("Player not found in this game.");

                if (!player.IsCurrentTurn)
                    throw new InvalidOperationException("It's not your turn.");

                var currentTurn = game.Turns
                    .Where(t => t.PlayerId == player.PlayerId && t.Status == TurnStatus.Active)
                    .OrderByDescending(t => t.StartedAt)
                    .FirstOrDefault();

                if (currentTurn == null)
                {
                    currentTurn = new Turn
                    {
                        GameId = game.GameId,
                        PlayerId = player.PlayerId,
                        TurnNumber = game.Turns.Count + 1,
                        DiceRemaining = GameRules.TotalDice
                    };
                    _context.Turns.Add(currentTurn);
                }

                int diceToRoll = request.NumberOfDice > 0
                    ? request.NumberOfDice
                    : currentTurn.DiceRemaining;

                var diceValues = _diceService.RollDice(diceToRoll);
                var roll = _diceService.CalculateScore(diceValues);

                currentTurn.RecordRoll(diceValues);

                if (roll.IsFarkle)
                {
                    currentTurn.Farkle();
                    player.ClearCurrentTurnScore();
                    game.SwitchToNextPlayer();

                    await _context.SaveChangesAsync();

                    return new RollDiceResponse
                    {
                        Roll = roll,
                        CurrentTurnScore = 0,
                        TotalScore = player.TotalScore,
                        DiceAvailableForNextRoll = 0,
                        TurnEnded = true,
                        CanContinue = false,
                        ShouldBank = false,
                        Message = "FARKLE! No scoring dice. Your turn has ended.",
                        GameOver = false
                    };
                }

                currentTurn.AddPoints(roll.TotalPoints);
                player.AddToCurrentTurnScore(roll.TotalPoints);

                if (roll.IsHotDice)
                {
                    currentTurn.ResetForHotDice();
                    game.AvailableDice = GameRules.TotalDice;
                }
                else
                {
                    currentTurn.UpdateDiceRemaining(roll.RemainingDice);
                    game.AvailableDice = roll.RemainingDice;
                }

                await _context.SaveChangesAsync();

                return new RollDiceResponse
                {
                    Roll = roll,
                    CurrentTurnScore = player.CurrentTurnScore,
                    TotalScore = player.TotalScore,
                    DiceAvailableForNextRoll = currentTurn.DiceRemaining,
                    TurnEnded = false,
                    CanContinue = currentTurn.DiceRemaining > 0,
                    ShouldBank = player.CurrentTurnScore >= GameRules.MinimumScoreToGetOnBoard,
                    Message = roll.Message,
                    GameOver = false
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rolling dice");
                throw;
            }
        }

        public async Task<BankPointsResponse> BankPointsAsync(BankPointsRequest request)
        {
            try
            {
                var game = await _context.Games
                    .Include(g => g.Players)
                    .Include(g => g.Turns)
                    .FirstOrDefaultAsync(g => g.GameId == request.GameId);

                if (game == null)
                    throw new InvalidOperationException("Game not found.");

                var player = game.Players.FirstOrDefault(p => p.PlayerId == request.PlayerId);
                if (player == null)
                    throw new InvalidOperationException("Player not found.");

                if (!player.IsCurrentTurn)
                    throw new InvalidOperationException("It's not your turn.");

                if (player.CurrentTurnScore == 0)
                    throw new InvalidOperationException("No points to bank. Roll dice first.");

                var currentTurn = game.Turns
                    .Where(t => t.PlayerId == player.PlayerId && t.Status == TurnStatus.Active)
                    .OrderByDescending(t => t.StartedAt)
                    .FirstOrDefault();

                if (currentTurn != null)
                {
                    currentTurn.BankPoints();
                }

                int pointsBanked = player.CurrentTurnScore;
                player.BankCurrentTurnScore();

                bool hasWon = player.HasWon();
                if (hasWon)
                {
                    game.EndGame(player.PlayerId);
                    await _context.SaveChangesAsync();

                    return new BankPointsResponse
                    {
                        PointsBanked = pointsBanked,
                        NewTotalScore = player.TotalScore,
                        IsOnBoard = player.IsOnBoard,
                        HasWon = true,
                        NextPlayerId = Guid.Empty,
                        NextPlayerName = string.Empty,
                        Message = $"🎉 Congratulations! You won with {player.TotalScore} points!",
                        GameStatus = game.Status.ToString()
                    };
                }

                game.SwitchToNextPlayer();
                await _context.SaveChangesAsync();

                var nextPlayer = game.GetCurrentPlayer();

                return new BankPointsResponse
                {
                    PointsBanked = pointsBanked,
                    NewTotalScore = player.TotalScore,
                    IsOnBoard = player.IsOnBoard,
                    HasWon = false,
                    NextPlayerId = nextPlayer?.PlayerId ?? Guid.Empty,
                    NextPlayerName = nextPlayer?.PlayerName ?? string.Empty,
                    Message = $"Banked {pointsBanked} points! Total: {player.TotalScore}. {nextPlayer?.PlayerName}'s turn.",
                    GameStatus = game.Status.ToString()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error banking points");
                throw;
            }
        }

        public async Task<bool> IsAIPlayerAsync(Guid playerId)
        {
            var player = await _context.Players.FindAsync(playerId);
            return player?.IsAI ?? false;
        }

        public async Task<AITurnResult> ExecuteAITurnAsync(Guid gameId, Guid aiPlayerId)
        {
            var player = await _context.Players.FindAsync(aiPlayerId);
            if (player == null || !player.IsAI)
                throw new InvalidOperationException("Player is not an AI player.");

            _aiPlayerService.SetAIDifficulty((AIPlayer)player.AIDifficulty);
            return await _aiPlayerService.TakeAITurnAsync(gameId, aiPlayerId);
        }

        public async Task<GameStateResponse> GetGameStateAsync(Guid gameId)
        {
            var game = await _context.Games
                .Include(g => g.Players)
                .Include(g => g.Winner)
                .FirstOrDefaultAsync(g => g.GameId == gameId);

            if (game == null)
                throw new InvalidOperationException("Game not found.");

            return MapToGameStateResponse(game);
        }

        public async Task<GameStateResponse?> GetGameByCodeAsync(string gameCode)
        {
            var game = await _context.Games
                .Include(g => g.Players)
                .Include(g => g.Winner)
                .FirstOrDefaultAsync(g => g.GameCode == gameCode.ToUpper());

            return game != null ? MapToGameStateResponse(game) : null;
        }

        public async Task<bool> CanPlayerActAsync(Guid gameId, Guid playerId)
        {
            var game = await _context.Games
                .Include(g => g.Players)
                .FirstOrDefaultAsync(g => g.GameId == gameId);

            if (game == null || game.Status != GameStatus.InProgress)
                return false;

            var player = game.Players.FirstOrDefault(p => p.PlayerId == playerId);
            return player != null && player.IsCurrentTurn;
        }

        public async Task<bool> AbandonGameAsync(Guid gameId, Guid playerId)
        {
            try
            {
                var game = await _context.Games
                    .Include(g => g.Players)
                    .FirstOrDefaultAsync(g => g.GameId == gameId);

                if (game == null)
                    return false;

                game.AbandonGame();
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Game {game.GameCode} abandoned by player {playerId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error abandoning game");
                return false;
            }
        }

        public async Task<List<GameStateResponse>> GetAvailableGamesAsync()
        {
            var games = await _context.Games
                .Include(g => g.Players)
                .Where(g => g.Status == GameStatus.WaitingForPlayers)
                .OrderByDescending(g => g.CreatedAt)
                .Take(20)
                .ToListAsync();

            return games.Select(MapToGameStateResponse).ToList();
        }

        public async Task<bool> ValidateGameCodeAsync(string gameCode)
        {
            var game = await _context.Games
                .Include(g => g.Players)
                .FirstOrDefaultAsync(g => g.GameCode == gameCode.ToUpper());

            return game != null && game.CanAcceptPlayers();
        }

        private GameStateResponse MapToGameStateResponse(Game game)
        {
            var currentPlayer = game.GetCurrentPlayer();
            var winner = game.Winner;

            return new GameStateResponse
            {
                GameId = game.GameId,
                GameCode = game.GameCode,
                Status = game.Status.ToString(),
                Players = game.Players.Select(p => new GamePlayerInfo
                {
                    PlayerId = p.PlayerId,
                    PlayerName = p.PlayerName,
                    TotalScore = p.TotalScore,
                    CurrentTurnScore = p.CurrentTurnScore,
                    IsOnBoard = p.IsOnBoard,
                    IsCurrentTurn = p.IsCurrentTurn,
                    TurnOrder = p.TurnOrder,
                    IsConnected = p.IsConnected,
                    IsAI = p.IsAI,
                    AIDifficulty = p.IsAI ? (int?)p.AIDifficulty : null
                }).ToList(),
                CurrentPlayer = currentPlayer != null ? new GamePlayerInfo
                {
                    PlayerId = currentPlayer.PlayerId,
                    PlayerName = currentPlayer.PlayerName,
                    TotalScore = currentPlayer.TotalScore,
                    CurrentTurnScore = currentPlayer.CurrentTurnScore,
                    IsOnBoard = currentPlayer.IsOnBoard,
                    IsCurrentTurn = currentPlayer.IsCurrentTurn,
                    TurnOrder = currentPlayer.TurnOrder,
                    IsConnected = currentPlayer.IsConnected,
                    IsAI = currentPlayer.IsAI,
                    AIDifficulty = currentPlayer.IsAI ? (int?)currentPlayer.AIDifficulty : null
                } : null,
                AvailableDice = game.AvailableDice,
                Winner = winner != null ? new GamePlayerInfo
                {
                    PlayerId = winner.PlayerId,
                    PlayerName = winner.PlayerName,
                    TotalScore = winner.TotalScore,
                    CurrentTurnScore = winner.CurrentTurnScore,
                    IsOnBoard = winner.IsOnBoard,
                    IsCurrentTurn = winner.IsCurrentTurn,
                    TurnOrder = winner.TurnOrder,
                    IsConnected = winner.IsConnected,
                    IsAI = winner.IsAI,
                    AIDifficulty = winner.IsAI ? (int?)winner.AIDifficulty : null
                } : null,
                CreatedAt = game.CreatedAt,
                StartedAt = game.StartedAt,
                CompletedAt = game.CompletedAt,
                LastActivityAt = game.LastActivityAt
            };
        }
    }
}