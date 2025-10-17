using Microsoft.AspNetCore.Mvc;
using FarkleGame.API.DTOs;
using FarkleGame.API.Models;
using FarkleGame.API.Services;
using FarkleGame.api.DTOs;

namespace FarkleGame.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class GameController : ControllerBase
    {
        private readonly IGameService _gameService;
        private readonly ILogger<GameController> _logger;

        public GameController(
            IGameService gameService,
            ILogger<GameController> logger)
        {
            _gameService = gameService;
            _logger = logger;
        }

        [HttpPost("create")]
        [ProducesResponseType(typeof(CreateGameResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CreateGameResponse>> CreateGame([FromBody] CreateGameRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var response = await _gameService.CreateGameAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating game");
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Creates a new game with AI opponent
        /// </summary>
        [HttpPost("create-ai")]
        [ProducesResponseType(typeof(CreateGameResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CreateGameResponse>> CreateAIGame([FromBody] CreateAIGameRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createRequest = new CreateGameRequest { PlayerName = request.PlayerName };
                var difficulty = (AIPlayer)request.AIDifficulty;

                var response = await _gameService.CreateGameWithAIAsync(createRequest, difficulty);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating AI game");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("join")]
        [ProducesResponseType(typeof(JoinGameResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<JoinGameResponse>> JoinGame([FromBody] JoinGameRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var response = await _gameService.JoinGameAsync(request);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid join game request");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining game");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("roll")]
        [ProducesResponseType(typeof(RollDiceResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<RollDiceResponse>> RollDice([FromBody] RollDiceRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var response = await _gameService.RollDiceAsync(request);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid roll dice request");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rolling dice");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("bank")]
        [ProducesResponseType(typeof(BankPointsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BankPointsResponse>> BankPoints([FromBody] BankPointsRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var response = await _gameService.BankPointsAsync(request);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid bank points request");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error banking points");
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Triggers AI to take its turn
        /// </summary>
        [HttpPost("ai-turn")]
        [ProducesResponseType(typeof(AITurnResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<AITurnResponse>> TriggerAITurn([FromBody] AITurnRequest request)
        {
            try
            {
                var result = await _gameService.ExecuteAITurnAsync(request.GameId, request.AIPlayerId);

                var gameState = await _gameService.GetGameStateAsync(request.GameId);

                var response = new AITurnResponse
                {
                    Summary = result.Summary,
                    PointsScored = result.PointsScored,
                    NewTotalScore = result.NewTotalScore,
                    Farkled = result.Farkled,
                    GameWon = result.GameWon,
                    RollCount = result.RollCount,
                    Rolls = result.Rolls.Select(r => new AIRollInfo
                    {
                        DiceValues = r.DiceValues,
                        Points = r.TotalPoints,
                        IsFarkle = r.IsFarkle,
                        IsHotDice = r.IsHotDice,
                        Message = r.Message ?? string.Empty
                    }).ToList(),
                    GameStatus = gameState.Status,
                    GameState = gameState
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing AI turn");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{gameId}")]
        [ProducesResponseType(typeof(GameStateResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<GameStateResponse>> GetGameState(Guid gameId)
        {
            try
            {
                var response = await _gameService.GetGameStateAsync(gameId);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, $"Game not found: {gameId}");
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game state");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("code/{gameCode}")]
        [ProducesResponseType(typeof(GameStateResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<GameStateResponse>> GetGameByCode(string gameCode)
        {
            try
            {
                var response = await _gameService.GetGameByCodeAsync(gameCode);
                if (response == null)
                    return NotFound(new { error = "Game not found" });

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game by code");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("available")]
        [ProducesResponseType(typeof(List<GameStateResponse>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<GameStateResponse>>> GetAvailableGames()
        {
            try
            {
                var response = await _gameService.GetAvailableGamesAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available games");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("validate/{gameCode}")]
        [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
        public async Task<ActionResult<bool>> ValidateGameCode(string gameCode)
        {
            try
            {
                var isValid = await _gameService.ValidateGameCodeAsync(gameCode);
                return Ok(new { isValid, gameCode });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating game code");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("abandon")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> AbandonGame([FromBody] AbandonGameRequest request)
        {
            try
            {
                var success = await _gameService.AbandonGameAsync(request.GameId, request.PlayerId);
                if (success)
                    return Ok(new { message = "Game abandoned successfully" });

                return BadRequest(new { error = "Failed to abandon game" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error abandoning game");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("can-act/{gameId}/{playerId}")]
        [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
        public async Task<ActionResult<bool>> CanPlayerAct(Guid gameId, Guid playerId)
        {
            try
            {
                var canAct = await _gameService.CanPlayerActAsync(gameId, playerId);
                return Ok(new { canAct });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if player can act");
                return BadRequest(new { error = ex.Message });
            }
        }
    }

    public class AbandonGameRequest
    {
        public Guid GameId { get; set; }
        public Guid PlayerId { get; set; }
    }

    public class AITurnRequest
    {
        public Guid GameId { get; set; }
        public Guid AIPlayerId { get; set; }
    }
}