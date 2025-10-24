namespace FarkleGame.API.DTOs
{
    /// <summary>
    /// Complete game state information
    /// </summary>
    public class GameStateResponse
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
        /// Current game status
        /// </summary>
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// List of players in the game
        /// </summary>
        public List<GamePlayerInfo> Players { get; set; } = new List<GamePlayerInfo>();

        /// <summary>
        /// Current player's turn
        /// </summary>
        public GamePlayerInfo? CurrentPlayer { get; set; }

        /// <summary>
        /// Number of dice available to roll
        /// </summary>
        public int AvailableDice { get; set; }

        /// <summary>
        /// Winner information (if game completed)
        /// </summary>
        public GamePlayerInfo? Winner { get; set; }

        /// <summary>
        /// Game created timestamp
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Game started timestamp
        /// </summary>
        public DateTime? StartedAt { get; set; }

        /// <summary>
        /// Game completed timestamp
        /// </summary>
        public DateTime? CompletedAt { get; set; }

        /// <summary>
        /// Last activity timestamp
        /// </summary>
        public DateTime LastActivityAt { get; set; }
    }

    /// <summary>
    /// Player information in game state
    /// </summary>
    public class GamePlayerInfo
    {
        /// <summary>
        /// Player ID
        /// </summary>
        public Guid PlayerId { get; set; }

        /// <summary>
        /// Player name
        /// </summary>
        public string PlayerName { get; set; } = string.Empty;

        /// <summary>
        /// Total score
        /// </summary>
        public int TotalScore { get; set; }

        /// <summary>
        /// Current turn score (not yet banked)
        /// </summary>
        public int CurrentTurnScore { get; set; }

        /// <summary>
        /// Is player on the board
        /// </summary>
        public bool IsOnBoard { get; set; }

        /// <summary>
        /// Is it this player's turn
        /// </summary>
        public bool IsCurrentTurn { get; set; }

        /// <summary>
        /// Turn order
        /// </summary>
        public int TurnOrder { get; set; }

        /// <summary>
        /// Is player connected
        /// </summary>
        public bool IsConnected { get; set; }

        /// <summary>
        /// Is this player an AI
        /// </summary>
        public bool IsAI { get; set; }

        /// <summary>
        /// AI difficulty level (if IsAI is true)
        /// </summary>
        public int? AIDifficulty { get; set; }
    }
}