using FarkleGame.Core.Entities;

namespace FarkleGame.API.Services;

/// <summary>
/// Interface for JWT token generation and validation
/// </summary>
public interface IJwtService
{
    /// <summary>
    /// Generates a JWT token for the specified user
    /// </summary>
    /// <param name="user">The user to generate a token for</param>
    /// <param name="rememberMe">Whether to generate a long-lived token</param>
    /// <returns>JWT token and expiration date</returns>
    (string Token, DateTime ExpiresAt) GenerateToken(User user, bool rememberMe = false);

    /// <summary>
    /// Validates a JWT token and extracts user information
    /// </summary>
    /// <param name="token">The JWT token to validate</param>
    /// <returns>User ID if valid, null if invalid</returns>
    int? ValidateToken(string token);

    /// <summary>
    /// Extracts user ID from a JWT token without validation
    /// </summary>
    /// <param name="token">The JWT token</param>
    /// <returns>User ID if found, null otherwise</returns>
    int? GetUserIdFromToken(string token);
}
