using System.ComponentModel.DataAnnotations;

namespace FarkleGame.API.DTOs
{
    /// <summary>
    /// Request to join an existing game
    /// </summary>
    public class JoinGameRequest
    {
        /// <summary>
        /// Game code to join
        /// </summary>
        [Required(ErrorMessage = "Game code is required")]
        [StringLength(10, MinimumLength = 6, ErrorMessage = "Game code must be between 6 and 10 characters")]
        public string GameCode { get; set; } = string.Empty;

        /// <summary>
        /// Name of the player joining
        /// </summary>
        [Required(ErrorMessage = "Player name is required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Player name must be between 2 and 50 characters")]
        public string PlayerName { get; set; } = string.Empty;
    }

    /// <summary>
    /// Response after joining a game
    /// </summary>
    public class JoinGameResponse
    {
        /// <summary>
        /// Game ID
        /// </summary>
        public Guid GameId { get; set; }

        /// <summary>
        /// Game code
        /// </summary>
        public string GameCode { get; set; } = string.Empty;

        /// <summary>
        /// Player ID of the joining player
        /// </summary>
        public Guid PlayerId { get; set; }

        /// <summary>
        /// Player name
        /// </summary>
        public string PlayerName { get; set; } = string.Empty;

        /// <summary>
        /// Turn order (1 or 2)
        /// </summary>
        public int TurnOrder { get; set; }

        /// <summary>
        /// Current game status
        /// </summary>
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// Indicates if it's this player's turn
        /// </summary>
        public bool IsYourTurn { get; set; }

        /// <summary>
        /// Message for the player
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Opponent player information
        /// </summary>
        public PlayerInfo? Opponent { get; set; }
    }

    /// <summary>
    /// Basic player information
    /// </summary>
    public class PlayerInfo
    { 
        public Guid PlayerId { get; set; }
        public string PlayerName { get; set; } = string.Empty;
        public int TotalScore { get; set; }
        public bool IsConnected { get; set; }
    }
}