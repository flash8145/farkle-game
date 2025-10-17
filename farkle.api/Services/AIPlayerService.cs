using Microsoft.EntityFrameworkCore;
using FarkleGame.API.Data;
using FarkleGame.API.Models;
using FarkleGame.Core.Constants;
using FarkleGame.Core.Enums;

namespace FarkleGame.API.Services
{
    /// <summary>
    /// AI Player service with multiple difficulty levels
    /// </summary>
    public class AIPlayerService : IAIPlayerService
    {
        private readonly FarkleDbContext _context;
        private readonly IDiceService _diceService;
        private readonly ILogger<AIPlayerService> _logger;
        private AIPlayer _difficulty;

        public AIPlayerService(
            FarkleDbContext context,
            IDiceService diceService,
            ILogger<AIPlayerService> logger)
        {
            _context = context;
            _diceService = diceService;
            _logger = logger;
            _difficulty = AIPlayer.Medium;
        }

        public AIPlayer GetAIDifficulty() => _difficulty;

        public void SetAIDifficulty(AIPlayer difficulty) => _difficulty = difficulty;

        public async Task<AITurnResult> TakeAITurnAsync(Guid gameId, Guid aiPlayerId)
        {
            var result = new AITurnResult();

            try
            {
                var game = await _context.Games
                    .Include(g => g.Players)
                    .Include(g => g.Turns)
                    .FirstOrDefaultAsync(g => g.GameId == gameId);

                if (game == null)
                    throw new InvalidOperationException("Game not found.");

                var aiPlayer = game.Players.FirstOrDefault(p => p.PlayerId == aiPlayerId);
                if (aiPlayer == null)
                    throw new InvalidOperationException("AI player not found.");

                if (!aiPlayer.IsCurrentTurn)
                    throw new InvalidOperationException("Not AI's turn.");

                var opponent = game.Players.FirstOrDefault(p => p.PlayerId != aiPlayerId);
                int opponentScore = opponent?.TotalScore ?? 0;

                var currentTurn = game.Turns
                    .Where(t => t.PlayerId == aiPlayerId && t.Status == TurnStatus.Active)
                    .OrderByDescending(t => t.StartedAt)
                    .FirstOrDefault();

                if (currentTurn == null)
                {
                    currentTurn = new Core.Entities.Turn
                    {
                        GameId = game.GameId,
                        PlayerId = aiPlayer.PlayerId,
                        TurnNumber = game.Turns.Count + 1,
                        DiceRemaining = GameRules.TotalDice
                    };
                    _context.Turns.Add(currentTurn);
                }

                bool continueTurn = true;
                int diceToRoll = currentTurn.DiceRemaining;

                while (continueTurn)
                {
                    var diceValues = _diceService.RollDice(diceToRoll);
                    var roll = _diceService.CalculateScore(diceValues);

                    result.Rolls.Add(roll);
                    result.RollCount++;

                    currentTurn.RecordRoll(diceValues);

                    _logger.LogInformation($"AI rolled: [{string.Join(", ", diceValues)}] - Points: {roll.TotalPoints}");

                    if (roll.IsFarkle)
                    {
                        currentTurn.Farkle();
                        aiPlayer.ClearCurrentTurnScore();
                        game.SwitchToNextPlayer();

                        result.Farkled = true;
                        result.Decision = "Farkled";
                        result.PointsScored = 0;
                        result.NewTotalScore = aiPlayer.TotalScore;
                        result.Summary = $"🤖 AI rolled {result.RollCount} time(s) and FARKLED! No points scored.";

                        await _context.SaveChangesAsync();
                        return result;
                    }

                    currentTurn.AddPoints(roll.TotalPoints);
                    aiPlayer.AddToCurrentTurnScore(roll.TotalPoints);

                    if (roll.IsHotDice)
                    {
                        currentTurn.ResetForHotDice();
                        game.AvailableDice = GameRules.TotalDice;
                        diceToRoll = GameRules.TotalDice;
                        _logger.LogInformation("AI got HOT DICE! Rolling all 6 again.");
                    }
                    else
                    {
                        currentTurn.UpdateDiceRemaining(roll.RemainingDice);
                        game.AvailableDice = roll.RemainingDice;
                        diceToRoll = roll.RemainingDice;
                    }

                    if (diceToRoll == 0 && !roll.IsHotDice)
                    {
                        continueTurn = false;
                    }
                    else
                    {
                        continueTurn = !ShouldBank(
                            aiPlayer.CurrentTurnScore,
                            aiPlayer.TotalScore,
                            opponentScore,
                            diceToRoll
                        );
                    }

                    await Task.Delay(500);
                }

                currentTurn.BankPoints();
                int pointsBanked = aiPlayer.CurrentTurnScore;
                aiPlayer.BankCurrentTurnScore();

                result.PointsScored = pointsBanked;
                result.NewTotalScore = aiPlayer.TotalScore;
                result.Decision = "Banked";

                if (aiPlayer.HasWon())
                {
                    game.EndGame(aiPlayer.PlayerId);
                    result.GameWon = true;
                    result.Summary = $"🤖 AI rolled {result.RollCount} time(s), banked {pointsBanked} points (Total: {aiPlayer.TotalScore}) and WON THE GAME! 🏆";
                }
                else
                {
                    game.SwitchToNextPlayer();
                    result.Summary = $"🤖 AI rolled {result.RollCount} time(s) and banked {pointsBanked} points. Total score: {aiPlayer.TotalScore}";
                }

                await _context.SaveChangesAsync();

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during AI turn");
                throw;
            }
        }

