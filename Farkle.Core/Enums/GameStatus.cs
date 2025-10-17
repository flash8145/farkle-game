namespace FarkleGame.Core.Enums
{
    /// <summary>
    /// Represents the current status of a Farkle game session
    /// </summary>
    public enum GameStatus
    {
        /// <summary>
        /// Game has been created but waiting for second player to join
        /// </summary>
        WaitingForPlayers = 0,

        /// <summary>
        /// Both players have joined and game is ready to start
        /// </summary>
        Ready = 1,

        /// <summary>
        /// Game is currently in progress with players taking turns
        /// </summary>
        InProgress = 2,

        /// <summary>
        /// Game has completed with a winner determined
        /// </summary>
        Completed = 3,

        /// <summary>
        /// Game was abandoned or cancelled before completion
        /// </summary>
        Abandoned = 4,

        /// <summary>
        /// Game is paused (optional - for future features)
        /// </summary>
        Paused = 5
    }
}