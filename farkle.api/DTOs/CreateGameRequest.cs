using System.ComponentModel.DataAnnotations;

namespace FarkleGame.API.DTOs
{
    /// <summary>
    /// Request to create a new game
    /// </summary>
    public class CreateGameRequest
    {
        /// <summary>
        /// Name of the player creating the game
        /// </summary>
        [Required(ErrorMessage = "Player name is required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Player name must be between 2 and 50 characters")]
        public string PlayerName { get; set; } = string.Empty;
    }

    /// <summary>
    /// Response after creating a game
    /// </summary>
    public class CreateGameResponse
    {
        /// <summary>
        /// Unique game identifier
        /// </summary>
        public Guid GameId { get; set; }

        /// <summary>
        /// Game code for other players to join
        /// </summary>
        public string GameCode { get; set; } = string.Empty;

        /// <summary>
        /// Player ID of the creator
        /// </summary>
        public Guid PlayerId { get; set; }

        /// <summary>
        /// Player name
        /// </summary>
        public string PlayerName { get; set; } = string.Empty;

        /// <summary>
        /// Current game status
        /// </summary>
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// Message for the player
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Timestamp when game was created
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}