using FarkleGame.API.Models;
using FarkleGame.Core.Constants;

namespace FarkleGame.API.Services
{
    /// <summary>
    /// Implementation of dice rolling and scoring operations
    /// </summary>
    public class DiceService : IDiceService
    {
        private readonly Random _random;

        public DiceService()
        {
            _random = new Random();
        }

        /// <summary>
        /// Rolls the specified number of dice
        /// </summary>
        public int[] RollDice(int numberOfDice)
        {
            if (numberOfDice < 1 || numberOfDice > GameRules.TotalDice)
                throw new ArgumentException($"Number of dice must be between 1 and {GameRules.TotalDice}");

            var dice = new int[numberOfDice];
            for (int i = 0; i < numberOfDice; i++)
            {
                dice[i] = _random.Next(1, 7); // Random number between 1 and 6
            }

            return dice;
        }

        /// <summary>
        /// Calculates the score for a given set of dice values
        /// </summary>
        public DiceRoll CalculateScore(int[] diceValues)
        {
            var result = new DiceRoll
            {
                DiceValues = diceValues,
                RolledAt = DateTime.UtcNow
            };

            // Find all scoring combinations
            result.ScoringCombinations = FindScoringCombinations(diceValues);

            // Calculate total points
            result.TotalPoints = result.ScoringCombinations.Sum(c => c.Points);

            // Check if Farkle (no scoring dice)
            result.IsFarkle = result.TotalPoints == 0;

            // Get scoring dice indices
            result.ScoringDiceIndices = GetScoringDiceIndices(diceValues);

            // Calculate remaining dice
            result.RemainingDice = diceValues.Length - result.ScoringDiceIndices.Count;

            // Check for hot dice
            result.IsHotDice = result.RemainingDice == 0 && !result.IsFarkle;

            // Set message
            if (result.IsFarkle)
            {
                result.Message = "Farkle! No scoring dice. Turn ends.";
            }
            else if (result.IsHotDice)
            {
                result.Message = $"Hot Dice! All dice scored {result.TotalPoints} points. Roll all 6 dice again!";
            }
            else
            {
                result.Message = $"Scored {result.TotalPoints} points! {result.RemainingDice} dice remaining.";
            }

            return result;
        }

        /// <summary>
        /// Finds all scoring combinations in the given dice values
        /// </summary>
        public List<ScoringCombination> FindScoringCombinations(int[] diceValues)
        {
            var combinations = new List<ScoringCombination>();
            var usedIndices = new HashSet<int>();

            // Sort dice for easier pattern matching
            var sortedDice = diceValues.Select((value, index) => (value, index))
                                       .OrderBy(x => x.value)
                                       .ToList();

            // Check for Straight (1,2,3,4,5,6)
            if (CheckForStraight(sortedDice, out var straightCombination))
            {
                combinations.Add(straightCombination);
                return combinations; // Straight uses all dice
            }

            // Check for Three Pairs
            if (CheckForThreePairs(sortedDice, out var threePairsCombination))
            {
                combinations.Add(threePairsCombination);
                return combinations; // Three pairs uses all dice
            }

            // Check for Two Triplets
            if (CheckForTwoTriplets(sortedDice, out var twoTripletsCombination))
            {
                combinations.Add(twoTripletsCombination);
                return combinations; // Two triplets uses all dice
            }

            // Group dice by value
            var groups = sortedDice.GroupBy(d => d.value)
                                   .OrderByDescending(g => g.Count())
                                   .ThenByDescending(g => g.Key)
                                   .ToList();

            // Check for multiple of a kind (6, 5, 4, or 3 of a kind)
            foreach (var group in groups)
            {
                int count = group.Count();
                int value = group.Key;

                if (count >= 3)
                {
                    // Multiple of a kind
                    var indices = group.Select(d => d.index).ToList();
                    int points = GameRules.GetMultipleOfAKindPoints(value, count);

                    combinations.Add(new ScoringCombination
                    {
                        Type = count == 3 ? "Three of a Kind" : count == 4 ? "Four of a Kind" : count == 5 ? "Five of a Kind" : "Six of a Kind",
                        Description = $"{count} {value}s",
                        DiceValues = Enumerable.Repeat(value, count).ToArray(),
                        Points = points,
                        DiceIndices = indices
                    });

                    foreach (var idx in indices)
                    {
                        usedIndices.Add(idx);
                    }
                }
            }

            // Check for single 1s and 5s that weren't part of a group
            foreach (var die in sortedDice)
            {
                if (usedIndices.Contains(die.index))
                    continue;

                if (die.value == 1)
                {
                    combinations.Add(new ScoringCombination
                    {
                        Type = "Single 1",
                        Description = "Single 1",
                        DiceValues = new[] { 1 },
                        Points = GameRules.SingleOnePoints,
                        DiceIndices = new List<int> { die.index }
                    });
                    usedIndices.Add(die.index);
                }
                else if (die.value == 5)
                {
                    combinations.Add(new ScoringCombination
                    {
                        Type = "Single 5",
                        Description = "Single 5",
                        DiceValues = new[] { 5 },
                        Points = GameRules.SingleFivePoints,
                        DiceIndices = new List<int> { die.index }
                    });
                    usedIndices.Add(die.index);
                }
            }

            return combinations;
        }

