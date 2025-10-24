using FarkleGame.API.DTOs;
using FarkleGame.Core.Entities;

namespace FarkleGame.API.Services;

/// <summary>
/// Interface for authentication services
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Registers a new user
    /// </summary>
    /// <param name="request">Registration request data</param>
    /// <returns>Authentication response with token and user data</returns>
    Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterRequestDto request);

    /// <summary>
    /// Authenticates a user login
    /// </summary>
    /// <param name="request">Login request data</param>
    /// <returns>Authentication response with token and user data</returns>
    Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginRequestDto request);

    /// <summary>
    /// Gets user information by ID
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>User information</returns>
    Task<ApiResponse<UserDto>> GetUserAsync(int userId);

    /// <summary>
    /// Updates user profile information
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="request">Updated user data</param>
    /// <returns>Updated user information</returns>
    Task<ApiResponse<UserDto>> UpdateProfileAsync(int userId, UpdateProfileRequestDto request);

    /// <summary>
    /// Changes user password
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="request">Password change request</param>
    /// <returns>Success response</returns>
    Task<ApiResponse<bool>> ChangePasswordAsync(int userId, ChangePasswordRequestDto request);

    /// <summary>
    /// Initiates password reset process
    /// </summary>
    /// <param name="request">Forgot password request</param>
    /// <returns>Success response</returns>
    Task<ApiResponse<bool>> ForgotPasswordAsync(ForgotPasswordRequestDto request);

    /// <summary>
    /// Resets password using reset token
    /// </summary>
    /// <param name="request">Reset password request</param>
    /// <returns>Success response</returns>
    Task<ApiResponse<bool>> ResetPasswordAsync(ResetPasswordRequestDto request);

    /// <summary>
    /// Validates if username is available
    /// </summary>
    /// <param name="username">Username to check</param>
    /// <returns>True if available, false if taken</returns>
    Task<bool> IsUsernameAvailableAsync(string username);

    /// <summary>
    /// Validates if email is available
    /// </summary>
    /// <param name="email">Email to check</param>
    /// <returns>True if available, false if taken</returns>
    Task<bool> IsEmailAvailableAsync(string email);

    /// <summary>
    /// Updates user game statistics after a game completion
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="won">Whether the user won the game</param>
    /// <param name="score">Final score achieved</param>
    /// <returns>Updated user information</returns>
    Task<ApiResponse<UserDto>> UpdateGameStatisticsAsync(int userId, bool won, int score);
}

/// <summary>
/// Request model for updating user profile
/// </summary>
public class UpdateProfileRequestDto
{
    [System.ComponentModel.DataAnnotations.StringLength(100)]
    public string? FirstName { get; set; }

    [System.ComponentModel.DataAnnotations.StringLength(100)]
    public string? LastName { get; set; }
}
