namespace FarkleGame.API.Models
{
    /// <summary>
    /// Represents the result of a dice roll with scoring information
    /// </summary>
    public class DiceRoll
    {
        /// <summary>
        /// Array of dice values rolled (1-6)
        /// </summary>
        public int[] DiceValues { get; set; } = Array.Empty<int>();

        /// <summary>
        /// Total points scored from this roll
        /// </summary>
        public int TotalPoints { get; set; }

        /// <summary>
        /// Indicates if this roll resulted in a Farkle (no scoring dice)
        /// </summary>
        public bool IsFarkle { get; set; }

        /// <summary>
        /// List of scoring combinations found in this roll
        /// </summary>
        public List<ScoringCombination> ScoringCombinations { get; set; } = new List<ScoringCombination>();

        /// <summary>
        /// Indices of dice that scored (0-based index into DiceValues array)
        /// </summary>
        public List<int> ScoringDiceIndices { get; set; } = new List<int>();

        /// <summary>
        /// Number of dice that can be re-rolled (non-scoring dice)
        /// </summary>
        public int RemainingDice { get; set; }

        /// <summary>
        /// Indicates if all dice scored (hot dice rule)
        /// </summary>
        public bool IsHotDice { get; set; }

        /// <summary>
        /// Message describing the roll result
        /// </summary>
        public string? Message { get; set; }

        /// <summary>
        /// Timestamp when the roll occurred
        /// </summary>
        public DateTime RolledAt { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public DiceRoll()
        {
            RolledAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Creates a DiceRoll from an array of dice values
        /// </summary>
        public static DiceRoll FromValues(int[] values)
        {
            return new DiceRoll
            {
                DiceValues = values,
                RolledAt = DateTime.UtcNow
            };
        }
    }

    /// <summary>
    /// Represents a scoring combination found in a dice roll
    /// </summary>
    public class ScoringCombination
    {
        /// <summary>
        /// Type of combination (e.g., "Three of a Kind", "Single 1", "Straight")
        /// </summary>
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// Description of the combination (e.g., "Three 4s", "Single 1")
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Dice values that form this combination
        /// </summary>
        public int[] DiceValues { get; set; } = Array.Empty<int>();

        /// <summary>
        /// Points awarded for this combination
        /// </summary>
        public int Points { get; set; }

        /// <summary>
        /// Indices of dice involved in this combination
        /// </summary>
        public List<int> DiceIndices { get; set; } = new List<int>();
    }

    /// <summary>
    /// Request model for rolling dice
    /// </summary>
    public class RollDiceRequest
    {
        /// <summary>
        /// Game ID
        /// </summary>
        public Guid GameId { get; set; }

        /// <summary>
        /// Player ID making the roll
        /// </summary>
        public Guid PlayerId { get; set; }

        /// <summary>
        /// Number of dice to roll
        /// </summary>
        public int NumberOfDice { get; set; }

        /// <summary>
        /// Optional: Specific dice indices to keep from previous roll
        /// Used when player selects which scoring dice to keep
        /// </summary>
        public List<int>? KeptDiceIndices { get; set; }
    }

    /// <summary>
    /// Response model for dice roll result
    /// </summary>
    public class RollDiceResponse
    {
        /// <summary>
        /// The dice roll result
        /// </summary>
        public DiceRoll? Roll { get; set; }

        /// <summary>
        /// Current turn score (accumulated)
        /// </summary>
        public int CurrentTurnScore { get; set; }

        /// <summary>
        /// Player's total score
        /// </summary>
        public int TotalScore { get; set; }

        /// <summary>
        /// Number of dice available for next roll
        /// </summary>
        public int DiceAvailableForNextRoll { get; set; }

        /// <summary>
        /// Indicates if the turn ended (Farkle or all dice used)
        /// </summary>
        public bool TurnEnded { get; set; }

        /// <summary>
        /// Indicates if player can continue rolling
        /// </summary>
        public bool CanContinue { get; set; }

        /// <summary>
        /// Indicates if player should bank points
        /// </summary>
        public bool ShouldBank { get; set; }

        /// <summary>
        /// Message for the player
        /// </summary>
        public string? Message { get; set; }

        /// <summary>
        /// Indicates if the game is over
        /// </summary>
        public bool GameOver { get; set; }

        /// <summary>
        /// Winner ID if game is over
        /// </summary>
        public Guid? WinnerId { get; set; }
    }
}