        /// <summary>
        /// Checks for a straight (1,2,3,4,5,6)
        /// </summary>
        private bool CheckForStraight(IEnumerable<(int value, int index)> sortedDice, out ScoringCombination combination)
        {
            combination = null!;
            var diceList = sortedDice.ToList();

            if (diceList.Count != 6)
                return false;

            var values = diceList.Select(d => d.value).ToList();
            if (values.SequenceEqual(new[] { 1, 2, 3, 4, 5, 6 }))
            {
                combination = new ScoringCombination
                {
                    Type = "Straight",
                    Description = "Straight (1-2-3-4-5-6)",
                    DiceValues = new[] { 1, 2, 3, 4, 5, 6 },
                    Points = GameRules.StraightPoints,
                    DiceIndices = diceList.Select(d => d.index).ToList()
                };
                return true;
            }

            return false;
        }

        /// <summary>
        /// Checks for three pairs
        /// </summary>
        private bool CheckForThreePairs(IEnumerable<(int value, int index)> sortedDice, out ScoringCombination combination)
        {
            combination = null!;
            var diceList = sortedDice.ToList();

            if (diceList.Count != 6)
                return false;

            var groups = diceList.GroupBy(d => d.value).ToList();

            if (groups.Count == 3 && groups.All(g => g.Count() == 2))
            {
                combination = new ScoringCombination
                {
                    Type = "Three Pairs",
                    Description = $"Three Pairs ({string.Join(", ", groups.Select(g => $"{g.Key}-{g.Key}"))})",
                    DiceValues = diceList.Select(d => d.value).ToArray(),
                    Points = GameRules.ThreePairsPoints,
                    DiceIndices = diceList.Select(d => d.index).ToList()
                };
                return true;
            }

            return false;
        }

        /// <summary>
        /// Checks for two triplets
        /// </summary>
        private bool CheckForTwoTriplets(IEnumerable<(int value, int index)> sortedDice, out ScoringCombination combination)
        {
            combination = null!;
            var diceList = sortedDice.ToList();

            if (diceList.Count != 6)
                return false;

            var groups = diceList.GroupBy(d => d.value).ToList();

            if (groups.Count == 2 && groups.All(g => g.Count() == 3))
            {
                combination = new ScoringCombination
                {
                    Type = "Two Triplets",
                    Description = $"Two Triplets ({string.Join(" and ", groups.Select(g => $"Three {g.Key}s"))})",
                    DiceValues = diceList.Select(d => d.value).ToArray(),
                    Points = GameRules.TwoTripletsPoints,
                    DiceIndices = diceList.Select(d => d.index).ToList()
                };
                return true;
            }

            return false;
        }

        /// <summary>
        /// Validates if the selected dice are valid scoring dice
        /// </summary>
        public bool ValidateDiceSelection(int[] diceValues, List<int> selectedIndices)
        {
            if (selectedIndices == null || selectedIndices.Count == 0)
                return false;

            // Get the selected dice values
            var selectedDice = selectedIndices.Select(i => diceValues[i]).ToArray();

            // Check if selected dice have any scoring combinations
            var combinations = FindScoringCombinations(selectedDice);

            return combinations.Any() && combinations.Sum(c => c.Points) > 0;
        }

        /// <summary>
        /// Checks if all dice in the roll are scoring dice (hot dice)
        /// </summary>
        public bool IsHotDice(int[] diceValues)
        {
            var scoringIndices = GetScoringDiceIndices(diceValues);
            return scoringIndices.Count == diceValues.Length;
        }

        /// <summary>
        /// Gets the scoring dice indices from a roll
        /// </summary>
        public List<int> GetScoringDiceIndices(int[] diceValues)
        {
            var combinations = FindScoringCombinations(diceValues);
            var scoringIndices = new HashSet<int>();

            foreach (var combination in combinations)
            {
                foreach (var index in combination.DiceIndices)
                {
                    scoringIndices.Add(index);
                }
            }

            return scoringIndices.OrderBy(i => i).ToList();
        }

        /// <summary>
        /// Checks if a specific set of dice values contains any scoring combinations
        /// </summary>
        public bool HasScoringDice(int[] diceValues)
        {
            var combinations = FindScoringCombinations(diceValues);
            return combinations.Any() && combinations.Sum(c => c.Points) > 0;
        }

        /// <summary>
        /// Calculates remaining dice after scoring dice are removed
        /// </summary>
        public int CalculateRemainingDice(int totalDice, int scoringDiceCount)
        {
            int remaining = totalDice - scoringDiceCount;

            // Hot dice rule: if all dice scored, reset to 6
            if (remaining == 0 && GameRules.HotDiceEnabled)
            {
                return GameRules.TotalDice;
            }

            return remaining;
        }
    }
}