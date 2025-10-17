using System.ComponentModel.DataAnnotations;

namespace FarkleGame.API.DTOs
{
    /// <summary>
    /// Request to bank points and end turn
    /// </summary>
    public class BankPointsRequest
    {
        /// <summary>
        /// Game ID
        /// </summary>
        [Required]
        public Guid GameId { get; set; }

        /// <summary>
        /// Player ID banking the points
        /// </summary>
        [Required]
        public Guid PlayerId { get; set; }
    }

    /// <summary>
    /// Response after banking points
    /// </summary>
    public class BankPointsResponse
    {
        /// <summary>
        /// Points that were banked
        /// </summary>
        public int PointsBanked { get; set; }

        /// <summary>
        /// Player's new total score
        /// </summary>
        public int NewTotalScore { get; set; }

        /// <summary>
        /// Indicates if player is now on the board
        /// </summary>
        public bool IsOnBoard { get; set; }

        /// <summary>
        /// Indicates if player won the game
        /// </summary>
        public bool HasWon { get; set; }

        /// <summary>
        /// Next player's ID
        /// </summary>
        public Guid NextPlayerId { get; set; }

        /// <summary>
        /// Next player's name
        /// </summary>
        public string NextPlayerName { get; set; } = string.Empty;

        /// <summary>
        /// Message for the player
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Current game status
        /// </summary>
        public string GameStatus { get; set; } = string.Empty;
    }
}