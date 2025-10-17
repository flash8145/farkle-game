namespace FarkleGame.Core.Enums
{
    /// <summary>
    /// Represents the current status of a player's turn in Farkle
    /// </summary>
    public enum TurnStatus
    {
        /// <summary>
        /// Turn is currently active and player can roll dice
        /// </summary>
        Active = 0,

        /// <summary>
        /// Player rolled but got no scoring combinations (Farkle!)
        /// Turn ends with no points added to score
        /// </summary>
        Farkled = 1,

        /// <summary>
        /// Player chose to bank their points and end turn successfully
        /// Points are added to their total score
        /// </summary>
        Banked = 2,

        /// <summary>
        /// Player has rolled all dice and must decide to continue or bank
        /// </summary>
        PendingDecision = 3,

        /// <summary>
        /// Turn has been completed (either banked or farkled)
        /// </summary>
        Completed = 4,

        /// <summary>
        /// Turn was abandoned or timed out (optional - for future features)
        /// </summary>
        Abandoned = 5
    }
}