        public bool ShouldBank(int currentTurnScore, int totalScore, int opponentScore, int diceRemaining)
        {
            if (totalScore == 0 && currentTurnScore < GameRules.MinimumScoreToGetOnBoard)
                return false;

            switch (_difficulty)
            {
                case AIPlayer.Easy:
                    return ShouldBankEasy(currentTurnScore, totalScore, opponentScore, diceRemaining);
                case AIPlayer.Medium:
                    return ShouldBankMedium(currentTurnScore, totalScore, opponentScore, diceRemaining);
                case AIPlayer.Hard:
                    return ShouldBankHard(currentTurnScore, totalScore, opponentScore, diceRemaining);
                default:
                    return ShouldBankMedium(currentTurnScore, totalScore, opponentScore, diceRemaining);
            }
        }

        private bool ShouldBankEasy(int currentTurnScore, int totalScore, int opponentScore, int diceRemaining)
        {
            if (currentTurnScore >= 300)
                return true;

            if (diceRemaining <= 2)
                return true;

            if (currentTurnScore >= 200 && opponentScore > totalScore)
                return true;

            return false;
        }

        private bool ShouldBankMedium(int currentTurnScore, int totalScore, int opponentScore, int diceRemaining)
        {
            if (currentTurnScore >= 500)
                return true;

            if (diceRemaining == 1)
                return true;

            if (currentTurnScore >= 350 && diceRemaining == 2)
                return true;

            if (opponentScore > totalScore + 2000)
            {
                if (currentTurnScore >= 700)
                    return true;
            }
            else if (opponentScore < totalScore)
            {
                if (currentTurnScore >= 400)
                    return true;
            }

            if (totalScore + currentTurnScore >= GameRules.WinningScore - 500)
            {
                if (currentTurnScore >= 300)
                    return true;
            }

            return false;
        }

        private bool ShouldBankHard(int currentTurnScore, int totalScore, int opponentScore, int diceRemaining)
        {
            if (currentTurnScore >= 800)
                return true;

            if (diceRemaining == 1 && currentTurnScore >= 200)
                return true;

            if (opponentScore > totalScore + 3000)
            {
                if (currentTurnScore >= 1000)
                    return true;
            }
            else if (opponentScore > totalScore + 1000)
            {
                if (currentTurnScore >= 700)
                    return true;
            }
            else if (opponentScore < totalScore)
            {
                if (currentTurnScore >= 600)
                    return true;
            }

            if (totalScore + currentTurnScore >= GameRules.WinningScore)
            {
                return true;
            }
            else if (totalScore + currentTurnScore >= GameRules.WinningScore - 1000)
            {
                if (currentTurnScore >= 400 || diceRemaining <= 2)
                    return true;
            }

            return false;
        }
    }
}