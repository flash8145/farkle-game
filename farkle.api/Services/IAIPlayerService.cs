using FarkleGame.API.Models;

namespace FarkleGame.API.Services
{
    /// <summary>
    /// Interface for AI player decision-making
    /// </summary>
    public interface IAIPlayerService
    {
        /// <summary>
        /// Makes the AI player take its turn
        /// </summary>
        /// <param name="gameId">Game ID</param>
        /// <param name="aiPlayerId">AI Player ID</param>
        /// <returns>Summary of AI's turn</returns>
        Task<AITurnResult> TakeAITurnAsync(Guid gameId, Guid aiPlayerId);

        /// <summary>
        /// Determines if AI should bank or continue rolling
        /// </summary>
        /// <param name="currentTurnScore">Points accumulated this turn</param>
        /// <param name="totalScore">AI's total score</param>
        /// <param name="opponentScore">Opponent's score</param>
        /// <param name="diceRemaining">Number of dice available</param>
        /// <returns>True if AI should bank, false to continue</returns>
        bool ShouldBank(int currentTurnScore, int totalScore, int opponentScore, int diceRemaining);

        /// <summary>
        /// Gets the AI difficulty level
        /// </summary>
        AIPlayer GetAIDifficulty();

        /// <summary>
        /// Sets the AI difficulty level
        /// </summary>
        void SetAIDifficulty(AIPlayer difficulty);
    }

    /// <summary>
    /// AI difficulty levels
    /// </summary>
    public enum AIPlayer
    {
        /// <summary>
        /// Easy - Banks early, conservative play
        /// </summary>
        Easy = 0,

        /// <summary>
        /// Medium - Balanced risk-taking
        /// </summary>
        Medium = 1,

        /// <summary>
        /// Hard - Aggressive play, calculated risks
        /// </summary>
        Hard = 2
    }

    /// <summary>
    /// Result of an AI player's turn
    /// </summary>
    public class AITurnResult
    {
        /// <summary>
        /// Total points scored this turn
        /// </summary>
        public int PointsScored { get; set; }

        /// <summary>
        /// Whether the AI farkled
        /// </summary>
        public bool Farkled { get; set; }

        /// <summary>
        /// List of all rolls made during the turn
        /// </summary>
        public List<DiceRoll> Rolls { get; set; } = new List<DiceRoll>();

        /// <summary>
        /// Final decision (Banked or Farkled)
        /// </summary>
        public string Decision { get; set; } = string.Empty;

        /// <summary>
        /// AI's new total score
        /// </summary>
        public int NewTotalScore { get; set; }

        /// <summary>
        /// Summary message of AI's turn
        /// </summary>
        public string Summary { get; set; } = string.Empty;

        /// <summary>
        /// Number of rolls taken
        /// </summary>
        public int RollCount { get; set; }

        /// <summary>
        /// Whether AI won the game
        /// </summary>
        public bool GameWon { get; set; }
    }
}