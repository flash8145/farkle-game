using Microsoft.EntityFrameworkCore;
using FarkleGame.API.Data;
using FarkleGame.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Configure Entity Framework Core with SQL Server
builder.Services.AddDbContext<FarkleDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register application services
builder.Services.AddScoped<IDiceService, DiceService>();
builder.Services.AddScoped<IAIPlayerService, AIPlayerService>();
builder.Services.AddScoped<IGameService, GameService>(); // ✅ MUST BE UNCOMMENTED

// ============================================
// CRITICAL: CORS Configuration
// ============================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Allow multiple origins for development
        policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:3001",
            "https://localhost:3000",
            "https://localhost:3001"
        )
        .AllowAnyMethod()           // Allow GET, POST, PUT, DELETE, etc.
        .AllowAnyHeader()           // Allow all headers
        .AllowCredentials();        // Allow credentials (cookies, auth)
    });
});

// Configure SignalR for real-time communication
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Configuration.GetValue<bool>("SignalR:EnableDetailedErrors");
    options.KeepAliveInterval = TimeSpan.Parse(builder.Configuration["SignalR:KeepAliveInterval"] ?? "00:00:15");
    options.ClientTimeoutInterval = TimeSpan.Parse(builder.Configuration["SignalR:ClientTimeoutInterval"] ?? "00:00:30");
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Farkle Game API",
        Version = "v1",
        Description = "API for multiplayer Farkle dice game",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Farkle Game Development Team"
        }
    });
});

// Add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Farkle Game API v1");
        options.RoutePrefix = string.Empty; // Swagger UI at root URL
    });
}

// ============================================
// CRITICAL: CORS MUST BE BEFORE UseAuthorization
// ============================================
app.UseCors("AllowFrontend");  // ✅ THIS MUST BE HERE, BEFORE UseAuthorization

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Map SignalR hub (will add later)
// app.MapHub<GameHub>("/gameHub");

// Ensure database is created (for development only)
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<FarkleDbContext>();
    try
    {
        // Apply any pending migrations
        dbContext.Database.Migrate();
        Console.WriteLine("✅ Database migrated successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database migration error: {ex.Message}");
    }
}

Console.WriteLine("🎮 Farkle Game API is starting...");
Console.WriteLine($"🌐 Swagger UI available at: http://localhost:5186");
Console.WriteLine($"🌐 API Base URL: http://localhost:5186/api");

app.Run();