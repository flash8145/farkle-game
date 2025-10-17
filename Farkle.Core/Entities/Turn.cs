using System.ComponentModel.DataAnnotations;
using FarkleGame.Core.Enums;

namespace FarkleGame.Core.Entities
{
    /// <summary>
    /// Represents a single turn in a Farkle game
    /// </summary>
    public class Turn
    {
        /// <summary>
        /// Unique identifier for the turn
        /// </summary>
        [Key]
        public Guid TurnId { get; set; }

        /// <summary>
        /// Turn number in the game sequence
        /// </summary>
        public int TurnNumber { get; set; }

        /// <summary>
        /// Foreign key to the player taking this turn
        /// </summary>
        public Guid PlayerId { get; set; }

        /// <summary>
        /// Navigation property to the player
        /// </summary>
        public Player? Player { get; set; }

        /// <summary>
        /// Foreign key to the game this turn belongs to
        /// </summary>
        public Guid GameId { get; set; }

        /// <summary>
        /// Navigation property to the game
        /// </summary>
        public Game? Game { get; set; }

        /// <summary>
        /// Current status of the turn
        /// </summary>
        public TurnStatus Status { get; set; }

        /// <summary>
        /// Number of rolls taken in this turn
        /// </summary>
        public int RollCount { get; set; }

        /// <summary>
        /// Total points scored in this turn
        /// </summary>
        public int PointsScored { get; set; }

        /// <summary>
        /// Points banked (if turn was successful)
        /// </summary>
        public int PointsBanked { get; set; }

        /// <summary>
        /// Number of dice available for next roll
        /// </summary>
        public int DiceRemaining { get; set; }

        /// <summary>
        /// JSON string storing the history of all dice rolls in this turn
        /// Format: [[1,2,3,4,5,6], [1,5], [1]] - each array is one roll
        /// </summary>
        [MaxLength(1000)]
        public string? RollHistory { get; set; }

        /// <summary>
        /// Timestamp when turn started
        /// </summary>
        public DateTime StartedAt { get; set; }

        /// <summary>
        /// Timestamp when turn ended
        /// </summary>
        public DateTime? EndedAt { get; set; }

        /// <summary>
        /// Duration of the turn in seconds
        /// </summary>
        public int DurationSeconds { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public Turn()
        {
            TurnId = Guid.NewGuid();
            Status = TurnStatus.Active;
            RollCount = 0;
            PointsScored = 0;
            PointsBanked = 0;
            DiceRemaining = FarkleGame.Core.Constants.GameRules.TotalDice;
            StartedAt = DateTime.UtcNow;
            RollHistory = "[]";
        }

        /// <summary>
        /// Records a dice roll in the turn history
        /// </summary>
        public void RecordRoll(int[] diceValues)
        {
            RollCount++;

            // Parse existing history
            var rolls = System.Text.Json.JsonSerializer.Deserialize<List<int[]>>(RollHistory ?? "[]")
                        ?? new List<int[]>();

            // Add new roll
            rolls.Add(diceValues);

            // Serialize back to JSON
            RollHistory = System.Text.Json.JsonSerializer.Serialize(rolls);
        }

        /// <summary>
        /// Adds points to the turn score
        /// </summary>
        public void AddPoints(int points)
        {
            PointsScored += points;
        }

        /// <summary>
        /// Banks the current turn score
        /// </summary>
        public void BankPoints()
        {
            PointsBanked = PointsScored;
            Status = TurnStatus.Banked;
            EndTurn();
        }

        /// <summary>
        /// Marks the turn as Farkled (no scoring dice)
        /// </summary>
        public void Farkle()
        {
            Status = TurnStatus.Farkled;
            PointsScored = 0;
            PointsBanked = 0;
            EndTurn();
        }

        /// <summary>
        /// Completes the turn
        /// </summary>
        public void CompleteTurn()
        {
            Status = TurnStatus.Completed;
            EndTurn();
        }

        /// <summary>
        /// Ends the turn and calculates duration
        /// </summary>
        private void EndTurn()
        {
            EndedAt = DateTime.UtcNow;
            DurationSeconds = (int)(EndedAt.Value - StartedAt).TotalSeconds;
        }

        /// <summary>
        /// Updates the number of dice remaining
        /// </summary>
        public void UpdateDiceRemaining(int count)
        {
            DiceRemaining = count;
        }

        /// <summary>
        /// Checks if all dice were used (hot dice)
        /// </summary>
        public bool IsHotDice()
        {
            return DiceRemaining == 0 && FarkleGame.Core.Constants.GameRules.HotDiceEnabled;
        }

        /// <summary>
        /// Resets dice to full set for hot dice rule
        /// </summary>
        public void ResetForHotDice()
        {
            DiceRemaining = FarkleGame.Core.Constants.GameRules.TotalDice;
        }

        /// <summary>
        /// Gets all rolls from history
        /// </summary>
        public List<int[]> GetRollHistory()
        {
            return System.Text.Json.JsonSerializer.Deserialize<List<int[]>>(RollHistory ?? "[]")
                   ?? new List<int[]>();
        }
    }
}