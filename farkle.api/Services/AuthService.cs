using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using FarkleGame.API.Data;
using FarkleGame.API.DTOs;
using FarkleGame.Core.Entities;

namespace FarkleGame.API.Services;

/// <summary>
/// Service for handling authentication operations
/// </summary>
public class AuthService : IAuthService
{
    private readonly FarkleDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(FarkleDbContext context, IJwtService jwtService, ILogger<AuthService> logger)
    {
        _context = context;
        _jwtService = jwtService;
        _logger = logger;
    }

    public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterRequestDto request)
    {
        try
        {
            // Check if username already exists
            if (await _context.Users.AnyAsync(u => u.Username.ToLower() == request.Username.ToLower()))
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse("Username is already taken");
            }

            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse("Email is already registered");
            }

            // Create new user
            var user = new User
            {
                Username = request.Username,
                Email = request.Email.ToLower(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsEmailVerified = false // In production, you'd send verification email
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate JWT token
            var (token, expiresAt) = _jwtService.GenerateToken(user, false);

            var response = new AuthResponseDto
            {
                Token = token,
                ExpiresAt = expiresAt,
                User = MapToUserDto(user)
            };

            _logger.LogInformation("User registered successfully: {Username} ({Email})", user.Username, user.Email);

            return ApiResponse<AuthResponseDto>.SuccessResponse(response, "Registration successful");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user registration for email: {Email}", request.Email);
            return ApiResponse<AuthResponseDto>.ErrorResponse("An error occurred during registration");
        }
    }

    public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginRequestDto request)
    {
        try
        {
            // Find user by email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (user == null)
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse("Invalid email or password");
            }

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse("Invalid email or password");
            }

            // Check if user is active
            if (!user.IsActive)
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse("Account is deactivated");
            }

            // Update last login
            user.UpdateLastLogin();
            await _context.SaveChangesAsync();

            // Generate JWT token
            var (token, expiresAt) = _jwtService.GenerateToken(user, request.RememberMe);

            var response = new AuthResponseDto
            {
                Token = token,
                ExpiresAt = expiresAt,
                User = MapToUserDto(user)
            };

            _logger.LogInformation("User logged in successfully: {Username} ({Email})", user.Username, user.Email);

            return ApiResponse<AuthResponseDto>.SuccessResponse(response, "Login successful");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user login for email: {Email}", request.Email);
            return ApiResponse<AuthResponseDto>.ErrorResponse("An error occurred during login");
        }
    }

    public async Task<ApiResponse<UserDto>> GetUserAsync(int userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null)
            {
                return ApiResponse<UserDto>.ErrorResponse("User not found");
            }

            return ApiResponse<UserDto>.SuccessResponse(MapToUserDto(user));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user: {UserId}", userId);
            return ApiResponse<UserDto>.ErrorResponse("An error occurred while retrieving user information");
        }
    }

    public async Task<ApiResponse<UserDto>> UpdateProfileAsync(int userId, UpdateProfileRequestDto request)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null)
            {
                return ApiResponse<UserDto>.ErrorResponse("User not found");
            }

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;

            await _context.SaveChangesAsync();

            return ApiResponse<UserDto>.SuccessResponse(MapToUserDto(user), "Profile updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile for user: {UserId}", userId);
            return ApiResponse<UserDto>.ErrorResponse("An error occurred while updating profile");
        }
    }

    public async Task<ApiResponse<bool>> ChangePasswordAsync(int userId, ChangePasswordRequestDto request)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null)
            {
                return ApiResponse<bool>.ErrorResponse("User not found");
            }

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            {
                return ApiResponse<bool>.ErrorResponse("Current password is incorrect");
            }

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Password changed successfully for user: {UserId}", userId);

            return ApiResponse<bool>.SuccessResponse(true, "Password changed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user: {UserId}", userId);
            return ApiResponse<bool>.ErrorResponse("An error occurred while changing password");
        }
    }

    public async Task<ApiResponse<bool>> ForgotPasswordAsync(ForgotPasswordRequestDto request)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (user == null)
            {
                // Don't reveal if email exists or not for security
                return ApiResponse<bool>.SuccessResponse(true, "If the email exists, a reset link has been sent");
            }

            // Generate reset token (in production, send this via email)
            user.PasswordResetToken = Guid.NewGuid().ToString();
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1); // 1 hour expiry

            await _context.SaveChangesAsync();

            _logger.LogInformation("Password reset token generated for user: {Email}", user.Email);

            return ApiResponse<bool>.SuccessResponse(true, "If the email exists, a reset link has been sent");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during forgot password for email: {Email}", request.Email);
            return ApiResponse<bool>.ErrorResponse("An error occurred while processing password reset");
        }
    }

    public async Task<ApiResponse<bool>> ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower() 
                                       && u.PasswordResetToken == request.Token);

            if (user == null || !user.IsPasswordResetTokenValid())
            {
                return ApiResponse<bool>.ErrorResponse("Invalid or expired reset token");
            }

            // Update password and clear reset token
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Password reset successfully for user: {Email}", user.Email);

            return ApiResponse<bool>.SuccessResponse(true, "Password reset successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password reset for email: {Email}", request.Email);
            return ApiResponse<bool>.ErrorResponse("An error occurred while resetting password");
        }
    }

    public async Task<bool> IsUsernameAvailableAsync(string username)
    {
        return !await _context.Users.AnyAsync(u => u.Username.ToLower() == username.ToLower());
    }

    public async Task<bool> IsEmailAvailableAsync(string email)
    {
        return !await _context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower());
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            DisplayName = user.DisplayName,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt,
            IsEmailVerified = user.IsEmailVerified,
            GamesPlayed = user.GamesPlayed,
            GamesWon = user.GamesWon,
            HighestScore = user.HighestScore,
            WinRate = user.WinRate,
            AverageScore = user.AverageScore
        };
    }

    public async Task<ApiResponse<UserDto>> UpdateGameStatisticsAsync(int userId, bool won, int score)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return ApiResponse<UserDto>.ErrorResponse("User not found");
            }

            // Update game statistics using the existing method
            user.UpdateGameStats(score, won);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated game statistics for user {UserId}: Games={Games}, Wins={Wins}, WinRate={WinRate}%", 
                userId, user.GamesPlayed, user.GamesWon, user.WinRate);

            var userDto = MapToUserDto(user);
            return ApiResponse<UserDto>.SuccessResponse(userDto, "Game statistics updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating game statistics for user {UserId}", userId);
            return ApiResponse<UserDto>.ErrorResponse("Failed to update game statistics");
        }
    }
}
