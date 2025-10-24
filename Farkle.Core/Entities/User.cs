using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FarkleGame.Core.Entities;

/// <summary>
/// Represents a registered user in the Farkle game system
/// </summary>
public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastLoginAt { get; set; }

    public bool IsActive { get; set; } = true;

    public bool IsEmailVerified { get; set; } = false;

    public string? EmailVerificationToken { get; set; }

    public DateTime? EmailVerificationTokenExpiry { get; set; }

    public string? PasswordResetToken { get; set; }

    public DateTime? PasswordResetTokenExpiry { get; set; }

    // Game Statistics
    public int GamesPlayed { get; set; } = 0;
    
    public int GamesWon { get; set; } = 0;
    
    public int TotalScore { get; set; } = 0;
    
    public int HighestScore { get; set; } = 0;

    // Navigation Properties
    public virtual ICollection<Player> Players { get; set; } = new List<Player>();

    // Computed Properties
    [NotMapped]
    public double WinRate => GamesPlayed > 0 ? (double)GamesWon / GamesPlayed * 100 : 0;

    [NotMapped]
    public double AverageScore => GamesPlayed > 0 ? (double)TotalScore / GamesPlayed : 0;

    [NotMapped]
    public string DisplayName => !string.IsNullOrEmpty(FirstName) && !string.IsNullOrEmpty(LastName) 
        ? $"{FirstName} {LastName}" 
        : Username;

    // Methods
    public void UpdateLastLogin()
    {
        LastLoginAt = DateTime.UtcNow;
    }

    public void UpdateGameStats(int score, bool won)
    {
        GamesPlayed++;
        TotalScore += score;
        
        if (score > HighestScore)
            HighestScore = score;
            
        if (won)
            GamesWon++;
    }

    public bool IsPasswordResetTokenValid()
    {
        return !string.IsNullOrEmpty(PasswordResetToken) 
            && PasswordResetTokenExpiry.HasValue 
            && PasswordResetTokenExpiry.Value > DateTime.UtcNow;
    }

    public bool IsEmailVerificationTokenValid()
    {
        return !string.IsNullOrEmpty(EmailVerificationToken) 
            && EmailVerificationTokenExpiry.HasValue 
            && EmailVerificationTokenExpiry.Value > DateTime.UtcNow;
    }
}
