using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FarkleGame.API.DTOs;
using FarkleGame.API.Services;

namespace FarkleGame.API.Controllers;

/// <summary>
/// Controller for authentication operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    /// <param name="request">Registration data</param>
    /// <returns>Authentication response with JWT token</returns>
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse("Validation failed", errors));
        }

        var result = await _authService.RegisterAsync(request);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Authenticate user login
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <returns>Authentication response with JWT token</returns>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<AuthResponseDto>.ErrorResponse("Validation failed", errors));
        }

        var result = await _authService.LoginAsync(request);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    /// <returns>Current user information</returns>
    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetProfile()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<UserDto>.ErrorResponse("Invalid token"));
        }

        var result = await _authService.GetUserAsync(userId.Value);
        
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Update user profile
    /// </summary>
    /// <param name="request">Updated profile data</param>
    /// <returns>Updated user information</returns>
    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateProfile([FromBody] UpdateProfileRequestDto request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<UserDto>.ErrorResponse("Invalid token"));
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<UserDto>.ErrorResponse("Validation failed", errors));
        }

        var result = await _authService.UpdateProfileAsync(userId.Value, request);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Change user password
    /// </summary>
    /// <param name="request">Password change data</param>
    /// <returns>Success response</returns>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<bool>.ErrorResponse("Invalid token"));
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<bool>.ErrorResponse("Validation failed", errors));
        }

        var result = await _authService.ChangePasswordAsync(userId.Value, request);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Initiate password reset
    /// </summary>
    /// <param name="request">Email for password reset</param>
    /// <returns>Success response</returns>
    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<bool>.ErrorResponse("Validation failed", errors));
        }

        var result = await _authService.ForgotPasswordAsync(request);
        
        return Ok(result); // Always return OK for security
    }

    /// <summary>
    /// Reset password using token
    /// </summary>
    /// <param name="request">Password reset data</param>
    /// <returns>Success response</returns>
    [HttpPost("reset-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<bool>.ErrorResponse("Validation failed", errors));
        }

        var result = await _authService.ResetPasswordAsync(request);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Check if username is available
    /// </summary>
    /// <param name="username">Username to check</param>
    /// <returns>Availability status</returns>
    [HttpGet("check-username/{username}")]
    public async Task<ActionResult<ApiResponse<bool>>> CheckUsername(string username)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return BadRequest(ApiResponse<bool>.ErrorResponse("Username is required"));
        }

        var isAvailable = await _authService.IsUsernameAvailableAsync(username);
        
        return Ok(ApiResponse<bool>.SuccessResponse(isAvailable, 
            isAvailable ? "Username is available" : "Username is already taken"));
    }

    /// <summary>
    /// Check if email is available
    /// </summary>
    /// <param name="email">Email to check</param>
    /// <returns>Availability status</returns>
    [HttpGet("check-email/{email}")]
    public async Task<ActionResult<ApiResponse<bool>>> CheckEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(ApiResponse<bool>.ErrorResponse("Email is required"));
        }

        var isAvailable = await _authService.IsEmailAvailableAsync(email);
        
        return Ok(ApiResponse<bool>.SuccessResponse(isAvailable, 
            isAvailable ? "Email is available" : "Email is already registered"));
    }

    /// <summary>
    /// Validate current JWT token
    /// </summary>
    /// <returns>Token validation status</returns>
    [HttpGet("validate-token")]
    [Authorize]
    public ActionResult<ApiResponse<bool>> ValidateToken()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<bool>.ErrorResponse("Invalid token"));
        }

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Token is valid"));
    }

    /// <summary>
    /// Logout user (client-side token removal)
    /// </summary>
    /// <returns>Success response</returns>
    [HttpPost("logout")]
    [Authorize]
    public ActionResult<ApiResponse<bool>> Logout()
    {
        // In a JWT-based system, logout is typically handled client-side by removing the token
        // For enhanced security, you could implement a token blacklist here
        
        _logger.LogInformation("User logged out: {UserId}", GetCurrentUserId());
        
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Logged out successfully"));
    }

    /// <summary>
    /// Update user game statistics after game completion
    /// </summary>
    /// <param name="request">Game completion data</param>
    /// <returns>Updated user information</returns>
    [HttpPost("update-game-stats")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateGameStatistics([FromBody] UpdateGameStatsRequestDto request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<UserDto>.ErrorResponse("Invalid token"));
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<UserDto>.ErrorResponse("Validation failed", errors));
        }

        var result = await _authService.UpdateGameStatisticsAsync(userId.Value, request.Won, request.Score);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get current user ID from JWT token
    /// </summary>
    /// <returns>User ID or null if not found</returns>
    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (int.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        return null;
    }
}
