using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FarkleGame.API.Data
{
    /// <summary>
    /// Factory for creating DbContext at design time (for migrations)
    /// </summary>
    public class FarkleDbContextFactory : IDesignTimeDbContextFactory<FarkleDbContext>
    {
        public FarkleDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<FarkleDbContext>();

            // Use the connection string directly for migrations
            optionsBuilder.UseSqlServer(
                "Server=(localdb)\\mssqllocaldb;Database=FarkleGameDb;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true"
            );

            return new FarkleDbContext(optionsBuilder.Options);
        }
    }
}