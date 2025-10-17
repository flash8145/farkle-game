using System.ComponentModel.DataAnnotations;

namespace FarkleGame.Core.Entities
{
    /// <summary>
    /// Represents a player in the Farkle game
    /// </summary>
    public class Player
    {
        /// <summary>
        /// Unique identifier for the player
        /// </summary>
        [Key]
        public Guid PlayerId { get; set; }

        /// <summary>
        /// Display name of the player
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string PlayerName { get; set; } = string.Empty;

        /// <summary>
        /// Total accumulated score for the player
        /// </summary>
        public int TotalScore { get; set; }

        /// <summary>
        /// Points accumulated in the current turn (not yet banked)
        /// </summary>
        public int CurrentTurnScore { get; set; }

        /// <summary>
        /// Indicates if player has scored minimum points to get on board
        /// </summary>
        public bool IsOnBoard { get; set; }

        /// <summary>
        /// Indicates if it's currently this player's turn
        /// </summary>
        public bool IsCurrentTurn { get; set; }

        /// <summary>
        /// Player's position in turn order (1 or 2)
        /// </summary>
        public int TurnOrder { get; set; }

        /// <summary>
        /// Indicates if this is an AI player
        /// </summary>
        public bool IsAI { get; set; }

        /// <summary>
        /// AI difficulty level (0=Easy, 1=Medium, 2=Hard) - only used if IsAI=true
        /// </summary>
        public int AIDifficulty { get; set; }

        /// <summary>
        /// SignalR connection ID for real-time updates
        /// </summary>
        [MaxLength(100)]
        public string? ConnectionId { get; set; }

        /// <summary>
        /// Indicates if player is connected to the game
        /// </summary>
        public bool IsConnected { get; set; }

        /// <summary>
        /// Foreign key to the game this player belongs to
        /// </summary>
        public Guid GameId { get; set; }

        /// <summary>
        /// Navigation property to the game
        /// </summary>
        public Game? Game { get; set; }

        /// <summary>
        /// Collection of turns taken by this player
        /// </summary>
        public ICollection<Turn> Turns { get; set; } = new List<Turn>();

        /// <summary>
        /// Timestamp when player joined the game
        /// </summary>
        public DateTime JoinedAt { get; set; }

        /// <summary>
        /// Last activity timestamp
        /// </summary>
        public DateTime LastActivityAt { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public Player()
        {
            PlayerId = Guid.NewGuid();
            JoinedAt = DateTime.UtcNow;
            LastActivityAt = DateTime.UtcNow;
            IsConnected = true;
            IsAI = false;
            AIDifficulty = 1; // Medium by default
        }

        /// <summary>
        /// Adds points to current turn score
        /// </summary>
        public void AddToCurrentTurnScore(int points)
        {
            CurrentTurnScore += points;
        }

        /// <summary>
        /// Banks the current turn score to total score
        /// </summary>
        public void BankCurrentTurnScore()
        {
            TotalScore += CurrentTurnScore;

            // Check if player gets on board
            if (!IsOnBoard && TotalScore >= FarkleGame.Core.Constants.GameRules.MinimumScoreToGetOnBoard)
            {
                IsOnBoard = true;
            }

            CurrentTurnScore = 0;
        }

        /// <summary>
        /// Clears current turn score (when Farkled)
        /// </summary>
        public void ClearCurrentTurnScore()
        {
            CurrentTurnScore = 0;
        }

        /// <summary>
        /// Checks if player has won the game
        /// </summary>
        public bool HasWon()
        {
            return TotalScore >= FarkleGame.Core.Constants.GameRules.WinningScore;
        }

        /// <summary>
        /// Updates last activity timestamp
        /// </summary>
        public void UpdateActivity()
        {
            LastActivityAt = DateTime.UtcNow;
        }
    }
}