using FarkleGame.API.Models;

namespace FarkleGame.API.Services
{
    /// <summary>
    /// Interface for dice rolling and scoring operations
    /// </summary>
    public interface IDiceService
    {
        /// <summary>
        /// Rolls the specified number of dice and returns random values
        /// </summary>
        /// <param name="numberOfDice">Number of dice to roll (1-6)</param>
        /// <returns>Array of dice values (1-6)</returns>
        int[] RollDice(int numberOfDice);

        /// <summary>
        /// Calculates the score for a given set of dice values
        /// </summary>
        /// <param name="diceValues">Array of dice values to score</param>
        /// <returns>DiceRoll object with scoring information</returns>
        DiceRoll CalculateScore(int[] diceValues);

        /// <summary>
        /// Finds all scoring combinations in the given dice values
        /// </summary>
        /// <param name="diceValues">Array of dice values</param>
        /// <returns>List of scoring combinations found</returns>
        List<ScoringCombination> FindScoringCombinations(int[] diceValues);

        /// <summary>
        /// Validates if the selected dice are valid scoring dice
        /// </summary>
        /// <param name="diceValues">All dice values rolled</param>
        /// <param name="selectedIndices">Indices of dice the player wants to keep</param>
        /// <returns>True if selection is valid, false otherwise</returns>
        bool ValidateDiceSelection(int[] diceValues, List<int> selectedIndices);

        /// <summary>
        /// Checks if all dice in the roll are scoring dice (hot dice)
        /// </summary>
        /// <param name="diceValues">Array of dice values</param>
        /// <returns>True if all dice score, false otherwise</returns>
        bool IsHotDice(int[] diceValues);

        /// <summary>
        /// Gets the scoring dice indices from a roll
        /// </summary>
        /// <param name="diceValues">Array of dice values</param>
        /// <returns>List of indices that contain scoring dice</returns>
        List<int> GetScoringDiceIndices(int[] diceValues);

        /// <summary>
        /// Checks if a specific set of dice values contains any scoring combinations
        /// </summary>
        /// <param name="diceValues">Array of dice values</param>
        /// <returns>True if at least one scoring combination exists, false if Farkle</returns>
        bool HasScoringDice(int[] diceValues);

        /// <summary>
        /// Calculates remaining dice after scoring dice are removed
        /// </summary>
        /// <param name="totalDice">Total number of dice rolled</param>
        /// <param name="scoringDiceCount">Number of dice that scored</param>
        /// <returns>Number of dice remaining for next roll</returns>
        int CalculateRemainingDice(int totalDice, int scoringDiceCount);
    }
}