using System.ComponentModel.DataAnnotations;
using FarkleGame.Core.Enums;

namespace FarkleGame.Core.Entities
{
    /// <summary>
    /// Represents a Farkle game session
    /// </summary>
    public class Game
    {
        /// <summary>
        /// Unique identifier for the game
        /// </summary>
        [Key]
        public Guid GameId { get; set; }

        /// <summary>
        /// Short code for players to join the game (e.g., "ABCD12")
        /// </summary>
        [Required]
        [MaxLength(10)]
        public string GameCode { get; set; } = string.Empty;

        /// <summary>
        /// Current status of the game
        /// </summary>
        public GameStatus Status { get; set; }

        /// <summary>
        /// Index of the current player (0 or 1)
        /// </summary>
        public int CurrentPlayerIndex { get; set; }

        /// <summary>
        /// Number of dice currently available to roll
        /// </summary>
        public int AvailableDice { get; set; }

        /// <summary>
        /// ID of the winning player (null if game not completed)
        /// </summary>
        public Guid? WinnerId { get; set; }

        /// <summary>
        /// Navigation property to winner
        /// </summary>
        public Player? Winner { get; set; }

        /// <summary>
        /// Collection of players in this game
        /// </summary>
        public ICollection<Player> Players { get; set; } = new List<Player>();

        /// <summary>
        /// Collection of all turns taken in this game
        /// </summary>
        public ICollection<Turn> Turns { get; set; } = new List<Turn>();

        /// <summary>
        /// Timestamp when game was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Timestamp when game started (both players joined)
        /// </summary>
        public DateTime? StartedAt { get; set; }

        /// <summary>
        /// Timestamp when game completed
        /// </summary>
        public DateTime? CompletedAt { get; set; }

        /// <summary>
        /// Last activity timestamp
        /// </summary>
        public DateTime LastActivityAt { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public Game()
        {
            GameId = Guid.NewGuid();
            GameCode = GenerateGameCode();
            Status = GameStatus.WaitingForPlayers;
            CurrentPlayerIndex = 0;
            AvailableDice = FarkleGame.Core.Constants.GameRules.TotalDice;
            CreatedAt = DateTime.UtcNow;
            LastActivityAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Generates a random 6-character game code
        /// </summary>
        private static string GenerateGameCode()
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excludes confusing chars like I, O, 0, 1
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        /// <summary>
        /// Checks if game is full (has 2 players)
        /// </summary>
        public bool IsFull()
        {
            return Players.Count >= FarkleGame.Core.Constants.GameRules.MaxPlayers;
        }

        /// <summary>
        /// Gets the current player whose turn it is
        /// </summary>
        public Player? GetCurrentPlayer()
        {
            if (Players.Count == 0)
                return null;

            var playersList = Players.OrderBy(p => p.TurnOrder).ToList();

            if (CurrentPlayerIndex >= playersList.Count)
                return null;

            return playersList[CurrentPlayerIndex];
        }

        /// <summary>
        /// Gets the opponent of the specified player
        /// </summary>
        public Player? GetOpponent(Guid playerId)
        {
            return Players.FirstOrDefault(p => p.PlayerId != playerId);
        }

        /// <summary>
        /// Switches to the next player's turn
        /// </summary>
        public void SwitchToNextPlayer()
        {
            var playersList = Players.OrderBy(p => p.TurnOrder).ToList();

            // Mark current player as not their turn
            if (CurrentPlayerIndex < playersList.Count)
            {
                playersList[CurrentPlayerIndex].IsCurrentTurn = false;
            }

            // Move to next player
            CurrentPlayerIndex = (CurrentPlayerIndex + 1) % playersList.Count;

            // Mark new current player
            if (CurrentPlayerIndex < playersList.Count)
            {
                playersList[CurrentPlayerIndex].IsCurrentTurn = true;
            }

            // Reset available dice for new turn
            AvailableDice = FarkleGame.Core.Constants.GameRules.TotalDice;

            UpdateActivity();
        }

        /// <summary>
        /// Starts the game when both players have joined
        /// </summary>
        public void StartGame()
        {
            if (Players.Count != FarkleGame.Core.Constants.GameRules.MaxPlayers)
                throw new InvalidOperationException("Cannot start game without 2 players");

            Status = GameStatus.InProgress;
            StartedAt = DateTime.UtcNow;

            // Set first player's turn
            var firstPlayer = Players.OrderBy(p => p.TurnOrder).First();
            firstPlayer.IsCurrentTurn = true;

            UpdateActivity();
        }

        /// <summary>
        /// Ends the game with a winner
        /// </summary>
        public void EndGame(Guid winnerId)
        {
            Status = GameStatus.Completed;
            WinnerId = winnerId;
            CompletedAt = DateTime.UtcNow;
            UpdateActivity();
        }

        /// <summary>
        /// Abandons the game
        /// </summary>
        public void AbandonGame()
        {
            Status = GameStatus.Abandoned;
            CompletedAt = DateTime.UtcNow;
            UpdateActivity();
        }

        /// <summary>
        /// Updates last activity timestamp
        /// </summary>
        public void UpdateActivity()
        {
            LastActivityAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Checks if game can accept new players
        /// </summary>
        public bool CanAcceptPlayers()
        {
            return Status == GameStatus.WaitingForPlayers && !IsFull();
        }
    }
}