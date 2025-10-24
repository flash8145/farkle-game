using FarkleGame.Core.Entities;
using FarkleGame.Core.Enums;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Numerics;
using System.Reflection.Emit;

namespace FarkleGame.API.Data
{
    /// <summary>
    /// Database context for Farkle game
    /// </summary>
    public class FarkleDbContext : DbContext
    {
        public FarkleDbContext(DbContextOptions<FarkleDbContext> options)
            : base(options)
        {
        }

        /// <summary>
        /// Games table
        /// </summary>
        public DbSet<Game> Games { get; set; }

        /// <summary>
        /// Players table
        /// </summary>
        public DbSet<Player> Players { get; set; }

        /// <summary>
        /// Turns table
        /// </summary>
        public DbSet<Turn> Turns { get; set; }

        /// <summary>
        /// Users table
        /// </summary>
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            #region Game Configuration

            modelBuilder.Entity<Game>(entity =>
            {
                entity.HasKey(g => g.GameId);

                entity.Property(g => g.GameCode)
                    .IsRequired()
                    .HasMaxLength(10);

                entity.HasIndex(g => g.GameCode)
                    .IsUnique();

                entity.Property(g => g.Status)
                    .HasConversion<string>()
                    .HasMaxLength(50);

                entity.Property(g => g.CreatedAt)
                    .IsRequired();

                entity.Property(g => g.LastActivityAt)
                    .IsRequired();

                // One Game has many Players
                entity.HasMany(g => g.Players)
                    .WithOne(p => p.Game)
                    .HasForeignKey(p => p.GameId)
                    .OnDelete(DeleteBehavior.Cascade);

                // One Game has many Turns
                entity.HasMany(g => g.Turns)
                    .WithOne(t => t.Game)
                    .HasForeignKey(t => t.GameId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Winner relationship (one-to-one nullable)
                entity.HasOne(g => g.Winner)
                    .WithMany()
                    .HasForeignKey(g => g.WinnerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            #endregion

            #region Player Configuration

            modelBuilder.Entity<Player>(entity =>
            {
                entity.HasKey(p => p.PlayerId);

                entity.Property(p => p.PlayerName)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(p => p.TotalScore)
                    .IsRequired()
                    .HasDefaultValue(0);

                entity.Property(p => p.CurrentTurnScore)
                    .IsRequired()
                    .HasDefaultValue(0);

                entity.Property(p => p.IsOnBoard)
                    .IsRequired()
                    .HasDefaultValue(false);

                entity.Property(p => p.IsCurrentTurn)
                    .IsRequired()
                    .HasDefaultValue(false);

                entity.Property(p => p.TurnOrder)
                    .IsRequired();

                entity.Property(p => p.ConnectionId)
                    .HasMaxLength(100);

                entity.Property(p => p.IsConnected)
                    .IsRequired()
                    .HasDefaultValue(true);

                entity.Property(p => p.JoinedAt)
                    .IsRequired();

                entity.Property(p => p.LastActivityAt)
                    .IsRequired();

                // One Player has many Turns
                entity.HasMany(p => p.Turns)
                    .WithOne(t => t.Player)
                    .HasForeignKey(t => t.PlayerId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Composite index for game and turn order
                entity.HasIndex(p => new { p.GameId, p.TurnOrder })
                    .IsUnique();
            });

            #endregion

            #region Turn Configuration

            modelBuilder.Entity<Turn>(entity =>
            {
                entity.HasKey(t => t.TurnId);

                entity.Property(t => t.TurnNumber)
                    .IsRequired();

                entity.Property(t => t.Status)
                    .HasConversion<string>()
                    .HasMaxLength(50);

                entity.Property(t => t.RollCount)
                    .IsRequired()
                    .HasDefaultValue(0);

                entity.Property(t => t.PointsScored)
                    .IsRequired()
                    .HasDefaultValue(0);

                entity.Property(t => t.PointsBanked)
                    .IsRequired()
                    .HasDefaultValue(0);

                entity.Property(t => t.DiceRemaining)
                    .IsRequired();

                entity.Property(t => t.RollHistory)
                    .HasMaxLength(1000);

                entity.Property(t => t.StartedAt)
                    .IsRequired();

                entity.Property(t => t.DurationSeconds)
                    .HasDefaultValue(0);

                // Index for querying turns by game
                entity.HasIndex(t => t.GameId);

                // Index for querying turns by player
                entity.HasIndex(t => t.PlayerId);

                // Composite index for game and turn number
                entity.HasIndex(t => new { t.GameId, t.TurnNumber });
            });

            #endregion

            #region User Configuration

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);

                entity.Property(u => u.Username)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(u => u.Email)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(u => u.PasswordHash)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(u => u.FirstName)
                    .HasMaxLength(100);

                entity.Property(u => u.LastName)
                    .HasMaxLength(100);

                entity.Property(u => u.CreatedAt)
                    .IsRequired();

                entity.Property(u => u.IsActive)
                    .IsRequired()
                    .HasDefaultValue(true);

                entity.Property(u => u.IsEmailVerified)
                    .IsRequired()
                    .HasDefaultValue(false);

                entity.Property(u => u.GamesPlayed)
                    .IsRequired()
                    .HasDefaultValue(0);

                entity.Property(u => u.GamesWon)
                    .IsRequired()
                    .HasDefaultValue(0);

                entity.Property(u => u.TotalScore)
                    .IsRequired()
                    .HasDefaultValue(0);

                entity.Property(u => u.HighestScore)
                    .IsRequired()
                    .HasDefaultValue(0);

                // Unique constraints
                entity.HasIndex(u => u.Username)
                    .IsUnique();

                entity.HasIndex(u => u.Email)
                    .IsUnique();

                // One User has many Players
                entity.HasMany(u => u.Players)
                    .WithOne(p => p.User)
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            #endregion

            #region Seed Data (Optional - for testing)

            // You can add seed data here if needed for development/testing
            // Example:
            // modelBuilder.Entity<Game>().HasData(
            //     new Game 
            //     { 
            //         GameId = Guid.NewGuid(), 
            //         GameCode = "TEST01",
            //         Status = GameStatus.WaitingForPlayers,
            //         CreatedAt = DateTime.UtcNow
            //     }
            // );

            #endregion
        }

        /// <summary>
        /// Override SaveChanges to update timestamps automatically
        /// </summary>
        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        /// <summary>
        /// Override SaveChangesAsync to update timestamps automatically
        /// </summary>
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return base.SaveChangesAsync(cancellationToken);
        }

        /// <summary>
        /// Automatically updates LastActivityAt timestamps
        /// </summary>
        private void UpdateTimestamps()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Modified);

            foreach (var entry in entries)
            {
                if (entry.Entity is Game game)
                {
                    game.LastActivityAt = DateTime.UtcNow;
                }
                else if (entry.Entity is Player player)
                {
                    player.LastActivityAt = DateTime.UtcNow;
                }
            }
        }
    }
}