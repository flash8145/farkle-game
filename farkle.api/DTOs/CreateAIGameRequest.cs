using FarkleGame.API.DTOs;
using System.ComponentModel.DataAnnotations;

namespace FarkleGame.api.DTOs
{
    /// <summary>
    /// Request to create a new game with AI opponent
    /// </summary>
    public class CreateAIGameRequest
    {
        /// <summary>
        /// Name of the human player
        /// </summary>
        [Required(ErrorMessage = "Player name is required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Player name must be between 2 and 50 characters")]
        public string PlayerName { get; set; } = string.Empty;

        /// <summary>
        /// AI difficulty level (0=Easy, 1=Medium, 2=Hard)
        /// </summary>
        [Range(0, 2, ErrorMessage = "AI difficulty must be 0 (Easy), 1 (Medium), or 2 (Hard)")]
        public int AIDifficulty { get; set; } = 1; // Default to Medium
    }

    /// <summary>
    /// Response after AI takes its turn
    /// </summary>
    public class AITurnResponse
    {
        /// <summary>
        /// Summary of what the AI did
        /// </summary>
        public string Summary { get; set; } = string.Empty;

        /// <summary>
        /// Points the AI scored
        /// </summary>
        public int PointsScored { get; set; }

        /// <summary>
        /// AI's new total score
        /// </summary>
        public int NewTotalScore { get; set; }

        /// <summary>
        /// Whether AI farkled
        /// </summary>
        public bool Farkled { get; set; }

        /// <summary>
        /// Whether AI won the game
        /// </summary>
        public bool GameWon { get; set; }

        /// <summary>
        /// Number of rolls AI made
        /// </summary>
        public int RollCount { get; set; }

        /// <summary>
        /// All dice rolls the AI made
        /// </summary>
        public List<AIRollInfo> Rolls { get; set; } = new List<AIRollInfo>();

        /// <summary>
        /// Current game status
        /// </summary>
        public string GameStatus { get; set; } = string.Empty;

        /// <summary>
        /// Updated game state
        /// </summary>
        public GameStateResponse? GameState { get; set; }
    }

    /// <summary>
    /// Information about a single AI dice roll
    /// </summary>
    public class AIRollInfo
    {
        public int[] DiceValues { get; set; } = Array.Empty<int>();
        public int Points { get; set; }
        public bool IsFarkle { get; set; }
        public bool IsHotDice { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}