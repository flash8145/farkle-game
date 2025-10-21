namespace FarkleGame.Core.Constants
{
    /// <summary>
    /// Contains all the game rules and scoring constants for Farkle
    /// </summary>
    public static class GameRules
    {
        /// <summary>
        /// Total number of dice used in the game
        /// </summary>
        public const int TotalDice = 6;

        /// <summary>
        /// Points needed to win the game (UPDATED: Changed from 10,000 to 5,000)
        /// </summary>
        public const int WinningScore = 5000;

        /// <summary>
        /// Minimum score required to get on the board (first scoring turn)
        /// </summary>
        public const int MinimumScoreToGetOnBoard = 500;

        /// <summary>
        /// Maximum number of players allowed in a game
        /// </summary>
        public const int MaxPlayers = 2;

        #region Scoring Rules

        /// <summary>
        /// Points for a single 1
        /// </summary>
        public const int SingleOnePoints = 100;

        /// <summary>
        /// Points for a single 5
        /// </summary>
        public const int SingleFivePoints = 50;

        /// <summary>
        /// Points for three 1s
        /// </summary>
        public const int ThreeOnesPoints = 1000;

        /// <summary>
        /// Points for three of any other number (2-6)
        /// Formula: Number × 100
        /// Example: Three 2s = 200, Three 3s = 300, etc.
        /// </summary>
        public const int ThreeOfAKindMultiplier = 100;

        /// <summary>
        /// Points for four of a kind
        /// Double the three of a kind score
        /// </summary>
        public const int FourOfAKindMultiplier = 2;

        /// <summary>
        /// Points for five of a kind
        /// Triple the three of a kind score
        /// </summary>
        public const int FiveOfAKindMultiplier = 3;

        /// <summary>
        /// Points for six of a kind
        /// Quadruple the three of a kind score
        /// </summary>
        public const int SixOfAKindMultiplier = 4;

        /// <summary>
        /// Points for a straight (1,2,3,4,5,6)
        /// </summary>
        public const int StraightPoints = 1500;

        /// <summary>
        /// Points for three pairs
        /// </summary>
        public const int ThreePairsPoints = 1500;

        /// <summary>
        /// Points for two triplets
        /// </summary>
        public const int TwoTripletsPoints = 2500;

        #endregion

        #region Game Settings

        /// <summary>
        /// Turn timeout in seconds (optional - for future features)
        /// </summary>
        public const int TurnTimeoutSeconds = 120;

        /// <summary>
        /// Whether hot dice rule is enabled
        /// (If all 6 dice score, player can roll all 6 again)
        /// </summary>
        public const bool HotDiceEnabled = true;

        #endregion

        #region Helper Methods

        /// <summary>
        /// Calculates points for three of a kind based on the dice value
        /// </summary>
        public static int GetThreeOfAKindPoints(int diceValue)
        {
            if (diceValue == 1)
                return ThreeOnesPoints;

            return diceValue * ThreeOfAKindMultiplier;
        }

        /// <summary>
        /// Calculates points for multiple of a kind (4, 5, or 6 dice)
        /// </summary>
        public static int GetMultipleOfAKindPoints(int diceValue, int count)
        {
            int basePoints = GetThreeOfAKindPoints(diceValue);

            return count switch
            {
                3 => basePoints,
                4 => basePoints * FourOfAKindMultiplier,
                5 => basePoints * FiveOfAKindMultiplier,
                6 => basePoints * SixOfAKindMultiplier,
                _ => 0
            };
        }

        #endregion
    }
}